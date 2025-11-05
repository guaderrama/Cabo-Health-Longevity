# 📊 FASE 3: FEATURES PENDIENTES - Guía de Implementación

**Proyecto**: Cabo Health Clinic
**Fecha**: 2025-11-04
**Estado**: Documentación para SEMANA 2

---

## 📋 **OVERVIEW**

Esta guía cubre las 4 features principales pendientes para SEMANA 2:

1. ✅ Completar generación de PDF final
2. ✅ Verificar/mejorar FunctionalAnalysisPage (113 biomarcadores)
3. ✅ Implementar paginación en listas
4. ✅ Mejorar error handling y loading states

**Tiempo estimado total**: 10-12 horas

---

## 1️⃣ **COMPLETAR GENERACIÓN DE PDF FINAL**

### **Estado Actual:**
- ⚠️ Edge function `generate-report` existe pero puede estar incompleta
- ⚠️ Campo `report_pdf_url` en tabla `reports` no se popula
- ⚠️ PatientReportPage puede no mostrar PDF final

### **Objetivo:**
Generar un PDF profesional con:
- Logo de Cabo Health
- Datos del paciente
- Análisis de 113 biomarcadores con clasificación
- Gráficos de tendencias
- Recomendaciones del doctor
- Firma digital del doctor

### **Archivos a Modificar/Crear:**

#### **1.1 Edge Function: generate-report**

**Archivo**: `supabase/functions/generate-report/index.ts`

**Librerías necesarias**:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from "https://cdn.skypack.dev/jspdf@2.5.1"
```

**Estructura básica**:
```typescript
serve(async (req) => {
  try {
    const { analysisId } = await req.json()

    // 1. Obtener datos del análisis
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        report:reports(*)
      `)
      .eq('id', analysisId)
      .single()

    // 2. Obtener biomarcadores del análisis
    const biomarkers = parseBiomarkersFromAIAnalysis(analysis.report.ai_analysis)

    // 3. Generar PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.text('Cabo Health Clinic', 20, 20)
    doc.setFontSize(16)
    doc.text('Análisis Funcional de Laboratorio', 20, 30)

    // Patient Info
    doc.setFontSize(12)
    doc.text(`Paciente: ${analysis.patient.name}`, 20, 50)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60)
    doc.text(`Doctor: ${analysis.doctor.name}`, 20, 70)

    // Biomarcadores (tabla)
    let y = 90
    biomarkers.forEach((biomarker) => {
      doc.text(`${biomarker.name}: ${biomarker.value} ${biomarker.unit}`, 20, y)
      doc.text(`Estado: ${biomarker.classification}`, 120, y)
      y += 10
    })

    // Recomendaciones
    y += 20
    doc.text('Recomendaciones:', 20, y)
    doc.setFontSize(10)
    y += 10
    const recommendations = analysis.report.recommendations.split('\n')
    recommendations.forEach((rec) => {
      doc.text(rec, 20, y)
      y += 7
    })

    // 4. Subir PDF a Supabase Storage
    const pdfBuffer = doc.output('arraybuffer')
    const fileName = `report-${analysisId}-${Date.now()}.pdf`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) throw uploadError

    // 5. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    // 6. Actualizar report con PDF URL
    await supabase
      .from('reports')
      .update({ report_pdf_url: publicUrl })
      .eq('analysis_id', analysisId)

    return new Response(
      JSON.stringify({ success: true, pdfUrl: publicUrl }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

#### **1.2 Llamar a generate-report desde AnalysisReviewPage**

**Archivo**: `src/pages/AnalysisReviewPage.tsx`

```typescript
async function approveAnalysis() {
  try {
    // 1. Actualizar status del análisis
    await supabase
      .from('analyses')
      .update({ status: 'approved' })
      .eq('id', analysisId)

    // 2. Llamar a edge function para generar PDF
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { analysisId }
    })

    if (error) throw error

    // 3. Mostrar toast de éxito
    toast({
      title: "Análisis aprobado",
      description: "El reporte PDF ha sido generado y enviado al paciente",
    })

    // 4. Navegar de vuelta al dashboard
    navigate('/dashboard')

  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  }
}
```

#### **1.3 Mostrar PDF en PatientReportPage**

**Archivo**: `src/pages/PatientReportPage.tsx`

```typescript
function PatientReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState<Report | null>(null)

  // ... cargar reporte ...

  return (
    <div>
      {/* Botón de descarga */}
      {report?.report_pdf_url && (
        <a
          href={report.report_pdf_url}
          download
          className="..."
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar PDF
        </a>
      )}

      {/* Viewer de PDF (iframe) */}
      {report?.report_pdf_url && (
        <iframe
          src={report.report_pdf_url}
          className="w-full h-screen border rounded-lg"
          title="Reporte de Análisis"
        />
      )}
    </div>
  )
}
```

**Tiempo estimado**: 3-4 horas

---

## 2️⃣ **VERIFICAR FUNCTIONALANALYSISPAGE (113 BIOMARCADORES)**

### **Estado Actual:**
- ✅ Página existe: `src/pages/FunctionalAnalysisPage.tsx`
- ❓ No confirmado si muestra los 113 biomarcadores
- ❓ Puede necesitar mejoras en UI/UX

### **Objetivo:**
Asegurar que la página:
- Carga datos del análisis
- Muestra TODOS los 113 biomarcadores de la BD
- Clasifica cada uno (ÓPTIMO, ACEPTABLE, SUBÓPTIMO, ANÓMALO)
- Permite filtrar por categoría
- Muestra gráficos de rangos

### **Pasos de Verificación:**

#### **2.1 Leer el archivo actual**

```bash
# Primero, leer el archivo para ver qué existe:
# Lee: src/pages/FunctionalAnalysisPage.tsx
```

#### **2.2 Verificar que carga biomarcadores**

**Query esperado**:
```typescript
// Cargar análisis con biomarcadores
const { data: analysis } = await supabase
  .from('analyses')
  .select(`
    *,
    report:reports(*),
    patient:patients(*)
  `)
  .eq('id', analysisId)
  .single()

