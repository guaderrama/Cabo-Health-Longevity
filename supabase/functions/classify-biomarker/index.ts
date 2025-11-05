Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { biomarkerCode, value, gender } = await req.json();

        if (!biomarkerCode || value === undefined) {
            throw new Error('biomarkerCode y value son requeridos');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        // Buscar rangos del biomarcador
        let queryUrl = `${supabaseUrl}/rest/v1/biomarker_ranges?biomarker_code=eq.${biomarkerCode}`;
        
        // Si es específico por género, añadir filtro
        if (gender && (biomarkerCode.includes('male') || biomarkerCode.includes('female'))) {
            queryUrl = `${supabaseUrl}/rest/v1/biomarker_ranges?biomarker_code=eq.${biomarkerCode}_${gender}`;
        }

        const rangesResponse = await fetch(queryUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
            }
        });

        if (!rangesResponse.ok) {
            throw new Error('Error obteniendo rangos del biomarcador');
        }

        const ranges = await rangesResponse.json();
        
        if (!ranges || ranges.length === 0) {
            // Intentar sin especificación de género
            const fallbackResponse = await fetch(
                `${supabaseUrl}/rest/v1/biomarker_ranges?biomarker_code=eq.${biomarkerCode}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                    }
                }
            );
            
            const fallbackRanges = await fallbackResponse.json();
            if (!fallbackRanges || fallbackRanges.length === 0) {
                return new Response(JSON.stringify({
                    data: {
                        classification: 'UNKNOWN',
                        message: 'Biomarcador no encontrado en base de datos',
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
            ranges.push(...fallbackRanges);
        }

        const range = ranges[0];
        const numericValue = parseFloat(value);

        // Clasificar valor según rangos funcionales
        let classification = 'UNKNOWN';
        let message = '';
        let riskLevel = 'medium';

        // 1. ÓPTIMO - Dentro del rango funcional óptimo
        if (numericValue >= range.optimal_min && numericValue <= range.optimal_max) {
            classification = 'OPTIMO';
            message = `Valor óptimo según medicina funcional (${range.optimal_min}-${range.optimal_max} ${range.units})`;
            riskLevel = 'low';
        }
        // 2. ACEPTABLE - Dentro del rango aceptable pero fuera del óptimo
        else if (numericValue >= range.acceptable_min && numericValue <= range.acceptable_max) {
            classification = 'ACEPTABLE';
            message = `Valor aceptable pero fuera del rango óptimo. Rango óptimo: ${range.optimal_min}-${range.optimal_max} ${range.units}`;
            riskLevel = 'low';
        }
        // 3. SUBÓPTIMO - Dentro del rango convencional pero fuera del funcional
        else if (numericValue >= range.conventional_min && numericValue <= range.conventional_max) {
            classification = 'SUBOPTIMO';
            message = `Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (${range.optimal_min}-${range.optimal_max} ${range.units})`;
            riskLevel = 'medium';
        }
        // 4. ANÓMALO - Fuera de todos los rangos
        else {
            classification = 'ANOMALO';
            message = `Valor fuera del rango convencional. Se recomienda evaluación médica inmediata`;
            riskLevel = 'high';
        }

        // Determinar si está por encima o por debajo
        let position = 'normal';
        if (numericValue < range.optimal_min) {
            position = 'below_optimal';
        } else if (numericValue > range.optimal_max) {
            position = 'above_optimal';
        }

        return new Response(JSON.stringify({
            data: {
                biomarker: range.biomarker_name,
                value: numericValue,
                units: range.units,
                classification: classification,
                riskLevel: riskLevel,
                position: position,
                message: message,
                ranges: {
                    optimal: {
                        min: range.optimal_min,
                        max: range.optimal_max,
                    },
                    acceptable: {
                        min: range.acceptable_min,
                        max: range.acceptable_max,
                    },
                    conventional: {
                        min: range.conventional_min,
                        max: range.conventional_max,
                    }
                },
                interpretation: range.interpretation_guide,
                description: range.description,
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error clasificando biomarcador:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'CLASSIFICATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
