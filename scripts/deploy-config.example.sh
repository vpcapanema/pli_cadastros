# Configuração de Deploy - SIGMA-PLI
# =====================================
# 
# INSTRUÇÕES:
# 1. Copie este arquivo para deploy-config.sh
# 2. Edite as variáveis abaixo com seus dados
# 3. Execute: source deploy-config.sh
# 4. Use os scripts normalmente
#
# NÃO INCLUA ESTE ARQUIVO NO GIT APÓS PREENCHIDO!

# ========================================
# CONFIGURAÇÕES DA AWS EC2
# ========================================

# IP público ou hostname da sua instância EC2
# Exemplo: "52.23.45.67" ou "ec2-52-23-45-67.compute-1.amazonaws.com"
export EC2_HOST=""

# Caminho para sua chave SSH privada (.pem)
# Exemplo Linux/macOS: "/home/usuario/.ssh/pli-cadastros-key.pem"
# Exemplo Windows: "C:\Users\Usuario\.ssh\pli-cadastros-key.pem"
export KEY_FILE=""

# Usuário SSH (geralmente 'ubuntu' para Ubuntu, 'ec2-user' para Amazon Linux)
export EC2_USER="ubuntu"

# ========================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ========================================

# Diretório da aplicação no servidor
export APP_DIR="/home/ubuntu/pli_cadastros"

# Nome da aplicação no PM2
export PM2_APP_NAME="pli-cadastros"

# Repositório Git (ajuste se necessário)
export GIT_REPO="https://github.com/vpcapanema/pli_cadastros.git"

# ========================================
# VERIFICAÇÃO DA CONFIGURAÇÃO
# ========================================

check_config() {
    local errors=0
    
    echo "🔍 Verificando configuração..."
    
    if [ -z "$EC2_HOST" ]; then
        echo "❌ EC2_HOST não configurado"
        errors=$((errors + 1))
    else
        echo "✅ EC2_HOST: $EC2_HOST"
    fi
    
    if [ -z "$KEY_FILE" ]; then
        echo "❌ KEY_FILE não configurado"
        errors=$((errors + 1))
    elif [ ! -f "$KEY_FILE" ]; then
        echo "❌ Arquivo de chave não encontrado: $KEY_FILE"
        errors=$((errors + 1))
    else
        echo "✅ KEY_FILE: $KEY_FILE"
        # Verificar e corrigir permissões
        chmod 400 "$KEY_FILE" 2>/dev/null
    fi
    
    if [ $errors -eq 0 ]; then
        echo "✅ Configuração válida!"
        return 0
    else
        echo "❌ Corrija os erros acima antes de continuar"
        return 1
    fi
}

# ========================================
# FUNÇÕES DE CONVENIÊNCIA
# ========================================

# Função para testar conexão SSH
test_connection() {
    if check_config; then
        echo "🔐 Testando conexão SSH..."
        ssh -i "$KEY_FILE" -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'Conexão SSH OK'"
    fi
}

# Função para conectar via SSH
connect() {
    if check_config; then
        echo "🔗 Conectando ao servidor..."
        ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST"
    fi
}

# Função para ver logs remotos
remote_logs() {
    if check_config; then
        echo "📋 Logs da aplicação:"
        ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "cd $APP_DIR && pm2 logs $PM2_APP_NAME --lines 20"
    fi
}

# ========================================
# ALIASES ÚTEIS
# ========================================

alias deploy-first='./scripts/deploy-manager.sh first-deploy'
alias deploy-update='./scripts/deploy-manager.sh update'
alias deploy-status='./scripts/deploy-manager.sh status'
alias deploy-logs='./scripts/deploy-manager.sh logs'
alias deploy-backup='./scripts/deploy-manager.sh backup'
alias deploy-rollback='./scripts/deploy-manager.sh rollback'
alias deploy-test='./scripts/deploy-manager.sh test'

# ========================================
# MENSAGEM DE BOAS-VINDAS
# ========================================

echo ""
echo "🚀 SIGMA-PLI Deploy Configuration Loaded"
echo "======================================="
echo ""
echo "Comandos disponíveis:"
echo "  check_config     - Verificar configuração"
echo "  test_connection  - Testar SSH"
echo "  connect          - Conectar ao servidor"
echo "  remote_logs      - Ver logs remotos"
echo ""
echo "Aliases disponíveis:"
echo "  deploy-first     - Primeiro deploy"
echo "  deploy-update    - Atualizar aplicação"
echo "  deploy-status    - Status da aplicação"
echo "  deploy-logs      - Logs da aplicação"
echo "  deploy-backup    - Criar backup"
echo "  deploy-rollback  - Rollback"
echo "  deploy-test      - Testar conexão"
echo ""

# Verificar configuração automaticamente
check_config
