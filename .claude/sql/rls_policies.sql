-- ============================================================================
-- RLS POLICIES - CABO HEALTH CLINIC
-- ============================================================================
-- Descripción: Configuración completa de Row Level Security para HIPAA compliance
-- Proyecto: Cabo Health Clinic
-- Fecha: 2025-11-04
-- Base de datos: Supabase PostgreSQL
--
-- IMPORTANTE: Ejecutar estas policies garantiza que:
-- - Pacientes solo ven sus propios datos
-- - Doctores ven análisis asignados
-- - Datos médicos (PHI) están protegidos
-- - Cumplimiento HIPAA básico
-- ============================================================================

-- ============================================================================
-- PASO 1: HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================

-- Habilitar RLS en tabla patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla doctors
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla analyses
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- biomarker_ranges es pública (solo lectura), no necesita RLS estricto
-- Pero la habilitamos por seguridad
ALTER TABLE biomarker_ranges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 2: CREAR FUNCIÓN HELPER PARA OBTENER ROL DE USUARIO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Verificar si es doctor
  IF EXISTS (SELECT 1 FROM doctors WHERE id = user_uuid) THEN
    RETURN 'doctor';
  END IF;

  -- Verificar si es paciente
  IF EXISTS (SELECT 1 FROM patients WHERE id = user_uuid) THEN
    RETURN 'patient';
  END IF;

  -- Si no se encuentra, retornar null
  RETURN NULL;
END;
$$;

-- ============================================================================
-- PASO 3: POLICIES PARA TABLA `patients`
-- ============================================================================
-- Reglas:
-- - Pacientes pueden ver/editar solo sus propios datos
-- - Doctores pueden ver pacientes que tienen análisis asignados
-- - Nadie puede eliminar pacientes (soft delete recomendado)
-- ============================================================================

-- Policy: Pacientes pueden ver sus propios datos
CREATE POLICY "patients_select_own"
ON patients
FOR SELECT
USING (
  auth.uid() = id
);

-- Policy: Pacientes pueden actualizar sus propios datos
CREATE POLICY "patients_update_own"
ON patients
FOR UPDATE
USING (
  auth.uid() = id
);

-- Policy: Doctores pueden ver pacientes con análisis asignados
CREATE POLICY "doctors_select_assigned_patients"
ON patients
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'doctor'
  AND EXISTS (
    SELECT 1
    FROM analyses
    WHERE analyses.patient_id = patients.id
    AND analyses.doctor_id = auth.uid()
  )
);

-- Policy: Permitir INSERT solo para registro (Supabase Auth trigger)
CREATE POLICY "patients_insert_own"
ON patients
FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- ============================================================================
-- PASO 4: POLICIES PARA TABLA `doctors`
-- ============================================================================
-- Reglas:
-- - Doctores pueden ver/editar solo sus propios datos
-- - Otros doctores NO pueden ver datos de colegas (privacidad)
-- ============================================================================

-- Policy: Doctores pueden ver sus propios datos
CREATE POLICY "doctors_select_own"
ON doctors
FOR SELECT
USING (
  auth.uid() = id
);

-- Policy: Doctores pueden actualizar sus propios datos
CREATE POLICY "doctors_update_own"
ON doctors
FOR UPDATE
USING (
  auth.uid() = id
);

-- Policy: Permitir INSERT solo para registro
CREATE POLICY "doctors_insert_own"
ON doctors
FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- ============================================================================
-- PASO 5: POLICIES PARA TABLA `analyses`
-- ============================================================================
-- Reglas:
-- - Pacientes ven solo sus análisis
-- - Doctores ven análisis asignados a ellos
-- - Pacientes pueden crear análisis (subir PDFs)
-- - Solo doctores pueden actualizar (asignar, cambiar status)
-- ============================================================================

-- Policy: Pacientes pueden ver sus propios análisis
CREATE POLICY "analyses_select_by_patient"
ON analyses
FOR SELECT
USING (
  patient_id = auth.uid()
);

-- Policy: Doctores pueden ver análisis asignados
CREATE POLICY "analyses_select_by_doctor"
ON analyses
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'doctor'
  AND (
    doctor_id = auth.uid()
    OR doctor_id IS NULL -- Análisis sin asignar (cola)
  )
);

-- Policy: Pacientes pueden crear análisis (subir PDF)
CREATE POLICY "analyses_insert_by_patient"
ON analyses
FOR INSERT
WITH CHECK (
  patient_id = auth.uid()
);

-- Policy: Doctores pueden actualizar análisis asignados
CREATE POLICY "analyses_update_by_doctor"
ON analyses
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'doctor'
  AND (doctor_id = auth.uid() OR doctor_id IS NULL)
);

-- Policy: Doctores pueden asignarse análisis
CREATE POLICY "analyses_assign_to_doctor"
ON analyses
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'doctor'
)
WITH CHECK (
  doctor_id = auth.uid()
);

-- ============================================================================
-- PASO 6: POLICIES PARA TABLA `reports`
-- ============================================================================
-- Reglas:
-- - Pacientes ven reportes de sus análisis aprobados
-- - Doctores ven reportes de análisis asignados
-- - Solo doctores pueden crear/editar reportes
-- ============================================================================

