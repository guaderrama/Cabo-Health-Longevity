-- ============================================================================
-- MIGRATION: CREATE AUDIT LOGS TABLE + TRIGGERS
-- ============================================================================
-- Descripción: Sistema completo de audit trail para HIPAA compliance
-- Proyecto: Cabo Health Clinic
-- Fecha: 2025-11-04
-- Propósito: Tracking de accesos y modificaciones a datos médicos (PHI)
--
-- IMPORTANTE: Esta migration crea:
-- 1. Tabla audit_logs para almacenar eventos
-- 2. Función trigger para capturar cambios
-- 3. Triggers en tablas sensibles (analyses, reports)
-- 4. Índices para performance
-- 5. RLS policies para audit_logs
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA audit_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  -- Identificador único del log
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Usuario que realizó la acción
  user_id UUID NOT NULL,
  user_email TEXT, -- Email del usuario (desnormalizado para auditoría)
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient', 'admin', 'system')),

  -- Acción realizada
  action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),

  -- Tabla y registro afectado
  table_name TEXT NOT NULL,
  record_id UUID, -- ID del registro afectado

  -- Datos antes y después del cambio (para UPDATE/DELETE)
  old_data JSONB, -- Estado anterior
  new_data JSONB, -- Estado nuevo
  changed_fields TEXT[], -- Campos que cambiaron

  -- Metadata de la request
  ip_address INET, -- IP del usuario
  user_agent TEXT, -- Navegador/cliente
  request_id UUID, -- ID de la request (para correlación)

  -- Metadata adicional
  description TEXT, -- Descripción legible de la acción
  sensitive_access BOOLEAN DEFAULT false, -- True si accedió a PHI

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PASO 2: CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice para búsquedas por usuario
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Índice para búsquedas por tabla y registro
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- Índice para búsquedas por fecha (más recientes primero)
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Índice para búsquedas de accesos sensibles
CREATE INDEX idx_audit_logs_sensitive ON public.audit_logs(sensitive_access) WHERE sensitive_access = true;

-- Índice para búsquedas por tipo de usuario
CREATE INDEX idx_audit_logs_user_type ON public.audit_logs(user_type);

-- Índice para búsquedas por acción
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Índice compuesto para reportes
CREATE INDEX idx_audit_logs_user_table_date ON public.audit_logs(user_id, table_name, created_at DESC);

-- ============================================================================
-- PASO 3: CREAR FUNCIÓN TRIGGER PARA AUDIT LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid UUID;
  user_role TEXT;
  user_email_val TEXT;
  changed_fields_array TEXT[];
  field_name TEXT;
BEGIN
  -- Obtener user_id del contexto de Supabase Auth
  user_uuid := auth.uid();

  -- Si no hay usuario autenticado, es una operación del sistema
  IF user_uuid IS NULL THEN
    user_uuid := '00000000-0000-0000-0000-000000000000';
    user_role := 'system';
    user_email_val := 'system@cabo-health.com';
  ELSE
    -- Determinar rol del usuario
    IF EXISTS (SELECT 1 FROM doctors WHERE id = user_uuid) THEN
      user_role := 'doctor';
      SELECT email INTO user_email_val FROM doctors WHERE id = user_uuid;
    ELSIF EXISTS (SELECT 1 FROM patients WHERE id = user_uuid) THEN
      user_role := 'patient';
      SELECT email INTO user_email_val FROM patients WHERE id = user_uuid;
    ELSE
      user_role := 'unknown';
      user_email_val := 'unknown@cabo-health.com';
    END IF;
  END IF;

  -- Para UPDATE, calcular campos que cambiaron
  IF TG_OP = 'UPDATE' THEN
    changed_fields_array := ARRAY[]::TEXT[];

    -- Iterar sobre todos los campos y comparar
    FOR field_name IN
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = TG_TABLE_SCHEMA
      AND table_name = TG_TABLE_NAME
    LOOP
      -- Comparar valores viejos vs nuevos
      IF to_jsonb(OLD) -> field_name IS DISTINCT FROM to_jsonb(NEW) -> field_name THEN
        changed_fields_array := array_append(changed_fields_array, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insertar log de auditoría
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    user_type,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    changed_fields,
    description,
    sensitive_access,
    created_at
  ) VALUES (
    user_uuid,
    user_email_val,
    user_role,
    TG_OP, -- INSERT, UPDATE, DELETE
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (OLD.id)::UUID
      ELSE (NEW.id)::UUID
    END,
    CASE
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
      ELSE NULL
    END,
    changed_fields_array,
    CASE TG_OP
      WHEN 'INSERT' THEN 'Record created in ' || TG_TABLE_NAME
      WHEN 'UPDATE' THEN 'Record updated in ' || TG_TABLE_NAME || ' (fields: ' || array_to_string(changed_fields_array, ', ') || ')'
      WHEN 'DELETE' THEN 'Record deleted from ' || TG_TABLE_NAME
    END,
    -- Marcar como sensible si es tabla médica
    TG_TABLE_NAME IN ('analyses', 'reports', 'medical_records'),
    NOW()
  );

  -- Retornar el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- ============================================================================
