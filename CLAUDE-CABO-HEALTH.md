# Proyecto: Cabo Health Clinic

## 🎯 Principios de Desarrollo (Context Engineering)

### Design Philosophy
- **KISS**: Keep It Simple, Stupid - Prefiere soluciones simples
- **YAGNI**: You Aren't Gonna Need It - Implementa solo lo necesario  
- **DRY**: Don't Repeat Yourself - Evita duplicación de código
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

### Descripción del Proyecto
Sistema de gestión integral para clínica de salud que incluye:
- Administración de pacientes y citas médicas
- Historiales clínicos digitales
- Gestión de consultas y tratamientos
- Control de acceso basado en roles (médicos, recepcionistas, admins)
- Cumplimiento de normativas médicas (HIPAA considerations)

## 🏗️ Tech Stack & Architecture

### Core Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: **Vite + React 18**
- **Routing**: React Router v6
- **Base de Datos**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Testing**: Jest (unit) + Playwright (E2E)
- **Schema Validation**: Zod
- **Package Manager**: pnpm
- **Build Tool**: Vite 5

### Architecture: Feature-First

**Enfoque: Arquitectura Feature-First optimizada para desarrollo asistido por IA**

Este proyecto usa una arquitectura **Feature-First** donde cada feature es independiente y contiene toda la lógica relacionada (componentes, hooks, servicios, tipos).

#### Frontend: Feature-First
```
src/
├── features/                 # 🎯 Organizadas por funcionalidad
│   ├── patients/            # Feature: Gestión de Pacientes
│   │   ├── components/      # PatientForm, PatientList, PatientCard
│   │   ├── hooks/           # usePatients, usePatientDetail
│   │   ├── services/        # patientService.ts (API calls)
│   │   ├── types/           # Patient, PatientFormData, etc.
│   │   └── store/           # patientsStore.ts (Zustand)
│   │
│   ├── appointments/        # Feature: Citas Médicas
│   │   ├── components/      # AppointmentCalendar, AppointmentForm
│   │   ├── hooks/           # useAppointments, useCalendar
│   │   ├── services/        # appointmentService.ts
│   │   ├── types/           # Appointment, TimeSlot, etc.
│   │   └── store/           # appointmentsStore.ts
│   │
│   ├── medical-records/     # Feature: Historiales Médicos
│   │   ├── components/      # RecordForm, RecordViewer, Prescriptions
│   │   ├── hooks/           # useMedicalRecords, useRecordAccess
│   │   ├── services/        # medicalRecordsService.ts
│   │   ├── types/           # MedicalRecord, Diagnosis, Treatment
│   │   └── store/           # recordsStore.ts
│   │
│   ├── auth/                # Feature: Autenticación y Roles
│   │   ├── components/      # LoginForm, RoleGuard, PermissionCheck
│   │   ├── hooks/           # useAuth, usePermissions
│   │   ├── services/        # authService.ts
│   │   ├── types/           # User, Role, Permissions
│   │   └── store/           # authStore.ts
│   │
│   └── [feature]/           # Otras features...
│
└── shared/                   # Código reutilizable
    ├── components/          # UI components genéricos (Button, Card, etc.)
    ├── hooks/               # Hooks genéricos (useDebounce, useLocalStorage)
    ├── stores/              # Estado global (appStore.ts, userStore.ts)
    ├── types/               # Tipos compartidos (api.ts, domain.ts)
    ├── utils/               # Funciones utilitarias
    ├── lib/                 # Configuraciones (supabase.ts, axios.ts)
    ├── constants/           # Constantes de la app
    └── assets/              # Imágenes, iconos, etc.
│
└── routes/                  # React Router configuración
    ├── index.tsx           # Route definitions
    └── guards/             # Route guards (auth, permissions)
```

### Estructura de Proyecto Completa
```
cabo-health/
├── src/                    # Source code
│   ├── features/          # Features por funcionalidad
│   ├── shared/            # Código reutilizable
│   ├── routes/            # React Router
│   ├── main.tsx           # Entry point (Vite)
│   └── App.tsx            # Root component
├── public/                # Static assets
├── dist/                  # Build output (Vite)
├── supabase/              # Database migrations
│   └── migrations/
├── .claude/               # Configuración Claude Code
│   ├── memory/            # Session management
│   ├── tasks/             # Feature tracking
│   ├── snippets/          # Quick reference
│   └── docs/              # Documentation
├── docs/                  # Project documentation
├── scripts/               # Build & utility scripts
├── package.json
├── tsconfig.json
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS
├── playwright.config.ts   # E2E tests
└── CLAUDE.md             # Este archivo
```

