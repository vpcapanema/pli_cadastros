#!/bin/bash

# ========================================
# PLI CADASTROS - VERIFICAÇÃO DE LAYOUT
# Testa se as correções de navbar e footer estão funcionando
# ========================================

echo "🔍 Verificando correções de layout..."

# Verifica se o CSS está sendo servido
echo "📝 Testando carregamento do CSS:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/static/css/main.css)
if [ "$response" = "200" ]; then
    echo "✅ CSS main.css carregando corretamente"
else
    echo "❌ Erro ao carregar CSS: $response"
fi

# Verifica se as correções estão presentes
echo ""
echo "📝 Verificando presença das correções:"

# Verifica reset
if curl -s http://localhost:3001/static/css/01-generic/_reset-fixes.css | grep -q "margin: 0 !important"; then
    echo "✅ Reset de margens encontrado"
else
    echo "❌ Reset de margens não encontrado"
fi

# Verifica correção do navbar
if curl -s http://localhost:3001/static/css/01-generic/_reset-fixes.css | grep -q "navbar-container"; then
    echo "✅ Correção do navbar encontrada"
else
    echo "❌ Correção do navbar não encontrada"
fi

# Verifica centralização do footer
if curl -s http://localhost:3001/static/css/01-generic/_reset-fixes.css | grep -q "justify-content: center"; then
    echo "✅ Centralização do footer encontrada"
else
    echo "❌ Centralização do footer não encontrada"
fi

echo ""
echo "🌐 Para testar visualmente:"
echo "   1. Abra: http://localhost:3001"
echo "   2. Verifique se não há espaço branco acima do navbar"
echo "   3. Verifique se o footer está centralizado"
echo ""
echo "🔧 Se ainda houver problemas:"
echo "   - Limpe o cache do navegador (Ctrl+F5)"
echo "   - Verifique no DevTools se o CSS está carregando"
echo "   - Confira se não há CSS inline sobrepondo"
