# Tool Guidance - Cabo Health Clinic

## 🎯 Objetivo
Esta guía te ayudará a entender cómo trabajar eficientemente con las herramientas y tecnologías de Cabo Health Clinic.

## 🛠️ Herramientas de Desarrollo

### Desarrollo Frontend

#### Estructura de Archivos
```
src/
├── components/          # Todos los componentes React
│   ├── biomarkers/     # Componentes específicos de biomarcadores
│   ├── common/         # Componentes compartidos
│   └── ui/             # Componentes UI base
├── pages/              # Páginas principales de la aplicación
├── contexts/           # React Contexts (Auth, Theme, etc.)
├── hooks/              # Custom hooks
└── lib/                # Utilidades y configuración
```

#### Modificar Componentes Existentes
```typescript
// Ejemplo: Modificar BiomarkerCard.tsx
// Archivo: src/components/biomarkers/BiomarkerCard.tsx

interface BiomarkerCardProps {
  biomarker: BiomarkerData;
  showRanges?: boolean;
  compact?: boolean; // Nueva prop
}

const BiomarkerCard: React.FC<BiomarkerCardProps> = ({
  biomarker,
  showRanges = true,
  compact = false
}) => {
  // Lógica del componente
  return (
    <Card className={cn(
      "biomarker-card",
      compact && "compact-mode"
    )}>
      {/* JSX del componente */}
    </Card>
  );
};
```

#### Añadir Nuevos Componentes
1. **Crear archivo en la carpeta correcta**
2. **Usar naming conventions PascalCase**
3. **Exportar en index.ts correspondiente**
4. **Tipar props con TypeScript**

```typescript
// src/components/biomarkers/BiomarkerChart.tsx
interface BiomarkerChartProps {
  data: BiomarkerData[];
  timeRange: 'week' | 'month' | 'year';
  biomarkerType: string;
}

export const BiomarkerChart: React.FC<BiomarkerChartProps> = ({
  data,
  timeRange,
  biomarkerType
}) => {
  // Implementación
  return <div>Chart Component</div>;
};

// src/components/biomarkers/index.ts
export { BiomarkerCard } from './BiomarkerCard';
export { BiomarkerSummary } from './BiomarkerSummary';
export { BiomarkerChart } from './BiomarkerChart'; // Nuevo export
```

#### Añadir Nuevas Páginas
```typescript
// src/pages/ReportsPage.tsx
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export const ReportsPage: React.FC = () => {
  const { user, role } = useAuth();
  
  if (role !== 'doctor') {
    return <div>Access denied</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reportes Médicos</h1>
        {/* Contenido de la página */}
      </div>
    </DashboardLayout>
  );
};
```

### Backend Supabase

#### Edge Functions
**Ubicación:** `supabase/functions/[function-name]/`

```typescript
// supabase/functions/analyze-biomarker/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    const { biomarkerName, value, ranges } = requestData
    
    // Lógica de la función
    const result = await classifyBiomarker(biomarkerName, value, ranges)
    
    return new Response(
      JSON.stringify({ data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      { status: 500 }
    )
  }
})

async function classifyBiomarker(name: string, value: number, ranges: any) {
  // Implementación de clasificación
  // Retorna: { status, color, interpretation, recommendations }
}
```

#### Migraciones de Base de Datos
```sql
-- supabase/migrations/20241103_add_biomarker_categories.sql
CREATE TABLE IF NOT EXISTS biomarker_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT,
  color_code VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar categorías
INSERT INTO biomarker_categories (name, display_name, description, color_code) VALUES
('metabolicos', 'Metabólicos', 'Biomarcadores de metabolismo', '#3B82F6'),
('lipidicos', 'Lipídicos', 'Perfil lipídico', '#10B981'),
('tiroideos', 'Tiroideos', 'Función tiroidea', '#F59E0B');

-- RLS
ALTER TABLE biomarker_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON biomarker_categories
  FOR SELECT USING (true);
```

#### Tablas de Base de Datos
```sql
-- supabase/tables/biomarker_ranges.sql
CREATE TABLE IF NOT EXISTS biomarker_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  optimal_min DECIMAL(10,2),
  optimal_max DECIMAL(10,2),
  acceptable_min DECIMAL(10,2),
  acceptable_max DECIMAL(10,2),
  conventional_min DECIMAL(10,2),
  conventional_max DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_ranges CHECK (
    (optimal_min IS NULL OR optimal_max IS NULL OR optimal_min <= optimal_max) AND
    (acceptable_min IS NULL OR acceptable_max IS NULL OR acceptable_min <= acceptable_max) AND
    (conventional_min IS NULL OR conventional_max IS NULL OR conventional_min <= conventional_max)
  )
);
```

