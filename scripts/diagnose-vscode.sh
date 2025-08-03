#!/bin/bash
# Diagnóstico de Problemas do VS Code - SIGMA-PLI
# Verifica configurações e possíveis causas de restart

echo "🔍 DIAGNÓSTICO VS CODE - SIGMA-PLI"
echo "=================================="

# 1. Verificar configurações do VS Code
VSCODE_CONFIG="$HOME/.vscode/settings.json"
WORKSPACE_CONFIG=".vscode/settings.json"

echo -e "\n📁 VERIFICANDO CONFIGURAÇÕES..."

if [ -f "$WORKSPACE_CONFIG" ]; then
    echo "✅ Configuração do workspace encontrada"
    
    # Verificar auto-save agressivo
    if grep -q '"files.autoSave": "afterDelay"' "$WORKSPACE_CONFIG"; then
        echo "⚠️ Auto-save configurado - pode causar reloads"
    fi
    
    # Verificar hot reload
    if grep -q '"typescript.updateImportsOnFileMove.enabled": "always"' "$WORKSPACE_CONFIG"; then
        echo "⚠️ Auto-update de imports ativo"
    fi
else
    echo "ℹ️ Nenhuma configuração específica do workspace"
fi

# 2. Verificar extensões problemáticas
echo -e "\n🔌 VERIFICANDO EXTENSÕES PROBLEMÁTICAS..."

# Lista de extensões que podem causar problemas
PROBLEMATIC_EXTENSIONS=(
    "auto-reload"
    "live-server"
    "browser-sync"
    "nodemon"
    "auto-refresh"
)

for ext in "${PROBLEMATIC_EXTENSIONS[@]}"; do
    if code --list-extensions | grep -i "$ext" > /dev/null; then
        echo "⚠️ Extensão problemática detectada: $ext"
    fi
done

# 3. Verificar processos Node.js
echo -e "\n⚡ VERIFICANDO PROCESSOS NODE.JS..."

NODE_PROCESSES=$(ps aux | grep node | grep -v grep | wc -l)
echo "Processos Node.js ativos: $NODE_PROCESSES"

if [ "$NODE_PROCESSES" -gt 5 ]; then
    echo "⚠️ Muitos processos Node.js rodando simultaneamente"
    ps aux | grep node | grep -v grep | head -10
fi

# 4. Verificar memória disponível
echo -e "\n💾 VERIFICANDO MEMÓRIA..."

if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    echo "Uso de memória: $MEMORY_USAGE"
    
    if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
        echo "⚠️ Alto uso de memória detectado"
    fi
fi

# 5. Verificar logs de erro do Node.js
echo -e "\n📋 VERIFICANDO LOGS..."

if [ -f "./logs/err.log" ]; then
    ERROR_COUNT=$(tail -50 "./logs/err.log" | grep -c "Error\|Exception\|FATAL" || true)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "🚨 $ERROR_COUNT erros encontrados nos logs recentes"
        echo "Últimos erros:"
        tail -10 "./logs/err.log" | grep -E "Error|Exception|FATAL" || echo "Nenhum erro crítico"
    else
        echo "✅ Nenhum erro crítico encontrado"
    fi
else
    echo "ℹ️ Arquivo de log não encontrado"
fi

# 6. Gerar recomendações
echo -e "\n🛠️ RECOMENDAÇÕES:"
echo "1. Configure auto-save menos agressivo no VS Code"
echo "2. Desabilite extensões de auto-reload desnecessárias"
echo "3. Monitore o uso de memória da aplicação"
echo "4. Verifique logs regularmente"
echo "5. Use 'pm2 monit' para monitoramento em tempo real"

echo -e "\n✅ Diagnóstico concluído!"
echo "Para monitoramento contínuo, execute: bash scripts/monitor-app.sh"
