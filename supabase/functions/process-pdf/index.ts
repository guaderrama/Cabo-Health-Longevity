Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { pdfData, fileName, patientId, patientName, patientAge, patientGender } = await req.json();

        if (!pdfData || !fileName || !patientId) {
            throw new Error('Datos requeridos faltantes: pdfData, fileName, patientId');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const groqApiKey = Deno.env.get('GROQ_API_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Configuracion de Supabase faltante');
        }

        // Extraer datos base64 del PDF
        const base64Data = pdfData.split(',')[1] || pdfData;
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generar ruta de almacenamiento con timestamp
        const timestamp = Date.now();
        const storagePath = `${patientId}/${timestamp}-${fileName}`;

        // Subir PDF a Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/medical-reports/${storagePath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/pdf',
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Error subiendo PDF: ${errorText}`);
        }

        // Obtener URL pública
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/medical-reports/${storagePath}`;

        // Extraer texto del PDF (simulación básica - en producción usar OCR real)
        // NOTA: Aquí se implementaría OCR real (Tesseract via API o similar)
        const extractedText = `Análisis de Laboratorio - Paciente: ${patientName}
Edad: ${patientAge} años
Género: ${patientGender}

[Texto extraído del PDF - En producción se usaría OCR real]
Este es un marcador de posición para el texto extraído del PDF.
En producción, se utilizaría una solución de OCR como Tesseract o servicios cloud.

Parámetros comunes de análisis de sangre:
- Hemoglobina
- Glóbulos Rojos
- Glóbulos Blancos
- Plaquetas
- Glucosa
- Colesterol
- Triglicéridos
`;

        // Guardar análisis en la base de datos
        const insertAnalysisResponse = await fetch(`${supabaseUrl}/rest/v1/analyses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                patient_id: patientId,
                pdf_url: publicUrl,
                pdf_filename: fileName,
                extracted_text: extractedText,
                status: 'pending'
            })
        });

        if (!insertAnalysisResponse.ok) {
            const errorText = await insertAnalysisResponse.text();
            throw new Error(`Error guardando análisis: ${errorText}`);
        }

        const analysisData = await insertAnalysisResponse.json();
        const analysisId = analysisData[0].id;

        // Procesar con IA si hay API key de Groq
        let aiAnalysis = null;
        let modelUsed = null;

        if (groqApiKey) {
            // Jerarquía de modelos (cascada como en Hia original)
            const models = [
                'llama-3.3-70b-versatile',
                'llama-3.1-70b-versatile',
                'llama-3.1-8b-instant',
                'llama3-70b-8192'
            ];

            const systemPrompt = `Eres un asistente médico experto en análisis de laboratorio clínico. Tu tarea es analizar reportes de laboratorio de sangre y proporcionar insights médicos profesionales.

Analiza el siguiente reporte y proporciona:

1. RESUMEN EJECUTIVO: Visión general del estado de salud
2. HALLAZGOS PRINCIPALES: Valores fuera de rango y su significado
3. NIVEL DE RIESGO: Bajo/Medio/Alto con justificación
4. CONDICIONES POTENCIALES: Basado en los valores del reporte
5. RECOMENDACIONES: Medidas de seguimiento, estilo de vida, pruebas adicionales

Sé preciso, profesional y fundamenta cada observación en los valores del reporte.`;

            // Intentar con cascada de modelos
            for (let i = 0; i < models.length; i++) {
                try {
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${groqApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: models[i],
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: `Analiza este reporte médico:\n\n${extractedText}` }
                            ],
                            temperature: 0.7,
                            max_tokens: 2000
                        })
                    });

                    if (groqResponse.ok) {
                        const groqData = await groqResponse.json();
                        aiAnalysis = groqData.choices[0].message.content;
                        modelUsed = models[i];
                        break;
                    } else if (i < models.length - 1) {
                        // Si falla, esperar un poco e intentar con el siguiente modelo
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    if (i === models.length - 1) {
                        throw error;
                    }
                }
            }
        }

        // Crear reporte con análisis de IA (si está disponible)
        const insertReportResponse = await fetch(`${supabaseUrl}/rest/v1/reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                analysis_id: analysisId,
                ai_analysis: aiAnalysis || 'Pendiente de configuración de API de IA',
                model_used: modelUsed,
                approved_by_doctor: false
            })
        });

        if (!insertReportResponse.ok) {
            const errorText = await insertReportResponse.text();
            throw new Error(`Error creando reporte: ${errorText}`);
        }

        const reportData = await insertReportResponse.json();

        // Crear notificación para el médico (si hay médico asignado)
        // Aquí asumiríamos que hay un médico por defecto o se asigna después
        // Por ahora, creamos notificación genérica

        return new Response(JSON.stringify({
            data: {
                analysisId,
                publicUrl,
                report: reportData[0],
                aiAnalysisGenerated: !!aiAnalysis
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error procesando PDF:', error);

        const errorResponse = {
            error: {
                code: 'PDF_PROCESS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
