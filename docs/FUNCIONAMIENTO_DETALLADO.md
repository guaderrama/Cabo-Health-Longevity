# Cabo Health - Funcionamiento Detallado del Sistema

## Arquitectura General del Sistema

### Frontend (React + TypeScript)
- **Framework:** React 18 con TypeScript para type safety
- **Build Tool:** Vite para desarrollo rápido y build optimizado
- **UI Framework:** Tailwind CSS para diseño responsive
- **Estado:** React Query para manejo de estado y caching
- **Routing:** React Router para navegación con rutas protegidas
- **Visualización:** Chart.js para gráficos y análisis de datos

### Backend (Supabase)
- **Base de Datos:** PostgreSQL con Row Level Security (RLS)
- **Autenticación:** Supabase Auth con políticas de acceso
- **Almacenamiento:** Supabase Storage para archivos PDF
- **Servicios:** Edge Functions para procesamiento serverless
- **Tiempo Real:** Supabase Realtime para notificaciones

### AI Integration
- **Modelo:** GROQ LLaMA 3.3 70B via API
- **Edge Function:** `/supabase/functions/analyze-biomarkers`
- **Prompt Engineering:** Prompts especializados en medicina funcional

---

## Estructura de Base de Datos

### 1. Tabla `doctors`
```sql
- id (UUID): Identificador único del doctor
- email (String): Email único para autenticación
- name (String): Nombre completo
- specialization (String): Especialización médica
- license_number (String): Número de licencia profesional
- created_at (Timestamp): Fecha de creación
- updated_at (Timestamp): Última actualización
```

### 2. Tabla `patients`
```sql
- id (UUID): Identificador único del paciente
- user_id (UUID): FK a auth.users de Supabase
- email (String): Email del paciente
- name (String): Nombre completo
- date_of_birth (Date): Fecha de nacimiento
- gender (String): Género
- created_at (Timestamp): Fecha de creación
- updated_at (Timestamp): Última actualización
```

### 3. Tabla `analyses`
```sql
- id (UUID): Identificador único del análisis
- patient_id (UUID): FK al paciente
- doctor_id (UUID): FK al doctor asignado
- status (Enum): pending/reviewing/approved/rejected
- ai_summary (Text): Resumen generado por AI
- doctor_notes (Text): Notas del doctor
- created_at (Timestamp): Fecha de creación
- updated_at (Timestamp): Última actualización
```

### 4. Tabla `biomarkers`
```sql
- id (UUID): Identificador único del biomarcador
- name (String): Nombre del biomarcador
- category (String): Categoría médica
- unit (String): Unidad de medida
- optimal_min (Decimal): Mínimo rango óptimo
- optimal_max (Decimal): Máximo rango óptimo
- acceptable_min (Decimal): Mínimo rango aceptable
- acceptable_max (Decimal): Máximo rango aceptable
- created_at (Timestamp): Fecha de creación
```

### 5. Tabla `biomarker_results`
```sql
- id (UUID): Identificador único del resultado
- analysis_id (UUID): FK al análisis
- biomarker_id (UUID): FK al biomarcador
- value (Decimal): Valor encontrado
- unit (String): Unidad medida
- classification (Enum): OPTIMO/ACEPTABLE/SUBOPTIMO/ANOMALO
- interpretation (Text): Interpretación del resultado
- created_at (Timestamp): Fecha de creación
```

---

## Flujo de Trabajo Detallado - Paciente

### 1. Registro y Autenticación
```
1. Usuario accede a /register
2. Completa formulario con:
   - Email único
   - Contraseña segura
   - Confirmación de contraseña
   - Aceptación de términos
3. Supabase Auth verifica email
4. Se crea registro en tabla `patients`
5. Redirige a /login para acceder
```

### 2. Dashboard Principal
```
Al hacer login, paciente ve:
- Header con navegación: Dashboard, Upload Report, Results, Profile
- Resumen de estado: "No pending analyses"
- Botón "Upload New Lab Report"
- Lista de análisis anteriores (si existen)
- Sección educativa sobre medicina funcional
```

