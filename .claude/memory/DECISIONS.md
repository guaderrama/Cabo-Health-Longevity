# Decisions Log - Cabo Health Clinic

> Documenta decisiones importantes con fecha, razón e impacto. Esto ayuda a mantener contexto y evitar repetir debates.

---

## Template

```markdown
## YYYY-MM-DD: [Título de la Decisión]

**Contexto:** Situación que llevó a esta decisión

**Razón:** Por qué tomamos esta decisión

**Impacto:** Qué afecta en el proyecto

**Alternativas consideradas:**
- Opción A: Por qué no
- Opción B: Por qué no
- Opción C (elegida): Por qué sí

**Trade-offs:** Ventajas y desventajas

**Decidido por:** Nombre/Equipo

**Revisión:** ¿Cuándo revisar esta decisión?
```

---

## Active Decisions

### 2025-11-04: Usar Vite + React 18 (CORREGIDO)

**Contexto:** Necesitamos elegir framework para aplicación médica de clínica. React es requisito por ecosistema y componentes disponibles.

**Razón:**
- **Vite ofrece desarrollo ultrarrápido** (HMR instantáneo)
- Build optimizado automático con Rollup
- Configuración mínima y clara
- Excelente DX con TypeScript
- Más ligero que Next.js para SPA médica
- **No necesitamos SSR** para app interna de clínica
- React Router v6 suficiente para routing

**Impacto:**
- Dev server en puerto 5173 (Vite estándar)
- Build output en `dist/` no `.next/`
- Entry point en `src/main.tsx` no `pages/`
- Necesitamos configurar routing manualmente (React Router)
- Performance excelente para staff médico
- Bundle size pequeño = carga rápida

**Alternativas consideradas:**
- **Next.js 16 App Router:** Excelente pero overkill para SPA interna, más complejo
- **Remix:** Bueno pero menor adopción, curva de aprendizaje
- **Create React App:** Deprecated, lento, no usar
- **Vite + React 18 (elegida):** Balance perfecto de simplicidad y performance

**Trade-offs:**
- ✅ Ventajas: Rapidez desarrollo, configuración simple, bundle pequeño, DX excelente
- ⚠️ Desventajas: No SSR (no lo necesitamos), routing manual (React Router lo soluciona)

**Decidido por:** Lead Developer

**Revisión:** No revisable, decisión final. Vite es el estándar moderno para SPAs.

---

### 2025-11-04: PostgreSQL con Supabase como BaaS

**Contexto:** Necesitamos base de datos para aplicación médica con datos sensibles (PHI). Datos son altamente relacionales (pacientes → citas → historiales).

**Razón:**
- **Datos son claramente relacionales** (pacientes, citas, historiales, prescripciones)
- **Integridad referencial CRÍTICA** para datos médicos
- Supabase ofrece Auth + Storage + Realtime + RLS
- **RLS (Row Level Security) esencial para HIPAA compliance**
- PostgreSQL ideal para queries complejas con joins
- Supabase CLI facilita migrations y desarrollo local
- Hosting incluido (no gestionar infraestructura)

**Impacto:**
- Schema explícito requerido (BUENO para app médica)
- Migrations necesarias para cambios de BD
- RLS policies deben configurarse para cada tabla
- Queries más estructuradas (SQL bien definido)
- Mejor consistencia y seguridad de datos
- Audit trail más fácil de implementar

**Alternativas consideradas:**
- **MongoDB/Firebase:** Flexible pero pierde integridad referencial crítica
- **MySQL:** Bueno pero sin features de Supabase (Auth, RLS, Realtime)
- **Firebase:** Más caro, vendor lock-in mayor, no SQL
- **PostgreSQL + Supabase (elegida):** MEJOR para app médica

**Trade-offs:**
- ✅ Ventajas: Integridad, RLS, HIPAA-friendly, Supabase ecosystem completo
- ⚠️ Desventajas: Menos flexible que NoSQL, migrations requeridas (BUENO en este caso)

**Decidido por:** Team consensus

**Revisión:** Revisar después de primer mes en producción

---

### 2025-11-04: TypeScript en modo strict (CRÍTICO para app médica)

**Contexto:** Decidir nivel de strictness de TypeScript para aplicación médica donde errores pueden afectar pacientes.

**Razón:**
- **Prevenir bugs en compile-time = SEGURIDAD**
- Errores de tipo pueden causar datos médicos incorrectos
- Mejor autocompletado en IDE = menos errores humanos
- Más fácil refactoring sin romper nada
- Código más mantenible a largo plazo
- **CRÍTICO para validación de datos médicos sensibles**

**Impacto:**
- Desarrollo inicial ligeramente más lento (tipos para todo)
- Significativamente menos bugs en runtime
- Mejor experiencia de desarrollo a mediano plazo
- Documentación implícita en los tipos
- Validaciones explícitas (Zod + TypeScript = doble seguridad)

**Alternativas consideradas:**
- **JavaScript puro:** INACEPTABLE para app médica
- **TypeScript no-strict:** Insuficiente, queremos máxima seguridad
- **TypeScript strict (elegida):** Única opción válida para salud

**Trade-offs:**
- ✅ Ventajas: Menos bugs, seguridad, DX, refactoring seguro, confianza
- ⚠️ Desventajas: Setup inicial más lento (vale la pena 100%)

**Decidido por:** Lead Developer

**Revisión:** No revisable, es estándar OBLIGATORIO del proyecto

---

### 2025-11-04: Feature-First Architecture

**Contexto:** Necesitamos organización de código clara y escalable para múltiples features médicas (pacientes, citas, historiales).

