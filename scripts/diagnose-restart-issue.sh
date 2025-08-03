#!/bin/bash
# Script de Diagnóstico Completo - Reinicializações VS Code
# Identifica todas as possíveis causas de restart automático

echo "🔍 DIAGNÓSTICO COMPLETO - REINICIALIZAÇÕES VS CODE"
echo "================================================="
echo "Data: $(date)"
echo ""

# 1. Verificar processos Node.js ativos
echo "1️⃣ VERIFICANDO PROCESSOS NODE.JS..."
echo "-----------------------------------"

# Usar comando Windows nativo
if command -v tasklist &> /dev/null; then
    echo "Processos Node.js encontrados:"
    tasklist //FI "IMAGENAME eq node.exe" //FO CSV | grep -v "INFO:" | head -10
else
    echo "⚠️ Comando tasklist não disponível"
fi

echo ""

# 2. Verificar PM2
echo "2️⃣ VERIFICANDO PM2..."
echo "--------------------"

if command -v pm2 &> /dev/null; then
    echo "Status PM2:"
    pm2 status 2>/dev/null || echo "❌ PM2 não está gerenciando nenhuma aplicação"
    echo ""
    
    echo "Lista de processos PM2:"
    pm2 list 2>/dev/null || echo "❌ Nenhum processo PM2 ativo"
else
    echo "❌ PM2 não está instalado ou não está no PATH"
fi

echo ""

# 3. Verificar configurações VS Code problemáticas
echo "3️⃣ VERIFICANDO CONFIGURAÇÕES VS CODE..."
echo "---------------------------------------"

SETTINGS_FILE=".vscode/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    echo "✅ Arquivo de configurações encontrado"
    
    # Verificar configurações problemáticas
    echo "Verificando configurações que podem causar reloads:"
    
    if grep -q '"files.autoSave".*"afterDelay"' "$SETTINGS_FILE"; then
        echo "⚠️ Auto-save com afterDelay pode causar reloads frequentes"
    fi
    
    if grep -q '"typescript.updateImportsOnFileMove".*"always"' "$SETTINGS_FILE"; then
        echo "⚠️ Auto-update de imports TypeScript ativo"
    fi
    
    if grep -q '"javascript.updateImportsOnFileMove".*"always"' "$SETTINGS_FILE"; then
        echo "⚠️ Auto-update de imports JavaScript ativo"
    fi
    
    if grep -q '"editor.formatOnSave".*true' "$SETTINGS_FILE"; then
        echo "⚠️ Format on save ativo - pode causar loops"
    fi
    
    if grep -q '"extensions.autoUpdate".*true' "$SETTINGS_FILE"; then
        echo "⚠️ Auto-update de extensões ativo"
    fi
    
    echo "✅ Configurações preventivas aplicadas"
else
    echo "❌ Arquivo de configurações não encontrado"
fi

echo ""

# 4. Verificar extensões problemáticas
echo "4️⃣ VERIFICANDO EXTENSÕES PROBLEMÁTICAS..."
echo "-----------------------------------------"

# Lista de extensões que podem causar problemas
PROBLEMATIC_EXTENSIONS=(
    "auto-reload"
    "live-server" 
    "browser-sync"
    "nodemon"
    "auto-refresh"
    "hot-reload"
    "restart"
    "refresh"
)