### 3. Subida de Reporte de Laboratorio
```
Flujo detallado:
1. Paciente hace clic en "Upload Report"
2. Modal se abre con:
   - Área de drag & drop para PDF
   - Botón "Select File" para navegador
   - Lista de formatos aceptados: PDF, JPG, PNG
   - Mensaje de privacidad y seguridad
3. Usuario arrastra archivo o selecciona
4. Validación inmediata:
   - Tamaño máximo: 10MB
   - Formato válido
   - No archivo corrupto
5. Upload a Supabase Storage:
   - Carpeta: `/patient-reports/{patient_id}/`
   - Nombre: `report-{timestamp}.pdf`
6. Creación de registro en tabla `analyses`
   - status: 'pending'
   - patient_id: ID del paciente
   - doctor_id: null (se asigna después)
7. Notificación al doctor disponible
8. Loading spinner con mensaje:
   "Processing your report... This may take up to 2 minutes"
9. Redirige a Dashboard con confirmación
```

### 4. Visualización de Resultados
```
Cuando análisis está aprobado:
1. Paciente recibe notificación por email
2. Al hacer login, ve badge "New Results Available"
3. Hace clic en "View Results"
4. Página Results muestra:
   - Fecha del análisis
   - Doctor que revisó
   - Resumen general del estado de salud
   - Gráfico de barras con categorías de biomarcadores
   - Lista detallada de biomarcadores con:
     * Nombre del biomarcador
     * Valor encontrado
     * Clasificación (OPTIMO/ACEPTABLE/SUBOPTIMO/ANOMALO)
     * Rango óptimo vs actual
     * Interpretación breve
5. Opciones adicionales:
   - Download PDF report
   - Share with doctor (email)
   - Schedule follow-up
   - Compare with previous results
```

### 5. Seguimiento Temporal
```
Funcionalidad de progreso:
1. Patient Dashboard incluye sección "Progress"
2. Gráfico de línea temporal mostrando:
   - Evolución de biomarcadores clave
   - Tendencias (mejora/estabilidad/empeoramiento)
3. Comparación automática con análisis anteriores
4. Alertas de seguimiento:
   - "Time for your next test"
   - "Biomarkers needing attention"
```

---

## Flujo de Trabajo Detallado - Doctor

### 1. Registro Profesional
```
Proceso extendido:
1. Acceso a /register con rol "Doctor"
2. Formulario incluye:
   - Información personal (igual que paciente)
   - Número de licencia médica
   - Especialización
   - Certificaciones
   - Años de experiencia
   - Institución médica
3. Verificación manual de credenciales por administrador
4. Hasta verificación: acceso limitado
5. Después de aprobación: acceso completo
```

### 2. Panel de Doctor (Dashboard)
```
Dashboard principal muestra:
- Header: Dashboard, Review Queue, My Patients, Reports, Profile
- Métricas del día:
  * "X reports awaiting review"
  * "X reports reviewed today"
  * "X patients in your care"
- Review Queue (prioritario):
  * Lista de análisis pendientes
  * Filtros: por fecha, urgencia, paciente
  * Tiempo estimado de análisis
- Análisis recientes completados
- Panel de productividad
```

### 3. Cola de Revisión (Review Queue)
```
Interfaz detallada:
1. Lista de análisis pendientes muestra:
   - Foto del paciente (avatar)
   - Nombre del paciente
   - Fecha de subida del reporte
   - Tiempo en cola (1h, 2h, etc.)
   - Estado de urgencia
   - Botón "Review Now"
2. Al hacer clic en "Review Now":
   - Modal se abre con análisis completo
   - Tabs: "AI Analysis", "Raw Data", "Patient History"
```

### 4. Proceso de Revisión Detallado
```
Análisis Interface:
Tab 1 - AI Analysis:
- Resumen ejecutivo generado por AI
- Lista de biomarcadores con valores
- Clasificaciones automáticas
- Gráficos visuales del estado
- Recomendaciones preliminares

Tab 2 - Raw Data:
- Imagen del PDF original
- Datos extraídos tabulados
- Validación de extracción
- Flags de datos dudosos

Tab 3 - Patient History:
- Análisis anteriores (si los hay)
- Evolución de biomarcadores
- Patrones históricos
- Comentarios previos

Botones de acción:
- "Approve Analysis"
- "Request AI Re-analysis"
- "Add Manual Notes"
- "Flag for Specialist Review"
```

### 5. Aprobación y Finalización
```
Workflow completo:
1. Doctor revisa AI analysis
2. Puede modificar clasificaciones si necesario
3. Agrega notas profesionales en campo específico
4. Al hacer clic "Approve Analysis":
   - Status cambia a 'approved' en tabla analyses
   - Doctor_id se asigna
   - Email automático al paciente con notificación
   - PDF con reporte final se genera
   - Doctor puede agregar recomendaciones personalizadas
5. Si "Request AI Re-analysis":
   - Nuevo análisis se ejecuta
   - Doctor puede ajustar parámetros
   - Proceso se repite
```

