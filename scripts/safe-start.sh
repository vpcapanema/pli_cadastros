#!/bin/bash
# Script de Inicialização Segura - Anti-Restart
# Monitora e previne restarts inesperados

LOG_FILE="./logs/safe-start.log"
mkdir -p logs

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "🚀 INICIANDO APLICAÇÃO EM MODO SEGURO"
log_message "====================================="

# 1. Verificar se não há processos residuais
log_message "1. Verificando processos residuais..."
NODE_COUNT=$(tasklist //FI "IMAGENAME eq node.exe" 2>/dev/null | grep -c "node.exe" || echo "0")
if [ "$NODE_COUNT" -gt 0 ]; then
    log_message "⚠️ Encontrados $NODE_COUNT processos Node.js. Limpando..."
    taskkill //F //IM node.exe 2>/dev/null || true
    sleep 2
fi

# 2. Verificar porta 3000
log_message "2. Verificando porta 3000..."
PORT_3000=$(netstat -an 2>/dev/null | grep ":3000" | wc -l || echo "0")
if [ "$PORT_3000" -gt 0 ]; then
    log_message "⚠️ Porta 3000 em uso. Aguardando liberação..."
    sleep 5
fi

# 3. Verificar PM2
log_message "3. Limpando PM2..."
pm2 kill 2>/dev/null || true
sleep 2

# 4. Verificar arquivos de lock
log_message "4. Removendo arquivos de lock..."
rm -f package-lock.json.lock 2>/dev/null || true
rm -f .pm2/.pm2-lock 2>/dev/null || true

# 5. Iniciar aplicação
log_message "5. Iniciando aplicação..."
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    log_message "✅ Aplicação iniciada com sucesso!"
    
    # 6. Salvar configuração
    log_message "6. Salvando configuração..."
    pm2 save
    
    # 7. Mostrar status
    log_message "7. Status da aplicação:"
    pm2 status | tee -a "$LOG_FILE"
    
    # 8. Iniciar monitoramento de estabilidade
    log_message "8. Iniciando monitoramento..."
    
    echo ""
    echo "🎉 APLICAÇÃO INICIADA COM SUCESSO!"
    echo "=================================="
    echo ""
    echo "📊 Para monitorar:"
    echo "   pm2 logs pli-cadastros"
    echo "   pm2 monit"
    echo ""
    echo "📋 Para verificar estabilidade:"
    echo "   bash scripts/stability-monitor.sh"
    echo ""
    
else
    log_message "❌ Falha ao iniciar aplicação!"
    exit 1
fi
