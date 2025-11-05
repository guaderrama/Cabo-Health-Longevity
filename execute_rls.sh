#!/bin/bash
# ============================================================================
# SCRIPT: Ejecutar RLS Policies en Supabase via psql
# Proyecto: Cabo Health Clinic
# ============================================================================

echo ""
echo "========================================"
echo " EJECUTANDO RLS POLICIES EN SUPABASE"
echo "========================================"
echo ""

# Connection string de Supabase
SUPABASE_DB_URL="postgresql://postgres.holtohiphaokzshtpyku:[YOUR_DB_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Nota: Necesitas obtener la database password desde:
# Supabase Dashboard → Settings → Database → Connection string

echo "[1/2] Aplicando RLS policies..."
psql "$SUPABASE_DB_URL" -f ".claude/sql/rls_policies.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ RLS Policies aplicadas exitosamente"
    echo ""

    echo "[2/2] Verificando RLS habilitado..."
    psql "$SUPABASE_DB_URL" -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('patients', 'doctors', 'analyses', 'reports', 'notifications', 'biomarker_ranges');"

    echo ""
    echo "========================================"
    echo " ✅ COMPLETADO"
    echo "========================================"
else
    echo ""
    echo "❌ Error al aplicar RLS policies"
    echo "Por favor verifica la connection string"
fi
