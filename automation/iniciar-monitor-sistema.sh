#!/bin/bash
echo "==================================================="
echo "PLI Cadastros - Iniciando Monitor de Sistema"
echo "==================================================="

# Abre o navegador com o endereço do monitor
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows usando Git Bash
    start chrome http://localhost:8887
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a "Google Chrome" http://localhost:8887
else
    # Linux
    xdg-open http://localhost:8887
fi

# Executa o monitor
cd "$(dirname "$0")/.."
node tools/system-monitor.js
