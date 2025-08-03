#!/bin/bash

# Script simples para configurar hostname
HOSTNAME="$1"
CONFIG_NAME="sigma-pli-$(echo $HOSTNAME | tr '.' '-')"

if [ -z "$HOSTNAME" ]; then
    echo "Uso: ./configure-simple.sh hostname"
    exit 1
fi

echo "Configurando Nginx para: $HOSTNAME"

# Criar configuração Nginx
sudo tee /etc/nginx/sites-available/$CONFIG_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $HOSTNAME;
    
    access_log /var/log/nginx/${CONFIG_NAME}_access.log;
    error_log /var/log/nginx/${CONFIG_NAME}_error.log;
    
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 10M;
    }
    
    location = /api/health {
        proxy_pass http://localhost:8888/api/health;
        access_log off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$CONFIG_NAME /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "Nginx configurado com sucesso para $HOSTNAME"
    
    # Atualizar CORS
    cd /home/ubuntu/pli_cadastros
    cp config/.env config/.env.backup.$(date +%Y%m%d_%H%M%S)
    sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://$HOSTNAME,http://54.237.45.153:8888|g" config/.env
    pm2 restart pli
    
    echo "Configuracao completa!"
    echo "Acesse: http://$HOSTNAME"
else
    echo "Erro na configuracao do Nginx"
fi