-- Policy: Pacientes pueden ver reportes de sus análisis aprobados
CREATE POLICY "reports_select_by_patient"
ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM analyses
    WHERE analyses.id = reports.analysis_id
    AND analyses.patient_id = auth.uid()
    AND analyses.status = 'approved'
  )
);

-- Policy: Doctores pueden ver reportes de análisis asignados
CREATE POLICY "reports_select_by_doctor"
ON reports
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'doctor'
  AND EXISTS (
    SELECT 1
    FROM analyses
    WHERE analyses.id = reports.analysis_id
    AND analyses.doctor_id = auth.uid()
  )
);

-- Policy: Doctores pueden crear reportes
CREATE POLICY "reports_insert_by_doctor"
ON reports
FOR INSERT
WITH CHECK (
  public.get_user_role(auth.uid()) = 'doctor'
  AND EXISTS (
    SELECT 1
    FROM analyses
    WHERE analyses.id = analysis_id
    AND analyses.doctor_id = auth.uid()
  )
);

-- Policy: Doctores pueden actualizar reportes de análisis asignados
CREATE POLICY "reports_update_by_doctor"
ON reports
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'doctor'
  AND EXISTS (
    SELECT 1
    FROM analyses
    WHERE analyses.id = reports.analysis_id
    AND analyses.doctor_id = auth.uid()
  )
);

-- ============================================================================
-- PASO 7: POLICIES PARA TABLA `notifications`
-- ============================================================================
-- Reglas:
-- - Usuarios solo ven sus propias notificaciones
-- - Sistema puede crear notificaciones (via service_role)
-- - Usuarios pueden marcar como leídas
-- ============================================================================

-- Policy: Usuarios ven solo sus notificaciones
CREATE POLICY "notifications_select_own"
ON notifications
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Policy: Usuarios pueden actualizar solo sus notificaciones (marcar leída)
CREATE POLICY "notifications_update_own"
ON notifications
FOR UPDATE
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- Policy: Permitir INSERT desde Edge Functions (service_role)
-- Esta policy se configura desde Supabase Dashboard para service_role
-- No requiere policy explícita aquí

-- ============================================================================
-- PASO 8: POLICIES PARA TABLA `biomarker_ranges`
-- ============================================================================
-- Reglas:
-- - Lectura pública para todos (necesario para análisis)
-- - Solo admins pueden modificar (via service_role)
-- ============================================================================

-- Policy: Todos pueden leer biomarker_ranges
CREATE POLICY "biomarker_ranges_select_all"
ON biomarker_ranges
FOR SELECT
USING (true);

-- No policies para INSERT/UPDATE/DELETE (solo service_role puede hacerlo)

-- ============================================================================
-- PASO 9: VERIFICACIÓN DE POLICIES
-- ============================================================================
-- Ejecutar estas queries para verificar que las policies están activas:

-- Ver todas las policies creadas
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('patients', 'doctors', 'analyses', 'reports', 'notifications', 'biomarker_ranges');

-- ============================================================================
-- PASO 10: TESTING DE POLICIES (RECOMENDADO)
-- ============================================================================

-- Test 1: Como paciente, ver solo mis análisis
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims.sub TO '<patient_uuid>';
-- SELECT * FROM analyses; -- Debe mostrar solo análisis del paciente

-- Test 2: Como doctor, ver análisis asignados
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims.sub TO '<doctor_uuid>';
-- SELECT * FROM analyses; -- Debe mostrar solo análisis asignados

-- Test 3: Intentar ver datos de otro paciente (debe fallar)
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims.sub TO '<patient1_uuid>';
-- SELECT * FROM patients WHERE id = '<patient2_uuid>'; -- Debe retornar 0 filas

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. APLICAR ESTAS POLICIES:
--    - Ir a Supabase Dashboard → SQL Editor
--    - Copiar y pegar este archivo completo
--    - Click "Run"
--    - Verificar que no hay errores

-- 2. VERIFICAR RLS:
--    - Probar login como paciente
--    - Verificar que solo ve sus datos
--    - Probar login como doctor
--    - Verificar que solo ve análisis asignados

-- 3. CONSIDERACIONES DE SEGURIDAD:
--    - Estas policies son BÁSICAS para HIPAA
--    - Considera agregar audit logging (ver migration audit_logs)
--    - Considera agregar IP whitelisting para doctores
--    - Considera agregar rate limiting

-- 4. PERFORMANCE:
--    - Asegúrate de tener índices en:
--      - analyses.patient_id
--      - analyses.doctor_id
--      - reports.analysis_id
--      - notifications.user_id

-- 5. MANTENIMIENTO:
--    - Revisar policies cada 6 meses
--    - Actualizar si cambian requisitos de negocio
--    - Monitorear logs de acceso

-- ============================================================================
-- FIN DEL ARCHIVO
-- ============================================================================

-- Para aplicar:
-- 1. Copia este archivo completo
-- 2. Pégalo en Supabase Dashboard → SQL Editor
-- 3. Click "Run"
-- 4. Verifica que todas las policies se crearon correctamente
-- 5. Ejecuta tests de verificación

-- Próximo paso: Crear tabla audit_logs (ver migration siguiente)
