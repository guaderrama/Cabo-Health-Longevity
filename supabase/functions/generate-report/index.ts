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
        const { reportId, doctorNotes, recommendations, riskLevel } = await req.json();

        if (!reportId) {
            throw new Error('reportId es requerido');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Configuracion de Supabase faltante');
        }

        // Actualizar reporte con notas del médico
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/reports?id=eq.${reportId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                doctor_notes: doctorNotes || '',
                recommendations: recommendations || '',
                risk_level: riskLevel || 'medium',
                approved_by_doctor: true,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando reporte: ${errorText}`);
        }

        const reportData = await updateResponse.json();
        const report = reportData[0];

        // Obtener datos del análisis asociado
        const analysisResponse = await fetch(`${supabaseUrl}/rest/v1/analyses?id=eq.${report.analysis_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!analysisResponse.ok) {
            throw new Error('Error obteniendo análisis');
        }

        const analysisData = await analysisResponse.json();
        const analysis = analysisData[0];

        // Actualizar estado del análisis
        await fetch(`${supabaseUrl}/rest/v1/analyses?id=eq.${analysis.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'approved',
                reviewed_at: new Date().toISOString()
            })
        });

        // Enviar notificación al paciente
        await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: analysis.patient_id,
                userType: 'patient',
                message: 'Su análisis de laboratorio ha sido revisado y está disponible',
                type: 'analysis_ready',
                relatedAnalysisId: analysis.id
            })
        });

        return new Response(JSON.stringify({
            data: {
                report: report,
                analysis: analysis,
                notificationSent: true
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error generando reporte:', error);

        const errorResponse = {
            error: {
                code: 'REPORT_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