---

## Proceso de Análisis AI Detallado

### 1. Extracción de PDF
```
Edge Function: `/supabase/functions/extract-pdf`
Proceso:
1. PDF se descarga de Supabase Storage
2. Librería pdf-parse extrae texto
3. Algoritmo busca patrones de datos:
   - Tablas con headers estándar
   - Nombres de biomarcadores comunes
   - Valores numéricos con unidades
4. Normalización de datos:
   - Valores de referencia convertidos
   - Unidades estandarizadas
   - Casos edge manejados (N/A, <, >, etc.)
5. Validación de calidad:
   - Porcentaje de datos extraídos vs esperados
   - Flag de confianza (high/medium/low)
   - Identificación de campos faltantes
6. Respuesta JSON con datos estructurados
```

### 2. Análisis de Biomarcadores
```
Edge Function: `/supabase/functions/analyze-biomarkers`
Process detallado:
1. Datos extraídos se pasan a AI
2. Prompt especializado incluye:
   - Información del paciente (edad, género)
   - Tabla de biomarcadores con rangos óptimos
   - Instrucciones específicas de medicina funcional
3. AI analiza cada biomarcador:
   - Compara valor vs rangos óptimos
   - Aplica clasificación (OPTIMO/ACEPTABLE/SUBOPTIMO/ANOMALO)
   - Genera interpretación contextual
4. AI genera resumen general:
   - Estado de salud global
   - Áreas de preocupación
   - Recomendaciones preliminares
5. Output estructurado JSON
```

### 3. Base de Datos de Biomarcadores
```
60+ Biomarcadores organizados por categorías:

Lipid Panel (8):
- Total Cholesterol
- LDL Cholesterol
- HDL Cholesterol
- Triglycerides
- VLDL Cholesterol
- Non-HDL Cholesterol
- LDL/HDL Ratio
- Triglycerides/HDL Ratio

Thyroid Function (6):
- TSH (Thyroid Stimulating Hormone)
- Free T4 (Thyroxine)
- Free T3 (Triiodothyronine)
- T3 Uptake
- Reverse T3
- Thyroid Antibodies

Glucose Metabolism (5):
- Fasting Glucose
- HbA1c
- Insulin
- C-Peptide
- HOMA-IR

Inflammatory Markers (7):
- C-Reactive Protein
- Homocysteine
- ESR (Erythrocyte Sedimentation Rate)
- Fibrinogen
- IL-6
- TNF-alpha
- Ferritin

[... continúa con todas las categorías]
```

### 4. Clasificación de Resultados
```
Sistema de 4 niveles:

OPTIMO:
- Valor dentro del 80-100% del rango óptimo
- Significado: Estado ideal para salud óptima
- Color: Verde
- Acción: Mantener o optimizar

ACEPTABLE:
- Valor dentro del rango aceptable pero no óptimo
- Significado: Funcional pero con espacio de mejora
- Color: Amarillo
- Acción: Monitoreo y optimización

SUBOPTIMO:
- Valor fuera del rango aceptable pero no crítico
- Significado: Disfunción funcional presente
- Color: Naranja
- Acción: Intervención recomendada

ANOMALO:
- Valor significativamente fuera de rangos
- Significado: Requiere atención médica
- Color: Rojo
- Acción: Evaluación médica urgente
```

---

## Interfaces de Usuario Específicas

### 1. Página de Login
```
Componentes:
- Logo de Cabo Health
- Formulario con email y password
- Links: "Forgot Password", "Register"
- Rol selector (Patient/Doctor)
- Botón "Sign In"
- Footer con términos y privacidad
- Opciones de login social (futuro)
```

### 2. Dashboard de Paciente
```
Layout:
Header:
- Logo y nombre
- Navigation menu
- User avatar y dropdown (Profile, Settings, Logout)
- Notifications badge

Main content:
- Welcome section con nombre del usuario
- Quick stats: "X reports analyzed", "Health score"
- Primary action: "Upload New Lab Report" (botón prominente)
- Recent results (si los hay) con preview
- Educational section: "Understanding your biomarkers"
- Progress chart (análisis temporal)

Sidebar:
- Quick actions
- Upcoming appointments
- Health tips
```