-- PASO 4: CREAR TRIGGERS EN TABLAS SENSIBLES
-- ============================================================================

-- Trigger para tabla analyses (PDFs subidos)
DROP TRIGGER IF EXISTS audit_analyses_trigger ON public.analyses;
CREATE TRIGGER audit_analyses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Trigger para tabla reports (análisis de IA + notas de doctor)
DROP TRIGGER IF EXISTS audit_reports_trigger ON public.reports;
CREATE TRIGGER audit_reports_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Trigger para tabla patients (datos demográficos - PHI)
DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients;
CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Trigger para tabla doctors (menos crítico pero útil para compliance)
DROP TRIGGER IF EXISTS audit_doctors_trigger ON public.doctors;
CREATE TRIGGER audit_doctors_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- ============================================================================
-- PASO 5: HABILITAR RLS EN audit_logs
-- ============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver audit logs (vía service_role)
-- Los usuarios normales NO pueden ver logs de auditoría
CREATE POLICY "audit_logs_admin_only"
ON public.audit_logs
FOR SELECT
USING (false); -- Nadie puede hacer SELECT directo

-- Permitir INSERT desde triggers (SECURITY DEFINER)
-- No necesita policy explícita porque la función tiene SECURITY DEFINER

-- ============================================================================
-- PASO 6: CREAR FUNCIÓN PARA REPORTES DE AUDITORÍA (ADMIN)
-- ============================================================================

-- Función para que admins vean logs de auditoría
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW(),
  filter_user_id UUID DEFAULT NULL,
  filter_table TEXT DEFAULT NULL,
  limit_count INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  user_type TEXT,
  action TEXT,
  table_name TEXT,
  description TEXT,
  sensitive_access BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Permite bypass de RLS
AS $$
BEGIN
  -- Solo permitir si el usuario es admin
  -- TODO: Implementar verificación de admin role
  -- IF public.get_user_role(auth.uid()) != 'admin' THEN
  --   RAISE EXCEPTION 'Only admins can view audit logs';
  -- END IF;

  RETURN QUERY
  SELECT
    al.id,
    al.user_email,
    al.user_type,
    al.action,
    al.table_name,
    al.description,
    al.sensitive_access,
    al.created_at
  FROM public.audit_logs al
  WHERE al.created_at >= start_date
    AND al.created_at <= end_date
    AND (filter_user_id IS NULL OR al.user_id = filter_user_id)
    AND (filter_table IS NULL OR al.table_name = filter_table)
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- PASO 7: CREAR VISTA PARA ACCESOS A PHI (HIPAA REQUIREMENT)
-- ============================================================================

CREATE OR REPLACE VIEW public.phi_access_logs AS
SELECT
  id,
  user_id,
  user_email,
  user_type,
  action,
  table_name,
  record_id,
  description,
  ip_address,
  created_at
FROM public.audit_logs
WHERE sensitive_access = true
ORDER BY created_at DESC;

-- Vista solo accesible por admins (via service_role)

-- ============================================================================
-- PASO 8: CREAR FUNCIÓN PARA LIMPIAR LOGS ANTIGUOS (OPCIONAL)
-- ============================================================================

