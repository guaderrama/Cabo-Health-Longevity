# Arquitectura del Sistema - Cabo Health

## Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                      │
├───────────────────────────┬─────────────────────────────────────────┤
│      PACIENTE             │             MÉDICO                       │
│                           │                                          │
│  1. Registrar cuenta      │  1. Registrar cuenta                    │
│  2. Subir PDF análisis    │  2. Ver análisis pendientes             │
│  3. Ver estado "En Rev."  │  3. Revisar análisis + IA               │
│  4. Recibir notificación  │  4. Agregar notas médicas               │
│  5. Ver resultados        │  5. Aprobar y enviar                    │
│  6. Descargar reporte     │  6. Notificación automática             │
└───────────────────────────┴─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                     │
├─────────────────────────────────────────────────────────────────────┤
│  • LoginPage / RegisterPage                                          │
│  • DoctorDashboard / PatientDashboard                               │
│  • AnalysisReviewPage / PatientReportPage                           │
│  • DashboardLayout                                                   │
│  • AuthContext (manejo de sesiones)                                 │
│  • React Router (navegación)                                         │
│  • Chart.js (visualizaciones)                                        │
│  • Tailwind CSS (diseño UX médico)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  AUTENTICACIÓN                                                       │
│  ├─ Sign Up (doctor/patient)                                        │
│  ├─ Sign In                                                          │
│  └─ Session Management                                               │
│                                                                      │
│  BASE DE DATOS (PostgreSQL + RLS)                                   │
│  ├─ doctors (id, email, name, specialty, license_number, ...)      │
│  ├─ patients (id, email, name, birth_date, gender, ...)            │
│  ├─ analyses (id, patient_id, pdf_url, status, extracted_text,...) │
│  ├─ reports (id, analysis_id, ai_analysis, doctor_notes, ...)      │
│  └─ notifications (id, user_id, message, type, read, ...)          │
│                                                                      │
│  EDGE FUNCTIONS (Deno)                                              │
│  ├─ process-pdf                                                      │
│  │   ├─ Recibe PDF en base64                                        │
│  │   ├─ Sube a Storage                                              │
│  │   ├─ Extrae texto (OCR placeholder)                              │
│  │   ├─ Llama a Groq API (cascada de modelos)                       │
│  │   ├─ Guarda análisis en DB                                       │
│  │   └─ Crea reporte                                                │
│  │                                                                   │
│  ├─ send-notification                                                │
│  │   └─ Crea notificación en DB (email/SMS pendiente)               │
│  │                                                                   │
│  └─ generate-report                                                  │
│      ├─ Actualiza reporte con notas médicas                         │
│      ├─ Cambia estado a "approved"                                  │
│      └─ Envía notificación al paciente                              │
│                                                                      │
│  STORAGE                                                             │
│  └─ medical-reports (bucket público, 20MB límite)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GROQ API (IA)                                                       │
│  ├─ Modelo Primario: llama-3.3-70b-versatile                       │
│  ├─ Modelo Secundario: llama-3.1-70b-versatile                     │
│  ├─ Modelo Terciario: llama-3.1-8b-instant                         │
│  └─ Modelo Respaldo: llama3-70b-8192                               │
│                                                                      │
│  [FUTURO] OCR API                                                    │
│  └─ Tesseract / Cloud Vision / AWS Textract                         │
│                                                                      │
│  [FUTURO] Notificaciones                                            │
│  ├─ SendGrid (Email)                                                 │
│  └─ Twilio (SMS)                                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Trabajo Detallado

### 1. Paciente Sube Análisis

```
PACIENTE                  FRONTEND               EDGE FUNCTION           SUPABASE
   │                         │                       │                      │
   │──PDF──>                 │                       │                      │
   │        convertir base64 │                       │                      │
   │                         │──invoke────────────>  │                      │
   │                         │  process-pdf          │                      │
   │                         │  {pdfData, fileName}  │                      │
   │                         │                       │                      │
   │                         │                       │──upload PDF──────>   │
   │                         │                       │  Storage             │
   │                         │                       │<────URL─────────────│
   │                         │                       │                      │
   │                         │                       │──extract text        │
   │                         │                       │  (OCR placeholder)   │
   │                         │                       │                      │
   │                         │                       │──call Groq API       │
   │                         │                       │  (AI analysis)       │
   │                         │                       │                      │
   │                         │                       │──INSERT──────────>   │
   │                         │                       │  analyses table      │
   │                         │                       │                      │
   │                         │                       │──INSERT──────────>   │
   │                         │                       │  reports table       │
   │                         │                       │                      │
   │                         │<────success───────────│                      │
   │<──"Análisis subido"────│                       │                      │
   │   "Será revisado"       │                       │                      │
```

