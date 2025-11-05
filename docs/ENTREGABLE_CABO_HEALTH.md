# Cabo Health - Plataforma Médica Profesional

## Información de Acceso

**URL de la Aplicación**: https://2k9vpincinp9.space.minimax.io

## Descripción General

Cabo Health es una plataforma médica completa diseñada para facilitar el análisis de laboratorio de sangre con IA y supervisión médica profesional. La plataforma implementa un flujo semi-automático que permite a los pacientes subir sus análisis y a los médicos revisarlos antes de enviar los resultados.

## Funcionalidades Implementadas

### Para Pacientes

1. **Portal Visual Intuitivo**
   - Dashboard con estadísticas de análisis
   - Gráficos interactivos con Chart.js
   - Sistema de códigos semáforo (verde/amarillo/rojo)
   - Historial completo de análisis

2. **Subida de Análisis**
   - Carga de PDFs de hasta 20MB
   - Procesamiento automático con IA
   - Estado de revisión en tiempo real

3. **Visualización de Resultados**
   - Análisis generado por IA
   - Notas médicas profesionales
   - Recomendaciones personalizadas
   - Indicador de nivel de riesgo
   - Opción de descargar PDF original

### Para Médicos

1. **Panel de Gestión**
   - Lista de análisis pendientes
   - Filtros por estado (todos/pendientes/aprobados)
   - Vista rápida de información del paciente

2. **Revisión de Análisis**
   - Visualización del PDF original
   - Análisis generado por IA
   - Editor para notas médicas
   - Selector de nivel de riesgo
   - Recomendaciones personalizables
   - Aprobación con un click

3. **Sistema de Notificaciones**
   - Alertas automáticas al paciente
   - Registro de actividad

## Arquitectura Técnica

### Backend (Supabase)

**Base de Datos:**
- `doctors` - Información de médicos
- `patients` - Información de pacientes
- `analyses` - Análisis subidos
- `reports` - Reportes generados
- `notifications` - Sistema de notificaciones

**Edge Functions:**
1. `process-pdf` - Procesa PDFs, extrae texto y genera análisis con IA
2. `send-notification` - Envía notificaciones a usuarios
3. `generate-report` - Aprueba reportes y notifica a pacientes

**Storage:**
- Bucket `medical-reports` para PDFs (20MB límite)

**Seguridad:**
- Políticas RLS configuradas para todos los roles
- Autenticación por roles (doctor/patient)
- Datos médicos protegidos

### Frontend (React + TypeScript)

**Tecnologías:**
- React 18.3 con TypeScript
- React Router para navegación
- Tailwind CSS para diseño
- Chart.js para visualizaciones
- Supabase Client para backend

**Componentes Principales:**
- Sistema de autenticación completo
- Dashboards diferenciados por rol
- Páginas de registro y login
- Visualizador de reportes
- Editor de análisis médicos

## Cómo Usar la Plataforma

### 1. Crear Cuenta de Médico

1. Ir a https://2k9vpincinp9.space.minimax.io/register
2. Seleccionar "Soy Médico"
3. Completar el formulario:
   - Nombre completo
   - Email válido (ej: doctor@gmail.com)
   - Contraseña (mínimo 6 caracteres)
   - Especialidad
   - Número de licencia
4. Click en "Crear Cuenta"

### 2. Crear Cuenta de Paciente

1. Ir a https://2k9vpincinp9.space.minimax.io/register
2. Seleccionar "Soy Paciente"
3. Completar el formulario:
   - Nombre completo
   - Email válido (ej: paciente@gmail.com)
   - Contraseña (mínimo 6 caracteres)
   - Fecha de nacimiento
   - Género
4. Click en "Crear Cuenta"

### 3. Flujo del Paciente

1. **Iniciar sesión** en el portal
2. **Dashboard**: Ver resumen de análisis
3. **Subir PDF**: Click en "Seleccionar PDF" y subir análisis
4. **Esperar revisión**: El análisis aparece como "En revisión"
5. **Ver resultados**: Cuando el médico apruebe, click en "Ver Resultados"

### 4. Flujo del Médico

