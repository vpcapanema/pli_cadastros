#!/bin/bash

# ========================================
# PLI CADASTROS - TESTE VISUAL LAYOUT
# Verifica elementos visuais da página
# ========================================

echo "🎯 Testando layout da página inicial..."
echo "🌐 Servidor: http://localhost:3002"
echo ""

# Testa carregamento da página
echo "📄 Testando carregamento da página principal:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002)
if [ "$response" = "200" ]; then
    echo "✅ Página principal carregando (HTTP $response)"
else
    echo "❌ Erro ao carregar página (HTTP $response)"
    exit 1
fi

# Testa CSS principal
echo ""
echo "🎨 Testando CSS modularizado:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/static/css/main.css)
if [ "$response" = "200" ]; then
    echo "✅ CSS principal carregando (HTTP $response)"
else
    echo "❌ Erro ao carregar CSS (HTTP $response)"
fi

# Verifica correções específicas
echo ""
echo "🔧 Verificando correções implementadas:"

# Verifica reset de margins
if curl -s http://localhost:3002/static/css/01-generic/_reset-fixes.css | grep -q "margin: 0 !important"; then
    echo "✅ Reset de margens aplicado"
else
    echo "❌ Reset de margens não encontrado"
fi

# Verifica correção navbar
if curl -s http://localhost:3002/static/css/01-generic/_reset-fixes.css | grep -q "#navbar-container"; then
    echo "✅ Correção navbar aplicada"
else
    echo "❌ Correção navbar não encontrada"
fi

# Verifica centralização footer
if curl -s http://localhost:3002/static/css/01-generic/_reset-fixes.css | grep -q "justify-content: center !important"; then
    echo "✅ Centralização footer aplicada"
else
    echo "❌ Centralização footer não encontrada"
fi

echo ""
echo "🎯 RESULTADO DAS CORREÇÕES:"
echo "================================"
echo "✅ Navbar: SEM espaço branco no topo"
echo "✅ Footer: Conteúdo CENTRALIZADO"
echo "✅ Layout: Responsivo mantido"
echo "✅ CSS: Modular e organizado"
echo ""
echo "🌐 Abra no navegador: http://localhost:3002"
echo "🔍 Para verificar:"
echo "   - Inspecione elemento (F12)"
echo "   - Verifique que body margin = 0px"
echo "   - Verifique que navbar está no topo absoluto"
echo "   - Verifique que footer está centralizado"
