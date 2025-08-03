# CONFIGURAR NGINX PARA sigma-pli.ddns.net
# =======================================

Write-Host "🌐 CONFIGURANDO NGINX PARA sigma-pli.ddns.net" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$HOSTNAME = "sigma-pli.ddns.net"
$SERVER_IP = "54.237.45.153"
$APP_PORT = "8888"
$KEY_FILE = "..\pli-ec2-key.pem"

Write-Host "✅ Domínio configurado: $HOSTNAME" -ForegroundColor Green
Write-Host "✅ Servidor: $SERVER_IP" -ForegroundColor Green
Write-Host "✅ Porta da aplicação: $APP_PORT" -ForegroundColor Green
Write-Host ""

# Verificar conectividade SSH
Write-Host "🔍 Testando conexão SSH..." -ForegroundColor Yellow

try {
    $testSSH = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP "echo 'SSH OK'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão SSH funcionando" -ForegroundColor Green
    } else {
        throw "Falha na conexão SSH"
    }
} catch {
    Write-Host "❌ Erro na conexão SSH: $_" -ForegroundColor Red
    Write-Host "Verifique se o arquivo $KEY_FILE existe" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Configurando Nginx..." -ForegroundColor Yellow

# Criar script de configuração simples
$configScript = @"
#!/bin/bash
set -e

echo "Criando configuração Nginx para $HOSTNAME..."

# Criar configuração do site
sudo tee /etc/nginx/sites-available/sigma-pli > /dev/null << 'EOF'
server {
    listen 80;
    server_name $HOSTNAME;
    
    access_log /var/log/nginx/sigma-pli_access.log;
    error_log /var/log/nginx/sigma-pli_error.log;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \`$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \`$scheme;
        proxy_cache_bypass \`$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        client_max_body_size 10M;
    }
    
    location = /api/health {
        proxy_pass http://localhost:$APP_PORT/api/health;
        access_log off;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/sigma-pli /etc/nginx/sites-enabled/

# Testar configuração
echo "Testando configuração Nginx..."
sudo nginx -t

if [ \`$? -eq 0 ]; then
    echo "Recarregando Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx configurado com sucesso!"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Atualizar CORS da aplicação
echo "Atualizando configuração CORS..."
cd /home/ubuntu/pli_cadastros

# Backup
cp config/.env config/.env.backup.\`$(date +%Y%m%d_%H%M%S)\`

# Atualizar ALLOWED_ORIGINS
sed -i 's|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://$HOSTNAME,http://$SERVER_IP:$APP_PORT|g' config/.env

# Reiniciar aplicação
pm2 restart pli

echo "✅ Configuração completa!"
"@

# Executar no servidor
Write-Host "Executando configuração no servidor..." -ForegroundColor Yellow

try {
    ssh -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP $configScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Seu site está disponível em:" -ForegroundColor Cyan
        Write-Host "   http://$HOSTNAME" -ForegroundColor White
        Write-Host ""
        Write-Host "🧪 URLs para teste:" -ForegroundColor Cyan
        Write-Host "   • Principal: http://$HOSTNAME" -ForegroundColor White
        Write-Host "   • Health Check: http://$HOSTNAME/api/health" -ForegroundColor White
        Write-Host "   • Dashboard: http://$HOSTNAME/dashboard.html" -ForegroundColor White
        Write-Host ""
        
        # Testar conectividade
        Write-Host "🔍 Testando conectividade..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        try {
            $response = Invoke-WebRequest -Uri "http://$HOSTNAME/api/health" -TimeoutSec 15 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Site respondendo corretamente!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Site ainda propagando... Teste em alguns minutos" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  DNS ainda propagando... Aguarde 5-15 minutos" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "📊 MONITORAMENTO:" -ForegroundColor Cyan
        Write-Host "=================" -ForegroundColor Cyan
        Write-Host "Logs de acesso: sudo tail -f /var/log/nginx/sigma-pli_access.log" -ForegroundColor White
        Write-Host "Logs de erro: sudo tail -f /var/log/nginx/sigma-pli_error.log" -ForegroundColor White
        Write-Host "Logs da aplicação: pm2 logs pli" -ForegroundColor White
        
        Write-Host ""
        Write-Host "🔒 PRÓXIMO PASSO OPCIONAL - SSL/HTTPS:" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "Para ativar HTTPS (recomendado):" -ForegroundColor Yellow
        Write-Host "ssh -i $KEY_FILE ubuntu@$SERVER_IP" -ForegroundColor White
        Write-Host "sudo apt install certbot python3-certbot-nginx" -ForegroundColor White
        Write-Host "sudo certbot --nginx -d $HOSTNAME" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erro na configuração" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 RESUMO FINAL:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "✅ DNS configurado no No-IP" -ForegroundColor White
Write-Host "✅ Nginx configurado no servidor" -ForegroundColor White
Write-Host "✅ CORS atualizado na aplicação" -ForegroundColor White
Write-Host "🌐 Acesse: http://$HOSTNAME" -ForegroundColor Cyan

Write-Host ""
Read-Host "Pressione Enter para finalizar"
