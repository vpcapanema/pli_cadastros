#!/bin/bash

# Script para Configurar Nginx após criação do hostname No-IP

echo "🌐 CONFIGURAÇÃO NGINX PARA HOSTNAME NO-IP"
echo "========================================"

# Configurações do servidor
SERVER_IP="54.237.45.153"
APP_PORT="8888"
KEY_FILE="pli-ec2-key.pem"

echo ""
echo "📋 Este script configurará o Nginx no servidor após você criar o hostname no No-IP"
echo ""

# Solicitar o hostname criado
read -p "📝 Digite o hostname completo criado no No-IP (ex: sigma-pli.ddns.net): " HOSTNAME

if [ -z "$HOSTNAME" ]; then
    echo "❌ Hostname não pode estar vazio"
    exit 1
fi

echo ""
echo "🔧 Configurando Nginx para: $HOSTNAME"
echo "======================================"

# Nome do arquivo de configuração
CONFIG_NAME="sigma-pli-$(echo $HOSTNAME | tr '.' '-')"

# Criar configuração Nginx
NGINX_CONFIG=$(cat << EOF
# Configuração Nginx para SIGMA-PLI
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
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|webp|svg)$ {
        proxy_pass http://localhost:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
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
}
EOF
)

echo "📄 Aplicando configuração no servidor AWS..."

# Comando SSH para aplicar configuração
SSH_COMMAND=$(cat << EOF
# Criar configuração Nginx
echo '$NGINX_CONFIG' | sudo tee /etc/nginx/sites-available/$CONFIG_NAME > /dev/null

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$CONFIG_NAME /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

if [ \$? -eq 0 ]; then
    # Recarregar Nginx
    sudo systemctl reload nginx
    echo "✅ Nginx configurado e recarregado com sucesso!"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Verificar status
sudo systemctl status nginx --no-pager -l | head -10
EOF
)

# Executar comando no servidor
echo "🔑 Conectando ao servidor via SSH..."
ssh -i "$KEY_FILE" ubuntu@$SERVER_IP "$SSH_COMMAND"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
    echo "===================================="
    echo ""
    echo "🌐 Acesso principal: http://$HOSTNAME"
    echo "💊 Health check: http://$HOSTNAME/api/health"
    echo "📊 Dashboard: http://$HOSTNAME/dashboard.html"
    echo ""
    
    # Atualizar configuração CORS na aplicação
    echo "⚙️ Atualizando configuração CORS na aplicação..."
    
    CORS_UPDATE=$(cat << 'EOF'
cd /home/ubuntu/pli_cadastros

# Backup da configuração atual
cp config/.env config/.env.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar ALLOWED_ORIGINS para incluir o novo hostname
NEW_ORIGINS="http://$HOSTNAME,http://54.237.45.153:8888"
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$NEW_ORIGINS|g" config/.env

# Reiniciar aplicação para aplicar mudanças
pm2 restart pli

echo "✅ Configuração CORS atualizada e aplicação reiniciada"
EOF
)
    
    # Substituir variável no comando
    CORS_UPDATE=$(echo "$CORS_UPDATE" | sed "s/\$HOSTNAME/$HOSTNAME/g")
    
    ssh -i "$KEY_FILE" ubuntu@$SERVER_IP "$CORS_UPDATE"
    
    echo ""
    echo "🔍 TESTANDO CONFIGURAÇÃO..."
    echo "=========================="
    
    # Aguardar um pouco para a configuração ser aplicada
    sleep 5
    
    # Testar conectividade
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOSTNAME/api/health" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Teste bem-sucedido! Aplicação respondendo corretamente"
        echo "🔗 Acesse: http://$HOSTNAME"
    else
        echo "⚠️ Aplicação ainda inicializando ou DNS propagando..."
        echo "💡 Aguarde 5-15 minutos e teste novamente"
        echo "🔗 URL para testar: http://$HOSTNAME"
    fi
    
    echo ""
    echo "📋 LOGS PARA MONITORAMENTO:"
    echo "=========================="
    echo "🔍 Logs de acesso: sudo tail -f /var/log/nginx/${CONFIG_NAME}_access.log"
    echo "❌ Logs de erro: sudo tail -f /var/log/nginx/${CONFIG_NAME}_error.log"
    echo "📱 Logs da aplicação: pm2 logs pli"
    
    echo ""
    echo "🔒 PRÓXIMO PASSO OPCIONAL - SSL:"
    echo "==============================="
    echo "Para configurar HTTPS (recomendado para produção):"
    echo "sudo apt install certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d $HOSTNAME"
    echo ""
    echo "🎊 PARABÉNS! Seu domínio www.sigma-pli está configurado!"
    
else
    echo ""
    echo "❌ ERRO na configuração do servidor"
    echo "=================================="
    echo ""
    echo "Possíveis causas:"
    echo "1. Problema na conexão SSH"
    echo "2. Nginx não instalado"
    echo "3. Permissões insuficientes"
    echo ""
    echo "Soluções:"
    echo "1. Verificar conexão: ssh -i $KEY_FILE ubuntu@$SERVER_IP"
    echo "2. Instalar Nginx: sudo apt install nginx"
    echo "3. Executar com sudo no servidor"
fi
