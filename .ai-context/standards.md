# Code Standards - Cabo Health Clinic

## 🎯 Filosofía de Código
Mantenemos un código limpio, modular y mantenible que refleje las mejores prácticas de desarrollo React/TypeScript y medicina funcional.

## 📝 Convenciones de Nomenclatura

### TypeScript/JavaScript
```typescript
// Interfaces - PascalCase con sufijo Interface
interface UserInterface {
  id: string;
  email: string;
  role: UserRole;
}

// Types - PascalCase sin sufijo
type UserRole = 'doctor' | 'patient';
type BiomarkerStatus = 'OPTIMO' | 'ACEPTABLE' | 'SUBOPTIMO' | 'ANOMALO';

// Constants - SCREAMING_SNAKE_CASE
const BIOMARKER_CATEGORIES = {
  METABOLICOS: 'metabolicos',
  LIPIDICOS: 'lipidicos',
  TIROIDEOS: 'tiroideos'
} as const;

// Variables y funciones - camelCase
const userEmail = 'doctor@example.com';
const analyzeBiomarker = (value: number, ranges: Range) => {};
```

### React Components
```tsx
// Nombres de componentes - PascalCase
const BiomarkerCard: React.FC<BiomarkerCardProps> = ({ biomarker }) => {
  return (
    <div className="biomarker-card">
      {/* Contenido */}
    </div>
  );
};

// Props - camelCase
interface BiomarkerCardProps {
  biomarkerName: string;
  value: number;
  unit: string;
  category: BiomarkerCategory;
  status: BiomarkerStatus;
}

// Archivos - PascalCase.tsx
BiomarkerCard.tsx
UserProfile.tsx
AnalysisReviewPage.tsx
```

### Base de Datos (Supabase)
```sql
-- Tablas - snake_case
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  specialty VARCHAR NOT NULL,
  license_number VARCHAR NOT NULL
);

-- Edge Functions - kebab-case
classify-biomarker/
get-biomarker-ranges/
process-pdf/
```

## 🏗️ Arquitectura de Componentes

### Estructura de Componentes
```
src/components/
├── biomarkers/           # Componentes específicos de biomarcadores
│   ├── BiomarkerCard.tsx
│   ├── BiomarkerSummary.tsx
│   └── index.ts
├── common/              # Componentes compartidos
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   └── Navigation.tsx
└── ui/                  # Componentes UI base (Radix + Tailwind)
    ├── Button.tsx
    ├── Card.tsx
    └── Input.tsx
```

### Componentes Médicos Especializados
```tsx
// Ejemplo: BiomarkerCard optimizado
interface BiomarkerCardProps {
  biomarker: BiomarkerData;
  showRanges?: boolean;
  onValueChange?: (value: number) => void;
}

const BiomarkerCard: React.FC<BiomarkerCardProps> = ({
  biomarker,
  showRanges = true,
  onValueChange
}) => {
  const { status, color, interpretation } = useBiomarkerAnalysis(biomarker);
  
  return (
    <Card className={cn("border-l-4", color.border)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {biomarker.name}
        </CardTitle>
        <CardDescription>
          {biomarker.unit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {biomarker.value} {biomarker.unit}
          </div>
          <Badge variant={statusVariant(status)}>
            {status}
          </Badge>
          {showRanges && (
            <BiomarkerRanges ranges={biomarker.ranges} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 🗄️ Supabase Standards

### Row Level Security (RLS)
```sql
-- RLS obligatorio en todas las tablas
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Política: Pacientes ven solo sus análisis
CREATE POLICY "patients_see_own_analyses" ON analyses
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    EXISTS (
      SELECT 1 FROM doctors WHERE id = auth.uid()
    )
  );

-- Política: Solo Edge Functions pueden insertar
CREATE POLICY "edge_functions_insert" ON analyses
  FOR INSERT WITH CHECK (false);
