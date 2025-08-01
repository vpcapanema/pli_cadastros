#!/bin/bash

# SIGMA-PLI | Script de Deploy no Servidor
# ========================================

DEPLOY_TYPE=${1:-update}
APP_DIR="/home/ubuntu/pli_cadastros"
BACKUP_DIR="/home/ubuntu/backups"
LOG_FILE="/home/ubuntu/deploy.log"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "🚀 Iniciando deploy tipo: $DEPLOY_TYPE"

# Criar diretórios se não existirem
mkdir -p $BACKUP_DIR
mkdir -p $(dirname $LOG_FILE)

case $DEPLOY_TYPE in
    "first-deploy")
        log "📦 Primeira instalação - Configurando servidor..."
        
        # Atualizar sistema
        log "🔄 Atualizando sistema..."
        sudo apt update && sudo apt upgrade -y
        
        # Instalar Node.js 18
        log "📦 Instalando Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Instalar PM2
        log "📦 Instalando PM2..."
        sudo npm install -g pm2
        
        # Instalar Nginx
        log "📦 Instalando Nginx..."
        sudo apt install -y nginx
        sudo systemctl enable nginx
        
        # Instalar PostgreSQL client
        log "📦 Instalando PostgreSQL client..."
        sudo apt install -y postgresql-client
        
        # Clonar repositório
        log "📥 Clonando repositório..."
        if [ -d "$APP_DIR" ]; then
            rm -rf $APP_DIR
        fi
        git clone https://github.com/vpcapanema/pli_cadastros.git $APP_DIR
        cd $APP_DIR
        
        # Instalar dependências
        log "📦 Instalando dependências..."
        npm install --production
        
        # Configurar .env
        log "⚙️ Configurando variáveis de ambiente..."
        cat > .env << 'EOF'
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados PostgreSQL (AWS RDS)
DB_HOST=pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pli_db
DB_USER=postgres
DB_PASSWORD=semil2025*
DATABASE_URL=postgresql://postgres:semil2025*@pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com:5432/pli_db?sslmode=no-verify

# Configurações de Segurança
JWT_SECRET=sigma_pli_jwt_secret_key_2025_production_environment
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Configurações de Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pli.semil.sp@gmail.com
SMTP_PASS=dzhojfnlpcfsodls
EMAIL_FROM="SIGMA-PLI | Módulo de Gerenciamento de Cadastros <pli.semil.sp@gmail.com>"
EMAIL_ADMIN=pli.semil.sp@gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://54.237.45.153,https://54.237.45.153

# Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/

# Session
SESSION_SECRET=sigma_pli_session_secret_key_2025_production
EOF
        
        # Configurar Nginx
        log "🌐 Configurando Nginx..."
        sudo tee /etc/nginx/sites-available/pli-cadastros > /dev/null << 'EOF'
server {
    listen 80;
    server_name 54.237.45.153;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Servir arquivos estáticos
    location /static/ {
        alias /home/ubuntu/pli_cadastros/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /css/ {
        alias /home/ubuntu/pli_cadastros/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
        
        # Ativar site
        sudo ln -sf /etc/nginx/sites-available/pli-cadastros /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
        
        # Configurar PM2
        log "⚙️ Configurando PM2..."
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pli-cadastros',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
        
        # Criar diretório de logs
        mkdir -p logs
        
        # Iniciar aplicação
        log "🚀 Iniciando aplicação..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup | grep -E '^sudo' | bash
        
        log "✅ Deploy inicial concluído!"
        ;;
        
    "update")
        log "🔄 Atualizando aplicação..."
        
        # Backup atual
        if [ -d "$APP_DIR" ]; then
            BACKUP_NAME="pli-backup-$(date +%Y%m%d_%H%M%S)"
            log "📦 Criando backup: $BACKUP_NAME"
            cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
        fi
        
        cd $APP_DIR
        
        # Atualizar código
        log "📥 Atualizando código..."
        git pull origin master
        
        # Instalar/atualizar dependências
        log "📦 Atualizando dependências..."
        npm install --production
        
        # Restart aplicação
        log "🔄 Reiniciando aplicação..."
        pm2 restart pli-cadastros
        
        log "✅ Update concluído!"
        ;;
        
    "backup")
        log "📦 Criando backup..."
        BACKUP_NAME="pli-backup-$(date +%Y%m%d_%H%M%S)"
        if [ -d "$APP_DIR" ]; then
            cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
            log "✅ Backup criado: $BACKUP_NAME"
        else
            log "❌ Diretório da aplicação não encontrado"
        fi
        ;;
        
    *)
        log "❌ Tipo de deploy desconhecido: $DEPLOY_TYPE"
        log "Tipos disponíveis: first-deploy, update, backup"
        exit 1
        ;;
esac

log "🎉 Deploy concluído!"