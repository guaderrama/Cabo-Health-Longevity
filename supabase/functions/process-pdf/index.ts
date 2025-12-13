// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPdfRequest {
  pdfData: string // base64 encoded
  fileName: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: ProcessPdfRequest = await req.json()
    const { pdfData, fileName, patientId, patientName, patientAge, patientGender } = body

    console.log(`Processing PDF: ${fileName} for patient: ${patientName}`)

    // Decode base64 to binary
    const base64Content = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData
    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0))

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const storagePath = `${patientId}/${timestamp}_${fileName}`

    // Upload PDF to Supabase Storage (using existing medical-reports bucket)
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('medical-reports')
      .upload(storagePath, binaryData, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Error uploading PDF: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseClient
      .storage
      .from('medical-reports')
      .getPublicUrl(storagePath)

    const pdfUrl = urlData.publicUrl

    // Extract text from PDF using basic approach
    // Note: For production, consider using a dedicated PDF parsing service
    let extractedText = ''
    try {
      // Try to extract text using a simple approach
      // This is a basic implementation - for real PDF text extraction,
      // you would need a proper PDF parsing library or external service
      const textDecoder = new TextDecoder('utf-8')
      const rawText = textDecoder.decode(binaryData)

      // Extract visible text between stream markers (basic approach)
      const textMatches = rawText.match(/BT[\s\S]*?ET/g)
      if (textMatches) {
        extractedText = textMatches
          .map(match => {
            const tjMatches = match.match(/\(([^)]*)\)/g)
            if (tjMatches) {
              return tjMatches.map(t => t.slice(1, -1)).join(' ')
            }
            return ''
          })
          .filter(Boolean)
          .join('\n')
      }

      // If no text extracted, try alternative method
      if (!extractedText) {
        // Look for text streams
        const streamRegex = /stream([\s\S]*?)endstream/g
        let match
        while ((match = streamRegex.exec(rawText)) !== null) {
          const streamContent = match[1]
          // Extract printable characters
          const printable = streamContent.replace(/[^\x20-\x7E\n]/g, ' ')
          if (printable.trim().length > 50) {
            extractedText += printable + '\n'
          }
        }
      }
    } catch (textError) {
      console.warn('Text extraction warning:', textError)
      extractedText = 'Texto no extraído automáticamente. Revise el PDF manualmente.'
    }

    // Create analysis record
    const { data: analysisData, error: analysisError } = await supabaseClient
      .from('analyses')
      .insert({
        patient_id: patientId,
        pdf_url: pdfUrl,
        pdf_filename: fileName,
        extracted_text: extractedText.substring(0, 50000), // Limit text length
        status: 'pending',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (analysisError) {
      console.error('Analysis creation error:', analysisError)
      throw new Error(`Error creating analysis: ${analysisError.message}`)
    }

    console.log(`Analysis created: ${analysisData.id}`)

    // Create initial report with placeholder AI analysis
    const { error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        analysis_id: analysisData.id,
        ai_analysis: generateInitialAnalysis(extractedText, patientName, patientAge, patientGender),
        risk_level: 'medium', // Default until doctor reviews
        approved_by_doctor: false,
        model_used: 'initial-extraction'
      })

    if (reportError) {
      console.error('Report creation error:', reportError)
      // Don't throw - analysis was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysisData.id,
        pdfUrl,
        message: 'PDF procesado exitosamente'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Process PDF error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error procesando PDF'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateInitialAnalysis(
  extractedText: string,
  patientName: string,
  patientAge: number,
  patientGender: string
): string {
  // Generate a structured initial analysis based on extracted text
  const hasText = extractedText && extractedText.length > 100

  return `
## Análisis Preliminar de Laboratorio

**Paciente:** ${patientName}
**Edad:** ${patientAge} a��os
**Género:** ${patientGender === 'male' ? 'Masculino' : patientGender === 'female' ? 'Femenino' : 'No especificado'}

---

### Estado del Análisis
${hasText
  ? 'El documento ha sido procesado y el texto ha sido extraído para revisión médica.'
  : 'El documento ha sido recibido pero requiere revisión manual del PDF original.'}

### Texto Extraído
${hasText
  ? extractedText.substring(0, 2000) + (extractedText.length > 2000 ? '...\n\n[Texto truncado - ver PDF completo]' : '')
  : 'No se pudo extraer texto automáticamente. Por favor revise el documento PDF directamente.'}

---

**Nota:** Este es un análisis preliminar automático. Un médico debe revisar los resultados y proporcionar su interpretación profesional antes de que el paciente pueda ver el reporte completo.

*Documento subido el ${new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}*
  `.trim()
}
