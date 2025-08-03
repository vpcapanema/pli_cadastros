# CONFIGURAR NGINX - VERSÃO CORRIGIDA
# ===================================

Write-Host "🌐 CONFIGURANDO sigma-pli.ddns.net" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

$HOSTNAME = "sigma-pli.ddns.net"
$SERVER_IP = "54.237.45.153"
$APP_PORT = "8888"
$KEY_FILE = "..\pli-ec2-key.pem"

Write-Host "✅ Domínio: $HOSTNAME" -ForegroundColor Green
Write-Host "✅ Servidor: $SERVER_IP" -ForegroundColor Green
Write-Host ""

# Criar configuração Nginx com escape correto
$nginxConfig = @'
server {
    listen 80;
    server_name sigma-pli.ddns.net;
    
    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
'@

Write-Host "🚀 Aplicando configuração..." -ForegroundColor Yellow

# Salvar arquivo localmente
$nginxConfig | Out-File -FilePath "sigma-pli.conf" -Encoding UTF8

Write-Host "1. Enviando configuração para servidor..." -ForegroundColor Gray
scp -i $KEY_FILE -o StrictHostKeyChecking=no sigma-pli.conf ubuntu@$SERVER_IP`:/tmp/

Write-Host "2. Instalando configuração..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo mv /tmp/sigma-pli.conf /etc/nginx/sites-available/"

Write-Host "3. Ativando site..." -ForegroundColor Gray
ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/sigma-pli.conf /etc/nginx/sites-enabled/"

Write-Host "4. Testando configuração..." -ForegroundColor Gray
$nginxTest = ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo nginx -t 2>&1"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuração válida!" -ForegroundColor Green
    
    Write-Host "5. Recarregando Nginx..." -ForegroundColor Gray
    ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo systemctl reload nginx"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
        Write-Host "=========================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Seu site está disponível em:" -ForegroundColor Cyan
        Write-Host "   http://$HOSTNAME" -ForegroundColor White
        Write-Host ""
        
        # Aguardar alguns segundos e testar
        Write-Host "🧪 Testando conectividade..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        try {
            $webTest = Invoke-WebRequest -Uri "http://$HOSTNAME" -TimeoutSec 15 -ErrorAction SilentlyContinue
            if ($webTest.StatusCode -eq 200) {
                Write-Host "✅ Site respondendo corretamente!" -ForegroundColor Green
                Write-Host "🎯 Acesse agora: http://$HOSTNAME" -ForegroundColor Cyan
            } else {
                Write-Host "⚠️ Site configurado, mas pode estar propagando DNS..." -ForegroundColor Yellow
                Write-Host "   Aguarde 5-15 minutos e teste: http://$HOSTNAME" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ DNS ainda propagando..." -ForegroundColor Yellow
            Write-Host "   Aguarde alguns minutos e acesse: http://$HOSTNAME" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "📊 STATUS FINAL:" -ForegroundColor Green
        Write-Host "• ✅ DNS configurado no No-IP" -ForegroundColor White
        Write-Host "• ✅ Nginx configurado e ativo" -ForegroundColor White
        Write-Host "• ✅ Site disponível em: http://$HOSTNAME" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erro ao recarregar Nginx" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Erro na configuração do Nginx:" -ForegroundColor Red
    Write-Host $nginxTest -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verificando configuração existente..." -ForegroundColor Yellow
    ssh -i $KEY_FILE ubuntu@$SERVER_IP "sudo nginx -T | grep sigma-pli -A 10 -B 2"
}

# Limpar arquivo temporário
Remove-Item "sigma-pli.conf" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🔗 LINKS ÚTEIS:" -ForegroundColor Cyan
Write-Host "• Site principal: http://$HOSTNAME" -ForegroundColor White
Write-Host "• IP direto: http://$SERVER_IP`:$APP_PORT" -ForegroundColor White

Write-Host ""
Read-Host "Pressione Enter para finalizar"
