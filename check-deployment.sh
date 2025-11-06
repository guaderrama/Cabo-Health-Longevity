#!/bin/bash
# Script para verificar si el deployment se completó

echo "🔍 VERIFICANDO ESTADO DEL DEPLOYMENT"
echo "===================================="
echo ""

# Check origin/main
echo "📍 Estado de origin/main:"
git fetch origin main -q
MAIN_COMMIT=$(git rev-parse origin/main)
MAIN_MSG=$(git log origin/main --oneline -1)
echo "   Commit: $MAIN_COMMIT"
echo "   Mensaje: $MAIN_MSG"
echo ""

# Check feature branch
echo "📍 Estado de feature branch:"
FEATURE_COMMIT=$(git rev-parse origin/claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz)
FEATURE_MSG=$(git log origin/claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz --oneline -1)
echo "   Commit: $FEATURE_COMMIT"
echo "   Mensaje: $FEATURE_MSG"
echo ""

# Compare
echo "📊 ANÁLISIS:"
if [ "$MAIN_COMMIT" = "$FEATURE_COMMIT" ]; then
    echo "   ✅ DEPLOYED: Los cambios están en producción"
    echo "   🌐 URL: https://cabo-health-longevity.vercel.app"
    echo ""
    echo "   Puedes verificar la app en línea ahora."
elif git merge-base --is-ancestor $FEATURE_COMMIT origin/main; then
    echo "   ✅ DEPLOYED: Feature branch está incluida en main"
    echo "   🌐 URL: https://cabo-health-longevity.vercel.app"
else
    echo "   ❌ NOT DEPLOYED: Los cambios NO están en producción"
    echo "   📝 ACCIÓN REQUERIDA:"
    echo ""
    echo "   1. Crear Pull Request:"
    echo "      https://github.com/guaderrama/Cabo-Health-Longevity/compare/main...claude/code-audit-review-011CUqjG1oZm2fu2e4ZdvRpz"
    echo ""
    echo "   2. Mergear el PR en GitHub"
    echo ""
    echo "   3. Esperar 2-5 minutos para deploy de Vercel"
fi

echo ""
echo "===================================="