> **🤖 ¿Por qué Feature-First?**
>
> Esta estructura fue diseñada específicamente para **desarrollo asistido por IA**. La organización clara por features permite que los AI assistants:
> - **Localicen rápidamente** todo el código relacionado con una feature en un mismo lugar
> - **Entiendan el contexto completo** sin navegar múltiples directorios
> - **Mantengan la separación de responsabilidades** al generar código nuevo
> - **Escalen el proyecto** añadiendo features sin afectar el código existente
> - **Generen código consistente** siguiendo patrones establecidos por feature
>
> *La IA puede trabajar de forma más efectiva cuando la información está organizada siguiendo principios claros y predecibles.*

## 🛠️ Comandos Importantes

### Development (Vite)
- `pnpm dev` - Servidor de desarrollo Vite (puerto 5173)
- `pnpm build` - Build para producción con Vite
- `pnpm preview` - Preview del build de producción

### Quality Assurance
- `pnpm test` - Ejecutar tests unitarios (Jest)
- `pnpm test:watch` - Tests en modo watch
- `pnpm test:coverage` - Coverage report
- `pnpm test:e2e` - Tests E2E con Playwright
- `pnpm lint` - ESLint
- `pnpm lint:fix` - Fix automático de linting
- `pnpm typecheck` - Verificación de tipos TypeScript

### Database (Supabase)
- `pnpm supabase:start` - Iniciar Supabase local
- `pnpm supabase:stop` - Detener Supabase local
- `pnpm supabase:reset` - Reset database local
- `pnpm supabase:migration` - Crear nueva migración

### Git Workflow
- `pnpm commit` - Commit con Conventional Commits
- `pnpm pre-commit` - Hook de pre-commit

### Quick Reference
**Ver `.claude/snippets/commands.md` para lista completa de comandos**

Comandos frecuentes:
```bash
# Database
npx supabase start              # Start local Supabase
npx supabase db reset          # Reset database
npx supabase migration new [name]  # New migration

# Debugging
lsof -i :5173                  # Check Vite dev port
kill -9 <PID>                  # Kill process
tail -f dev.log                # Monitor logs

# Testing
pnpm test:watch               # Watch mode
pnpm test:coverage            # Coverage report
pnpm test:e2e                 # Playwright E2E
```

## 📝 Convenciones de Código

### File & Function Limits
- **Archivos**: Máximo 500 líneas
- **Funciones**: Máximo 50 líneas
- **Componentes**: Una responsabilidad clara

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.extension`
- **Folders**: `kebab-case`

### TypeScript Guidelines
- **Siempre usar type hints** para function signatures
- **Interfaces** para object shapes
- **Types** para unions y primitives
- **Evitar `any`** - usar `unknown` si es necesario

### Component Patterns
```typescript
// ✅ GOOD: Proper component structure
interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ children, variant = 'primary', onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

## 🧪 Testing Strategy

### Test-Driven Development (TDD)
1. **Red**: Escribe el test que falla
2. **Green**: Implementa código mínimo para pasar
3. **Refactor**: Mejora el código manteniendo tests verdes

### Test Structure (AAA Pattern)
```typescript
// ✅ GOOD: Clear test structure
test('should calculate total with tax', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;
  
  // Act
  const result = calculateTotal(items, taxRate);
  
  // Assert  
  expect(result).toBe(330);
});
```

### Testing Pyramid
1. **Unit Tests (70%)**: Jest para lógica de negocio
2. **Integration Tests (20%)**: React Testing Library para componentes
3. **E2E Tests (10%)**: Playwright para flujos críticos

### Critical Test Cases for Medical App
```typescript
// Siempre testear:
- Patient data validation (Zod schemas)
- Authentication and authorization flows
- Medical record access permissions (RLS)
- CRUD operations for sensitive data
- Form validations for patient information
- Date/time handling for appointments
- Error handling for API calls
```

## 🔒 Security Best Practices

### Input Validation
- Validate all user inputs (especialmente datos médicos sensibles)
- Sanitize data before processing
- Use schema validation (Zod) para forms

### Authentication & Authorization
- JWT tokens con expiración via Supabase Auth
- Role-based access control (médicos, recepcionistas, admins)
- Secure session management
- Protected routes con guards

### Data Protection (CRÍTICO para datos médicos)
- **HIPAA Compliance considerations**
- Never log sensitive medical data
- Encrypt data at rest (Supabase RLS)
- Use HTTPS everywhere
- Audit trail para acceso a historiales médicos

### Medical Data Specific
- **PHI (Protected Health Information)** debe estar protegida
- Logging de accesos a datos de pacientes
- Permisos granulares por tipo de usuario
- Expiración de sesiones corta para seguridad

## ⚡ Performance Guidelines

### Code Splitting (Vite)
- Route-based splitting con React.lazy()
- Component lazy loading
- Dynamic imports para features grandes

```typescript
// ✅ GOOD: Lazy loading en React Router
const Patients = lazy(() => import('./features/patients/Patients'))
const Appointments = lazy(() => import('./features/appointments/Appointments'))
```