```

### Edge Functions
```typescript
// Estructura estándar para Edge Functions
// supabase/functions/analyze-biomarker/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { biomarkerName, value } = await req.json()
    
    // Lógica de la función
    const analysis = await analyzeBiomarker(biomarkerName, value)
    
    return new Response(
      JSON.stringify({ data: analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function analyzeBiomarker(name: string, value: number) {
  // Implementación de análisis
}
```

### Storage
```typescript
// Configuración de Storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Subida de archivos médicos
const uploadMedicalReport = async (file: File, patientId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${patientId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('medical-reports')
    .upload(fileName, file)
    
  if (error) throw error
  return data
}
```

## 🎨 Estilo y Diseño

### Tailwind CSS
```tsx
// Usar clases utilitarias consistentes
<div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
  <h2 className="text-lg font-semibold text-gray-900">
    Análisis de Biomarcadores
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Componentes */}
  </div>
</div>

// Colores médicos específicos
const MEDICAL_COLORS = {
  OPTIMO: 'bg-green-50 border-green-200 text-green-800',
  ACEPTABLE: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  SUBOPTIMO: 'bg-orange-50 border-orange-200 text-orange-800',
  ANOMALO: 'bg-red-50 border-red-200 text-red-800'
}
```

### Componentes UI
```tsx
// Usar shadcn/ui + Radix UI
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Patrón consistente
<Card>
  <CardHeader>
    <CardTitle>Biomarcadores</CardTitle>
    <CardDescription>Clasificación funcional</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Contenido */}
    </div>
  </CardContent>
</Card>
```

## 🔧 Utilidades y Helpers

### cn() Utility
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Uso en componentes
<div className={cn(
  "base-classes",
  variant === "primary" && "primary-styles",
  isDisabled && "disabled-state"
)}>
```

### Custom Hooks
```typescript
// hooks/useBiomarkerAnalysis.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useBiomarkerAnalysis = (biomarker: BiomarkerData) => {
  const [analysis, setAnalysis] = useState<BiomarkerAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const analyze = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('classify-biomarker', {
          body: { name: biomarker.name, value: biomarker.value }
        })
        
        if (error) throw error
        setAnalysis(data)
      } catch (error) {
        console.error('Error analyzing biomarker:', error)
      } finally {
        setLoading(false)
      }
    }

    analyze()
  }, [biomarker.name, biomarker.value])

  return { analysis, loading }
}
```

## 📊 Contextos y Estado

### AuthContext
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  role: 'doctor' | 'patient' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 🧪 Testing Standards

### Jest + Testing Library
```typescript
// __tests__/components/BiomarkerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BiomarkerCard } from '@/components/biomarkers/BiomarkerCard'

const mockBiomarker = {
  name: 'Glucosa',
  value: 95,
  unit: 'mg/dL',
  status: 'SUBOPTIMO' as const
}

describe('BiomarkerCard', () => {
  it('renders biomarker information correctly', () => {
    render(<BiomarkerCard biomarker={mockBiomarker} />)
    
    expect(screen.getByText('Glucosa')).toBeInTheDocument()
    expect(screen.getByText('95 mg/dL')).toBeInTheDocument()
    expect(screen.getByText('SUBOPTIMO')).toBeInTheDocument()
  })

  it('calls onValueChange when value is updated', () => {
    const mockOnChange = jest.fn()
    render(
      <BiomarkerCard 
        biomarker={mockBiomarker} 
        onValueChange={mockOnChange}
      />
    )
    
    // Simular cambio de valor
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '100' }
    })
    
    expect(mockOnChange).toHaveBeenCalledWith(100)
  })
})
```

## 🚀 Git Workflow

### Branch Naming
```
feature/biomarker-classification-system
feature/patient-dashboard-improvements
bugfix/fix-biomarker-ranges-calculation
hotfix/security-vulnerability-fix
docs/update-api-documentation
```

### Commit Messages (Conventional Commits)
```
feat: add biomarker classification system
fix: correct glucose range calculation
docs: update API documentation
style: improve component styling
refactor: restructure biomarker components
test: add unit tests for classification
chore: update dependencies
```

### Pull Request Process
1. Feature branches from `main`
2. Squash and merge to `main`
3. Delete branch after merge
4. Include tests for new features
5. Update documentation

## 📱 Responsive Design

### Mobile First
```css
/* Mobile-first approach */
.biomarker-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile */
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .biomarker-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .biomarker-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Touch-Friendly Interface
```tsx
// Botones con área de toque adecuada
<Button 
  className="min-h-[44px] min-w-[44px]"
  onClick={handleAction}
>
  Acción
</Button>

// Inputs grandes para móviles
<Input 
  className="text-base" // Evita zoom en iOS
  type="number"
  placeholder="Ingrese valor"
/>
```

## 🔒 Seguridad

### Validación de Datos
```typescript
// Usar Zod para validación
import { z } from 'zod'

const BiomarkerSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().positive(),
  unit: z.string().min(1).max(10),
  category: z.enum(['metabolicos', 'lipidicos', 'tiroideos'])
})

const validateBiomarker = (data: unknown) => {
  return BiomarkerSchema.parse(data)
}
```

### Sanitización
```typescript
// Limpiar inputs del usuario
import DOMPurify from 'dompurify'

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  })
}
```

---

## ✅ Checklist de Code Review

### Antes de hacer commit:
- [ ] Código sigue convenciones de nomenclatura
- [ ] TypeScript types son correctos y específicos
- [ ] Componentes tienen props tipadas
- [ ] Linter no reporta errores
- [ ] Tests pasan correctamente
- [ ] Responsive design implementado
- [ ] Accesibilidad considerada (a11y)
- [ ] Performance optimizada
- [ ] Seguridad validada
- [ ] Documentación actualizada

---
**Última actualización:** 2025-11-03 09:12:44  
**Por:** MiniMax Agent  
**Versión:** 1.0