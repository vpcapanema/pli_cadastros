#!/bin/bash

# Script para remover arquivos de CSS obsoletos
# Este script remove os arquivos _forms-page.css e _tables-page.css após a migração

echo "Removendo arquivos CSS obsoletos..."

# Caminho para os arquivos
FORMS_PAGE="c:/Users/vinic/pli_cadastros/static/css/06-pages/_forms-page.css"
TABLES_PAGE="c:/Users/vinic/pli_cadastros/static/css/06-pages/_tables-page.css"

# Verificar e remover _forms-page.css
if [ -f "$FORMS_PAGE" ]; then
  echo "Removendo: $FORMS_PAGE"
  rm "$FORMS_PAGE"
  echo "✓ Arquivo removido com sucesso!"
else
  echo "× Arquivo não encontrado: $FORMS_PAGE"
fi

# Verificar e remover _tables-page.css
if [ -f "$TABLES_PAGE" ]; then
  echo "Removendo: $TABLES_PAGE"
  rm "$TABLES_PAGE"
  echo "✓ Arquivo removido com sucesso!"
else
  echo "× Arquivo não encontrado: $TABLES_PAGE"
fi

echo "Processo concluído!"