### State Management
- Local state first (useState, useReducer)
- Context para estado compartido entre componentes relacionados
- Global state (Zustand) solo cuando realmente necesario
- Memoization con useMemo/useCallback para cálculos costosos

### Vite Optimization
- Pre-bundling de dependencias (automático en Vite)
- Tree-shaking automático
- CSS code splitting
- Asset optimization (imágenes, fonts)

### Database Optimization (Supabase)
- Index frequently queried columns (patient_id, appointment_date, etc.)
- Use pagination para listas de pacientes/citas
- Cache repeated queries con React Query
- RLS (Row Level Security) para performance y security

## 🔄 Git Workflow & Repository Rules

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/TICKET-123-description` - Feature branches
- `hotfix/TICKET-456-description` - Hotfixes

### Commit Convention (Conventional Commits)
```
type(scope): description

feat(patients): add patient registration form
fix(appointments): handle null date in calendar  
docs(readme): update setup instructions
perf(dashboard): optimize patient list query
```

### Pull Request Rules
- **No direct commits** a `main` o `develop`
- **Require PR review** antes de merge
- **All tests must pass** antes de merge
- **Squash and merge** para mantener historia limpia

## ❌ No Hacer (Critical)

### Code Quality
- ❌ No usar `any` en TypeScript
- ❌ No hacer commits sin tests
- ❌ No omitir manejo de errores
- ❌ No hardcodear configuraciones (usar env vars)

### Security (CRÍTICO para app médica)
- ❌ **NUNCA** expongas datos médicos en logs
- ❌ **NUNCA** almacenes PHI sin encriptar
- ❌ **NUNCA** omitas validación de permisos
- ❌ **NUNCA** uses conexiones HTTP (solo HTTPS)
- ❌ **NUNCA** compartas credenciales en código
- ❌ **NUNCA** ignores CORS en producción

### Performance
- ❌ No cargar todo el dataset de pacientes sin paginación
- ❌ No hacer N+1 queries a la base de datos
- ❌ No usar re-renders innecesarios
- ❌ No cargar imágenes sin optimizar

## 📐 Project Structure & File Organization

### Feature Folder Structure
```
features/
└── [feature-name]/
    ├── components/           # React components
    │   ├── [Feature]Form.tsx
    │   ├── [Feature]List.tsx
    │   └── [Feature]Card.tsx
    ├── hooks/               # Custom hooks
    │   ├── use[Feature].ts
    │   └── use[Feature]Actions.ts
    ├── services/            # API calls
    │   └── [feature]Service.ts
    ├── types/               # TypeScript types
    │   └── index.ts
    ├── store/               # State management
    │   └── [feature]Store.ts
    └── index.ts             # Public exports
