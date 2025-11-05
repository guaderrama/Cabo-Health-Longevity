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
        const { userId, userType, message, type, relatedAnalysisId } = await req.json();

        if (!userId || !userType || !message || !type) {
            throw new Error('Datos requeridos faltantes');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Configuracion de Supabase faltante');
        }

        // Crear notificación en la base de datos
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: userId,
                user_type: userType,
                message: message,
                type: type,
                related_analysis_id: relatedAnalysisId || null,
                read: false
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Error creando notificación: ${errorText}`);
        }

        const notificationData = await insertResponse.json();

        // Aquí se podría integrar envío de email/SMS
        // Por ejemplo, usando servicios como SendGrid, Twilio, etc.

        return new Response(JSON.stringify({
            data: {
                notification: notificationData[0],
                sent: true
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error enviando notificación:', error);

        const errorResponse = {
            error: {
                code: 'NOTIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
