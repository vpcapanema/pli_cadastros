#!/bin/bash

# Script de Configuração www.sigma-pli - SIGMA-PLI
# Configura domínio personalizado tipo www.sigma-pli

echo "🌐 CONFIGURAÇÃO www.sigma-pli - SIGMA-PLI"
echo "========================================"

# Configurações
SERVER_IP="54.237.45.153"
APP_PORT="8888"
DOMAIN=""
SUBDOMAIN=""

# Função para configurar No-IP
configure_noip() {
    echo ""
    echo "📋 CONFIGURAÇÃO NO-IP PARA www.sigma-pli:"
    echo "========================================"
    echo ""
    echo "1. 🌐 Acesse: https://www.noip.com/sign-up"
    echo "2. 📝 Crie uma conta gratuita"
    echo "3. ➕ Clique em 'Add a Hostname'"
    echo ""
    echo "4. 🔧 Configure o hostname:"
    echo "   ┌─────────────────────────────────┐"
    echo "   │ Hostname: sigma-pli             │"
    echo "   │ Domain: ddns.net                │"
    echo "   │ IP Address: $SERVER_IP    │"
    echo "   └─────────────────────────────────┘"
    echo ""
    echo "5. ✅ Clique em 'Create Hostname'"
    echo ""
    echo "🎉 RESULTADO: http://sigma-pli.ddns.net"
    echo ""
    
    read -p "❓ Já configurou no No-IP? (y/n): " noip_configured
    
    if [ "$noip_configured" = "y" ]; then
        read -p "📝 Digite o hostname completo (ex: sigma-pli.ddns.net): " noip_hostname
        configure_nginx_for_domain "$noip_hostname"
    else
        echo "⏳ Configure primeiro no No-IP e execute este script novamente"
        echo "🔗 Link direto: https://www.noip.com/sign-up"
    fi
}

# Função para configurar DuckDNS
configure_duckdns() {
    echo ""
    echo "🦆 CONFIGURAÇÃO DUCKDNS PARA www.sigma-pli:"
    echo "=========================================="
    echo ""
    echo "1. 🌐 Acesse: https://www.duckdns.org"
    echo "2. 🔑 Faça login com Google/GitHub"
    echo "3. 📝 Digite: sigma-pli"
    echo "4. 🔧 Configure IP: $SERVER_IP"
    echo "5. ➕ Clique em 'add domain'"
    echo ""
    echo "🎉 RESULTADO: http://sigma-pli.duckdns.org"
    echo ""
    
    read -p "❓ Já configurou no DuckDNS? (y/n): " duck_configured
    
    if [ "$duck_configured" = "y" ]; then
        configure_nginx_for_domain "sigma-pli.duckdns.org"
    else
        echo "⏳ Configure primeiro no DuckDNS e execute este script novamente"
        echo "🔗 Link direto: https://www.duckdns.org"
    fi
}

# Função para configurar domínio próprio
configure_custom_domain() {
    echo ""
    echo "💼 CONFIGURAÇÃO DOMÍNIO PRÓPRIO:"
    echo "==============================="
    echo ""
    echo "📋 Sugestões de domínios disponíveis:"
    echo "   • sigma-pli.com"
    echo "   • sigma-pli.com.br"
    echo "   • sigmapli.com"
    echo "   • sigma-sistemas.com"
    echo ""
    echo "🛒 Onde registrar:"
    echo "   • Registro.br (.com.br) - R$ 40/ano"
    echo "   • GoDaddy (.com) - $12/ano"
    echo "   • Namecheap (.com) - $10/ano"
    echo ""
    
    read -p "📝 Digite seu domínio (ex: sigma-pli.com): " custom_domain
    
    if [ ! -z "$custom_domain" ]; then
        echo ""
        echo "📋 CONFIGURAR DNS:"
        echo "=================="
        echo "No painel do seu provedor de domínio, adicione:"
        echo ""
        echo "   Tipo: A"
        echo "   Nome: @"
        echo "   Valor: $SERVER_IP"
        echo "   TTL: 300"
        echo ""
        echo "   Tipo: A"
        echo "   Nome: www"
        echo "   Valor: $SERVER_IP"
        echo "   TTL: 300"
        echo ""
        
        read -p "❓ DNS já está configurado? (y/n): " dns_ready
        
        if [ "$dns_ready" = "y" ]; then
            configure_nginx_for_domain "$custom_domain" "true"
        else
            echo "⏳ Configure o DNS primeiro e execute este script novamente"
        fi
    fi
}