```

### Shared Folder Structure
```
shared/
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── layout/             # Layout components
├── hooks/                  # Generic hooks
├── lib/                    # External libraries config
│   ├── supabase.ts        # Supabase client
│   └── react-query.ts     # React Query config
├── types/                  # Shared TypeScript types
├── utils/                  # Utility functions
└── constants/              # App constants
```

## 🧠 AI Development Guidelines

### When Working with Claude

#### Al inicio de cada sesión:
1. **"Lee `.claude/memory/NOTES.md` para contexto de la sesión anterior"**
2. **"Lee `.claude/memory/TODO.md` para ver tareas pendientes"**
3. **"Revisa `.claude/memory/DECISIONS.md` para decisiones técnicas previas"**

#### Durante el desarrollo:
- **Usa el workflow PLAN → DIFFS → VERIFY** (ver `.claude/docs/WORKFLOW.md`)
- Siempre pide aprobación antes de aplicar cambios
- Actualiza `.claude/memory/NOTES.md` con progreso
- Documenta decisiones importantes en `.claude/memory/DECISIONS.md`

#### Para features complejas:
1. **"Crea una task en `.claude/tasks/` para [feature]"**
2. **"Sigue el workflow de `.claude/docs/WORKFLOW.md`"**
3. **"Usa bucle-agentico para iteración completa"**

#### Quick Reference durante desarrollo:
- **"Muéstrame `.claude/snippets/commands.md`"** - Comandos útiles
- **"Lee `.claude/docs/FEATURE_TEMPLATE.md`"** - Template para features
- **"Revisa `.claude/docs/ARCHITECTURE.md`"** - Decisiones de arquitectura

### Code Generation Preferences
- Usa TypeScript estricto
- Prefiere functional components con hooks
- Usa Tailwind CSS para styling
- Implementa error boundaries
- Siempre valida inputs con Zod
- Incluye tipos explícitos
- Agrega comentarios para lógica compleja
- Sigue convenciones de naming

## 🧩 Project Files

### Configuration Files
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS configuration
- `playwright.config.ts` - E2E testing configuration
- `jest.config.js` - Unit testing configuration
- `.env.example` - Environment variables template

### Essential Documentation
- `.claude/INDEX.md` - Claude Code system overview
- `.claude/docs/ARCHITECTURE.md` - Complete architecture explanation
- `.claude/docs/WORKFLOW.md` - PLAN → DIFFS → VERIFY process
- `.claude/docs/FEATURE_TEMPLATE.md` - Step-by-step feature creation
- `.claude/docs/GIT_WORKFLOW.md` - Git branching and commit standards

### Memory Management
- `.claude/memory/NOTES.md` - Session notes and progress tracking
- `.claude/memory/TODO.md` - Organized task list with priorities
- `.claude/memory/DECISIONS.md` - Technical decisions documentation
- `.claude/memory/BLOCKERS.md` - Problems blocking progress

### Quick Reference
- `.claude/snippets/commands.md` - Complete development commands
- `.claude/snippets/gitignore.txt` - Complete .gitignore template

## 🔄 Development Workflow: PLAN → DIFFS → VERIFY

**Para features nuevas o cambios complejos, sigue este workflow:**

Ver `.claude/docs/WORKFLOW.md` para documentación completa.

### Resumen del Workflow

1. **PLAN** (Planificación)
   - Define arquitectura y approach
   - Identifica archivos a modificar
   - Lista decisiones técnicas
   - Propone estructura

2. **DIFFS** (Implementación)
   - Muestra cambios explícitos con diffs
   - Explica cada cambio
   - Permite revisión antes de aplicar
   - Implementa solo después de aprobación

3. **VERIFY** (Verificación)
   - Comandos de verificación
   - Tests a ejecutar
   - Checklist de validación
   - Usuario ejecuta y reporta

### Cuándo Usar Este Workflow

**✅ SÍ usar para:**
- Features nuevas (módulo de citas, pacientes, etc.)
- Cambios en múltiples archivos
- Refactoring importante
- Cambios de arquitectura
- Integraciones con APIs de Supabase

**⚠️ OPCIONAL para:**
- Cambios triviales (fix typo)
- Updates de documentación
- Ajustes de styling menores

**❌ NO necesario para:**
- Leer archivos
- Explorar código
- Responder preguntas

### Comandos Útiles

```bash
# Iniciar con workflow
"Usa el workflow de WORKFLOW.md para implementar [módulo de citas]"

# Durante desarrollo
"Muéstrame el PLAN antes de implementar"
"Espera mi aprobación antes de aplicar DIFFS"
"Dame comandos de VERIFY después de aplicar"

# Para features complejas
"Usa bucle-agentico y sigue el workflow PLAN → DIFFS → VERIFY"
```

### Ejemplo de Verificación

Después de implementar cambios, ejecuta:

```bash
# 1. Verificar build
pnpm build
# Debe completar sin errores

# 2. Verificar types
pnpm typecheck
# 0 errores de TypeScript

# 3. Verificar tests
pnpm test
# Todos los tests pasan

# 4. Verificar linting
pnpm lint
# No errors

# 5. Probar manualmente
pnpm dev
# 1. Ir a http://localhost:5173/patients
# 2. Llenar formulario de registro
# 3. Submit debe crear paciente en Supabase
# 4. Lista debe actualizar con nuevo paciente
```

## 🏥 Cabo Health Specific Guidelines

### Medical Data Handling
- **SIEMPRE** validar datos de pacientes con Zod
- **NUNCA** loggear información médica sensible
- Usar Supabase RLS para control de acceso granular
- Implementar audit trail para accesos a historiales

### Feature Priority
1. **Security & Compliance** (máxima prioridad)
2. **Patient Management** (core functionality)
3. **Appointment System** (core functionality)
4. **Medical Records** (sensitive data)
5. **Reporting & Analytics**

### Performance for Medical Staff
- **Forms deben validar en <100ms**
- **Patient list debe cargar en <500ms**
- **Search debe ser instantáneo** (usar debounce)
- **Offline capability** para áreas rurales (considerar)

### Compliance Considerations
- **HIPAA Guidelines** (si aplica en tu región)
- Encryption at rest y in transit
- Access logs para auditoría
- Data retention policies
- Patient consent management

### User Roles & Permissions
```typescript
// Roles definidos
type Role = 'admin' | 'doctor' | 'receptionist' | 'patient';

// Permisos por rol
const permissions = {
  admin: ['*'], // Acceso total
  doctor: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
    'records:read',
    'records:write',
  ],
  receptionist: [
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
  ],
  patient: [
    'appointments:read:own',
    'records:read:own',
  ],
};
```

---

*Este archivo es la fuente de verdad para desarrollo en este proyecto. Todas las decisiones de código deben alinearse con estos principios.*
