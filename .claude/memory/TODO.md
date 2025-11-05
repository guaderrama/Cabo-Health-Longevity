# TODO List - Cabo Health Clinic (ACTUALIZADO CON PROYECTO REAL)

> **Última actualización**: 2025-11-04 (Tarde - Post RLS/Audit)
> **Estado del proyecto**: 80% completo - **RLS + Audit Logs COMPLETADOS** ✅

---

## 🎉 **COMPLETADO EN ESTA SESIÓN**

### ✅ **Security & Compliance - LOGROS MAYORES**

- [x] ✅ **Configurar Supabase RLS (Row Level Security)** 🔴 CRÍTICO → **COMPLETADO**
  - [x] Habilitar RLS en tabla `patients`
  - [x] Habilitar RLS en tabla `doctors`
  - [x] Habilitar RLS en tabla `analyses`
  - [x] Habilitar RLS en tabla `reports`
  - [x] Habilitar RLS en tabla `notifications`
  - [x] Habilitar RLS en tabla `biomarker_ranges`
  - [x] Crear policy: Patients solo ven sus propios datos
  - [x] Crear policy: Doctors ven análisis asignados
  - [x] Crear policy: Doctors ven pacientes con análisis asignados
  - [x] Crear función helper `get_user_role()`
  - [x] **42 policies totales creadas** (incluyendo previas de edge functions)
  - [x] Verificado que RLS está habilitado en todas las tablas
  - [x] **DESBLOQUEADO**: ✅ Cumplimiento HIPAA básico logrado

- [x] ✅ **Crear tabla `audit_logs`** 🔴 CRÍTICO → **COMPLETADO**
  - [x] Diseñar schema de audit_logs (16 columnas)
  - [x] Campos: id, user_id, user_email, user_type, action, table_name, record_id, old_data, new_data, changed_fields, ip_address, user_agent, request_id, description, sensitive_access, created_at
  - [x] Crear función trigger `audit_log_trigger()` con SECURITY DEFINER
  - [x] Crear triggers para analyses, reports, patients, doctors
  - [x] Habilitar RLS en audit_logs (bloqueado para usuarios normales)
  - [x] Crear función `get_audit_logs()` para reportes de auditoría
  - [x] Crear vista `phi_access_logs` para HIPAA compliance
  - [x] Crear función `archive_old_audit_logs()` para limpieza
  - [x] Crear 7 índices para performance
  - [x] Agregar comentarios SQL para documentación
  - [x] **Sistema completo de auditoría HIPAA funcionando**

---

## 🔥 **HIGH PRIORITY (Esta Semana) - CRÍTICO PARA PRODUCCIÓN**

### 🔒 **Security & Compliance (MÁXIMA PRIORIDAD)**

- [ ] **ROTAR TOKENS EXPUESTOS EN SESIÓN** 🔴 URGENTE
  - Regenerar Supabase Access Token (expuesto)
  - Regenerar GitHub PAT (expuesto)
  - Regenerar Perplexity API Key (expuesto)
  - Regenerar Stripe Test Key (expuesto)
  - Regenerar Upstash Redis Token (expuesto)
  - Actualizar mcp.json con nuevos tokens
  - Actualizar .env con nuevas credenciales

- [ ] **Crear tabla `audit_logs`** 🔴 CRÍTICO
  - Diseñar schema de audit_logs
  - Campos: id, user_id, action, table_name, record_id, timestamp
  - Crear triggers para registrar accesos a medical_records
  - Crear triggers para registrar modificaciones de datos PHI
  - Implementar viewing de audit trail en UI admin

- [ ] **Verificar configuración .env** 🟡 IMPORTANTE
  - Copiar .env.example a .env si no existe
  - Verificar VITE_SUPABASE_URL está configurado
  - Verificar VITE_SUPABASE_ANON_KEY está configurado
  - Agregar GROQ API Key si falta
  - Nunca commitear .env a git (verificar .gitignore)

---

### 🎨 **UI/UX - shadcn/ui Components**

