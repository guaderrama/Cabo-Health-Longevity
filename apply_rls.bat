@echo off
REM ============================================================================
REM SCRIPT: Aplicar RLS Policies en Supabase
REM Proyecto: Cabo Health Clinic
REM ============================================================================

echo.
echo ========================================
echo  APLICANDO RLS POLICIES EN SUPABASE
echo ========================================
echo.

REM Crear archivo temporal con el SQL
set SQL_FILE=%TEMP%\rls_temp.sql
copy /Y ".claude\sql\rls_policies.sql" "%SQL_FILE%" >nul

echo [INFO] Archivo SQL preparado: %SQL_FILE%
echo.
echo [OPCION 1] APLICAR VIA SUPABASE DASHBOARD (RECOMENDADO)
echo.
echo 1. Abre: https://supabase.com/dashboard/project/holtohiphaokzshtpyku/sql/new
echo 2. Copia el contenido de: .claude\sql\rls_policies.sql
echo 3. Pega en el SQL Editor
echo 4. Click en "Run"
echo 5. Verifica que no hay errores
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para:
echo - Copiar SQL al portapapeles
echo - Abrir Supabase Dashboard
pause >nul

REM Copiar SQL al portapapeles
powershell -Command "Get-Content '.claude\sql\rls_policies.sql' | Set-Clipboard"
echo.
echo [OK] SQL copiado al portapapeles!

REM Abrir Supabase Dashboard
start https://supabase.com/dashboard/project/holtohiphaokzshtpyku/sql/new

echo.
echo ========================================
echo  INSTRUCCIONES
echo ========================================
echo.
echo 1. Se abrio Supabase Dashboard
echo 2. El SQL esta en tu portapapeles
echo 3. Pega (Ctrl+V) en el SQL Editor
echo 4. Click "Run"
echo 5. Verifica que todas las policies se crearon
echo.
pause
