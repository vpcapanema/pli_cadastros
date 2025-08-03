#!/bin/bash

# ========================================
# PLI CADASTROS - DIAGNÓSTICO COMPLETO
# Verifica todos os problemas de layout
# ========================================

echo "🔍 DIAGNÓSTICO COMPLETO DO LAYOUT PLI"
echo "===================================="
echo ""

# 1. Verifica servidor
echo "1️⃣ Testando servidor:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888)
if [ "$response" = "200" ]; then
    echo "✅ Servidor respondendo (HTTP $response)"
else
    echo "❌ Servidor com problema (HTTP $response)"
fi

# 2. Testa página principal
echo ""
echo "2️⃣ Testando página principal:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/index.html)
if [ "$response" = "200" ]; then
    echo "✅ Página principal carregando (HTTP $response)"
else
    echo "❌ Página principal com problema (HTTP $response)"
fi

# 3. Verifica CSS
echo ""
echo "3️⃣ Testando CSS modular:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/static/css/main.css)
if [ "$response" = "200" ]; then
    echo "✅ CSS principal carregando (HTTP $response)"
else
    echo "❌ CSS principal com problema (HTTP $response)"
fi

# 4. Verifica correções
echo ""
echo "4️⃣ Verificando correções implementadas:"

# Reset de body
if curl -s http://localhost:8888/static/css/01-generic/_reset-fixes.css | grep -q "body.*margin: 0 !important"; then
    echo "✅ Reset de body aplicado"
else
    echo "❌ Reset de body não encontrado"
fi

# Navbar fixo
if curl -s http://localhost:8888/static/css/01-generic/_reset-fixes.css | grep -q "position: fixed !important"; then
    echo "✅ Navbar fixo aplicado"
else
    echo "❌ Navbar fixo não encontrado"
fi

# Footer centralizado
if curl -s http://localhost:8888/static/css/01-generic/_reset-fixes.css | grep -q "justify-content: center !important"; then
    echo "✅ Footer centralizado aplicado"
else
    echo "❌ Footer centralizado não encontrado"
fi

# 5. Verifica navbar component
echo ""
echo "5️⃣ Testando componente navbar:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/components/navbar.html)
if [ "$response" = "200" ]; then
    echo "✅ Navbar component carregando (HTTP $response)"
else
    echo "❌ Navbar component com problema (HTTP $response)"
fi

echo ""
echo "🎯 RESUMO DOS TESTES:"
echo "===================="
echo "� Página principal: http://localhost:8888/"
echo "📊 Dashboard: http://localhost:8888/dashboard.html"
echo "🔐 Login: http://localhost:8888/login.html"
echo ""
echo "📋 Checklist visual:"
echo "- [ ] Navbar fixo no topo (sem espaço branco)"
echo "- [ ] Footer fixo no fundo (centralizado)"
echo "- [ ] Conteúdo entre navbar e footer"
echo "- [ ] Cores PLI (gradiente verde-azul)"
echo "- [ ] Cards com estatísticas visíveis"
echo ""
echo "🛠️ Se ainda houver problemas:"
echo "- Limpe cache do navegador (Ctrl+F5)"
echo "- Abra DevTools (F12) e verifique console"
echo "- Teste em navegador normal (não Simple Browser)"