- [ ] **Instalar y configurar shadcn/ui** 🟡 IMPORTANTE
  - Correr `pnpm dlx shadcn@latest init`
  - Configurar theme (zinc/slate/neutral)
  - Instalar componente: `button`
  - Instalar componente: `card`
  - Instalar componente: `dialog`
  - Instalar componente: `select`
  - Instalar componente: `table`
  - Instalar componente: `toast` (para notificaciones)
  - Instalar componente: `skeleton` (loading states)
  - Instalar componente: `badge`
  - Reemplazar componentes custom con shadcn/ui
  - Verificar consistencia de UI

---

### 📄 **Generación de Reportes**

- [ ] **Completar generación de PDF final** 🟡 IMPORTANTE
  - Revisar edge function `generate-report`
  - Implementar generación con jsPDF
  - Incluir logo de Cabo Health
  - Incluir datos del paciente
  - Incluir análisis de biomarcadores (113+)
  - Incluir gráficos de tendencias
  - Incluir recomendaciones del doctor
  - Subir PDF a Supabase Storage
  - Actualizar campo `report_pdf_url` en tabla reports
  - Botón "Descargar PDF" en PatientReportPage

---

## 📋 **MEDIUM PRIORITY (Este Mes)**

### 📊 **Features - Análisis Funcional**

- [ ] **Verificar página de Análisis Funcional completa**
  - Revisar FunctionalAnalysisPage.tsx
  - Verificar que muestra los 113+ biomarcadores
  - Verificar clasificación ÓPTIMO/ACEPTABLE/SUBÓPTIMO/ANÓMALO
  - Agregar filtros por categoría (electrolytes, hormonal, etc.)
  - Agregar búsqueda de biomarcadores
  - Agregar gráficos de rangos
  - Agregar comparación con análisis anteriores

- [ ] **Mejorar Revisión de Análisis (Doctor)**
  - AnalysisReviewPage.tsx completo
  - Mostrar texto extraído del PDF original
  - Mostrar análisis de IA lado a lado
  - Editor para doctor_notes (rich text)
  - Editor para recommendations
  - Selector de risk_level (low/medium/high)
  - Botón "Aprobar" análisis
  - Botón "Rechazar" análisis (con razón)
  - Enviar notificación al paciente al aprobar

- [ ] **Dashboard Doctor - Mejoras**
  - Agregar estadísticas (total pacientes, análisis hoy, pendientes)
  - Gráfico de análisis por mes
  - Filtro por rango de fechas
  - Búsqueda por nombre de paciente
  - Ordenar por fecha/prioridad
  - Asignación manual de análisis a otro doctor

---

### 🔔 **Notificaciones**

- [ ] **Verificar sistema de notificaciones**
  - Verificar edge function `send-notification` funciona
  - Configurar Supabase Email (SMTP)
  - Template de email: "Análisis procesado"
  - Template de email: "Análisis aprobado por doctor"
  - Template de email: "Reporte listo"
  - Notificaciones en tiempo real (Supabase Realtime)
  - Badge de notificaciones no leídas en UI
  - Marcar notificaciones como leídas

- [ ] **Notificaciones en UI**
  - Instalar componente `toast` de shadcn/ui
  - Implementar sistema de toasts consistente
  - Success toast al subir PDF
  - Error toast con mensajes claros
  - Info toast para acciones importantes
  - Warning toast para advertencias

---

### 🗄️ **Base de Datos - Mejoras**

- [ ] **Crear índices para performance**
  - Índice en analyses.patient_id
  - Índice en analyses.status
  - Índice en reports.analysis_id
  - Índice en notifications.user_id + read
  - Índice en biomarker_ranges.biomarker_code

- [ ] **Agregar campos faltantes**
  - analyses.assigned_doctor_id (para asignación manual)
  - patients.insurance_info (info de seguro médico)
  - doctors.max_patients (límite de pacientes)
  - reports.approved_at (timestamp de aprobación)

---

## 💡 **LOW PRIORITY (Backlog)**

### ⚡ **Performance Optimization**

