#!/bin/bash

# Script de Configuração de Domínio Personalizado - SIGMA-PLI
# Configura um alias/domínio para acesso à aplicação

set -e

echo "🌐 CONFIGURAÇÃO DE DOMÍNIO PERSONALIZADO - SIGMA-PLI"
echo "===================================================="

# Configurações
SERVER_IP="54.237.45.153"
APP_PORT="8888"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Função para mostrar opções
show_options() {
    echo ""
    echo "📋 Opções de Configuração:"
    echo "1. Configurar domínio próprio (ex: meudominio.com)"
    echo "2. Configurar subdomínio (ex: app.meudominio.com)"
    echo "3. Usar serviço gratuito (No-IP, DuckDNS)"
    echo "4. Configurar apenas proxy local"
    echo "5. Mostrar configuração atual"
    echo "6. Sair"
    echo ""
}

# Função para configurar Nginx
configure_nginx() {
    local domain=$1
    local config_name=$2
    local ssl_enabled=${3:-false}
    
    echo "🔧 Configurando Nginx para: $domain"
    
    # Criar configuração do Nginx
    local nginx_config=""
    
    if [ "$ssl_enabled" = "true" ]; then
        nginx_config=$(cat << EOF
# Redirecionamento HTTP para HTTPS
server {
    listen 80;
    server_name $domain;
    return 301 https://\$server_name\$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name $domain;
    
    # Certificados SSL (configurar depois com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    
    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logs
    access_log /var/log/nginx/${config_name}_access.log;
    error_log /var/log/nginx/${config_name}_error.log;
    
    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Servir arquivos estáticos diretamente (performance)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|webp|svg)$ {
        proxy_pass http://localhost:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$APP_PORT/api/health;
        access_log off;
    }
}
EOF
)
    else
        nginx_config=$(cat << EOF
# Configuração HTTP simples
server {
    listen 80;
    server_name $domain;
    
    # Logs
    access_log /var/log/nginx/${config_name}_access.log;
    error_log /var/log/nginx/${config_name}_error.log;
    
    # Headers de segurança básicos
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
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
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$APP_PORT/api/health;
        access_log off;
    }
}
EOF
)
    fi
    
    # Salvar configuração
    echo "$nginx_config" | sudo tee "$NGINX_AVAILABLE/$config_name" > /dev/null
    
    # Ativar site
    sudo ln -sf "$NGINX_AVAILABLE/$config_name" "$NGINX_ENABLED/"
    
    # Testar configuração
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx configurado com sucesso para: $domain"
    else
        echo "❌ Erro na configuração do Nginx"
        return 1
    fi
}

# Função para configurar SSL com Let's Encrypt
configure_ssl() {
    local domain=$1
    
    echo "🔒 Configurando SSL para: $domain"
    
    # Verificar se certbot está instalado
    if ! command -v certbot &> /dev/null; then
        echo "📦 Instalando Certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Obter certificado
    sudo certbot --nginx -d "$domain" --non-interactive --agree-tos --email admin@$domain
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL configurado com sucesso!"
        
        # Configurar renovação automática
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        echo "🔄 Renovação automática de SSL configurada"
    else
        echo "❌ Erro ao configurar SSL"
    fi
}

# Função para atualizar configuração da aplicação
update_app_config() {
    local domain=$1
    local ssl_enabled=${2:-false}
    
    local protocol="http"
    if [ "$ssl_enabled" = "true" ]; then
        protocol="https"
    fi
    
    echo "⚙️ Atualizando configuração da aplicação..."
    
    # Atualizar CORS no arquivo .env
    local env_file="/home/ubuntu/pli_cadastros/config/.env"
    
    if [ -f "$env_file" ]; then
        # Backup do arquivo atual
        sudo cp "$env_file" "${env_file}.backup"
        
        # Atualizar ALLOWED_ORIGINS
        sudo sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=${protocol}://${domain},http://${SERVER_IP}:${APP_PORT}|g" "$env_file"
        
        echo "✅ Configuração da aplicação atualizada"
        
        # Reiniciar aplicação
        cd /home/ubuntu/pli_cadastros
        sudo pm2 restart pli
        echo "🔄 Aplicação reiniciada"
    else
        echo "⚠️ Arquivo de configuração não encontrado: $env_file"
    fi
}

# Função para mostrar configuração atual
show_current_config() {
    echo "📋 Configuração Atual:"
    echo "====================="
    echo "🖥️ Servidor IP: $SERVER_IP"
    echo "🚪 Porta da aplicação: $APP_PORT"
    echo "🌐 URL atual: http://$SERVER_IP:$APP_PORT"
    echo ""
    
    echo "📁 Sites Nginx disponíveis:"
    if [ -d "$NGINX_AVAILABLE" ]; then
        ls -la "$NGINX_AVAILABLE" | grep -v default
    else
        echo "Diretório não encontrado"
    fi
    
    echo ""
    echo "🔗 Sites Nginx ativos:"
    if [ -d "$NGINX_ENABLED" ]; then
        ls -la "$NGINX_ENABLED" | grep -v default
    else
        echo "Diretório não encontrado"
    fi
    
    echo ""
    echo "🔒 Certificados SSL:"
    if [ -d "/etc/letsencrypt/live" ]; then
        ls -la "/etc/letsencrypt/live"
    else
        echo "Nenhum certificado encontrado"
    fi
}

