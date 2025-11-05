# 📋 PLAN DE REORGANIZACIÓN - CABO HEALTH

## 📊 RESUMEN DEL ANÁLISIS

### ✅ STACK TECNOLÓGICO CONFIRMADO:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **IA:** Groq API + Edge Functions para clasificación médica
- **113 biomarcadores** validados científicamente
- **Sistema completo** operativo y funcional

### ❌ PROBLEMAS DETECTADOS:
- Documentación dispersa (7+ archivos .md en raíz)
- Falta estructura estándar (.ai-context/, memory/, docs/)
- No hay guía de estándares de código
- Memory del proyecto disperso
- Tool guidance no centralizado

---

## 🏗️ ESTRUCTURA PROFESIONAL PROPUESTA

```
cabo-health-clinic/ (RAÍZ DEL PROYECTO)
├── 📁 .ai-context/                    # PARA EL AGENTE IA
│   ├── project-facts.md              # Stack, comandos, links
│   ├── standards.md                  # Reglas de código
│   └── tool-guidance.md              # Cómo usar herramientas
├── 📁 memory/                        # CONTEXTO ENTRE SESIONES
│   ├── NOTES.md                      # Actividades diarias
│   ├── TODO.md                       # Lista de pendientes
│   ├── DECISIONS.md                  # Decisiones técnicas
│   └── BLOCKERS.md                   # Problemas bloqueantes
├── 📁 docs/                          # DOCUMENTACIÓN TÉCNICA
│   ├── README.md                     # Guía de inicio
│   ├── ARCHITECTURE.md               # Arquitectura del sistema
│   ├── SECURITY.md                   # Variables y secretos
│   ├── OPERATIONS.md                 # Comandos y deploy
│   └── API.md                        # Documentación de APIs
├── 📁 src/                           # CÓDIGO FUENTE ACTUAL
├── 📁 supabase/                      # BACKEND ACTUAL
└── 📁 tests/                         # TESTS (por crear)
```

---

## 📝 PLAN DE EJECUCIÓN (PASO A PASO)

### **PASO 1: CREAR CARPETAS PRINCIPALES**
```bash
# Crear estructura de carpetas
mkdir -p .ai-context/{src,assets}
mkdir -p memory/{daily,weekly}
mkdir -p tests/{unit,integration,e2e}
mkdir -p docs/{api,guides,architecture}
mkdir -p scripts
mkdir -p configs
```

### **PASO 2: MIGRAR DOCUMENTACIÓN EXISTENTE**
```bash
# Mover archivos .md dispersos a docs/
mv ARQUITECTURA.md docs/
mv CONFIGURACION_GROQ_API.md docs/
mv DIAGNOSTICO_Y_SOLUCION.md docs/
mv ENTREGABLE_CABO_HEALTH.md docs/
mv GUIA_PRIVACIDAD_ACCESO_CABO_HEALTH.md docs/
mv PRUEBAS_SISTEMA_CABO_HEALTH.md docs/
mv RESUMEN_SISTEMA_CABO_HEALTH.md docs/
mv SISTEMA_MEDICINA_FUNCIONAL.md docs/
```

### **PASO 3: CREAR ARCHIVOS DE CONTEXTO (.ai-context/)**

#### 📄 project-facts.md
```markdown
# Cabo Health Clinic - Project Facts

## Stack Tecnológico
- **Frontend:** React 18.3 + TypeScript 5.6 + Vite 6.2
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **UI:** Tailwind CSS 3.4 + Radix UI + Chart.js 4.5
- **IA:** Groq API (Llama 3.3-70b-versatile)
- **Build:** pnpm + ESLint + TypeScript

## Comandos Principales
```bash
# Desarrollo
pnpm dev                    # Iniciar servidor desarrollo
pnpm build                  # Build producción
pnpm build:prod            # Build optimizado
pnpm preview               # Preview build
pnpm lint                  # Linter

# Supabase
npx supabase start         # Iniciar local
npx supabase db reset      # Reset DB local
```

## URLs y Configuración
- **Proyecto:** https://holtohiphaokzshtpyku.supabase.co
- **Edge Functions:** /functions/v1/[function-name]
- **Deploy URL:** (actualizar según deploy)
```

#### 📄 standards.md
```markdown
# Code Standards - Cabo Health

## TypeScript Guidelines
- **Interfaces:** PascalCase con sufijo Interface (ej: `UserInterface`)
- **Types:** PascalCase sin sufijo (ej: `UserRole`)
- **Constants:** SCREAMING_SNAKE_CASE
- **Variables/Functions:** camelCase

## React Components
- **Naming:** PascalCase para componentes
- **Props:** camelCase
- **Files:** PascalCase.tsx
- **Hooks:** useHookName.tsx

## Supabase
- **Tablas:** snake_case
- **RLS Policies:** Nivel de seguridad obligatorio
- **Edge Functions:** Deno + TypeScript
- **Storage:** Buckets con políticas públicas/privadas

## Git Workflow
- **Branches:** feature/description, bugfix/description
- **Commits:** Conventional Commits (feat:, fix:, docs:, etc.)
- **PRs:** Squash and merge a main
```

