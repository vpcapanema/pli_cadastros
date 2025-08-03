#!/bin/bash

# Script para remover arquivos CSS não utilizados no sistema PLI
# Mantém apenas a estrutura ITCSS (00-settings até 07-utilities)

echo "=== REMOVENDO ARQUIVOS CSS NÃO UTILIZADOS ==="

# Navegar para o diretório CSS
cd /c/Users/vinic/pli_cadastros/static/css

echo "Diretório atual: $(pwd)"

# Arquivos CSS soltos na raiz (não utilizados)
echo "Removendo arquivos CSS da raiz..."
rm -f footer.css
rm -f header.css  
rm -f root.css
rm -f sessions-manager.css

# Arquivos de recuperação de senha (ainda em uso - manter por enquanto)
echo "Mantendo arquivos de recuperar-senha (ainda referenciados)..."

# Remover pasta body inteira (não utilizada)
echo "Removendo pasta body/..."
rm -rf body/

# Remover pasta modules (vazia)
echo "Removendo pasta modules/..."
rm -rf modules/

# Listar estrutura final
echo ""
echo "=== ESTRUTURA CSS FINAL ==="
find . -type f -name "*.css" | sort

echo ""
echo "=== DIRETÓRIOS MANTIDOS ==="
find . -type d | grep -E "(00-settings|01-generic|02-generic|03-elements|04-layout|05-components|06-pages|07-utilities)" | sort

echo ""
echo "Limpeza concluída! Mantida apenas a estrutura ITCSS."