### 2. Médico Revisa y Aprueba

```
MÉDICO                    FRONTEND               EDGE FUNCTION           SUPABASE
   │                         │                       │                      │
   │──"Ver pendientes"──>    │                       │                      │
   │                         │──SELECT───────────────────────────────────>  │
   │                         │  FROM analyses WHERE status='pending'        │
   │                         │<──────lista de análisis──────────────────────│
   │<──lista mostrada────    │                       │                      │
   │                         │                       │                      │
   │──click "Revisar"──>     │                       │                      │
   │                         │──SELECT───────────────────────────────────>  │
   │                         │  análisis + reporte + paciente               │
   │                         │<──────datos completos────────────────────────│
   │<──ver análisis IA───    │                       │                      │
   │   + datos paciente      │                       │                      │
   │                         │                       │                      │
   │──editar notas──>        │                       │                      │
   │  seleccionar riesgo     │                       │                      │
   │  agregar recomend.      │                       │                      │
   │  click "Aprobar"        │                       │                      │
   │                         │──invoke────────────>  │                      │
   │                         │  generate-report      │                      │
   │                         │  {reportId, notes}    │                      │
   │                         │                       │                      │
   │                         │                       │──UPDATE──────────>   │
   │                         │                       │  reports table       │
   │                         │                       │  (doctor_notes,      │
   │                         │                       │   approved=true)     │
   │                         │                       │                      │
   │                         │                       │──UPDATE──────────>   │
   │                         │                       │  analyses table      │
   │                         │                       │  (status='approved') │
   │                         │                       │                      │
   │                         │                       │──invoke──────────>   │
   │                         │                       │  send-notification   │
   │                         │                       │                      │
   │                         │                       │──INSERT──────────>   │
   │                         │                       │  notifications       │
   │                         │                       │  (para paciente)     │
   │                         │<────success───────────│                      │
   │<──"Aprobado y enviado"──│                       │                      │
```

### 3. Paciente Ve Resultados

```
PACIENTE                  FRONTEND               SUPABASE
   │                         │                      │
   │──"Ver resultados"──>    │                      │
   │                         │──SELECT──────────────────────>
   │                         │  FROM reports WHERE       │
   │                         │  analysis_id=... AND      │
   │                         │  approved=true            │
   │                         │<──────reporte completo────│
   │<──VISUALIZACIÓN─────    │                      │
   │  • Análisis IA          │                      │
   │  • Notas médicas        │                      │
   │  • Recomendaciones      │                      │
   │  • Nivel de riesgo      │                      │
   │  • PDF descargable      │                      │
```

## Seguridad (RLS Policies)

```
TABLA: analyses
├─ SELECT: Paciente ve solo sus análisis
├─ SELECT: Médicos ven todos los análisis
├─ INSERT: Paciente + Edge Function
└─ UPDATE: Solo Edge Function

TABLA: reports
├─ SELECT: Paciente ve reportes de sus análisis
├─ SELECT: Médicos ven todos los reportes
├─ INSERT: Solo Edge Function
└─ UPDATE: Solo Edge Function

TABLA: storage.objects (medical-reports)
├─ SELECT: Acceso público (PDFs son públicos)
├─ INSERT: anon + service_role (Edge Function)
└─ DELETE: Solo service_role
```

## Tecnologías Principales

| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|-----------|
| Frontend | React | 18.3 | Framework UI |
| Frontend | TypeScript | 5.6 | Type safety |
| Frontend | React Router | 6.30 | Navegación |
| Frontend | Tailwind CSS | 3.4 | Estilos |
| Frontend | Chart.js | 4.5 | Gráficos |
| Frontend | Supabase Client | 2.78 | Backend SDK |
| Backend | Supabase | - | BaaS |
| Backend | PostgreSQL | - | Base de datos |
| Backend | Deno | - | Edge Functions |
| IA | Groq API | - | LLM Inference |
| Build | Vite | 6.2 | Build tool |
| Deploy | MiniMax | - | Hosting |