# Função para configurar domínio próprio
configure_custom_domain() {
    echo ""
    read -p "🌐 Digite seu domínio (ex: meusite.com): " domain
    
    if [ -z "$domain" ]; then
        echo "❌ Domínio não pode estar vazio"
        return 1
    fi
    
    echo ""
    echo "📋 Instruções para configurar DNS:"
    echo "=================================="
    echo "1. Acesse o painel de controle do seu domínio"
    echo "2. Vá para configurações de DNS"
    echo "3. Adicione um registro A:"
    echo "   Tipo: A"
    echo "   Nome: @ (ou subdomínio)"
    echo "   Valor: $SERVER_IP"
    echo "   TTL: 300"
    echo ""
    
    read -p "❓ DNS já está configurado? (y/n): " dns_ready
    
    if [ "$dns_ready" != "y" ]; then
        echo "⏳ Configure o DNS primeiro e execute o script novamente"
        return 1
    fi
    
    # Testar resolução DNS
    echo "🔍 Testando resolução DNS..."
    nslookup_result=$(nslookup "$domain" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ "$nslookup_result" = "$SERVER_IP" ]; then
        echo "✅ DNS configurado corretamente"
    else
        echo "⚠️ DNS ainda não propagado ou incorreto"
        echo "Resultado: $nslookup_result | Esperado: $SERVER_IP"
        read -p "❓ Continuar mesmo assim? (y/n): " continue_anyway
        if [ "$continue_anyway" != "y" ]; then
            return 1
        fi
    fi
    
    # Configurar Nginx
    configure_nginx "$domain" "sigma-pli-$domain"
    
    # Perguntar sobre SSL
    read -p "🔒 Configurar SSL (Let's Encrypt)? (y/n): " setup_ssl
    
    if [ "$setup_ssl" = "y" ]; then
        configure_ssl "$domain"
        update_app_config "$domain" "true"
    else
        update_app_config "$domain" "false"
    fi
    
    echo ""
    echo "🎉 Configuração concluída!"
    echo "🌐 Acesso: http://$domain"
    if [ "$setup_ssl" = "y" ]; then
        echo "🔒 Acesso seguro: https://$domain"
    fi
}

# Função para usar serviço gratuito
configure_free_service() {
    echo ""
    echo "📋 Serviços Gratuitos Disponíveis:"
    echo "1. No-IP (https://www.noip.com)"
    echo "2. DuckDNS (https://www.duckdns.org)"
    echo "3. FreeDNS (https://freedns.afraid.org)"
    echo ""
    
    read -p "📝 Digite o hostname completo (ex: meuapp.ddns.net): " hostname
    
    if [ -z "$hostname" ]; then
        echo "❌ Hostname não pode estar vazio"
        return 1
    fi
    
    echo ""
    echo "📋 Instruções para configurar $hostname:"
    echo "======================================="
    echo "1. Acesse o site do serviço escolhido"
    echo "2. Crie uma conta (se necessário)"
    echo "3. Adicione hostname: $hostname"
    echo "4. Configure IP: $SERVER_IP"
    echo ""
    
    read -p "❓ Hostname já está configurado? (y/n): " hostname_ready
    
    if [ "$hostname_ready" = "y" ]; then
        configure_nginx "$hostname" "sigma-pli-$(echo $hostname | tr '.' '-')"
        update_app_config "$hostname" "false"
        
        echo ""
        echo "🎉 Configuração concluída!"
        echo "🌐 Acesso: http://$hostname"
    else
        echo "⏳ Configure o hostname primeiro e execute o script novamente"
    fi
}

# Menu principal
main_menu() {
    while true; do
        show_options
        read -p "👆 Escolha uma opção (1-6): " option
        
        case $option in
            1)
                configure_custom_domain
                ;;
            2)
                echo "📝 Para subdomínio, use a opção 1 e digite o subdomínio completo"
                echo "Exemplo: app.meudominio.com"
                configure_custom_domain
                ;;
            3)
                configure_free_service
                ;;
            4)
                configure_nginx "localhost" "sigma-pli-local"
                echo "✅ Proxy local configurado"
                ;;
            5)
                show_current_config
                ;;
            6)
                echo "👋 Saindo..."
                exit 0
                ;;
            *)
                echo "❌ Opção inválida"
                ;;
        esac
        
        echo ""
        read -p "⏸️ Pressione Enter para continuar..."
    done
}

# Verificar se está rodando como root/sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado com sudo"
    echo "Usage: sudo $0"
    exit 1
fi

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx não encontrado. Instalando..."
    apt update
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi

# Executar menu principal
main_menu