#### Storage y Buckets
```typescript
// Configurar bucket para reportes médicos
const createMedicalReportsBucket = async () => {
  const { data, error } = await supabase.storage.createBucket('medical-reports', {
    public: true,
    fileSizeLimit: 20971520, // 20MB
    allowedMimeTypes: ['application/pdf', 'image/*']
  })
  
  if (error) {
    console.error('Error creating bucket:', error)
    return
  }
  
  // Configurar políticas RLS
  await supabase.rpc('create_storage_policy', {
    bucket_name: 'medical-reports',
    policy_name: 'public_read_reports',
    operation: 'SELECT'
  })
}
```

### Comandos y Workflows

#### Desarrollo Local
```bash
# Iniciar desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint

# Instalar dependencias
pnpm install
```

#### Supabase Local
```bash
# Iniciar Supabase local
npx supabase start

# Detener
npx supabase stop

# Resetear DB
npx supabase db reset

# Aplicar migraciones
npx supabase db push

# Servir Edge Functions localmente
npx supabase functions serve

# Ver logs
npx supabase logs
```

#### Deployment
```bash
# Build antes de deploy
pnpm build

# Deploy se maneja automáticamente por la plataforma
# Asegurar que las variables de entorno estén configuradas:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# GROQ_API_KEY
```

### Configuración de Entorno

#### Variables de Entorno
```bash
# .env.local
VITE_SUPABASE_URL=https://holtohiphaokzshtpyku.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GROQ_API_KEY=tu_groq_api_key_aqui

# Para desarrollo local
SUPABASE_ACCESS_TOKEN=tu_token_aqui
SUPABASE_PROJECT_ID=holtohiphaokzshtpyku
```

#### Configuración de Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 📊 Herramientas de Análisis Médico

### Clasificación de Biomarcadores
```typescript
// Usar Edge Function para clasificar
const classifyBiomarker = async (name: string, value: number) => {
  const { data, error } = await supabase.functions.invoke('classify-biomarker', {
    body: { 
      biomarkerName: name, 
      value: value 
    }
  })
  
  if (error) throw error
  return data
}

// En componente React
const BiomarkerAnalysis = ({ biomarker }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const analyze = async () => {
      setLoading(true)
      try {
        const result = await classifyBiomarker(
          biomarker.name, 
          biomarker.value
        )
        setAnalysis(result)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    analyze()
  }, [biomarker.name, biomarker.value])
  
  if (loading) return <div>Analyzing...</div>
  if (!analysis) return <div>No analysis available</div>
  
  return (
    <div className={`status-${analysis.status.toLowerCase()}`}>
      <span>{analysis.status}</span>
      <p>{analysis.interpretation}</p>
    </div>
  )
}
```

### Gestión de Archivos Médicos
```typescript
// Subir PDF de laboratorio
const uploadLabReport = async (file: File, patientId: string) => {
  try {
    // Convertir a base64
    const base64 = await fileToBase64(file)
    
    // Llamar Edge Function
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: {
        pdfData: base64,
        fileName: file.name,
        patientId: patientId
      }
    })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
```

## 🧪 Testing y Debugging

### Unit Tests
```typescript
// __tests__/utils/biomarkerUtils.test.ts
import { classifyBiomarkerValue } from '@/utils/biomarkerUtils'

describe('Biomarker Classification', () => {
  it('should classify glucose correctly', () => {
    const result = classifyBiomarkerValue('glucose', 95)
    expect(result.status).toBe('SUBOPTIMO')
    expect(result.recommendations).toContain('dietary')
  })
  
  it('should handle optimal values', () => {
    const result = classifyBiomarkerValue('glucose', 80)
    expect(result.status).toBe('OPTIMO')
  })
})
```

### Integration Tests
```typescript
// __tests__/integration/biomarkerAnalysis.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import { BiomarkerAnalyzer } from '@/components/BiomarkerAnalyzer'

describe('BiomarkerAnalyzer Integration', () => {
  it('should analyze and display results', async () => {
    render(<BiomarkerAnalyzer />)
    
    // Simular subida de archivo
    const fileInput = screen.getByLabelText(/upload lab report/i)
    const file = new File(['test data'], 'report.pdf', { type: 'application/pdf' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Esperar resultados
    await waitFor(() => {
      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument()
    })
  })
})
```

