# 🎨 INSTALACIÓN Y CONFIGURACIÓN DE shadcn/ui

**Proyecto**: Cabo Health Clinic
**Framework**: Vite + React 18
**Fecha**: 2025-11-04

---

## 📋 **¿QUÉ ES shadcn/ui?**

**shadcn/ui** NO es una librería de componentes tradicional. Es una colección de **componentes copy-paste** que instalas directamente en tu proyecto.

### **Ventajas:**
- ✅ Tienes el código fuente completo (puedes modificarlo)
- ✅ No es una dependencia (cero lock-in)
- ✅ Basado en Radix UI (accesibilidad excelente)
- ✅ Usa Tailwind CSS (consistente con nuestro stack)
- ✅ TypeScript completo
- ✅ Componentes hermosos out-of-the-box

### **Estado Actual:**
- ⚠️ **shadcn/ui NO está instalado** en el proyecto
- ✅ Radix UI ya está instalado (dependencias en package.json)
- ✅ Tailwind CSS ya está configurado

---

## 🚀 **INSTALACIÓN PASO A PASO**

### **Prerrequisitos:**
```bash
# Asegúrate de estar en el directorio correcto:
cd "c:\Users\admin\Dropbox\Ai\cabo health clinic\cabo health clinic\cabo-health"

# Asegúrate de que pnpm está instalado:
pnpm --version
```

---

### **PASO 1: Inicializar shadcn/ui** (5 min)

```bash
pnpm dlx shadcn@latest init
```

**Te hará varias preguntas. Responde:**

```
? Would you like to use TypeScript? › Yes
? Which style would you like to use? › New York (más moderno y clean)
? Which color would you like to use as base color? › Zinc (neutral, ideal para app médica)
? Where is your global CSS file? › src/index.css
? Would you like to use CSS variables for colors? › Yes
? Where is your tailwind.config.js located? › tailwind.config.js
? Configure the import alias for components? › @/components
? Configure the import alias for utils? › @/lib/utils
```

**Resultado:**
- Crea `components.json` (ya existe, se actualizará)
- Actualiza `tailwind.config.js` con theme
- Crea carpeta `src/components/ui/` (aquí van los componentes)

---

### **PASO 2: Instalar Componentes Necesarios** (10 min)

Cabo Health necesita estos componentes:

#### **Componentes Esenciales:**
```bash
# Button - Botones en toda la app
pnpm dlx shadcn@latest add button

# Card - Para dashboards y listas
pnpm dlx shadcn@latest add card

# Dialog - Modales para confirmaciones
pnpm dlx shadcn@latest add dialog

# Select - Dropdowns (selección de doctor, etc.)
pnpm dlx shadcn@latest add select

# Input - Campos de formulario
pnpm dlx shadcn@latest add input

# Label - Labels de formularios
pnpm dlx shadcn@latest add label

# Toast - Notificaciones (success, error, info)
pnpm dlx shadcn@latest add toast

# Table - Tablas de datos (lista de análisis)
pnpm dlx shadcn@latest add table

# Badge - Pills de estado (pending, approved)
pnpm dlx shadcn@latest add badge

# Skeleton - Loading states
pnpm dlx shadcn@latest add skeleton
```

#### **Componentes Útiles (Opcionales):**
```bash
# Tabs - Para organizar contenido
pnpm dlx shadcn@latest add tabs

# Alert - Alertas importantes
pnpm dlx shadcn@latest add alert

# Avatar - Fotos de perfil
pnpm dlx shadcn@latest add avatar

# Dropdown Menu - Menús desplegables
pnpm dlx shadcn@latest add dropdown-menu

# Accordion - Secciones colapsables
pnpm dlx shadcn@latest add accordion

# Progress - Barras de progreso (upload PDF)
pnpm dlx shadcn@latest add progress

# Separator - Líneas divisoras
pnpm dlx shadcn@latest add separator
```

**Todos los componentes:**
```bash
# Si quieres instalar todos de una vez:
pnpm dlx shadcn@latest add button card dialog select input label toast table badge skeleton tabs alert avatar dropdown-menu accordion progress separator
```

---

### **PASO 3: Configurar Toaster (Notificaciones)** (5 min)

El componente `toast` necesita configuración adicional.

#### 3.1 Agregar Toaster al App.tsx

**Archivo**: `src/App.tsx`

```typescript
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ... tus rutas ... */}
        </Routes>
        {/* Agregar Toaster aquí */}
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
```

#### 3.2 Usar Toasts en tu código