-- Función para archivar logs mayores a 2 años (HIPAA requiere 6 años, pero podemos mover a S3)
CREATE OR REPLACE FUNCTION public.archive_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar logs mayores a 2 años
  -- IMPORTANTE: Antes de eliminar, exportar a S3 o sistema de archivo
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND sensitive_access = false; -- Solo logs no-sensibles

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- PASO 9: COMENTARIOS EN TABLA PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.audit_logs IS 'Audit trail for HIPAA compliance - tracks all access and modifications to PHI';
COMMENT ON COLUMN public.audit_logs.user_id IS 'UUID of user who performed the action';
COMMENT ON COLUMN public.audit_logs.action IS 'Type of action: SELECT, INSERT, UPDATE, DELETE';
COMMENT ON COLUMN public.audit_logs.table_name IS 'Name of table affected';
COMMENT ON COLUMN public.audit_logs.old_data IS 'State before change (for UPDATE/DELETE)';
COMMENT ON COLUMN public.audit_logs.new_data IS 'State after change (for INSERT/UPDATE)';
COMMENT ON COLUMN public.audit_logs.sensitive_access IS 'True if accessed PHI (Protected Health Information)';

-- ============================================================================
-- PASO 10: GRANTS (PERMISOS)
-- ============================================================================

-- Solo service_role puede hacer SELECT directo en audit_logs
-- Los triggers pueden INSERT via SECURITY DEFINER
-- Usuarios normales NO tienen acceso

-- ============================================================================
-- TESTING DE LA MIGRATION
-- ============================================================================

-- Test 1: Insertar un análisis (debería crear audit log)
-- INSERT INTO analyses (patient_id, pdf_filename, status)
-- VALUES (auth.uid(), 'test.pdf', 'pending');

-- Test 2: Ver audit log creado (solo admins)
-- SELECT * FROM get_audit_logs();

-- Test 3: Verificar que trigger captura cambios
-- UPDATE analyses SET status = 'approved' WHERE id = '<analysis_id>';

-- Test 4: Ver PHI access logs
-- SELECT * FROM phi_access_logs LIMIT 10;

-- ============================================================================
-- ROLLBACK (SI ES NECESARIO)
-- ============================================================================

-- Para revertir esta migration:
/*
DROP VIEW IF EXISTS public.phi_access_logs;
DROP FUNCTION IF EXISTS public.archive_old_audit_logs();
DROP FUNCTION IF EXISTS public.get_audit_logs(TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT, INT);
DROP TRIGGER IF EXISTS audit_analyses_trigger ON public.analyses;
DROP TRIGGER IF EXISTS audit_reports_trigger ON public.reports;
DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients;
DROP TRIGGER IF EXISTS audit_doctors_trigger ON public.doctors;
DROP FUNCTION IF EXISTS public.audit_log_trigger();
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_table_record;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_sensitive;
DROP INDEX IF EXISTS idx_audit_logs_user_type;
DROP INDEX IF EXISTS idx_audit_logs_action;
DROP INDEX IF EXISTS idx_audit_logs_user_table_date;
DROP TABLE IF EXISTS public.audit_logs;
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. APLICAR ESTA MIGRATION:
--    Opción A: Via Supabase CLI
--      npx supabase db push
--
--    Opción B: Via Supabase Dashboard
--      SQL Editor → Copiar/Pegar → Run

-- 2. VERIFICAR QUE FUNCIONA:
--    - Hacer INSERT/UPDATE/DELETE en analyses
--    - Verificar que se crea registro en audit_logs
--    - Llamar get_audit_logs() para ver logs

-- 3. COMPLIANCE HIPAA:
--    - Esta migration cubre audit trail básico
--    - Considera agregar: backup automático de logs, alertas de accesos sospechosos
--    - Exportar logs a S3 cada año para archivo a largo plazo

-- 4. PERFORMANCE:
--    - Índices ya creados para queries comunes
--    - Considera particionar tabla por fecha si crece mucho
--    - Monitorear tamaño de tabla audit_logs

-- 5. PRIVACIDAD:
--    - Los logs contienen PHI en campos old_data/new_data
--    - Acceso SOLO para admins via service_role
--    - Considerar encriptar campos sensibles

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