#### 📄 tool-guidance.md
```markdown
# Tool Guidance - Cabo Health

## Desarrollo Frontend
- **Modificar componentes:** Trabajar en src/components/
- **Añadir páginas:** Crear en src/pages/
- **Contextos:** Mantener en src/contexts/
- **Hooks personalizados:** Crear en src/hooks/

## Backend Supabase
- **Edge Functions:** Crear en supabase/functions/
- **Migraciones:** Añadir en supabase/migrations/
- **Tablas:** Documentar en supabase/tables/
- **Storage:** Configurar buckets según necesidades

## Deploy y Operaciones
- **Build:** pnpm build siempre antes de deploy
- **Variables:** Configurar SUPABASE_URL, SUPABASE_ANON_KEY
- **Testing:** Crear tests antes de cambios mayores
```

### **PASO 4: CREAR ARCHIVOS DE MEMORIA (memory/)**

#### 📄 NOTES.md
```markdown
# Daily Notes - Cabo Health

## 2025-11-03
- ✅ Análisis completo del proyecto
- ✅ Identificación del stack tecnológico
- ✅ Detección de problemas de organización
- 📋 Plan de reorganización creado

## Próximas actividades
- Crear estructura de carpetas
- Migrar documentación existente
- Configurar archivos de contexto
```

#### 📄 TODO.md
```markdown
# TODO List - Cabo Health

## Reorganización (Prioridad Alta)
- [ ] Crear estructura de carpetas (.ai-context/, memory/, docs/)
- [ ] Migrar documentación dispersa a docs/
- [ ] Crear project-facts.md
- [ ] Crear standards.md
- [ ] Crear tool-guidance.md
- [ ] Configurar NOTES.md, TODO.md, DECISIONS.md, BLOCKERS.md

## Documentación (Prioridad Media)
- [ ] Crear README.md principal
- [ ] Actualizar ARCHITECTURE.md
- [ ] Crear SECURITY.md
- [ ] Crear OPERATIONS.md
- [ ] Crear API.md

## Testing (Prioridad Baja)
- [ ] Crear tests unitarios
- [ ] Crear tests de integración
- [ ] Configurar E2E tests
```

#### 📄 DECISIONS.md
```markdown
# Technical Decisions - Cabo Health

## 2025-11-03
- **Stack elegido:** React + TypeScript + Supabase
- **UI Framework:** Tailwind CSS + Radix UI
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **IA Integration:** Groq API para análisis médico
- **Build Tool:** Vite (por velocidad de desarrollo)
- **Package Manager:** pnpm (por eficiencia)

## Decisiones de Arquitectura
- **Frontend-Backend:** Separación clara (React/Supabase)
- **Edge Functions:** Procesamiento de PDFs y clasificación
- **RLS:** Row Level Security obligatorio
- **Storage:** Buckets públicos para reportes médicos
```

#### 📄 BLOCKERS.md
```markdown
# Current Blockers - Cabo Health

## No hay bloqueos actuales
- ✅ Proyecto completamente funcional
- ✅ Backend operativo
- ✅ Frontend desplegado
- ✅ Base de datos poblada

## Observaciones
- Ningún bloqueo técnico identificado
- Proyecto listo para reorganización
```

### **PASO 5: MEJORAR DOCUMENTACIÓN (docs/)**

#### 📄 README.md (Principal)
```markdown
# Cabo Health Clinic 🏥

Plataforma médica completa que combina medicina convencional y funcional avanzada para análisis optimizado de biomarcadores de salud.

## Quick Start
```bash
git clone [repository]
cd cabo-health-clinic
pnpm install
pnpm dev
```

## Documentación
- 📚 [Architecture](./docs/ARCHITECTURE.md) - Arquitectura del sistema
- 🔐 [Security](./docs/SECURITY.md) - Variables y configuración
- ⚙️ [Operations](./docs/OPERATIONS.md) - Comandos y deployment
- 🔗 [API](./docs/API.md) - Documentación de APIs
```

### **PASO 6: CONFIGURACIONES (configs/)**

#### 📄 eslint.config.js
```javascript
// Configuración ESLint específica para el proyecto
export default [
  {
    // Reglas específicas para React + TypeScript
  }
];
```

---

## ✅ BENEFICIOS DE LA REORGANIZACIÓN

1. **Para el Agente IA:**
   - Contexto centralizado en .ai-context/
   - Estándares claros para modificaciones
   - Tool guidance específico del proyecto

2. **Para el Equipo:**
   - Documentación centralizada y organizada
   - Memoria del proyecto persistente
   - Estándares de código claros

3. **Para el Desarrollo:**
   - Estructura profesional estándar
   - Comandos centralizados
   - Testing framework preparado

4. **Para el Mantenimiento:**
   - Decisions tracking
   - Blocker identification
   - Historical context preserved

---

## ⏰ TIEMPO ESTIMADO DE EJECUCIÓN

- **Paso 1-2:** 15 minutos (Crear carpetas + migrar docs)
- **Paso 3:** 30 minutos (Crear archivos .ai-context/)
- **Paso 4:** 20 minutos (Configurar memory/)
- **Paso 5:** 25 minutos (Mejorar docs/)
- **Paso 6:** 15 minutos (Configs)

**TOTAL:** ~1.5 horas de reorganización

---

## 🚀 RESULTADO FINAL

Una estructura profesional estándar que:
- ✅ Facilita el trabajo del agente IA
- ✅ Mantiene contexto entre sesiones
- ✅ Centraliza toda la documentación
- ✅ Establece estándares claros
- ✅ Prepara para escalabilidad futura