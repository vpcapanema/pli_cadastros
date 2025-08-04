#!/bin/bash

# Script de Verificação da Nova Estrutura Views
# Valida se todas as referências estão corretas após reorganização

echo "=== VERIFICAÇÃO DA NOVA ESTRUTURA VIEWS ==="
echo ""

# Verificar estrutura de diretórios
echo "📁 ESTRUTURA DE DIRETÓRIOS:"
echo "views/"
echo "├── public/     $(find /c/Users/vinic/pli_cadastros/views/public -name "*.html" | wc -l) arquivos"
echo "├── app/        $(find /c/Users/vinic/pli_cadastros/views/app -name "*.html" | wc -l) arquivos"
echo "├── admin/      $(find /c/Users/vinic/pli_cadastros/views/admin -name "*.html" | wc -l) arquivos"
echo "└── components/ $(find /c/Users/vinic/pli_cadastros/views/components -name "*.html" | wc -l) arquivos"
echo ""

# Verificar páginas públicas
echo "🔓 PÁGINAS PÚBLICAS:"
find /c/Users/vinic/pli_cadastros/views/public -name "*.html" | sort | sed 's|.*/||' | sed 's/^/   ✅ /'
echo ""

# Verificar páginas da aplicação
echo "🔒 PÁGINAS DA APLICAÇÃO (AUTENTICADAS):"
find /c/Users/vinic/pli_cadastros/views/app -name "*.html" | sort | sed 's|.*/||' | sed 's/^/   🛡️ /'
echo ""

# Verificar páginas administrativas
echo "🔐 PÁGINAS ADMINISTRATIVAS:"
find /c/Users/vinic/pli_cadastros/views/admin -name "*.html" | sort | sed 's|.*/||' | sed 's/^/   👑 /'
echo ""

# Verificar se server.js foi atualizado
echo "🔧 VERIFICAÇÃO DO SERVIDOR:"
if grep -q "views.*public" /c/Users/vinic/pli_cadastros/server.js; then
    echo "   ✅ Rotas para páginas públicas atualizadas"
else
    echo "   ❌ Rotas para páginas públicas NÃO atualizadas"
fi

if grep -q "views.*app" /c/Users/vinic/pli_cadastros/server.js; then
    echo "   ✅ Rotas para páginas da aplicação atualizadas"
else
    echo "   ❌ Rotas para páginas da aplicação NÃO atualizadas"
fi

if grep -q "views.*admin.*panel.html" /c/Users/vinic/pli_cadastros/server.js; then
    echo "   ✅ Rotas para páginas administrativas atualizadas"
else
    echo "   ❌ Rotas para páginas administrativas NÃO atualizadas"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "   1. Testar todas as páginas no navegador"
echo "   2. Verificar se auth-guard.js funciona corretamente"
echo "   3. Validar que componentes (navbar/footer) carregam"
echo "   4. Commit das alterações"
echo ""
echo "📊 RESUMO:"
echo "   • Total de páginas: $(find /c/Users/vinic/pli_cadastros/views -name "*.html" | grep -v components | wc -l)"
echo "   • Páginas públicas: $(find /c/Users/vinic/pli_cadastros/views/public -name "*.html" | wc -l)"
echo "   • Páginas autenticadas: $(find /c/Users/vinic/pli_cadastros/views/app -name "*.html" | wc -l)"
echo "   • Páginas administrativas: $(find /c/Users/vinic/pli_cadastros/views/admin -name "*.html" | wc -l)"
echo ""
echo "✅ Verificação concluída!"