1. **Iniciar sesión** en el panel
2. **Dashboard**: Ver lista de análisis pendientes
3. **Revisar análisis**: Click en "Revisar" sobre un análisis
4. **Completar revisión**:
   - Revisar análisis de IA
   - Seleccionar nivel de riesgo (Bajo/Medio/Alto)
   - Agregar notas médicas
   - Agregar recomendaciones
5. **Aprobar**: Click en "Aprobar y Enviar al Paciente"
6. Sistema notifica automáticamente al paciente

## Notas Importantes

### API Key de Groq (IA)

**IMPORTANTE**: Para habilitar el procesamiento automático con IA, se necesita configurar la API key de Groq:

1. Obtener API key en: https://console.groq.com/keys
2. Configurar en Supabase:
   - Ir a Project Settings > Edge Functions > Environment Variables
   - Agregar variable: `GROQ_API_KEY = tu_api_key_aqui`
3. Redesplegar edge function `process-pdf`

**Modelos utilizados (cascada automática):**
- Primario: llama-3.3-70b-versatile
- Secundario: llama-3.1-70b-versatile
- Terciario: llama-3.1-8b-instant
- Respaldo: llama3-70b-8192

**Sin API Key:** La plataforma funciona, pero el análisis de IA mostrará "Pendiente de configuración de API de IA".

### Mejoras vs Cabo Original

1. **Flujo Semi-Automático**: Médico revisa antes de enviar al paciente
2. **Roles Separados**: Autenticación diferenciada doctor/paciente
3. **Panel Médico**: Dashboard profesional para revisión
4. **Portal Paciente**: Visualizaciones gráficas y reportes claros
5. **Sistema de Notificaciones**: Alertas automáticas
6. **Diseño UX Médico**: Paleta de colores profesional y accesible
7. **OCR Preparado**: Estructura lista para integrar OCR (placeholder implementado)

### Limitaciones Actuales

1. **OCR**: PDF escaneados requieren capa de texto (OCR real pendiente de implementar)
2. **Email de Prueba**: Supabase rechaza emails simples como "test@test.com" (usar @gmail.com, @outlook.com, etc.)
3. **Notificaciones**: Sistema interno implementado (email/SMS externos pendientes)

## Testing Realizado

Se realizaron pruebas de:
- Carga de páginas y UI
- Registro de usuarios (ambos roles)
- Sistema de autenticación
- Navegación entre páginas
- Responsive design
- Políticas de seguridad RLS

## Próximos Pasos Recomendados

1. **Configurar GROQ_API_KEY** para habilitar IA
2. **Crear cuentas de prueba** (médico y paciente)
3. **Subir PDF de análisis real** para probar flujo completo
4. **Personalizar**:
   - Logo de la clínica
   - Colores corporativos
   - Información de contacto
5. **Implementar OCR real** para PDFs escaneados (Tesseract o API cloud)
6. **Agregar email/SMS** para notificaciones externas

## Soporte Técnico

**Base de Datos Supabase:**
- URL: https://holtohiphaokzshtpyku.supabase.co
- Acceso vía dashboard de Supabase

**Edge Functions Desplegadas:**
1. `process-pdf`: https://holtohiphaokzshtpyku.supabase.co/functions/v1/process-pdf
2. `send-notification`: https://holtohiphaokzshtpyku.supabase.co/functions/v1/send-notification
3. `generate-report`: https://holtohiphaokzshtpyku.supabase.co/functions/v1/generate-report

## Cumplimiento de Requerimientos

- ✅ Flujo semi-automático implementado
- ✅ Panel médico operativo
- ✅ Portal paciente con visualizaciones
- ✅ Sistema de notificaciones automático
- ✅ Base de datos configurada
- ✅ Backend con edge functions
- ✅ Storage para PDFs
- ✅ Autenticación por roles
- ✅ Diseño UX médico profesional
- ✅ Responsive design
- ✅ Generación de reportes
- ⚠️ OCR para PDFs escaneados (estructura lista, implementación pendiente)
- ⚠️ Reportes PDF descargables (pendiente integración jsPDF)

---

**Desarrollado por**: MiniMax Agent
**Fecha**: 2025-11-02
**Versión**: 1.0.0
