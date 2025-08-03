# CONFIGURAR NGINX PARA sigma-pli.ddns.net - VERSÃO SIMPLES
# ===========================================================

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

# Testar SSH
Write-Host "🔍 Testando conexão SSH..." -ForegroundColor Yellow
try {
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP "echo 'SSH OK'" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão SSH funcionando" -ForegroundColor Green
    } else {
        throw "Falha SSH"
    }
} catch {
    Write-Host "❌ Erro na conexão SSH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Aplicando configuração..." -ForegroundColor Yellow

# Comando 1: Criar configuração Nginx
$cmd1 = @"
sudo tee /etc/nginx/sites-available/sigma-pli > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name $HOSTNAME;
    
    access_log /var/log/nginx/sigma-pli_access.log;
    error_log /var/log/nginx/sigma-pli_error.log;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
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
NGINXCONF
"@

# Comando 2: Ativar site e recarregar
$cmd2 = @"
sudo ln -sf /etc/nginx/sites-available/sigma-pli /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
"@

# Comando 3: Atualizar CORS
$cmd3 = @"
cd /home/ubuntu/pli_cadastros && cp config/.env config/.env.backup.`$(date +%Y%m%d_%H%M%S) && echo "ALLOWED_ORIGINS=http://$HOSTNAME,http://$SERVER_IP`:$APP_PORT" | sudo tee -a config/.env.new > /dev/null && sudo mv config/.env.new config/.env && pm2 restart pli
"@

Write-Host "Passo 1: Criando configuração Nginx..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP $cmd1

Write-Host "Passo 2: Ativando site e recarregando Nginx..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP $cmd2

Write-Host "Passo 3: Atualizando CORS e reiniciando aplicação..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP $cmd3

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Seu site: http://$HOSTNAME" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🧪 Testando..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    try {
        $test = Invoke-WebRequest -Uri "http://$HOSTNAME/api/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($test.StatusCode -eq 200) {
            Write-Host "✅ Site funcionando perfeitamente!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ DNS ainda propagando... Teste em alguns minutos" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🔗 LINKS FINAIS:" -ForegroundColor Cyan
    Write-Host "• Principal: http://$HOSTNAME" -ForegroundColor White
    Write-Host "• Health: http://$HOSTNAME/api/health" -ForegroundColor White
    Write-Host "• Dashboard: http://$HOSTNAME/dashboard.html" -ForegroundColor White
    
} else {
    Write-Host "❌ Erro na configuração" -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para finalizar"
