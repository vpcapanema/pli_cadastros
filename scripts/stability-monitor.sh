#!/bin/bash
# Monitor de Estabilidade VS Code + PM2
# Monitora e previne reinicializações inesperadas

MONITOR_INTERVAL=30  # segundos
LOG_FILE="./logs/stability-monitor.log"

# Criar diretório de logs se não existir
mkdir -p logs

# Função de log
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "🚀 Iniciando Monitor de Estabilidade"
log_message "====================================="

# Função para verificar PM2
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_message "❌ PM2 não está disponível"
        return 1
    fi
    
    # Verificar se a aplicação está rodando
    PM2_STATUS=$(pm2 describe pli-cadastros 2>/dev/null)
    if [ $? -eq 0 ]; then
        STATUS=$(echo "$PM2_STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        MEMORY=$(echo "$PM2_STATUS" | grep -o '"memory":[0-9]*' | cut -d':' -f2)
        RESTARTS=$(echo "$PM2_STATUS" | grep -o '"restart_time":[0-9]*' | cut -d':' -f2)
        
        if [ "$STATUS" = "online" ]; then
            MEMORY_MB=$((MEMORY / 1024 / 1024))
            log_message "✅ PM2 OK - Status: $STATUS, Memória: ${MEMORY_MB}MB, Restarts: $RESTARTS"
            
            # Alertar se memória alta
            if [ "$MEMORY_MB" -gt 4000 ]; then
                log_message "⚠️ Alto uso de memória: ${MEMORY_MB}MB"
            fi
            
            # Alertar se muitos restarts
            if [ "$RESTARTS" -gt 3 ]; then
                log_message "⚠️ Muitos restarts detectados: $RESTARTS"
            fi
        else
            log_message "🚨 PM2 Status anormal: $STATUS"
            return 1
        fi
    else
        log_message "❌ Aplicação pli-cadastros não encontrada no PM2"
        return 1
    fi
    
    return 0
}

# Função para verificar processos Node.js órfãos
check_orphan_processes() {
    # Contar processos Node.js
    NODE_COUNT=$(tasklist //FI "IMAGENAME eq node.exe" 2>/dev/null | grep -c "node.exe" || echo "0")
    
    if [ "$NODE_COUNT" -gt 2 ]; then
        log_message "⚠️ Múltiplos processos Node.js detectados: $NODE_COUNT"
        log_message "   Listando processos:"
        tasklist //FI "IMAGENAME eq node.exe" //FO CSV 2>/dev/null | head -5 | tee -a "$LOG_FILE"
    else
        log_message "✅ Processos Node.js sob controle: $NODE_COUNT"
    fi
}

# Função para verificar portas
check_ports() {
    # Verificar se porta 3000 está ocupada
    PORT_3000=$(netstat -an 2>/dev/null | grep ":3000" | wc -l)
    PORT_8080=$(netstat -an 2>/dev/null | grep ":8080" | wc -l)
    
    if [ "$PORT_3000" -gt 0 ]; then
        log_message "✅ Porta 3000 em uso (aplicação rodando)"
    else
        log_message "⚠️ Porta 3000 livre (aplicação pode não estar rodando)"
    fi
    
    if [ "$PORT_8080" -gt 0 ]; then
        log_message "ℹ️ Porta 8080 em uso"
    fi
}

# Função principal de monitoramento
monitor_stability() {
    log_message "🔍 Verificação de estabilidade iniciada"
    
    # 1. Verificar PM2
    if ! check_pm2; then
        log_message "🚨 Problema com PM2 detectado!"
        
        # Tentar reiniciar
        log_message "🔄 Tentando reiniciar aplicação..."
        pm2 restart pli-cadastros 2>/dev/null
        
        if [ $? -eq 0 ]; then
            log_message "✅ Aplicação reiniciada com sucesso"
        else
            log_message "❌ Falha ao reiniciar aplicação"
        fi
    fi
    
    # 2. Verificar processos órfãos
    check_orphan_processes
    
    # 3. Verificar portas
    check_ports
    
    # 4. Verificar uso de memória do sistema
    if command -v node &> /dev/null; then
        SYSTEM_MEMORY=$(node -e "
            const os = require('os');
            const freeMem = os.freemem();
            const totalMem = os.totalmem();
            const usedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
            console.log(usedPercent);
        ")
        
        if [ "$SYSTEM_MEMORY" -gt 85 ]; then
            log_message "⚠️ Alto uso de memória do sistema: ${SYSTEM_MEMORY}%"
        else
            log_message "✅ Memória do sistema OK: ${SYSTEM_MEMORY}%"
        fi
    fi
    
    log_message "✅ Verificação de estabilidade concluída"
    log_message "----------------------------------------"
}

# Função para limpeza automática
cleanup_if_needed() {
    # Limpeza de logs antigos (manter apenas últimos 7 dias)
    if [ -f "$LOG_FILE" ]; then
        # Manter apenas últimas 1000 linhas
        tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
}

# Trap para limpeza ao sair
trap 'log_message "👋 Monitor de estabilidade encerrado"; exit 0' SIGINT SIGTERM

# Loop principal
if [ "$1" = "--daemon" ]; then
    log_message "🔄 Modo daemon ativado (intervalo: ${MONITOR_INTERVAL}s)"
    
    while true; do
        monitor_stability
        cleanup_if_needed
        sleep $MONITOR_INTERVAL
    done
else
    # Execução única
    monitor_stability
    
    echo ""
    echo "💡 Para monitoramento contínuo, execute:"
    echo "   bash scripts/stability-monitor.sh --daemon"
    echo ""
    echo "📊 Para ver logs em tempo real:"
    echo "   tail -f logs/stability-monitor.log"
fi