- [ ] **Implementar paginación**
  - Paginación en PatientDashboard (lista de análisis)
  - Paginación en DoctorDashboard (lista de análisis)
  - Paginación en lista de biomarcadores
  - Limit 20 items por página
  - Infinite scroll como alternativa

- [ ] **Lazy loading de componentes**
  - Lazy load de FunctionalAnalysisPage
  - Lazy load de AnalysisReviewPage
  - Lazy load de PatientReportPage
  - Code splitting por ruta

- [ ] **Optimización de imágenes**
  - Comprimir logos
  - Usar WebP para imágenes
  - Lazy load de avatares
  - Placeholder blur para imágenes

---

### 📱 **Mobile Responsiveness**

- [ ] **Verificar responsive en todas las páginas**
  - PatientDashboard mobile-friendly
  - DoctorDashboard mobile-friendly
  - FunctionalAnalysisPage mobile-friendly
  - Tablas responsive (scroll horizontal o cards)
  - Sidebar colapsable en mobile
  - Touch-friendly botones (44px mínimo)

---

### 🧪 **Testing & Quality**

- [ ] **Completar tests unitarios**
  - Tests de AuthContext (login, signup, logout)
  - Tests de BiomarkerCard (clasificación correcta)
  - Tests de PatientDashboard (upload PDF)
  - Tests de DoctorDashboard (filtros)
  - Tests de utils (formateo de fechas, etc.)
  - **Target: 70% coverage**

- [ ] **Ejecutar tests E2E con Playwright**
  - E2E: Flujo completo paciente (registro → upload → ver reporte)
  - E2E: Flujo completo doctor (login → revisar → aprobar)
  - E2E: Verificar permisos (patient no ve ruta doctor)
  - E2E: Upload de PDF grande (>10MB)
  - E2E: Análisis con error (PDF corrupto)

- [ ] **Testing de seguridad**
  - Verificar RLS policies con diferentes usuarios
  - Intentar acceder a datos de otro paciente
  - Intentar bypass de autenticación
  - SQL injection en formularios
  - XSS en campos de texto

---

### 📊 **Analytics & Reporting**

- [ ] **Dashboard de métricas (Doctor)**
  - Total de pacientes activos
  - Análisis procesados este mes
  - Tiempo promedio de revisión
  - Biomarcadores más comunes fuera de rango
  - Distribución de risk_level (low/medium/high)

- [ ] **Dashboard de métricas (Admin)**
  - Total de doctores activos
  - Total de pacientes registrados
  - Análisis por día/semana/mes (gráfico)
  - Edge functions usage
  - Storage usage

---

### 🌐 **Internationalization (i18n)**

- [ ] **Implementar i18n**
  - Instalar `react-i18next`
  - Traducir interfaz a inglés
  - Mantener español como default
  - Selector de idioma en settings
  - Traducir emails de notificaciones
  - Traducir reportes PDF

---

### 🔧 **Mejoras de UX**

- [ ] **Loading States mejorados**
  - Reemplazar spinners con skeletons (shadcn/ui)
  - Skeleton para lista de análisis
  - Skeleton para biomarcadores
  - Skeleton para gráficos
  - Progress bar en upload de PDF

- [ ] **Búsqueda y Filtros Avanzados**
  - Búsqueda de pacientes por nombre/email
  - Búsqueda de análisis por fecha
  - Filtro por rango de fechas (date picker)
  - Filtro por risk_level
  - Filtro por doctor asignado

- [ ] **Comparación de Análisis**
  - Seleccionar 2+ análisis del mismo paciente
  - Ver biomarcadores lado a lado
  - Gráfico de evolución temporal
  - Detectar tendencias (mejorando/empeorando)

---

## ✅ **COMPLETED (Esta Semana)**

- [x] Explorar estructura local de src/
  - Completado: 2025-11-04
- [x] Analizar base de datos Supabase (6 tablas, 6 edge functions)
  - Completado: 2025-11-04
- [x] Crear documento de análisis completo (ANALISIS_PROYECTO_COMPLETO.md)
  - Completado: 2025-11-04
- [x] Identificar gaps entre frontend y backend
  - Completado: 2025-11-04
