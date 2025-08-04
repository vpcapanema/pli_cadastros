#!/bin/bash

# ========================================
# PLI CADASTROS - SCRIPT DE MIGRAÇÃO HTML
# Atualiza arquivos HTML para usar o novo CSS modularizado
# ========================================

echo "🚀 Iniciando migração dos arquivos HTML para CSS modularizado..."

# Contador de arquivos processados
count=0

# Array de diretórios a processar
directories=("views" "static" "." "src")

# Função para processar arquivo HTML
process_html_file() {
    local file="$1"
    echo "📄 Processando: $file"
    
    # Backup do arquivo original
    cp "$file" "${file}.backup"
    
    # Substitui a referência do CSS antigo pelo novo
    sed -i 's|/static/css/sistema_aplicacao_cores_pli\.css|/static/css/main.css|g' "$file"
    
    # Adiciona classe de página baseada no nome do arquivo
    local filename=$(basename "$file" .html)
    local page_class=""
    
    case "$filename" in
        "index"|"inicio"|"home")
            page_class="page-index"
            ;;
        "dashboard"|"painel"|"admin")
            page_class="page-dashboard"
            ;;
        "login"|"entrar"|"auth"|"autenticacao")
            page_class="page-login"
            ;;
        *"form"*|*"cadastro"*|*"registro"*)
            page_class="page-forms"
            ;;
        *"table"*|*"lista"*|*"relatorio"*)
            page_class="page-tables"
            ;;
        *)
            page_class="page-generic"
            ;;
    esac
    
    # Adiciona classe ao body se não existir
    if grep -q '<body[^>]*class=' "$file"; then
        # Se body já tem classe, adiciona a nova
        sed -i "s/<body\([^>]*\)class=\"\([^\"]*\)\"/<body\1class=\"\2 $page_class\"/" "$file"
    else
        # Se body não tem classe, adiciona
        sed -i "s/<body\([^>]*\)>/<body\1 class=\"$page_class\">/" "$file"
    fi
    
    ((count++))
    echo "✅ Arquivo processado: $file (Classe: $page_class)"
}

# Processa arquivos HTML em cada diretório
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "📁 Processando diretório: $dir"
        find "$dir" -name "*.html" -type f | while read -r file; do
            process_html_file "$file"
        done
    fi
done

echo ""
echo "🎉 Migração concluída!"
echo "📊 Total de arquivos processados: $count"
echo ""
echo "💡 Próximos passos:"
echo "1. Teste as páginas para verificar se o CSS está carregando corretamente"
echo "2. Verifique se as dimensões dinâmicas estão funcionando"
echo "3. Ajuste classes específicas conforme necessário"
echo "4. Remova os backups (.backup) após confirmação"
echo ""
echo "🔍 Para verificar as mudanças:"
echo "   diff arquivo.html arquivo.html.backup"
echo ""
echo "🔄 Para reverter (se necessário):"
echo "   find . -name '*.html.backup' -exec bash -c 'mv \"\$1\" \"\${1%.backup}\"' _ {} \\;"
