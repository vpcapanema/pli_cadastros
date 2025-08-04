#!/bin/bash

# Script para remover arquivos desnecessários após refatoração
echo "Iniciando limpeza de arquivos desnecessários..."

# 1. Remover arquivos de backup HTML
echo -e "\nRemovendo backups de HTML..."
find c:/Users/vinic/pli_cadastros/views -name "*.bak" -exec rm {} \; 
echo "✅ Backups HTML removidos"

# 2. Remover arquivos CSS refatorados que já foram substituídos
echo -e "\nRemovendo arquivos CSS temporários..."
rm -f c:/Users/vinic/pli_cadastros/static/css/05-components/_forms-refatorado.css
rm -f c:/Users/vinic/pli_cadastros/static/css/05-components/_tables-refatorado.css
rm -f c:/Users/vinic/pli_cadastros/static/css/main-refatorado.css
echo "✅ Arquivos CSS temporários removidos"

# 3. Remover arquivo vazio
echo -e "\nRemovendo arquivos CSS vazios..."
# Verificar antes se o arquivo continua vazio
if [ ! -s c:/Users/vinic/pli_cadastros/static/css/06-pages/_meus-dados-page.css ]; then
  # Verificar se tem conteúdo ou não
  echo "Arquivo _meus-dados-page.css está vazio e será substituído por um adequado"
  echo -e "/* ========================================\n   PLI DESIGN SYSTEM - MEUS DADOS PAGE\n   Estilos específicos para página de dados do usuário\n======================================== */\n\n.p-meus-dados {\n  color: inherit;\n}\n\n/* Container de dados do usuário */\n.p-meus-dados .user-data-container {\n  background: var(--pli-branco);\n  border-radius: var(--pli-border-radius-md);\n  padding: var(--pli-spacing-xl);\n  box-shadow: var(--pli-shadow-sm);\n  margin-bottom: var(--pli-spacing-xl);\n}\n\n/* Estilo para foto de perfil */\n.p-meus-dados .profile-picture-container {\n  text-align: center;\n  margin-bottom: var(--pli-spacing-lg);\n}\n\n.p-meus-dados .profile-picture {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 3px solid var(--pli-verde-principal);\n  padding: 3px;\n}\n\n/* Responsividade */\n@media (max-width: 768px) {\n  .p-meus-dados .user-data-container {\n    padding: var(--pli-spacing-lg);\n  }\n  \n  .p-meus-dados .profile-picture {\n    width: 100px;\n    height: 100px;\n  }\n}" > c:/Users/vinic/pli_cadastros/static/css/06-pages/_meus-dados-page.css
else
  echo "Arquivo _meus-dados-page.css não está mais vazio, não será modificado"
fi
echo "✅ Arquivos vazios verificados"

echo -e "\n✨ Processo de limpeza concluído!"