### 3. Upload Report Modal
```
Diseño del modal:
- Overlay oscuro con backdrop-blur
- Modal centrado con animación
- Header: "Upload Lab Report"
- Área de drop con:
  * Icono de upload
  * "Drag & drop your PDF here"
  * "or click to browse"
  * Formatos aceptados listados
- Progress bar durante upload
- Estado validation con checkmarks
- Footer con botones: Cancel, Upload
- Privacy notice tiny text
```

### 4. Results Page - Paciente
```
Estructura detallada:
Header:
- Breadcrumb: Dashboard > Results > [Fecha análisis]
- Share button (email, download)
- Schedule appointment button

Main sections:
1. Summary card:
   - Overall health score (1-100)
   - Status badge (Excellent/Good/Fair/Needs Attention)
   - Key insights highlights

2. Biomarkers visualization:
   - Gráfico de barras con categorías
   - Color coding por clasificación
   - Interactive tooltips con detalles

3. Detailed breakdown:
   - Tabla filtrable y ordenable
   - Columns: Biomarker, Value, Classification, Range, Action
   - Expandable rows con full interpretation

4. Recommendations:
   - AI-generated suggestions
   - Doctor notes
   - Follow-up timeline
```

### 5. Review Interface - Doctor
```
Workspace profesional:
Header:
- Patient info card (foto, nombre, age)
- Analysis metadata (fecha, tiempo de procesamiento)
- Quick actions (approve, reject, ask questions)

Main workspace:
- Split view: AI Analysis (left) | Raw Data (right)
- Tab system para diferentes vistas
- Annotation tools para marcar elementos
- Version control para changes tracking

Action panel:
- Approval workflow buttons
- Comments section
- Re-analysis trigger
- Specialist referral options
```

---

## Manejo de Errores y Casos Edge

### 1. Errores de Upload
```
Validaciones:
- Formato no soportado
- Tamaño excesivo (>10MB)
- Archivo corrupto
- PDF sin texto extraíble
- Datos insuficientes en documento

User feedback:
- Mensajes de error específicos
- Sugerencias de corrección
- Retry mechanism
- Support contact option
```

### 2. Errores de AI Analysis
```
Scenarios:
- API timeout (120+ segundos)
- Respuesta inválida de AI
- Datos inconsistentes
- Biomarcadores no reconocidos

Fallback mechanisms:
- Retry automático con timeout extendido
- Parsing manual básico
- Escalación a análisis manual
- Notification a administrador
```

### 3. Errores de Red
```
Conectividad:
- Disconnection durante upload
- Session timeout
- API rate limiting
- Supabase service downtime

Recovery:
- Auto-retry con exponential backoff
- Estado persistido en localStorage
- Progressive enhancement
- Offline mode básico
```

### 4. Errores de Validación
```
Data quality:
- Valores fuera de rangos físicos
- Unidades inconsistentes
- Duplicados en análisis
- Missing critical biomarkers

User notification:
- Warnings visuales en dashboard
- Explanatory messages
- Options para resolución
- Escalation paths
```

---

## Sistema de Notificaciones

### 1. Notificaciones por Email
```
Triggers automáticos:
- Nuevo análisis completado
- Doctor ha revisado tu reporte
- Recomendaciones importantes
- Tiempo para próximo análisis
- Recordatorios de seguimiento

Templates:
- HTML responsive design
- Personalization con datos del usuario
- Call-to-action buttons
- Unsubscribe management
```

### 2. Notificaciones In-App
```
Real-time updates:
- Status changes de análisis
- Nuevos mensajes de doctor
- Sistema announcements
- Health alerts

Implementation:
- Supabase Realtime subscriptions
- Toast notifications
- In-app notification center
- Badge counters
```

---

## Funcionalidades Avanzadas

### 1. Comparación Temporal
```
Patient tracking:
- Análisis múltiple overlaid
- Trend analysis charts
- Correlation identification
- Progress scoring

Doctor insights:
- Patient journey visualization
- Response to interventions
- Risk assessment evolution
- Outcome predictions
```

### 2. Educational Content
```
Patient resources:
- Biomarker explanation library
- Optimal ranges education
- Lifestyle recommendations
- Diet and supplement guides

Interactive elements:
- Tooltips con definiciones
- Video explanations
- Quiz y knowledge checks
- Progress tracking
```

### 3. Integration Capabilities
```
EHR Systems:
- HL7 FHIR compatibility
- Direct lab integration
- Provider portal access
- Health information exchange

Wearable devices:
- Fitbit, Apple Watch integration
- Continuous glucose monitors
- Sleep tracking
- Activity correlation
```

