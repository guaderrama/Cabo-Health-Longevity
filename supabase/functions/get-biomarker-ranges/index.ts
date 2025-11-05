Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const category = url.searchParams.get('category');
        const biomarkerCode = url.searchParams.get('biomarker_code');

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        let queryUrl = `${supabaseUrl}/rest/v1/biomarker_ranges?select=*&order=biomarker_name.asc`;

        if (category) {
            queryUrl += `&category=eq.${category}`;
        }

        if (biomarkerCode) {
            queryUrl += `&biomarker_code=eq.${biomarkerCode}`;
        }

        const rangesResponse = await fetch(queryUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
            }
        });

        if (!rangesResponse.ok) {
            throw new Error('Error obteniendo rangos');
        }

        const ranges = await rangesResponse.json();

        // Agrupar por categoría
        const groupedByCategory = ranges.reduce((acc, range) => {
            const cat = range.category;
            if (!acc[cat]) {
                acc[cat] = [];
            }
            acc[cat].push({
                code: range.biomarker_code,
                name: range.biomarker_name,
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
                },
                units: range.units,
                genderSpecific: range.gender_specific,
                gender: range.gender,
                description: range.description,
                interpretation: range.interpretation_guide,
            });
            return acc;
        }, {});

        return new Response(JSON.stringify({
            data: {
                total: ranges.length,
                categories: Object.keys(groupedByCategory),
                biomarkers: groupedByCategory,
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error obteniendo rangos:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'GET_RANGES_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
