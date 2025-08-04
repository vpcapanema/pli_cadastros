#!/bin/bash

# Script para Remover Extensões VS Code Menos Utilizadas
# Remove extensões duplicadas e especializadas não utilizadas

echo "=== REMOÇÃO DE EXTENSÕES VS CODE MENOS UTILIZADAS ==="
echo ""

# Lista de extensões para remover (menos utilizadas/duplicadas)
EXTENSIONS_TO_REMOVE=(
    # Oracle/OCI Tools (7 extensões - não usa Oracle Cloud)
    "oracle-labs-graalvm.oci-devops"
    "oracle.apm"
    "oracle.faas"
    "oracle.oci-core"
    "oracle.oci-vscode-toolkit"
    "oracle.odsc"
    "oracle.rms"
    "joaofelipes.oci-policy-language"
    "linjun.oracle-support"
    
    # Visualizadores especializados não utilizados
    "analytic-signal.preview-tiff"
    "kleinicke.tiff-visualizer"
    "tyriar.luna-paint"
    "adamcamerer1.geospatial-viewer"
    
    # Arquivos/Compressão
    "slevesque.vscode-zipexplorer"
    "tomashubelbauer.zip-file-system"
    
    # Office viewers duplicados (manter só um)
    "apeanut.vs-office"
    
    # Java/NetBeans não utilizados
    "asf.apache-netbeans-java"
    
    # Ferramentas de debug browsers específicos (manter só essenciais)
    "firefox-devtools.vscode-firefox-debug"
    "ms-edgedevtools.vscode-edge-devtools"
    "aaravb.chrome-extension-developer-tools"
    
    # Visualizadores de dados especializados
    "randomfractalsinc.geo-data-viewer"
    "randomfractalsinc.vscode-data-table"
    
    # CORS browser (funcionalidade específica)
    "wscats.cors-browser"
    
    # AWS tools redundantes (manter só os principais)
    "cloudtoolbox.awstoolbox"
    "necatiarslan.aws-credentials-vscode-extension"
    "teetangh.aws-essentials"
    "vscode-aws-console.vscode-aws-console"
    "antstack.aws-js-code-snippet"
    "poyashad.display-aws-amplify-environment"
    "congnguyendinh0.aws-amplify-flutter-snippet"
    "indexsoftware.rds-data-api"
    "mziyabo.vscode-codedeploy"
    "rafwilinski.dynamodb-vscode-snippets"
    
    # Markdown redundantes (manter só o principal)
    "bierner.markdown-checkbox"
    "bierner.markdown-emoji"
    "bierner.markdown-footnotes"
    "bierner.markdown-yaml-preamble"
    
    # Container tools redundantes
    "ms-azuretools.vscode-containers"
    "ms-kubernetes-tools.vscode-kubernetes-tools"
    
    # Remote tools menos utilizados
    "ms-vscode.remote-server"
    "github.remotehub"
    
    # Office debugger específico
    "msoffice.microsoft-office-add-in-debugger"
    
    # Gutter preview
    "kisstkondoros.vscode-gutter-preview"
    
    # Outros especializados
    "yamlhunter.yamltemplatemaker"
    "bat-snippets.bat-snippets"
    "bisnetoinc.theme-word"
    "boto3typed.boto3-ide"
    "redjue.git-commit-plugin"
    "riussi.code-stats-vscode"
    "samuelcolvin.jinjahtml"
    "wholroyd.jinja"
    "techer.open-in-browser"
)

echo "📋 EXTENSÕES MARCADAS PARA REMOÇÃO:"
echo ""

# Verificar quais extensões estão instaladas antes de tentar remover
INSTALLED_TO_REMOVE=()
for extension in "${EXTENSIONS_TO_REMOVE[@]}"; do
    if code --list-extensions | grep -q "^$extension$"; then
        echo "   ❌ $extension"
        INSTALLED_TO_REMOVE+=("$extension")
    else
        echo "   ⚠️ $extension (já removida ou não instalada)"
    fi
done

echo ""
echo "📊 RESUMO:"
echo "   • Total para remover: ${#EXTENSIONS_TO_REMOVE[@]} extensões"
echo "   • Realmente instaladas: ${#INSTALLED_TO_REMOVE[@]} extensões"
echo "   • Economia estimada: ~$(( ${#INSTALLED_TO_REMOVE[@]} * 2 ))MB + startup time"
echo ""

if [ ${#INSTALLED_TO_REMOVE[@]} -eq 0 ]; then
    echo "✅ Nenhuma extensão para remover (todas já foram removidas)."
    exit 0
fi

echo "⏳ INICIANDO REMOÇÃO..."
echo ""

# Remover extensões uma por uma
REMOVED_COUNT=0
FAILED_COUNT=0

for extension in "${INSTALLED_TO_REMOVE[@]}"; do
    echo -n "   Removendo $extension... "
    if code --uninstall-extension "$extension" >/dev/null 2>&1; then
        echo "✅ OK"
        ((REMOVED_COUNT++))
    else
        echo "❌ FALHOU"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "=== RESULTADO FINAL ==="
echo "✅ Extensões removidas: $REMOVED_COUNT"
echo "❌ Falhas na remoção: $FAILED_COUNT"
echo ""

# Mostrar extensões restantes por categoria
echo "📊 EXTENSÕES RESTANTES (categorias principais):"
echo ""

echo "🔧 DESENVOLVIMENTO ESSENCIAL:"
code --list-extensions | grep -E "(copilot|python|prettier|eslint|gitlens)" | sed 's/^/   ✅ /'

echo ""
echo "☁️ AWS/CLOUD (essenciais mantidas):"
code --list-extensions | grep -E "amazonwebservices" | sed 's/^/   ✅ /'

echo ""
echo "🗄️ BANCO DE DADOS:"
code --list-extensions | grep -E "(postgres|dbclient)" | sed 's/^/   ✅ /'

echo ""
echo "🌐 WEB/FRONTEND:"
code --list-extensions | grep -E "(tailwind|html|css)" | sed 's/^/   ✅ /'

echo ""
echo "📝 MARKDOWN:"
code --list-extensions | grep -E "markdown" | sed 's/^/   ✅ /'

echo ""
TOTAL_REMAINING=$(code --list-extensions | wc -l)
echo "📊 TOTAL DE EXTENSÕES RESTANTES: $TOTAL_REMAINING"
echo ""
echo "🎯 RECOMENDAÇÃO: Reinicie o VS Code para aplicar as mudanças."
echo ""
echo "✅ Limpeza concluída!"
