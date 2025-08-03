#!/bin/bash

# Script Rápido para Configurar Alias - SIGMA-PLI
# Configura um alias simples para acesso à aplicação

echo "🚀 CONFIGURAÇÃO RÁPIDA DE ALIAS - SIGMA-PLI"
echo "==========================================="

# Configurações
SERVER_IP="54.237.45.153"
APP_PORT="8888"

# Função para configurar alias simples via hosts (local)
configure_local_alias() {
    local alias_name=$1
    
    echo "📝 Configurando alias local: $alias_name"
    
    # Adicionar ao /etc/hosts (Linux/Mac) ou hosts (Windows)
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        local hosts_file="C:\\Windows\\System32\\drivers\\etc\\hosts"
        echo "$SERVER_IP $alias_name" >> "$hosts_file"
    else
        # Linux/Mac
        echo "$SERVER_IP $alias_name" | sudo tee -a /etc/hosts
    fi
    
    echo "✅ Alias local configurado!"
    echo "🌐 Acesso: http://$alias_name:$APP_PORT"
}

# Função para configurar Nginx no servidor
configure_server_alias() {
    local alias_name=$1
    
    echo "🔧 Configurando alias no servidor: $alias_name"
    
    # Criar configuração Nginx simples
    ssh -i pli-ec2-key.pem ubuntu@$SERVER_IP << EOF
# Criar configuração Nginx
sudo tee /etc/nginx/sites-available/sigma-pli-alias << 'NGINX_CONFIG'
server {
    listen 80;
    server_name $alias_name;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_CONFIG

# Ativar configuração
sudo ln -sf /etc/nginx/sites-available/sigma-pli-alias /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configurado no servidor"
EOF
}

# Menu de opções
echo ""
echo "📋 Opções Disponíveis:"
echo "1. Configurar alias local (acesso apenas deste computador)"
echo "2. Usar serviço No-IP gratuito (recomendado)"
echo "3. Usar serviço DuckDNS gratuito"
echo "4. Configurar manualmente"
echo ""

read -p "👆 Escolha uma opção (1-4): " option

case $option in
    1)
        read -p "📝 Digite o nome do alias (ex: sigma-pli.local): " alias_name
        configure_local_alias "$alias_name"
        ;;
    2)
        echo ""
        echo "🌐 CONFIGURAÇÃO NO-IP (GRATUITO):"
        echo "================================"
        echo "1. Acesse: https://www.noip.com/sign-up"
        echo "2. Crie uma conta gratuita"
        echo "3. No painel, clique em 'Dynamic DNS' → 'No-IP Hostnames'"
        echo "4. Clique em 'Create Hostname'"
        echo "5. Configure:"
        echo "   - Hostname: sigma-pli (ou nome desejado)"
        echo "   - Domain: ddns.net (ou outro disponível)"
        echo "   - IP Address: $SERVER_IP"
        echo "6. Clique em 'Create Hostname'"
        echo ""
        echo "🎉 Após configurar, acesse: http://sigma-pli.ddns.net"
        echo ""
        read -p "❓ Já configurou no No-IP? Digite o hostname completo: " noip_hostname
        if [ ! -z "$noip_hostname" ]; then
            echo "✅ Hostname configurado: http://$noip_hostname"
        fi
        ;;
    3)
        echo ""
        echo "🦆 CONFIGURAÇÃO DUCKDNS (GRATUITO):"
        echo "=================================="
        echo "1. Acesse: https://www.duckdns.org"
        echo "2. Faça login com Google/GitHub"
        echo "3. Digite um subdomínio: sigma-pli"
        echo "4. Configure IP: $SERVER_IP"
        echo "5. Clique em 'add domain'"
        echo ""
        echo "🎉 Após configurar, acesse: http://sigma-pli.duckdns.org"
        ;;
    4)
        echo ""
        echo "📋 CONFIGURAÇÃO MANUAL:"
        echo "======================"
        echo "Para configurar um domínio próprio:"
        echo "1. Registre um domínio (GoDaddy, Registro.br, etc.)"
        echo "2. Configure DNS apontando para: $SERVER_IP"
        echo "3. Execute o script completo: ./configure-domain.sh"
        echo ""
        echo "Para usar um subdomínio existente:"
        echo "1. Acesse o painel DNS do seu domínio"
        echo "2. Adicione registro A:"
        echo "   Nome: app (ou outro)"
        echo "   Valor: $SERVER_IP"
        echo "3. Aguarde propagação (até 24h)"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📊 RESUMO ATUAL:"
echo "==============="
echo "🖥️ Servidor: $SERVER_IP"
echo "🚪 Porta: $APP_PORT"
echo "🌐 URL atual: http://$SERVER_IP:$APP_PORT"
echo "🔗 Health check: http://$SERVER_IP:$APP_PORT/api/health"
echo ""
echo "💡 DICA: Para uso profissional, recomendo:"
echo "   - Registrar domínio próprio"
echo "   - Configurar SSL (https)"
echo "   - Usar CDN (CloudFlare)"
echo ""
echo "✅ Configuração concluída!"
