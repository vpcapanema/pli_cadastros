#!/bin/bash
# CONFIGURACAO NGINX PARA HOSTNAME NO-IP (GIT BASH)
# ==================================================

# Este script e uma versao alternativa para Git Bash
# Use se voce tem Git for Windows instalado

echo "CONFIGURACAO NGINX PARA HOSTNAME NO-IP (Git Bash)"
echo "=================================================="

# Configurações do servidor
SERVER_IP="54.237.45.153"
APP_PORT="8888"
KEY_FILE="../pli-ec2-key.pem"

echo ""
echo "Este script configurara o Nginx no servidor apos voce criar o hostname no No-IP"
echo ""

# Verificar se a chave existe
if [ ! -f "$KEY_FILE" ]; then
    echo "ERRO: Arquivo de chave nao encontrado: $KEY_FILE"
    echo ""
    echo "Procurando em outros locais..."
    
    # Tentar outros caminhos possíveis
    POSSIBLE_PATHS=(
        "../pli-ec2-key.pem"
        "./pli-ec2-key.pem"
        "/c/Users/vinic/pli_cadastros/pli-ec2-key.pem"
    )
    
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            KEY_FILE="$path"
            echo "Chave encontrada em: $KEY_FILE"
            break
        fi
    done
    
    if [ ! -f "$KEY_FILE" ]; then
        echo "ERRO: Arquivo pli-ec2-key.pem nao encontrado!"
        echo "Verifique se o arquivo existe no projeto"
        read -p "Pressione Enter para sair..."
        exit 1
    fi
fi

# Configurar permissões da chave (Git Bash)
echo "Configurando permissoes da chave SSH..."
chmod 600 "$KEY_FILE"
echo "Permissoes configuradas"

# Solicitar o hostname criado
echo ""
read -p "Digite o hostname completo criado no No-IP (ex: sigma-pli.ddns.net): " HOSTNAME

if [ -z "$HOSTNAME" ]; then
    echo "Hostname nao pode estar vazio"
    exit 1
fi

echo ""
echo "Configurando Nginx para: $HOSTNAME"
echo "======================================"

# Nome do arquivo de configuração
CONFIG_NAME="sigma-pli-$(echo $HOSTNAME | sed 's/\./-/g')"

# Criar configuração Nginx
NGINX_CONFIG="# Configuração Nginx para SIGMA-PLI
# Hostname: $HOSTNAME
# Gerado em: $(date)

server {
    listen 80;
    server_name $HOSTNAME;
    
    # Logs específicos para este hostname
    access_log /var/log/nginx/${CONFIG_NAME}_access.log;
    error_log /var/log/nginx/${CONFIG_NAME}_error.log;
    
    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    
    # Cache para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|webp|svg)$ {
        proxy_pass http://localhost:$APP_PORT;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
    }
    
    # Health check (sem logs para não poluir)
    location = /api/health {
        proxy_pass http://localhost:$APP_PORT/api/health;
        access_log off;
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Configuração principal da aplicação
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        
        # Headers para proxy
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings para melhor performance
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        # Configurações de limite de tamanho
        client_max_body_size 10M;
    }
    
    # Bloquear acesso a arquivos sensíveis
    location ~ /\.(env|git|svn) {
        deny all;
        return 404;
    }
    
    # Bloquear acesso a arquivos de backup
    location ~ \.(bak|backup|old|tmp)$ {
        deny all;
        return 404;
    }
}"

echo "Aplicando configuracao no servidor AWS..."

# Comando SSH para aplicar configuração
SSH_COMMAND="
# Criar configuração Nginx
echo '$NGINX_CONFIG' | sudo tee /etc/nginx/sites-available/$CONFIG_NAME > /dev/null

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$CONFIG_NAME /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

if [ \$? -eq 0 ]; then
    # Recarregar Nginx
    sudo systemctl reload nginx
    echo '✅ Nginx configurado e recarregado com sucesso!'
else
    echo '❌ Erro na configuração do Nginx'
    exit 1
fi

# Verificar status
sudo systemctl status nginx --no-pager -l | head -10
"

# Executar comando no servidor
echo "Conectando ao servidor via SSH..."

if ssh -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@$SERVER_IP "$SSH_COMMAND"; then
    echo ""
    echo "CONFIGURACAO CONCLUIDA COM SUCESSO!"
    echo "==================================="
    echo ""
    echo "Acesso principal: http://$HOSTNAME"
    echo "Health check: http://$HOSTNAME/api/health"
    echo "Dashboard: http://$HOSTNAME/dashboard.html"
    echo ""
    
    # Atualizar configuração CORS na aplicação
    echo "Atualizando configuracao CORS na aplicacao..."
    
    CORS_UPDATE="
cd /home/ubuntu/pli_cadastros

# Backup da configuração atual
cp config/.env config/.env.backup.\$(date +%Y%m%d_%H%M%S)

# Atualizar ALLOWED_ORIGINS para incluir o novo hostname
NEW_ORIGINS=\"http://$HOSTNAME,http://54.237.45.153:8888\"
sed -i \"s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=\$NEW_ORIGINS|g\" config/.env

# Reiniciar aplicação para aplicar mudanças
pm2 restart pli

echo '✅ Configuração CORS atualizada e aplicação reiniciada'
"
    
    ssh -o ConnectTimeout=30 -i "$KEY_FILE" ubuntu@$SERVER_IP "$CORS_UPDATE"
    
    echo ""
    echo "TESTANDO CONFIGURACAO..."
    echo "========================"
    
    # Aguardar um pouco para a configuração ser aplicada
    sleep 5
    
    # Testar conectividade
    if curl -s -o /dev/null -w "%{http_code}" "http://$HOSTNAME/api/health" | grep -q "200"; then
        echo "Teste bem-sucedido! Aplicacao respondendo corretamente"
        echo "Acesse: http://$HOSTNAME"
    else
        echo "Aplicacao ainda inicializando ou DNS propagando..."
        echo "Aguarde 5-15 minutos e teste novamente"
        echo "URL para testar: http://$HOSTNAME"
    fi
    
    echo ""
    echo "LOGS PARA MONITORAMENTO:"
    echo "========================"
    echo "Logs de acesso: sudo tail -f /var/log/nginx/${CONFIG_NAME}_access.log"
    echo "Logs de erro: sudo tail -f /var/log/nginx/${CONFIG_NAME}_error.log"
    echo "Logs da aplicacao: pm2 logs pli"
    
    echo ""
    echo "PROXIMO PASSO OPCIONAL - SSL:"
    echo "============================="
    echo "Para configurar HTTPS (recomendado para producao):"
    echo "sudo apt install certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d $HOSTNAME"
    echo ""
    echo "PARABENS! Seu dominio esta configurado!"
    
else
    echo ""
    echo "ERRO na configuracao do servidor"
    echo "================================"
    echo ""
    echo "Possiveis causas e solucoes:"
    echo ""
    echo "1. PROBLEMA NA CHAVE SSH:"
    echo "   - Chave sendo usada: $KEY_FILE"
    echo "   - Verificar permissoes: ls -la $KEY_FILE"
    echo ""
    echo "2. PROBLEMA DE CONECTIVIDADE:"
    echo "   - Testar ping: ping $SERVER_IP"
    echo "   - Testar SSH: ssh -v -i '$KEY_FILE' ubuntu@$SERVER_IP"
    echo ""
    echo "3. COMANDO PARA DEBUG:"
    echo "   ssh -v -i '$KEY_FILE' ubuntu@$SERVER_IP"
fi

echo ""
read -p "Pressione Enter para sair..."