### Debugging
```typescript
// Usar console.log estratégico
const analyzeBiomarker = (biomarker: BiomarkerData) => {
  console.log('Analyzing biomarker:', biomarker.name)
  console.log('Value:', biomarker.value)
  
  const classification = performClassification(biomarker)
  
  console.log('Classification result:', classification)
  return classification
}

// Error boundaries para React
class BiomarkerErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Biomarker component error:', error, errorInfo)
    // Reportar a servicio de errores
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with biomarker analysis.</div>
    }
    return this.props.children
  }
}
```

## 🔧 Utilidades Comunes

### Custom Hooks
```typescript
// hooks/useBiomarkerData.ts
export const useBiomarkerData = (patientId: string) => {
  const [biomarkers, setBiomarkers] = useState<BiomarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchBiomarkers = async () => {
      try {
        const { data, error } = await supabase
          .from('biomarkers')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setBiomarkers(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBiomarkers()
  }, [patientId])
  
  return { biomarkers, loading, error }
}
```

### Utilidades de Fecha
```typescript
// lib/dateUtils.ts
export const formatBiomarkerDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export const getDateRange = (period: 'week' | 'month' | 'year') => {
  const now = new Date()
  const start = new Date()
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return { start, end: now }
}
```

### Validación con Zod
```typescript
// schemas/biomarker.ts
import { z } from 'zod'

export const BiomarkerSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().positive(),
  unit: z.string().min(1).max(10),
  category: z.enum([
    'metabolicos',
    'lipidicos', 
    'tiroideos',
    'nutricionales',
    'hormonales',
    'cardiovasculares',
    'hepaticos',
    'renales',
    'inflamatorios',
    'hematologicos',
    'electrolitos'
  ]),
  patientId: z.string().uuid(),
  analysisDate: z.string().datetime()
})

export type BiomarkerInput = z.infer<typeof BiomarkerSchema>
```

## 📱 Optimización de Performance

### Lazy Loading
```typescript
// Cargar componentes bajo demanda
const FunctionalAnalysisPage = lazy(() => import('@/pages/FunctionalAnalysisPage'))
const PatientReportPage = lazy(() => import('@/pages/PatientReportPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/functional-analysis" element={<FunctionalAnalysisPage />} />
          <Route path="/patient-report/:id" element={<PatientReportPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Memoización
```typescript
// Memoizar componentes costosos
const BiomarkerChart = memo(({ data, timeRange }) => {
  const processedData = useMemo(() => {
    return data.filter(item => {
      const itemDate = new Date(item.date)
      const cutoffDate = getDateRange(timeRange).start
      return itemDate >= cutoffDate
    })
  }, [data, timeRange])
  
  return <LineChart data={processedData} />
})
```

## 🚨 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules .vite
pnpm install
pnpm dev
```

### Error de Supabase Connection
```typescript
// Verificar configuración
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('doctors').select('count')
    if (error) {
      console.error('Supabase error:', error)
      return false
    }
    console.log('✅ Supabase connected successfully')
    return true
  } catch (err) {
    console.error('Connection failed:', err)
    return false
  }
}
```

### Edge Function Errors
```typescript
// Debug Edge Functions
serve(async (req) => {
  try {
    console.log('Request received:', req.method, req.url)
    const body = await req.json()
    console.log('Request body:', body)
    
    // Tu lógica aquí
    
    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { status: 500 }
    )
  }
})
```

---

## ✅ Quick Reference

### Archivos Importantes
- `src/contexts/AuthContext.tsx` - Autenticación
- `src/lib/supabase.ts` - Configuración Supabase  
- `supabase/functions/` - Edge Functions
- `.ai-context/standards.md` - Estándares de código
- `.ai-context/project-facts.md` - Facts del proyecto

### Comandos Esenciales
```bash
pnpm dev          # Desarrollo
pnpm build        # Build
npx supabase start # Local DB
```

### URLs Importantes
- Supabase: https://holtohiphaokzshtpyku.supabase.co
- Functions: /functions/v1/[name]

---
**Última actualización:** 2025-11-03 09:12:44  
**Por:** MiniMax Agent  
**Versión:** 1.0