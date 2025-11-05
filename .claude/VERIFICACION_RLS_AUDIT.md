# 🧪 VERIFICACIÓN RLS & AUDIT LOGS - Cabo Health Clinic

**Fecha**: 2025-11-04
**Propósito**: Verificar que RLS Policies y Audit Logs están funcionando correctamente
**Proyecto**: holtohiphaokzshtpyku

---

## 📍 DÓNDE EJECUTAR

**Supabase Dashboard → SQL Editor**:
```
https://supabase.com/dashboard/project/holtohiphaokzshtpyku/sql/new
```

---

## ✅ TEST 1: Verificar RLS Habilitado

**Query**:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'doctors', 'analyses', 'reports', 'notifications', 'biomarker_ranges')
ORDER BY tablename;
```

**Resultado Esperado**:
```
tablename          | rowsecurity
-------------------+-------------
analyses           | true
biomarker_ranges   | true
doctors            | true
notifications      | true
patients           | true
reports            | true

Total: 6 filas
```

✅ **PASS**: Todas las tablas tienen RLS habilitado
❌ **FAIL**: Si alguna tabla tiene rowsecurity = false

---

## ✅ TEST 2: Contar Policies por Tabla

**Query**:
```sql
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Resultado Esperado**:
```
tablename          | policies
-------------------+----------
analyses           | 9
biomarker_ranges   | 5
doctors            | 7
notifications      | 5
patients           | 8
reports            | 8

Total: 42 policies
```

✅ **PASS**: 42 policies totales distribuidas en 6 tablas
❌ **FAIL**: Si el total es diferente de 42

---

## ✅ TEST 3: Verificar Tabla audit_logs

**Query**:
```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'audit_logs'
ORDER BY ordinal_position;
```

**Resultado Esperado**:
```
column_name       | data_type                   | is_nullable
------------------+-----------------------------+-------------
id                | uuid                        | NO
user_id           | uuid                        | NO
user_email        | text                        | YES
user_type         | text                        | NO
action            | text                        | NO
table_name        | text                        | NO
record_id         | uuid                        | YES
old_data          | jsonb                       | YES
new_data          | jsonb                       | YES
changed_fields    | ARRAY                       | YES
ip_address        | inet                        | YES
user_agent        | text                        | YES
request_id        | uuid                        | YES
description       | text                        | YES
sensitive_access  | boolean                     | YES
created_at        | timestamp with time zone    | NO

Total: 16 columnas
```

✅ **PASS**: Tabla existe con 16 columnas
❌ **FAIL**: Si la tabla no existe o tiene diferente número de columnas

---

## ✅ TEST 4: Verificar Triggers Activos

**Query**:
```sql
SELECT
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table, event_manipulation;
```

**Resultado Esperado**:
```
trigger_name              | event_object_table | event_manipulation | action_timing
--------------------------+--------------------+--------------------+--------------
audit_analyses_trigger    | analyses           | DELETE             | AFTER
audit_analyses_trigger    | analyses           | INSERT             | AFTER
audit_analyses_trigger    | analyses           | UPDATE             | AFTER
audit_doctors_trigger     | doctors            | DELETE             | AFTER
audit_doctors_trigger     | doctors            | INSERT             | AFTER
audit_doctors_trigger     | doctors            | UPDATE             | AFTER
audit_patients_trigger    | patients           | DELETE             | AFTER
audit_patients_trigger    | patients           | INSERT             | AFTER
audit_patients_trigger    | patients           | UPDATE             | AFTER
audit_reports_trigger     | reports            | DELETE             | AFTER
audit_reports_trigger     | reports            | INSERT             | AFTER
audit_reports_trigger     | reports            | UPDATE             | AFTER

Total: 12 triggers (4 tablas × 3 operaciones)
```

✅ **PASS**: 12 triggers activos en 4 tablas sensibles
❌ **FAIL**: Si faltan triggers o tienen diferente configuración

---

## ✅ TEST 5: Verificar Función get_user_role

**Query**:
```sql
SELECT
    routine_name,
    routine_type,
    data_type as return_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_role';
```

**Resultado Esperado**:
```
routine_name    | routine_type | return_type | security_type
----------------+--------------+-------------+---------------
get_user_role   | FUNCTION     | text        | DEFINER

Total: 1 función
```