# Função para configurar Nginx
configure_nginx_for_domain() {
    local domain=$1
    local is_custom=${2:-false}
    local config_name="sigma-pli-$(echo $domain | tr '.' '-')"
    
    echo ""
    echo "🔧 Configurando Nginx para: $domain"
    
    # Criar configuração Nginx
    local nginx_config=""
    
    if [ "$is_custom" = "true" ]; then
        # Configuração para domínio próprio com www
        nginx_config=$(cat << EOF
# Redirecionar para www
server {
    listen 80;
    server_name $domain;
    return 301 http://www.$domain\$request_uri;
}

# Configuração principal com www
server {
    listen 80;
    server_name www.$domain;
    
    # Logs
    access_log /var/log/nginx/${config_name}_access.log;
    error_log /var/log/nginx/${config_name}_error.log;
    
    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy para aplicação
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
        # Configuração simples para serviços gratuitos
        nginx_config=$(cat << EOF
server {
    listen 80;
    server_name $domain;
    
    # Logs
    access_log /var/log/nginx/${config_name}_access.log;
    error_log /var/log/nginx/${config_name}_error.log;
    
    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    
    echo "📄 Aplicando configuração no servidor..."
    
    # Aplicar configuração via SSH
    ssh -i pli-ec2-key.pem ubuntu@$SERVER_IP << EOF
# Criar configuração Nginx
echo '$nginx_config' | sudo tee /etc/nginx/sites-available/$config_name > /dev/null

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$config_name /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configurado com sucesso!"
EOF
    
    # Atualizar configuração da aplicação
    update_app_cors "$domain" "$is_custom"
    
    echo ""
    echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
    echo "=========================="
    
    if [ "$is_custom" = "true" ]; then
        echo "🌐 Acesso: http://www.$domain"
        echo "🔒 Para SSL: sudo certbot --nginx -d $domain -d www.$domain"
    else
        echo "🌐 Acesso: http://$domain"
    fi
    
    echo "💊 Health: http://$domain/health"
}

# Função para atualizar CORS na aplicação
update_app_cors() {
    local domain=$1
    local is_custom=${2:-false}
    
    echo "⚙️ Atualizando configuração CORS..."
    
    local new_origin=""
    if [ "$is_custom" = "true" ]; then
        new_origin="http://$domain,http://www.$domain"
    else
        new_origin="http://$domain"
    fi
    
    ssh -i pli-ec2-key.pem ubuntu@$SERVER_IP << EOF
cd /home/ubuntu/pli_cadastros

# Backup da configuração atual
cp config/.env config/.env.backup

# Atualizar ALLOWED_ORIGINS
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$new_origin,http://$SERVER_IP:$APP_PORT|g" config/.env

# Reiniciar aplicação
pm2 restart pli

echo "✅ Configuração da aplicação atualizada"
EOF
}

# Menu principal
main_menu() {
    echo ""
    echo "📋 OPÇÕES PARA www.sigma-pli:"
    echo "============================"
    echo "1. 🆓 No-IP (Gratuito, 5 minutos)"
    echo "2. 🦆 DuckDNS (Gratuito, 3 minutos)"
    echo "3. 💼 Domínio próprio (Profissional)"
    echo "4. 📊 Mostrar configuração atual"
    echo "5. 🚪 Sair"
    echo ""
    
    read -p "👆 Escolha uma opção (1-5): " option
    
    case $option in
        1)
            configure_noip
            ;;
        2)
            configure_duckdns
            ;;
        3)
            configure_custom_domain
            ;;
        4)
            show_current_status
            ;;
        5)
            echo "👋 Saindo..."
            exit 0
            ;;
        *)
            echo "❌ Opção inválida"
            main_menu
            ;;
    esac
}

# Função para mostrar status atual
show_current_status() {
    echo ""
    echo "📊 STATUS ATUAL - SIGMA-PLI:"
    echo "============================"
    echo "🖥️ Servidor: $SERVER_IP"
    echo "🚪 Porta: $APP_PORT"
    echo "🌐 URL atual: http://$SERVER_IP:$APP_PORT"
    echo ""
    echo "🔗 Links funcionais:"
    echo "   📱 Aplicação: http://$SERVER_IP:$APP_PORT"
    echo "   💊 Health: http://$SERVER_IP:$APP_PORT/api/health"
    echo "   📊 Dashboard: http://$SERVER_IP:$APP_PORT/dashboard.html"
    echo ""
    
    # Verificar sites Nginx ativos
    echo "📁 Domínios configurados:"
    ssh -i pli-ec2-key.pem ubuntu@$SERVER_IP "ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep sigma || echo 'Nenhum domínio personalizado configurado'"
    echo ""
}

# Verificar dependências
check_dependencies() {
    echo "🔍 Verificando dependências..."
    
    # Verificar chave SSH
    if [ ! -f "pli-ec2-key.pem" ]; then
        echo "❌ Chave SSH não encontrada: pli-ec2-key.pem"
        echo "💡 Certifique-se de que a chave está no diretório atual"
        exit 1
    fi
    
    # Verificar conectividade
    echo "🔑 Testando conexão SSH..."
    timeout 10 ssh -i pli-ec2-key.pem -o ConnectTimeout=5 ubuntu@$SERVER_IP "echo 'Conexão OK'" || {
        echo "❌ Não foi possível conectar ao servidor"
        echo "💡 Verifique se a chave SSH e o IP estão corretos"
        exit 1
    }
    
    echo "✅ Dependências verificadas"
}

# Execução principal
echo "🚀 Iniciando configuração..."
check_dependencies
main_menu