```typescript
import { useToast } from "@/components/ui/use-toast"

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "¡Análisis subido!",
      description: "Tu análisis será revisado por un médico pronto.",
    })
  }

  const handleError = () => {
    toast({
      title: "Error",
      description: "Hubo un problema al subir el archivo.",
      variant: "destructive",
    })
  }

  return (
    <button onClick={handleSuccess}>Test Toast</button>
  )
}
```

---

## 🎨 **EJEMPLOS DE USO**

### **Ejemplo 1: Reemplazar Botón Custom con shadcn Button**

**Antes** (código actual):
```tsx
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
  Ver Resultados
</button>
```

**Después** (con shadcn):
```tsx
import { Button } from "@/components/ui/button"

<Button>Ver Resultados</Button>

// Con variantes:
<Button variant="destructive">Eliminar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Editar</Button>
```

---

### **Ejemplo 2: Card para Análisis**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function AnalysisCard({ analysis }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{analysis.pdf_filename}</CardTitle>
          <Badge variant={analysis.status === 'approved' ? 'default' : 'secondary'}>
            {analysis.status}
          </Badge>
        </div>
        <CardDescription>
          Subido: {new Date(analysis.uploaded_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Estado: {analysis.status}</p>
      </CardContent>
      <CardFooter>
        <Button>Ver Detalles</Button>
      </CardFooter>
    </Card>
  )
}
```

---

### **Ejemplo 3: Dialog para Confirmaciones**

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function DeleteAnalysisDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Eliminar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El análisis será eliminado permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Sí, eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### **Ejemplo 4: Table para Lista de Análisis**

```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function AnalysisTable({ analyses }) {
  return (
    <Table>
      <TableCaption>Lista de análisis recientes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {analyses.map((analysis) => (
          <TableRow key={analysis.id}>
            <TableCell>{analysis.patient?.name}</TableCell>
            <TableCell>{new Date(analysis.uploaded_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge>{analysis.status}</Badge>
            </TableCell>
            <TableCell>
              <Button size="sm">Ver</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

### **Ejemplo 5: Skeleton para Loading States**

```tsx
import { Skeleton } from "@/components/ui/skeleton"

function AnalysisListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Uso:
function AnalysisList() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return <AnalysisListSkeleton />
  }

  return <div>...</div>
}
```

---

## 🔄 **MIGRACIÓN DE COMPONENTES EXISTENTES**

### **Componentes a Reemplazar:**

1. **Spinners** → `<Skeleton />`
2. **Botones custom** → `<Button />`
3. **Divs con estilos de card** → `<Card />`
4. **Alerts custom** → `<Alert />`
5. **Status badges** → `<Badge />`

### **Estrategia de Migración:**

1. **No migrar todo de una vez**
2. Empezar por componentes nuevos
3. Migrar componentes existentes gradualmente
4. Mantener consistencia visual

---

## ✅ **VERIFICACIÓN**

Después de instalar, verifica que funciona:

```bash
# 1. Compilar proyecto
pnpm dev

# 2. Verificar que la carpeta existe:
ls src/components/ui/

# Debe mostrar:
# button.tsx
# card.tsx
# dialog.tsx
# toast.tsx
# ... etc

# 3. En el navegador, no debe haber errores de TypeScript
```

---

## 🎨 **CUSTOMIZACIÓN**

### **Cambiar Colores:**

**Archivo**: `src/index.css`

```css
@layer base {
  :root {
    --primary: 205 100% 24%; /* Azul médico de Cabo Health */
    --primary-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* ... más variables ... */
  }
}
```

### **Cambiar Tamaños por Defecto:**

```tsx
// En cada componente, puedes modificar:
// src/components/ui/button.tsx

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ...",
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8", // Modificar aquí
      },
    },
  }
)
```

---

## 📚 **RECURSOS**

- **Documentación oficial**: https://ui.shadcn.com/
- **Todos los componentes**: https://ui.shadcn.com/docs/components
- **Examples**: https://ui.shadcn.com/examples
- **Themes**: https://ui.shadcn.com/themes

---

## ⏱️ **TIEMPO ESTIMADO**

- Instalación inicial: 5 min
- Instalar 10 componentes: 10 min
- Configurar Toaster: 5 min
- Prueba y verificación: 10 min
- **Total**: ~30 minutos

---

## 🚨 **TROUBLESHOOTING**

### Error: "Cannot find module '@/components/ui/button'"
```bash
# Solución: Verificar alias en vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Error: "Module not found: Can't resolve 'class-variance-authority'"
```bash
# Solución: Instalar dependencia
pnpm add class-variance-authority
```

### Estilos no se aplican
```bash
# Solución: Verificar que Tailwind está configurado
# Ver tailwind.config.js incluye:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

---

**Última actualización**: 2025-11-04
**Próximo paso**: Usar shadcn/ui en componentes nuevos y migrar gradualmente los existentes
