# ============================================================================
# SCRIPT: Aplicar RLS Policies en Supabase usando Supabase CLI
# Proyecto: Cabo Health Clinic
# ============================================================================

Write-Host ""
Write-Host "========================================"
Write-Host " APLICANDO RLS POLICIES EN SUPABASE"
Write-Host "========================================"
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location $PSScriptRoot

# Verificar que existe el archivo SQL
if (-not (Test-Path ".\.claude\sql\rls_policies.sql")) {
    Write-Host "ERROR: No se encuentra el archivo rls_policies.sql" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "[1/3] Archivo SQL encontrado" -ForegroundColor Green
Write-Host ""

# Leer el contenido del SQL
$sqlContent = Get-Content ".\.claude\sql\rls_policies.sql" -Raw

Write-Host "[2/3] Ejecutando SQL en Supabase..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar usando psql directamente con la URL de Supabase
# La URL debe estar en formato: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
$env:SUPABASE_URL = "https://holtohiphaokzshtpyku.supabase.co"

# Intentar ejecutar con npx supabase (si está configurado)
try {
    Write-Host "Intentando con Supabase CLI..." -ForegroundColor Cyan
    npx supabase db execute --file ".\.claude\sql\rls_policies.sql" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================"  -ForegroundColor Green
        Write-Host " RLS POLICIES APLICADAS EXITOSAMENTE"  -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximo paso: Aplicar migration audit_logs" -ForegroundColor Cyan
    } else {
        throw "Error al ejecutar SQL"
    }
} catch {
    Write-Host ""
    Write-Host "========================================"  -ForegroundColor Red
    Write-Host " ERROR AL APLICAR RLS POLICIES"  -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solucion alternativa:" -ForegroundColor Yellow
    Write-Host "1. Abre Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Ve a SQL Editor" -ForegroundColor White
    Write-Host "3. Copia el contenido de: .claude\sql\rls_policies.sql" -ForegroundColor White
    Write-Host "4. Pegalo y ejecuta" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Read-Host "Presiona Enter para continuar"
