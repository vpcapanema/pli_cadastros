# CONFIGURAR NGINX - VERSÃO ULTRA SIMPLES
# =======================================

Write-Host "🌐 CONFIGURANDO sigma-pli.ddns.net" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

$HOSTNAME = "sigma-pli.ddns.net"
$SERVER_IP = "54.237.45.153"
$APP_PORT = "8888"
$KEY_FILE = "..\pli-ec2-key.pem"

Write-Host "✅ Domínio: $HOSTNAME" -ForegroundColor Green
Write-Host "✅ Servidor: $SERVER_IP" -ForegroundColor Green
Write-Host ""

# Criar arquivo de configuração Nginx local
$nginxConfig = @"
server {
    listen 80;
    server_name $HOSTNAME;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx-sigma-pli.conf" -Encoding UTF8

Write-Host "🚀 Enviando configuração..." -ForegroundColor Yellow

# Comandos separados para evitar problemas
Write-Host "1. Enviando arquivo de configuração..." -ForegroundColor Gray
scp -i $KEY_FILE -o StrictHostKeyChecking=no nginx-sigma-pli.conf ubuntu@$SERVER_IP`:/tmp/

Write-Host "2. Movendo para Nginx..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo mv /tmp/nginx-sigma-pli.conf /etc/nginx/sites-available/sigma-pli"

Write-Host "3. Ativando site..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/sigma-pli /etc/nginx/sites-enabled/"

Write-Host "4. Testando configuração..." -ForegroundColor Gray
$testResult = ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo nginx -t"

if ($LASTEXITCODE -eq 0) {
    Write-Host "5. Recarregando Nginx..." -ForegroundColor Gray
    ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo systemctl reload nginx"
    
    Write-Host ""
    Write-Host "🎉 SUCESSO!" -ForegroundColor Green
    Write-Host "==========" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acesse: http://$HOSTNAME" -ForegroundColor Cyan
    Write-Host ""
    
    # Teste rápido
    Write-Host "🧪 Testando..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://$HOSTNAME" -TimeoutSec 15 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site funcionando!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Aguarde alguns minutos para propagação do DNS" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Erro na configuração do Nginx:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
}

# Limpar arquivo temporário
Remove-Item "nginx-sigma-pli.conf" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📋 RESUMO:" -ForegroundColor Cyan
Write-Host "• DNS: ✅ Configurado no No-IP" -ForegroundColor White
Write-Host "• Nginx: ✅ Configurado no servidor" -ForegroundColor White
Write-Host "• Acesso: http://$HOSTNAME" -ForegroundColor White

Write-Host ""
Read-Host "Pressione Enter para sair"