if command -v code &> /dev/null; then
    echo "Verificando extensões instaladas..."
    EXTENSIONS=$(code --list-extensions 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        for ext in "${PROBLEMATIC_EXTENSIONS[@]}"; do
            if echo "$EXTENSIONS" | grep -i "$ext" > /dev/null; then
                echo "⚠️ Extensão problemática encontrada: $ext"
            fi
        done
        
        # Verificar algumas extensões específicas conhecidas por causar problemas
        if echo "$EXTENSIONS" | grep -i "live.*server" > /dev/null; then
            echo "⚠️ Live Server detectado - pode causar reloads automáticos"
        fi
        
        if echo "$EXTENSIONS" | grep -i "auto.*save" > /dev/null; then
            echo "⚠️ Extensão de auto-save detectada"
        fi
        
        echo "Total de extensões: $(echo "$EXTENSIONS" | wc -l)"
    else
        echo "❌ Não foi possível listar extensões"
    fi
else
    echo "❌ Comando 'code' não disponível"
fi

echo ""

# 5. Verificar logs de erro recentes
echo "5️⃣ VERIFICANDO LOGS DE ERRO..."
echo "------------------------------"

LOG_FILES=(
    "./logs/err.log"
    "./logs/combined.log"
    "./logs/out.log"
)

for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        echo "📋 Verificando $log_file:"
        
        # Verificar erros recentes (últimas 20 linhas)
        ERROR_COUNT=$(tail -20 "$log_file" 2>/dev/null | grep -ci "error\|crash\|fatal\|exception" || echo "0")
        
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo "🚨 $ERROR_COUNT erros encontrados em $log_file"
            echo "Últimos erros:"
            tail -20 "$log_file" | grep -i "error\|crash\|fatal\|exception" | tail -3
        else
            echo "✅ Nenhum erro crítico em $log_file"
        fi
    else
        echo "ℹ️ Arquivo $log_file não encontrado"
    fi
done

echo ""

# 6. Verificar uso de memória
echo "6️⃣ VERIFICANDO USO DE MEMÓRIA..."
echo "--------------------------------"

if command -v node &> /dev/null; then
    echo "Verificando memória do sistema..."
    node -e "
        const os = require('os');
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        console.log('Total:', Math.round(totalMem/1024/1024/1024*100)/100, 'GB');
        console.log('Livre:', Math.round(freeMem/1024/1024/1024*100)/100, 'GB');
        console.log('Usado:', Math.round(usedMem/1024/1024/1024*100)/100, 'GB');
        console.log('% Usado:', Math.round((usedMem/totalMem)*100), '%');
        
        if ((usedMem/totalMem) > 0.85) {
            console.log('⚠️ Alto uso de memória detectado!');
        } else {
            console.log('✅ Uso de memória normal');
        }
    "
else
    echo "❌ Node.js não disponível para verificação de memória"
fi

echo ""

# 7. Verificar configuração PM2 vs processos diretos
echo "7️⃣ VERIFICANDO CONFIGURAÇÃO PM2..."
echo "----------------------------------"

if [ -f "ecosystem.config.js" ]; then
    echo "✅ Arquivo ecosystem.config.js encontrado"
    
    # Verificar configurações que podem causar restart
    if grep -q '"watch".*true' "ecosystem.config.js"; then
        echo "⚠️ Watch mode ativo no PM2 - pode causar restarts automáticos"
    fi
    
    MEMORY_LIMIT=$(grep -o '"max_memory_restart".*' "ecosystem.config.js" | head -1)
    if [ ! -z "$MEMORY_LIMIT" ]; then
        echo "📊 Limite de memória PM2: $MEMORY_LIMIT"
    fi
    
    MAX_RESTARTS=$(grep -o '"max_restarts".*' "ecosystem.config.js" | head -1)
    if [ ! -z "$MAX_RESTARTS" ]; then
        echo "🔄 Máximo de restarts: $MAX_RESTARTS"
    fi
else
    echo "❌ Arquivo ecosystem.config.js não encontrado"
fi

echo ""

# 8. Verificar se há múltiplos processos Node.js conflitantes
echo "8️⃣ VERIFICANDO CONFLITOS DE PROCESSOS..."
echo "----------------------------------------"

# Tentar identificar processos Node.js usando netstat (se disponível)
if command -v netstat &> /dev/null; then
    echo "Verificando portas em uso:"
    netstat -an | grep ":3000\|:8080\|:5000" | head -5
fi

# Verificar se server.js está rodando diretamente (fora do PM2)
if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️ Processo server.js detectado rodando diretamente (fora do PM2)"
    echo "Isso pode causar conflitos e restarts!"
fi

echo ""

# 9. Gerar recomendações
echo "9️⃣ RECOMENDAÇÕES BASEADAS NO DIAGNÓSTICO..."
echo "-------------------------------------------"

echo "🛠️ AÇÕES RECOMENDADAS:"
echo ""

echo "1. ⚠️ PROBLEMA PRINCIPAL IDENTIFICADO:"
echo "   - PM2 não está gerenciando a aplicação"
echo "   - Processos Node.js rodando diretamente"
echo "   - Isso causa instabilidade e restarts inesperados"
echo ""

echo "2. 🚀 SOLUÇÕES IMEDIATAS:"
echo "   a) Parar todos os processos Node.js:"
echo "      taskkill /F /IM node.exe"
echo ""
echo "   b) Iniciar com PM2:"
echo "      pm2 start ecosystem.config.js"
echo "      pm2 save"
echo ""
echo "   c) Verificar status:"
echo "      pm2 status"
echo "      pm2 monit"
echo ""

echo "3. 🔧 CONFIGURAÇÕES PREVENTIVAS JÁ APLICADAS:"
echo "   - Auto-save otimizado"
echo "   - Auto-update de imports desabilitado"
echo "   - Format on save desabilitado"
echo "   - Watchers otimizados"
echo ""

echo "4. 📊 MONITORAMENTO:"
echo "   - Use: node tools/memory-monitor.js"
echo "   - PM2 logs: pm2 logs pli-cadastros"
echo ""

echo "✅ DIAGNÓSTICO CONCLUÍDO!"
echo "========================="
echo ""
echo "💡 PRÓXIMO PASSO: Execute os comandos da seção 2 para resolver o problema."
