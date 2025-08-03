#!/bin/bash
# Script de Monitoramento de Aplicação - SIGMA-PLI
# Monitora restarts, uso de memória e logs de erro

LOG_FILE="./logs/monitoring.log"
ERROR_LOG="./logs/err.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_message "❌ PM2 não está instalado"
    exit 1
fi

# Verificar status da aplicação
APP_STATUS=$(pm2 show pli-cadastros --silent)
if [ $? -eq 0 ]; then
    log_message "✅ Aplicação está rodando"
    
    # Verificar uso de memória
    MEMORY_USAGE=$(pm2 show pli-cadastros | grep -o 'memory: [0-9]*' | grep -o '[0-9]*')
    if [ ! -z "$MEMORY_USAGE" ]; then
        if [ "$MEMORY_USAGE" -gt 1500 ]; then
            log_message "⚠️ Alto uso de memória: ${MEMORY_USAGE}MB"
        fi
    fi
    
    # Verificar restarts recentes
    RESTARTS=$(pm2 show pli-cadastros | grep -o 'restarts: [0-9]*' | grep -o '[0-9]*')
    if [ ! -z "$RESTARTS" ] && [ "$RESTARTS" -gt 3 ]; then
        log_message "🔄 Muitos restarts detectados: $RESTARTS"
    fi
else
    log_message "❌ Aplicação não está rodando"
fi

# Verificar logs de erro recentes
if [ -f "$ERROR_LOG" ]; then
    ERROR_COUNT=$(tail -100 "$ERROR_LOG" | grep -c "ERROR\|CRASH\|FATAL" || true)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        log_message "🚨 $ERROR_COUNT erros encontrados nos logs recentes"
    fi
fi

# Verificar processos órfãos do Node.js
ORPHAN_PROCESSES=$(ps aux | grep node | grep -v grep | grep -v pm2 | wc -l)
if [ "$ORPHAN_PROCESSES" -gt 2 ]; then
    log_message "⚠️ Processos Node.js órfãos detectados: $ORPHAN_PROCESSES"
fi

echo "Monitoramento concluído. Verifique $LOG_FILE para detalhes."
