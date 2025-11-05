-- ===================================================
-- FIX RLS POLICIES FOR SIGNUP
-- ===================================================
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/project/holtohiphaokzshtpyku/sql/new
-- 2. Copia y pega TODO este contenido
-- 3. Click "Execute"
-- 4. Espera a que termine
-- 5. Vuelve a intentar signup en la aplicación
-- ===================================================

-- Drop las políticas restrictivas que bloquean signup
DROP POLICY IF EXISTS "Allow insert for doctors via edge function" ON doctors CASCADE;
DROP POLICY IF EXISTS "Allow insert for patients via edge function" ON patients CASCADE;

-- Crear nuevas políticas que permitan a usuarios autenticados insertar sus propios registros
CREATE POLICY "Authenticated users can insert doctors record" ON doctors
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert patients record" ON patients
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===================================================
-- Ejecuta esto arriba en el SQL editor de Supabase
-- Luego intenta signup nuevamente
-- ===================================================
