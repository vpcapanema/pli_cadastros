#!/bin/bash

# SIGMA-PLI | Módulo de Gerenciamento de Cadastros
# Script Local para Deploy/Update na AWS EC2
# ==========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações (EDITE CONFORME NECESSÁRIO)
EC2_HOST=""  # IP ou hostname da instância EC2
EC2_USER="ubuntu"
KEY_FILE=""  # Caminho para sua chave .pem
APP_DIR="/home/ubuntu/pli_cadastros"

# Função para logs
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
    exit 1
}

# Função para verificar configurações
check_config() {
    if [ -z "$EC2_HOST" ]; then
        error "Configure o EC2_HOST no início deste script"
    fi
    
    if [ -z "$KEY_FILE" ]; then
        error "Configure o KEY_FILE no início deste script"
    fi
    
    if [ ! -f "$KEY_FILE" ]; then
        error "Arquivo de chave não encontrado: $KEY_FILE"
    fi
    
    # Verificar permissões da chave
    chmod 400 "$KEY_FILE"
}

# Função para testar conexão SSH
test_connection() {
    log "🔐 Testando conexão SSH..."
    if ssh -i "$KEY_FILE" -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'Conexão SSH OK'" >/dev/null 2>&1; then
        log "✅ Conexão SSH estabelecida com sucesso"
    else
        error "❌ Não foi possível conectar via SSH. Verifique:\n- IP/hostname da EC2\n- Arquivo de chave\n- Security Groups da EC2"
    fi
}

# Função para fazer commit e push das mudanças
commit_and_push() {
    log "📝 Verificando mudanças no Git..."
    
    if ! git status --porcelain | grep -q .; then
        log "ℹ️ Nenhuma mudança local detectada"
        return 0
    fi
    
    log "📋 Mudanças detectadas:"
    git status --short
    
    echo ""
    read -p "Deseja fazer commit dessas mudanças? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Digite a mensagem do commit: " COMMIT_MSG
        
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Deploy automático - $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        log "📤 Fazendo commit e push..."
        git add .
        git commit -m "$COMMIT_MSG"
        git push origin master
        log "✅ Código enviado para repositório"
    else
        warn "⚠️ Continuando sem fazer commit. Mudanças locais não serão enviadas."
    fi
}

# Função para enviar script de deploy para servidor
upload_deploy_script() {
    log "📤 Enviando script de deploy para servidor..."
    scp -i "$KEY_FILE" scripts/deploy-update.sh "$EC2_USER@$EC2_HOST:/tmp/"
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "chmod +x /tmp/deploy-update.sh"
}

# Função para executar deploy no servidor
execute_deploy() {
    local DEPLOY_TYPE="${1:-update}"
    
    log "🚀 Executando deploy no servidor..."
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "/tmp/deploy-update.sh $DEPLOY_TYPE"
}

# Função para verificar logs da aplicação
check_logs() {
    log "📋 Verificando logs da aplicação..."
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "cd $APP_DIR && pm2 logs pli-cadastros --lines 20"
}

# Função para verificar status da aplicação
check_status() {
    log "📊 Verificando status da aplicação..."
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "cd $APP_DIR && pm2 status"
}

# Função para backup remoto
create_backup() {
    log "📦 Criando backup no servidor..."
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "/tmp/deploy-update.sh backup"
}

# Função para rollback (voltar para backup anterior)
rollback() {
    log "🔄 Iniciando rollback..."
    
    # Listar backups disponíveis
    log "📋 Backups disponíveis:"
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "ls -la /home/ubuntu/backups/ | grep pli-backup"
    
    echo ""
    read -p "Digite o nome do backup para rollback (ou ENTER para cancelar): " BACKUP_NAME
    
    if [ -z "$BACKUP_NAME" ]; then
        log "ℹ️ Rollback cancelado"
        return 0
    fi
    
    ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << EOF
        cd /home/ubuntu
        
        # Parar aplicação
        pm2 stop pli-cadastros || true
        
        # Backup da versão atual
        if [ -d "$APP_DIR" ]; then
            mv "$APP_DIR" "${APP_DIR}_before_rollback_\$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Restaurar backup
        cp -r "backups/$BACKUP_NAME" "$APP_DIR"
        cd "$APP_DIR"
        
        # Reinstalar dependências
        npm install --production
        
        # Reiniciar aplicação
        pm2 restart pli-cadastros || pm2 start ecosystem.config.js
EOF
    
    log "✅ Rollback concluído"
}

# Função de ajuda
show_help() {
    echo "SIGMA-PLI | Script de Deploy e Gerenciamento"
    echo "============================================"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  deploy       - Deploy/update padrão (default)"
    echo "  first-deploy - Primeira instalação completa"
    echo "  update       - Atualização da aplicação"
    echo "  status       - Verificar status da aplicação"
    echo "  logs         - Ver logs da aplicação"
    echo "  backup       - Criar backup no servidor"
    echo "  rollback     - Voltar para backup anterior"
    echo "  test         - Testar conexão SSH"
    echo "  help         - Mostrar esta ajuda"
    echo ""
    echo "Configuração necessária:"
    echo "  1. Edite as variáveis EC2_HOST e KEY_FILE no início do script"
    echo "  2. Certifique-se que sua chave SSH está correta"
    echo "  3. Configure o Security Group da EC2 para permitir SSH (porta 22)"
    echo ""
}

# Função principal
main() {
    local COMMAND="${1:-deploy}"
    
    case "$COMMAND" in
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        "test")
            check_config
            test_connection
            log "✅ Teste de conexão concluído"
            ;;
        "first-deploy")
            check_config
            test_connection
            commit_and_push
            upload_deploy_script
            execute_deploy "first-deploy"
            check_status
            ;;
        "deploy"|"update")
            check_config
            test_connection
            commit_and_push
            upload_deploy_script
            execute_deploy "update"
            check_status
            ;;
        "status")
            check_config
            test_connection
            check_status
            ;;
        "logs")
            check_config
            test_connection
            check_logs
            ;;
        "backup")
            check_config
            test_connection
            create_backup
            ;;
        "rollback")
            check_config
            test_connection
            rollback
            check_status
            ;;
        *)
            error "Comando desconhecido: $COMMAND\nUse '$0 help' para ver os comandos disponíveis"
            ;;
    esac
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
    error "Execute este script na raiz do projeto PLI Cadastros"
fi

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    SIGMA-PLI | Deploy Manager v1.0                          ║"
echo "║                  Módulo de Gerenciamento de Cadastros                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Executar comando
main "$@"
