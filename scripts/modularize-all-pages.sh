#!/bin/bash

# ================================================
# SCRIPT DE MODULARIZAÇÃO AUTOMÁTICA
# ================================================
# Remove CSS e JS inline/duplicados de todas as páginas HTML
# e aplica sistema modularizado

echo "🚀 Iniciando modularização automática de todas as páginas HTML..."

# Diretório base
BASE_DIR="C:/Users/vinic/pli_cadastros"
VIEWS_DIR="$BASE_DIR/views"
CSS_DIR="$BASE_DIR/static/css"
JS_DIR="$BASE_DIR/static/js"

# Contador de páginas processadas
count=0

# Função para processar cada arquivo HTML
process_html_file() {
    local file="$1"
    local filename=$(basename "$file" .html)
    
    echo "📄 Processando: $filename.html"
    
    # Backup do arquivo original
    cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Remove CSS inline (entre <style> e </style>)
    sed -i '/<style>/,/<\/style>/d' "$file"
    
    # Remove scripts Bootstrap duplicados
    sed -i '/https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.1\.3\/dist\/js\/bootstrap\.bundle\.min\.js/d' "$file"
    
    # Remove outros scripts duplicados comuns
    sed -i '/https:\/\/code\.jquery\.com\/jquery-3\.7\.1\.min\.js/d' "$file"
    sed -i '/https:\/\/cdn\.datatables\.net.*\.js/d' "$file"
    sed -i '/https:\/\/cdn\.jsdelivr\.net\/npm\/sweetalert2@11/d' "$file"
    sed -i '/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jquery\.mask/d' "$file"
    
    # Atualiza class do body se necessário
    if [[ "$filename" != "index" && "$filename" != "login" && "$filename" != "usuarios" ]]; then
        sed -i "s/class=\"[^\"]*page-[^\"]*\"/class=\"page-$filename\"/g" "$file"
    fi
    
    # Adiciona carregamento modularizado baseado no tipo de página
    if grep -q "datatables" "$file" 2>/dev/null; then
        # Página com DataTables
        add_datatable_modules "$file" "$filename"
    else
        # Página simples
        add_simple_modules "$file" "$filename"
    fi
    
    ((count++))
    echo "✅ $filename.html processado"
}

# Função para adicionar módulos DataTable
add_datatable_modules() {
    local file="$1"
    local filename="$2"
    
    # Remove seção de scripts antiga
    sed -i '/<!-- Scripts -->/,/<!-- Footer/d' "$file"
    
    # Adiciona nova seção modularizada antes do fechamento do body
    cat >> "$file" << EOF

    <!-- Scripts Modularizados -->
    <script src="/static/js/datatable-script-loader.js"></script>
    <script>
        // Inicializa scripts específicos da página $filename
        DataTableScriptLoader.initDataTableScripts([
            '/static/js/pages/$filename.js'
        ]).then(() => {
            console.log('Página $filename inicializada com sucesso');
        }).catch(error => {
            console.error('Erro na inicialização da página $filename:', error);
        });
    </script>

    <!-- Footer Modularizado -->
    <div id="footer-container"></div>
    <script src="/static/js/footer-loader.js"></script>
</body>
</html>
EOF
}

# Função para adicionar módulos simples
add_simple_modules() {
    local file="$1"
    local filename="$2"
    
    # Remove seção de scripts antiga
    sed -i '/<!-- Scripts -->/,/<!-- Footer/d' "$file"
    sed -i '/<!-- Bootstrap JS -->/,/<!-- Footer/d' "$file"
    
    # Adiciona nova seção modularizada antes do fechamento do body
    cat >> "$file" << EOF

    <!-- Scripts da Página -->
    <script src="/static/js/core-scripts-loader.js"></script>
    <script src="/static/js/pages/$filename.js"></script>
    <script>
        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página $filename');
        });
    </script>

    <!-- Footer Modularizado -->
    <div id="footer-container"></div>
    <script src="/static/js/footer-loader.js"></script>
</body>
</html>
EOF
}

# Processa todos os arquivos HTML no diretório views
echo "🔍 Buscando arquivos HTML em $VIEWS_DIR..."

for file in "$VIEWS_DIR"/*.html; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file" .html)
        
        # Pula arquivos já processados
        if [[ "$filename" == "index" || "$filename" == "usuarios" || "$filename" == "login" ]]; then
            echo "⏭️  Pulando $filename.html (já processado)"
            continue
        fi
        
        process_html_file "$file"
    fi
done

echo ""
echo "🎉 Modularização concluída!"
echo "📊 Total de páginas processadas: $count"
echo ""
echo "📋 Próximos passos manuais:"
echo "1. Verificar se todas as páginas estão funcionando corretamente"
echo "2. Criar arquivos JavaScript específicos para páginas que precisam (/static/js/pages/)"
echo "3. Criar CSS específico para páginas com estilos únicos (/static/css/06-pages/)"
echo "4. Testar funcionalidades de cada página"
echo ""
echo "⚠️  Backups criados com timestamp para todos os arquivos modificados"
