// Edge Function: extract-biomarkers
// Extracts biomarkers from PDF text using Groq API with model cascade
// Based on hia/src/agents/model_manager.py

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Model cascade configuration (from HIA)
const MODEL_CASCADE = [
  { model: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  { model: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { model: 'llama3-70b-8192', name: 'Llama3 70B' },
]

// Extraction prompt for biomarkers - COMPREHENSIVE VERSION
const EXTRACTION_PROMPT = `Eres un experto en análisis de laboratorio médico especializado en medicina funcional. Tu tarea es extraer ABSOLUTAMENTE TODOS los biomarcadores del reporte.

INSTRUCCIONES CRÍTICAS:
1. Extrae CADA valor numérico que aparezca junto a un nombre de prueba
2. NO omitas ningún parámetro, incluso si parece menor
3. Busca TODAS estas categorías:

BIOMETRÍA HEMÁTICA (hematologic):
Hemoglobina, Hematocrito, Eritrocitos, Leucocitos, Plaquetas, Neutrófilos, Linfocitos, Monocitos, Eosinófilos, Basófilos, VCM, HCM, CHCM, RDW, VPM, Reticulocitos

QUÍMICA SANGUÍNEA (metabolic):
Glucosa, Urea, BUN, Creatinina, Ácido Úrico, Nitrógeno ureico, HbA1c, Insulina

PERFIL LIPÍDICO (lipid):
Colesterol Total, HDL, LDL, VLDL, Triglicéridos, Índice aterogénico

FUNCIÓN HEPÁTICA (hepatic):
AST/TGO, ALT/TGP, GGT, Fosfatasa Alcalina, Bilirrubina Total/Directa/Indirecta, Albúmina, Proteínas Totales, Globulinas, LDH

FUNCIÓN RENAL (renal):
Creatinina, BUN, Ácido Úrico, TFG, Depuración de creatinina

PERFIL TIROIDEO (thyroid):
TSH, T3, T4, T3 Libre, T4 Libre, Anticuerpos tiroideos

ELECTROLITOS Y MINERALES (nutritional):
Sodio, Potasio, Cloro, Calcio, Fósforo, Magnesio, Hierro, Ferritina, Transferrina, Vitamina D, Vitamina B12, Ácido Fólico, Zinc

MARCADORES INFLAMATORIOS (inflammatory):
PCR, VSG, Fibrinógeno, Homocisteína

EXAMEN GENERAL DE ORINA:
pH, Densidad, Proteínas, Glucosa, Sangre, Leucocitos

Para cada biomarcador:
- name: Nombre exacto
- value: Valor numérico como string
- unit: Unidad de medida
- reference_range: Rango de referencia
- category: metabolic/lipid/thyroid/nutritional/hepatic/renal/inflammatory/hematologic
- status: optimal/acceptable/suboptimal/abnormal

IMPORTANTE: Responde SOLO con JSON válido. Formato:
{
  "biomarkers": [
    {
      "name": "Glucosa en Ayunas",
      "value": "95",
      "unit": "mg/dL",
      "reference_range": "70-100",
      "category": "metabolic",
      "status": "optimal",
      "optimal_min": 75,
      "optimal_max": 86,
      "acceptable_min": 70,
      "acceptable_max": 99,
      "conventional_min": 65,
      "conventional_max": 99,
      "interpretation": "Óptimo: 75-86 mg/dL para prevención metabólica",
      "description": "Marcador clave de metabolismo de glucosa y riesgo de diabetes"
    }
  ],
  "summary": "Resumen breve del estado general del paciente",
  "categories_found": ["metabolic", "lipid"]
}

Si no encuentras biomarcadores, responde: {"biomarkers": [], "summary": "No se encontraron biomarcadores en el texto", "categories_found": []}

Texto del reporte:
`

interface BiomarkerExtraction {
  biomarkers: Array<{
    name: string
    value: string
    unit: string
    reference_range?: string
    category: string
    status: string
    optimal_min?: number
    optimal_max?: number
    acceptable_min?: number
    acceptable_max?: number
    conventional_min?: number
    conventional_max?: number
    interpretation?: string
    description?: string
  }>
  summary: string
  categories_found: string[]
}

async function callGroq(model: string, text: string): Promise<BiomarkerExtraction | null> {
  const apiKey = Deno.env.get('GROQ_API_KEY')
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en análisis de laboratorio médico. Siempre respondes en JSON válido.'
        },
        {
          role: 'user',
          content: EXTRACTION_PROMPT + text
        }
      ],
      temperature: 0,  // Determinístico: mismo input = mismo output
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Groq API error with ${model}:`, error)
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content in response')
  }

  try {
    return JSON.parse(content) as BiomarkerExtraction
  } catch (e) {
    console.error('Failed to parse JSON:', content)
    throw new Error('Invalid JSON response')
  }
}

async function extractWithCascade(text: string): Promise<{ extraction: BiomarkerExtraction | null, model_used: string }> {
  for (const config of MODEL_CASCADE) {
    try {
      console.log(`Trying model: ${config.name}`)
      const extraction = await callGroq(config.model, text)
      console.log(`Success with ${config.name}`)
      return { extraction, model_used: config.name }
    } catch (e) {
      console.error(`Model ${config.name} failed:`, e)
      // Continue to next model
    }
  }

  return { extraction: null, model_used: 'none' }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { analysis_id, extracted_text } = await req.json()

    if (!analysis_id || !extracted_text) {
      return new Response(
        JSON.stringify({ error: 'Missing analysis_id or extracted_text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Extracting biomarkers for analysis: ${analysis_id}`)
    console.log(`Text length: ${extracted_text.length} characters`)

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract biomarkers using cascade
    const { extraction, model_used } = await extractWithCascade(extracted_text)

    if (!extraction || extraction.biomarkers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No biomarkers extracted',
          model_used
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch biomarker_ranges to enrich extracted biomarkers
    console.log('Fetching biomarker_ranges for enrichment...')
    const { data: ranges, error: rangesError } = await supabase
      .from('biomarker_ranges')
      .select('*')

    if (rangesError) {
      console.error('Error fetching biomarker_ranges:', rangesError)
    }

    // Smart matching function for biomarker names
    function findBestMatch(name: string, ranges: any[]): any | null {
      const searchName = name.toLowerCase().trim()

      // Common synonyms/aliases mapping
      const synonyms: Record<string, string[]> = {
        'colesterol hdl': ['hdl colesterol', 'hdl'],
        'hdl': ['hdl colesterol', 'colesterol hdl'],
        'colesterol ldl': ['ldl colesterol', 'ldl'],
        'ldl': ['ldl colesterol', 'colesterol ldl'],
        'pcr': ['hs-crp', 'proteina c reactiva', 'proteína c reactiva'],
        'proteina c reactiva': ['hs-crp', 'pcr'],
        'proteínas totales': ['proteína total', 'proteinas totales'],
        'proteína total': ['proteínas totales'],
        'urea': ['bun', 'nitrógeno ureico'],
        'bun': ['urea', 'nitrógeno ureico'],
        'eritrocitos': ['glóbulos rojos', 'hematíes'],
        'glóbulos rojos': ['eritrocitos'],
        'trigliceridos': ['triglicéridos'],
        'acido urico': ['ácido úrico'],
        'vitamina d': ['vitamina d (25-oh)', '25-oh vitamina d', '25-hidroxivitamina d'],
        'vitamina d3': ['vitamina d (25-oh)'],
        // Additional common short-form synonyms
        'leucocitos': ['leucocitos totales', 'wbc'],
        'wbc': ['leucocitos totales'],
        'hierro': ['hierro sérico', 'hierro serico'],
        'ast': ['ast (aspartato aminotransferasa)', 'tgo', 'aspartato aminotransferasa'],
        'tgo': ['ast (aspartato aminotransferasa)'],
        'alt': ['alt (alanina aminotransferasa)', 'tgp', 'alanina aminotransferasa'],
        'tgp': ['alt (alanina aminotransferasa)'],
        'ggt': ['ggt (gamma glutamil transferasa)'],
        'ldh': ['ldh (lactato deshidrogenasa)'],
        'cpk': ['cpk (creatina fosfoquinasa)'],
        'tsh': ['tsh (hormona estimulante de tiroides)'],
        't3': ['t3 libre', 't3 total'],
        't4': ['t4 libre', 't4 total'],
        'vcm': ['vcm (volumen corpuscular medio)'],
        'hcm': ['hcm (hemoglobina corpuscular media)'],
        'rdw': ['rdw (amplitud distribución eritrocitaria)'],
        'chcm': ['chcm (concentración hb corpuscular media)'],
        'crp': ['hs-crp', 'proteína c reactiva'],
        'egfr': ['egfr (tasa de filtración glomerular)'],
      }

      // 1. Try exact match first (highest priority)
      let match = ranges.find(r => {
        const rangeName = (r.biomarker_name || '').toLowerCase().trim()
        const rangeCode = (r.biomarker_code || '').toLowerCase().trim()
        return rangeName === searchName || rangeCode === searchName
      })
      if (match) return match

      // 2. Try synonym match
      const possibleNames = synonyms[searchName] || []
      for (const syn of possibleNames) {
        match = ranges.find(r => {
          const rangeName = (r.biomarker_name || '').toLowerCase().trim()
          return rangeName.includes(syn) || syn.includes(rangeName)
        })
        if (match) return match
      }

      // 3. Try word-based matching (all significant words must be present)
      // Only use this if there are at least 2 significant words to avoid false positives
      const searchWords = searchName.split(/\s+/).filter(w => w.length > 2)
      if (searchWords.length >= 2) {
        // Find ranges where all search words appear in the name
        const candidates = ranges.filter(r => {
          const rangeName = (r.biomarker_name || '').toLowerCase()
          return searchWords.every(word => rangeName.includes(word))
        })
        // Prefer shorter matches (more specific)
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.biomarker_name.length - b.biomarker_name.length)
          return candidates[0]
        }
      }

      // 4. Try partial match (name is contained in range or vice versa)
      // But filter out very short matches and prefer longer search name matches
      match = ranges.find(r => {
        const rangeName = (r.biomarker_name || '').toLowerCase().trim()
        // Only match if the search name is a significant portion of the range name
        // This prevents "Hemoglobina" from matching "Hemoglobina Glicosilada"
        if (searchName.length >= 5 && rangeName.startsWith(searchName)) {
          // Make sure it's not matching a different biomarker
          const afterMatch = rangeName.slice(searchName.length).trim()
          // If there's text after, it should be just qualifiers like (HbA1c), not a different word
          if (afterMatch === '' || afterMatch.startsWith('(')) {
            return true
          }
        }
        return false
      })
      if (match) return match

      return null
    }

    // Enrich biomarkers with optimal/functional ranges from database
    if (ranges && ranges.length > 0) {
      console.log(`Found ${ranges.length} biomarker ranges for matching`)

      extraction.biomarkers.forEach(b => {
        // Try to match by name using smart matching
        const range = findBestMatch(b.name, ranges)

        if (range) {
          console.log(`Matched "${b.name}" with range "${range.biomarker_name}"`)
          // Enrich with database values (override AI-generated if available)
          b.optimal_min = range.optimal_min ?? b.optimal_min
          b.optimal_max = range.optimal_max ?? b.optimal_max
          b.acceptable_min = range.acceptable_min ?? b.acceptable_min
          b.acceptable_max = range.acceptable_max ?? b.acceptable_max
          b.conventional_min = range.conventional_min ?? b.conventional_min
          b.conventional_max = range.conventional_max ?? b.conventional_max
          b.unit = range.units || b.unit
          b.category = range.category || b.category
          b.description = range.description || b.description

          // Recalculate status based on database ranges
          const value = parseFloat(b.value)
          if (!isNaN(value) && range.optimal_min != null && range.optimal_max != null) {
            if (value >= range.optimal_min && value <= range.optimal_max) {
              b.status = 'optimal'
            } else if (range.acceptable_min != null && range.acceptable_max != null &&
                       value >= range.acceptable_min && value <= range.acceptable_max) {
              b.status = 'acceptable'
            } else if (range.conventional_min != null && range.conventional_max != null &&
                       value >= range.conventional_min && value <= range.conventional_max) {
              b.status = 'suboptimal'
            } else {
              b.status = 'abnormal'
            }
          }
        }
      })
    }

    // Insert biomarkers into database
    const biomarkersToInsert = extraction.biomarkers.map(b => ({
      analysis_id,
      name: b.name,
      value: b.value,
      unit: b.unit || null,
      reference_range: b.reference_range || null,
      category: b.category || null,
      status: b.status || null,
      optimal_min: b.optimal_min || null,
      optimal_max: b.optimal_max || null,
      acceptable_min: b.acceptable_min || null,
      acceptable_max: b.acceptable_max || null,
      conventional_min: b.conventional_min || null,
      conventional_max: b.conventional_max || null,
      interpretation: b.interpretation || null,
      description: b.description || null,
    }))

    const { data: insertedData, error: insertError } = await supabase
      .from('biomarkers')
      .insert(biomarkersToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting biomarkers:', insertError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save biomarkers',
          details: insertError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update analysis status
    await supabase
      .from('analyses')
      .update({
        status: 'processed',
        extracted_data: {
          summary: extraction.summary,
          categories_found: extraction.categories_found,
          biomarkers_count: extraction.biomarkers.length,
          model_used,
          extracted_at: new Date().toISOString()
        }
      })
      .eq('id', analysis_id)

    return new Response(
      JSON.stringify({
        success: true,
        biomarkers_count: extraction.biomarkers.length,
        categories_found: extraction.categories_found,
        summary: extraction.summary,
        model_used
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Extract biomarkers error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