✅ **PASS**: Función existe con security_type = DEFINER
❌ **FAIL**: Si la función no existe

---

## ✅ TEST 6: Verificar Vista phi_access_logs

**Query**:
```sql
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'phi_access_logs';
```

**Resultado Esperado**:
```
table_name       | view_definition
-----------------+------------------
phi_access_logs  | SELECT id, user_id, user_email, ...

Total: 1 vista
```

✅ **PASS**: Vista existe
❌ **FAIL**: Si la vista no existe

---

## ✅ TEST 7: Verificar Índices de Performance

**Query**:
```sql
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'audit_logs'
ORDER BY indexname;
```

**Resultado Esperado**:
```
Índices esperados:
1. audit_logs_pkey (PRIMARY KEY)
2. idx_audit_logs_action
3. idx_audit_logs_created_at
4. idx_audit_logs_sensitive
5. idx_audit_logs_table_record
6. idx_audit_logs_user_id
7. idx_audit_logs_user_table_date
8. idx_audit_logs_user_type

Total: 8 índices (1 PK + 7 performance)
```

✅ **PASS**: 8 índices creados
❌ **FAIL**: Si faltan índices

---

## ✅ TEST 8: Test Funcional de Trigger (Opcional)

**Query** (ejecutar en orden):
```sql
-- 1. Insertar un paciente de prueba (esto debe crear un audit log)
INSERT INTO patients (id, email, full_name, phone, date_of_birth)
VALUES (
    gen_random_uuid(),
    'test-verification@cabo-health.com',
    'Test Verification User',
    '+1234567890',
    '1990-01-01'
);

-- 2. Verificar que se creó el audit log
SELECT
    user_type,
    action,
    table_name,
    description,
    sensitive_access,
    created_at
FROM audit_logs
WHERE description LIKE '%patients%'
ORDER BY created_at DESC
LIMIT 1;

-- 3. Limpiar (borrar el paciente de prueba)
DELETE FROM patients
WHERE email = 'test-verification@cabo-health.com';

-- 4. Verificar que el DELETE también se registró
SELECT
    user_type,
    action,
    table_name,
    description,
    created_at
FROM audit_logs
WHERE description LIKE '%patients%'
ORDER BY created_at DESC
LIMIT 2;
```

**Resultado Esperado**:
- El INSERT debe crear un registro en audit_logs con action='INSERT'
- El DELETE debe crear un registro en audit_logs con action='DELETE'
- Ambos deben tener sensitive_access=true
- user_type debe ser 'system' (porque no hay usuario autenticado)

✅ **PASS**: Ambas operaciones registradas en audit_logs
❌ **FAIL**: Si no se crean los registros de auditoría

---

## 📊 RESUMEN DE VERIFICACIÓN

Después de ejecutar todos los tests, debes tener:

| Test | Componente | Resultado Esperado |
|------|------------|-------------------|
| 1 | RLS Habilitado | 6 tablas con rowsecurity=true |
| 2 | Policies | 42 policies totales |
| 3 | audit_logs | Tabla con 16 columnas |
| 4 | Triggers | 12 triggers activos |
| 5 | get_user_role | 1 función DEFINER |
| 6 | phi_access_logs | 1 vista |
| 7 | Índices | 8 índices en audit_logs |
| 8 | Trigger Funcional | INSERT/DELETE registrados |

---

## ✅ CRITERIO DE ÉXITO

**SESIÓN EXITOSA** si:
- ✅ Todos los 8 tests pasan
- ✅ No hay errores en ninguna query
- ✅ Los números coinciden exactamente con los esperados

**REQUIERE INVESTIGACIÓN** si:
- ❌ Algún test falla
- ❌ Números diferentes a los esperados
- ❌ Errores de sintaxis o permisos

---

## 🚀 PRÓXIMOS PASOS DESPUÉS DE VERIFICACIÓN

Si todos los tests pasan:

1. ✅ **RLS y Audit Logs confirmados funcionando**
2. **Próxima tarea**: Testing con usuarios reales
   - Crear usuario paciente de prueba
   - Crear usuario doctor de prueba
   - Validar que RLS policies funcionan en la app
3. **Luego**: Instalar shadcn/ui components
4. **Después**: Completar generación de PDF final

---

**Ejecuta estos queries en Supabase Dashboard y reporta los resultados.** 🧪