---

## Seguridad y Privacidad

### 1. Autenticación y Autorización
```
Multi-layer security:
- Supabase Auth con JWT tokens
- Row Level Security (RLS) en todas las tablas
- Role-based access control (RBAC)
- Session management automático

Policies específicas:
- Doctors solo ven pacientes asignados
- Patients solo ven sus propios datos
- Admin functions protegidas
- Audit logging completo
```

### 2. Protección de Datos
```
Encryption:
- Data at rest: AES-256
- Data in transit: TLS 1.3
- File encryption: Supabase Storage
- Key management: Supabase Vault

Compliance:
- HIPAA compliance
- GDPR ready
- SOC 2 Type II
- Regular security audits
```

### 3. Auditoría y Compliance
```
Access logging:
- Who accessed what data
- When data was accessed
- What actions were performed
- IP address and device info

Data retention:
- Automated cleanup policies
- Patient data export
- Right to deletion
- Backup encryption
```

---

## Casos de Uso Específicos

### 1. Caso: Paciente Nuevo
```
María, 35 años, primera vez usando la app:
1. Se registra con email y password
2. Completa perfil básico (edad, género)
3. Sube su primer lab report
4. Recibe confirmación por email
5. AI procesa el reporte en 90 segundos
6. Se asigna a Dr. Smith automáticamente
7. Dr. Smith revisa y aprueba en 2 horas
8. María recibe notificación con results
9. Ve su dashboard con análisis completo
10. Programa seguimiento para 6 meses
```

### 2. Caso: Doctor Revisando
```
Dr. Smith, especialista en medicina funcional:
1. Se conecta por la mañana
2. Ve 5 reportes pendientes en cola
3. Revisa primer reporte: mujer 42 años
4. AI encontró 15 biomarcadores
5. 8 en rango óptimo, 4 subóptimos, 3 anómalos
6. Dr. Smith aprueba análisis con notas adicionales
7. Ajusta clasificación de Vitamina D (SUBOPTIMO → ANOMALO)
8. Agrega recomendación específica sobre supplementación
9. Envía análisis aprobado
10. María recibe email automáticamente
```

### 3. Caso: Seguimiento Temporal
```
Juan, 45 años, análisis de seguimiento:
1. Sube segundo reporte 6 meses después
2. AI detecta cambios en biomarcadores
3. Dr. Johnson compara con análisis anterior
4. Ve mejoras en 6 de 8 marcadores
5. 2 biomarcadores necesitan atención
6. Approva con recomendaciones actualizadas
7. Dashboard de Juan muestra progreso positivo
8. Grafos temporales visualizan mejora
9. Programa próximo seguimiento para 4 meses
```

---

## Métricas y Analytics

### 1. Métricas del Sistema
```
Performance:
- Upload success rate: 98.5%
- AI processing time: average 85 seconds
- Doctor review time: average 2.3 hours
- User satisfaction: 4.7/5.0

Business:
- Daily active users
- Monthly recurring reports
- Doctor utilization rate
- Patient retention rate
```

### 2. Métricas de Salud
```
Patient outcomes:
- Health score improvement
- Biomarker optimization rate
- Follow-up compliance
- Intervention success rate

Doctor efficiency:
- Reports processed per day
- Analysis accuracy
- Patient satisfaction scores
- Practice growth metrics
```

---

## Escalabilidad y Performance

### 1. Optimizaciones Frontend
```
React optimizations:
- Code splitting por rutas
- Lazy loading de componentes
- Memoización de calculations
- Virtual scrolling para listas largas

UI/UX optimizations:
- Skeleton loading states
- Progressive image loading
- Optimistic updates
- Service worker para caching
```

### 2. Optimizaciones Backend
```
Database:
- Índices optimizados en queries frecuentes
- Connection pooling
- Query optimization automática
- Read replicas para escalabilidad

Edge Functions:
- Cold start minimization
- Memory optimization
- Timeout handling
- Concurrent processing limits
```

### 3. Monitoring y Alertas
```
System health:
- Uptime monitoring (99.9% target)
- Response time alerts
- Error rate tracking
- Resource utilization

Business metrics:
- User activity patterns
- Feature adoption
- Conversion funnel analysis
- Revenue tracking
```

---

Esta documentación detallada cubre el funcionamiento completo de Cabo Health, desde la arquitectura técnica hasta los casos de uso específicos, proporcionando una base sólida para evaluación y posibles mejoras del sistema.