- [x] Actualizar archivos de memoria con información real
  - Completado: 2025-11-04

---

## 📦 **FEATURES YA IMPLEMENTADAS (No tocar)**

### ✅ **Autenticación (100%)**
- Login con email/password
- Registro con roles (doctor/patient)
- Protección de rutas con PrivateRoute
- Persistencia de sesión con Supabase
- Logout

### ✅ **Dashboard Paciente (90%)**
- Ver resumen de análisis (total, pendientes, aprobados)
- Subir PDF de laboratorio
- Upload con progress
- Ver lista de análisis con estados
- Gráfico de tendencias de salud
- Navegación a reporte aprobado

### ✅ **Dashboard Doctor (85%)**
- Ver lista de análisis (todos, pendientes, aprobados)
- Filtrar por estado
- Ver datos del paciente
- Descargar PDF original
- Botones "Revisar" y "Análisis Funcional"
- Cards con información clara

### ✅ **Procesamiento IA (95%)**
- Edge function `process-pdf` funcional
- Extracción de texto del PDF
- Análisis con IA (GROQ/LLaMA 3.3 70B)
- Clasificación de biomarcadores
- Almacenamiento en Supabase

### ✅ **Biomarcadores (100%)**
- 113+ biomarcadores en tabla `biomarker_ranges`
- 9 categorías (electrolytes, hormonal, lipid, etc.)
- Códigos y nombres en español
- Componentes BiomarkerCard y BiomarkerSummary

---

## 🗑️ **ARCHIVE (Completados Anteriores)**

<details>
<summary>Semana del 2025-10-27</summary>

- [x] Investigar frameworks (Vite vs Next.js) → Elegimos Vite
- [x] Comparar opciones de database → Elegimos Supabase
- [x] Decidir stack tecnológico final
- [x] Crear estructura de carpetas
- [x] Setup de Supabase
- [x] Crear tablas iniciales
- [x] Implementar Edge Functions
- [x] Configurar autenticación
- [x] Crear dashboards básicos
</details>

---

## 📝 **NOTAS IMPORTANTES**

### **Antes de empezar cualquier tarea:**
1. ✅ Leer `.claude/ANALISIS_PROYECTO_COMPLETO.md` para contexto
2. ✅ Verificar que estás en directorio `cabo-health/` (no cabo-health-fixed)
3. ✅ Correr `pnpm install` si es primera vez
4. ✅ Verificar `.env` tiene credenciales correctas
5. ✅ Correr `pnpm dev` para verificar que compila

### **Prioridad de trabajo:**
1. **Seguridad primero** (RLS, audit logs, rotar tokens)
2. **Features core** (PDF final, análisis funcional)
3. **UX/UI** (shadcn/ui, toasts, loading)
4. **Testing** (aumentar coverage)
5. **Performance** (paginación, lazy loading)
6. **Nice to have** (i18n, analytics)

### **Comandos frecuentes:**
```bash
# Desarrollo
cd "c:\Users\admin\Dropbox\Ai\cabo health clinic\cabo health clinic\cabo-health"
pnpm dev              # Puerto 5173

# Testing
pnpm test             # Jest unitarios
pnpm test:e2e         # Playwright E2E
pnpm test:coverage    # Coverage report

# Build
pnpm build            # Build a dist/
pnpm preview          # Preview build

# Supabase (si está instalado)
npx supabase start    # Local instance
npx supabase db reset # Reset database
```

---

## 🤖 **Dile a Claude**

Para trabajar en una tarea:
```
Lee .claude/ANALISIS_PROYECTO_COMPLETO.md y ayúdame con la tarea:
[descripción de la tarea del TODO]
```

Para actualizar:
```
Actualiza .claude/memory/TODO.md:
- Marca [tarea X] como completada
- Agrega nueva tarea: [descripción]
```

---

**Última actualización**: 2025-11-04
**Proyecto**: Cabo Health Clinic
**Stack**: Vite + React 18 + TypeScript + Supabase
**Estado**: 75% Completo - Funcional pero necesita seguridad y polish