**Razón:**
- Cada feature médica es independiente (patients, appointments, medical-records)
- Todo el código relacionado en un mismo lugar
- **Optimizado para desarrollo asistido por IA** (Claude puede encontrar código fácilmente)
- Escalable: agregar features sin afectar existentes
- Separación clara de responsabilidades
- Fácil onboarding de nuevos desarrolladores

**Impacto:**
- Estructura de carpetas por feature, no por tipo de archivo
- Cada feature tiene: components/, hooks/, services/, types/, store/
- Código shared separado (shared/components, shared/utils, etc.)
- Menos confusión sobre dónde poner código nuevo

**Alternativas consideradas:**
- **Estructura por tipo** (components/, hooks/, services/): Se vuelve caótico
- **Estructura por página**: No refleja la lógica de features médicas
- **Feature-First (elegida):** Mejor organización para app compleja

**Trade-offs:**
- ✅ Ventajas: Organización clara, escalable, mantenible, AI-friendly
- ⚠️ Desventajas: Requiere disciplina para seguir convención

**Decidido por:** Basado en CLAUDE-CABO-HEALTH.md

**Revisión:** No revisable, es la arquitectura del proyecto

---

### 2025-11-04: pnpm como package manager

**Contexto:** Necesitamos package manager para gestionar dependencias.

**Razón:**
- Más rápido que npm y yarn
- Ahorra espacio en disco (symlinks)
- Mejor para monorepos (si crecemos)
- Compatible con todos los packages de npm
- Instalación consistente en todo el equipo

**Impacto:**
- Todo el equipo debe usar pnpm (documentado en README)
- Scripts en package.json usan pnpm
- Lock file es pnpm-lock.yaml

**Alternativas consideradas:**
- **npm:** Lento, usa más espacio
- **yarn:** Bueno pero pnpm es más rápido
- **pnpm (elegida):** Mejor performance

**Trade-offs:**
- ✅ Ventajas: Rapidez, eficiencia, futuro-proof
- ⚠️ Desventajas: Requiere instalación global de pnpm

**Decidido por:** Team

**Revisión:** No revisable, estándar del proyecto

---

### 2025-11-04: Zod para validación de schemas

**Contexto:** Necesitamos validación robusta de datos médicos en forms y API.

**Razón:**
- **Validación type-safe** (integración perfecta con TypeScript)
- Prevenir datos médicos inválidos
- Validación en frontend Y backend con mismo schema
- Error messages claros para usuarios
- Mejor que validación manual (menos errores)

**Impacto:**
- Todos los forms médicos usan Zod schemas
- Validación de datos de pacientes, citas, historiales
- Types de TypeScript inferidos desde Zod schemas
- Mensajes de error consistentes

**Alternativas consideradas:**
- **Yup:** Bueno pero Zod tiene mejor integración con TS
- **Joi:** Backend-focused, no type-safe
- **Validación manual:** Propensa a errores
- **Zod (elegida):** Mejor para TypeScript strict

**Trade-offs:**
- ✅ Ventajas: Type-safety, DX, menos bugs, reusabilidad
- ⚠️ Desventajas: Curva de aprendizaje pequeña

**Decidido por:** Lead Developer

**Revisión:** No revisable

---

### 2025-11-04: shadcn/ui para componentes de UI

**Contexto:** Necesitamos componentes de UI accesibles y consistentes.

**Razón:**
- Componentes copy-paste (no dependencia, tenemos el código)
- Basados en Radix UI (accesibilidad built-in)
- Tailwind CSS (consistente con nuestro stack)
- Customizables al 100%
- Excelente DX

**Impacto:**
- Componentes en src/shared/components/ui/
- Código propio (podemos modificar sin restricciones)
- Accesibilidad garantizada (importante para médicos/recepcionistas)

**Alternativas consideradas:**
- **Material UI:** Pesado, opinionado, difícil customizar
- **Chakra UI:** Bueno pero dependencia grande
- **Headless UI:** Bueno pero menos componentes
- **shadcn/ui (elegida):** Balance perfecto

**Trade-offs:**
- ✅ Ventajas: Control total, ligero, accesible, Tailwind
- ⚠️ Desventajas: Actualizar componentes manualmente

**Decidido por:** Basado en CLAUDE-CABO-HEALTH.md

**Revisión:** No revisable

---

## Archived Decisions

<details>
<summary>Octubre 2025</summary>

### 2025-10-28: Decidir entre SPA vs SSR

**Razón:** Aplicación interna de clínica no necesita SEO ni SSR. SPA es suficiente.

**Impacto:** Elegimos Vite (SPA) en lugar de Next.js (SSR)

**Decidido por:** Team

</details>

---

## How to Use

### Al tomar una decisión importante:
1. Usa el template de arriba
2. Documenta ANTES de implementar
3. Incluye contexto suficiente
4. Lista alternativas consideradas
5. Define cuándo revisar

### Qué documentar:
- ✅ Elección de tecnologías/frameworks
- ✅ Arquitectura y patrones
- ✅ Cambios de API design
- ✅ Políticas de seguridad (CRÍTICO para app médica)
- ✅ Procesos de deployment
- ❌ Decisiones triviales o reversibles fácilmente

### Revisar decisiones:
- Agrega recordatorio en calendar
- Revisa si encuentras problemas
- Actualiza con lecciones aprendidas

---

## Tips

- ✅ Documenta el "por qué", no solo el "qué"
- ✅ Incluye alternativas y por qué no se eligieron
- ✅ Sé honesto sobre trade-offs
- ✅ Define criterios de revisión
- ✅ Mantén formato consistente
- ✅ Archiva decisiones viejas pero no las borres

---

## Dile a Claude

Para revisar decisiones:
```
Lee .claude/memory/DECISIONS.md y dame contexto sobre [decisión X]
```

Para documentar nueva:
```
Ayúdame a documentar esta decisión en DECISIONS.md:
[descripción de la decisión]
```
