#!/bin/bash

# Script para limpar arquivos CSS desnecessários
echo "Iniciando limpeza de diretórios CSS..."

# 1. Remover diretórios vazios
echo -e "\nRemovendo diretórios vazios..."
rmdir c:/Users/vinic/pli_cadastros/static/css/02-generic
rmdir c:/Users/vinic/pli_cadastros/static/css/03-elements
echo "✅ Diretórios vazios removidos"

# 2. Remover arquivo exemplo não usado (se você confirmar que realmente não é necessário)
echo -e "\nRemovendo arquivo de exemplo não utilizado..."
# Comentado para você decidir se realmente quer removê-lo
# rm -f c:/Users/vinic/pli_cadastros/static/css/06-pages/_exemplo-pagina.css
echo "⚠️ Arquivo _exemplo-pagina.css mantido (descomente para remover)"

echo -e "\n✨ Processo de limpeza concluído!"