// Cargar TODOS los biomarcadores de la BD
const { data: biomarkerRanges } = await supabase
  .from('biomarker_ranges')
  .select('*')
  .order('category', { ascending: true })
```

#### **2.3 Parsear datos del AI analysis**

```typescript
// El campo report.ai_analysis contiene los biomarcadores extraídos del PDF
// Necesitamos parsearlos y compararlos con biomarker_ranges

interface ParsedBiomarker {
  code: string
  name: string
  value: number
  unit: string
  category: string
  classification: 'OPTIMO' | 'ACEPTABLE' | 'SUBOPTIMO' | 'ANOMALO'
  optimalMin: number
  optimalMax: number
}

function parseBiomarkersFromReport(aiAnalysis: string): ParsedBiomarker[] {
  // La IA debería retornar JSON con formato:
  /*
  {
    "biomarkers": [
      {
        "code": "PHOSPHORUS",
        "value": 3.5,
        "unit": "mg/dL",
        "classification": "OPTIMO"
      },
      ...
    ]
  }
  */

  const parsed = JSON.parse(aiAnalysis)
  return parsed.biomarkers
}
```

#### **2.4 Agregar filtros por categoría**

```typescript
const categories = [
  'electrolytes',
  'hormonal',
  'lipid',
  'nutritional',
  'hepatic',
  'hematology',
  'thyroid',
  'renal',
  'metabolic'
]

function FunctionalAnalysisPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [biomarkers, setBiomarkers] = useState<ParsedBiomarker[]>([])

  const filteredBiomarkers = selectedCategory
    ? biomarkers.filter(b => b.category === selectedCategory)
    : biomarkers

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
        >
          Todos ({biomarkers.length})
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} ({biomarkers.filter(b => b.category === cat).length})
          </Button>
        ))}
      </div>

      {/* Lista de biomarcadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBiomarkers.map(biomarker => (
          <BiomarkerCard key={biomarker.code} biomarker={biomarker} />
        ))}
      </div>
    </div>
  )
}
```

**Tiempo estimado**: 2 horas

---

## 3️⃣ **IMPLEMENTAR PAGINACIÓN EN LISTAS**

### **Estado Actual:**
- ❌ No hay paginación en PatientDashboard
- ❌ No hay paginación en DoctorDashboard
- ⚠️ Listas cargan TODOS los registros (puede ser lento con muchos datos)

### **Objetivo:**
Implementar paginación eficiente usando offset/limit de Supabase

### **Implementación:**

#### **3.1 Hook personalizado para paginación**

**Archivo**: `src/hooks/usePagination.ts` (crear nuevo)

```typescript
import { useState } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
}

export function usePagination({ totalItems, itemsPerPage = 20 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const offset = (currentPage - 1) * itemsPerPage

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return {
    currentPage,
    totalPages,
    offset,
    limit: itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}
```

#### **3.2 Componente de Paginación**

**Archivo**: `src/components/common/Pagination.tsx` (crear nuevo)

```typescript
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasPrevPage: boolean
  hasNextPage: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, hasPrevPage, hasNextPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-gray-700">
        Página <span className="font-medium">{currentPage}</span> de{' '}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
```

#### **3.3 Usar en PatientDashboard**

**Archivo**: `src/pages/PatientDashboard.tsx`

```typescript
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/common/Pagination'

export default function PatientDashboard() {
  const { userId } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const pagination = usePagination({
    totalItems: totalCount,
    itemsPerPage: 10, // 10 análisis por página
  })

  async function loadAnalyses() {
    // Obtener total count
    const { count } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', userId)

    setTotalCount(count || 0)

    // Obtener página actual
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('patient_id', userId)
      .order('uploaded_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1)

    setAnalyses(data || [])
  }

  useEffect(() => {
    loadAnalyses()
  }, [pagination.currentPage]) // Recargar cuando cambia página

  return (
    <div>
      {/* Lista de análisis */}
      <div className="space-y-4">
        {analyses.map(analysis => (
          <AnalysisCard key={analysis.id} analysis={analysis} />
        ))}
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        hasPrevPage={pagination.hasPrevPage}
        hasNextPage={pagination.hasNextPage}
      />
    </div>
  )
}
```

**Tiempo estimado**: 2 horas

---

## 4️⃣ **MEJORAR ERROR HANDLING Y LOADING STATES**

### **Objetivo:**
Reemplazar spinners básicos con Skeletons de shadcn/ui y agregar error boundaries

### **Implementación:**

#### **4.1 Loading Skeleton para Listas**

**Archivo**: `src/components/common/AnalysisListSkeleton.tsx` (crear nuevo)

```typescript
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function AnalysisListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-5 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </Card>
      ))}
    </div>
  )
}
```

#### **4.2 Usar en componentes**

```typescript
function PatientDashboard() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return <AnalysisListSkeleton />
  }

  return <div>...</div>
}
```

#### **4.3 Error Boundary mejorado**

Ya existe `ErrorBoundary.tsx`, pero asegurar que captura todos los errores.

**Tiempo estimado**: 1 hora

---

## ✅ **CHECKLIST DE FASE 3**

- [ ] Edge function `generate-report` completa
- [ ] Botón "Aprobar" genera PDF
- [ ] PDF se sube a Supabase Storage
- [ ] Campo `report_pdf_url` se actualiza
- [ ] PatientReportPage muestra PDF
- [ ] FunctionalAnalysisPage carga 113 biomarcadores
- [ ] Filtros por categoría funcionan
- [ ] Paginación en PatientDashboard
- [ ] Paginación en DoctorDashboard
- [ ] Skeletons en lugar de spinners
- [ ] Toasts para todas las acciones

---

## 📊 **TIEMPO TOTAL ESTIMADO**

- PDF Final: 3-4 horas
- FunctionalAnalysisPage: 2 horas
- Paginación: 2 horas
- Loading States: 1 hora
- **Total**: 8-9 horas

---

**Próximo paso**: Implementar una feature a la vez, testear, y marcar como completada antes de continuar.
