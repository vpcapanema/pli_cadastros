# EXECUTAR CONFIGURACAO DO HOSTNAME
# ========================================

# Configuracao automatica do Nginx apos criacao do hostname No-IP

Write-Host "CONFIGURACAO NGINX PARA HOSTNAME NO-IP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verificar se o SSH está disponível
Write-Host "Verificando pre-requisitos..." -ForegroundColor Yellow

$SSH_AVAILABLE = $false
try {
    # Primeiro verificar se o comando existe
    $SSH_COMMAND = Get-Command ssh -ErrorAction SilentlyContinue
    
    if ($SSH_COMMAND) {
        $SSH_VERSION = & ssh -V 2>&1
        if ($SSH_VERSION -and ($SSH_VERSION -like "*OpenSSH*" -or $SSH_VERSION.ToString() -like "*OpenSSH*")) {
            $SSH_AVAILABLE = $true
            $VERSION_LINE = $SSH_VERSION.ToString().Split("`n")[0]
            Write-Host "SSH encontrado: $VERSION_LINE" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "SSH nao encontrado: $($_.Exception.Message)" -ForegroundColor Red
}

if (-not $SSH_AVAILABLE) {
    Write-Host ""
    Write-Host "ERRO: OpenSSH nao esta instalado ou disponivel" -ForegroundColor Red
    Write-Host "=======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar o OpenSSH no Windows:" -ForegroundColor Yellow
    Write-Host "1. Abra o PowerShell como Administrador" -ForegroundColor White
    Write-Host "2. Execute: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor White
    Write-Host "3. Ou baixe o Git for Windows que inclui SSH" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Configurações do servidor
$SERVER_IP = "54.237.45.153"
$APP_PORT = "8888"
$KEY_FILE = "..\pli-ec2-key.pem"

# Verificar se o arquivo de chave existe
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "Arquivo de chave nao encontrado em: $KEY_FILE" -ForegroundColor Red
    Write-Host "Procurando o arquivo..." -ForegroundColor Yellow
    
    # Tentar outros caminhos possíveis
    $POSSIBLE_PATHS = @(
        "..\pli-ec2-key.pem",
        ".\pli-ec2-key.pem", 
        "c:\Users\vinic\pli_cadastros\pli-ec2-key.pem",
        "$PSScriptRoot\..\pli-ec2-key.pem"
    )
    
    foreach ($path in $POSSIBLE_PATHS) {
        if (Test-Path $path) {
            $KEY_FILE = $path
            Write-Host "Chave encontrada em: $KEY_FILE" -ForegroundColor Green
            break
        }
    }
    
    if (-not (Test-Path $KEY_FILE)) {
        Write-Host "ERRO: Arquivo pli-ec2-key.pem nao encontrado!" -ForegroundColor Red
        Write-Host "Verifique se o arquivo existe no projeto" -ForegroundColor Yellow
        Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

# Verificar permissões do arquivo de chave
if (Test-Path $KEY_FILE) {
    Write-Host "Configurando permissoes da chave SSH..." -ForegroundColor Yellow
    
    # No Windows, usar icacls para definir permissões corretas
    try {
        # Remover herança e dar acesso total apenas ao usuário atual
        & icacls $KEY_FILE /inheritance:r /grant:r "$env:USERNAME:(R)" > $null 2>&1
        Write-Host "Permissoes da chave SSH configuradas" -ForegroundColor Green
    } catch {
        Write-Host "Aviso: Nao foi possivel configurar permissoes automaticamente" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Este script configurara o Nginx no servidor apos voce criar o hostname no No-IP" -ForegroundColor Yellow
Write-Host ""

# Solicitar o hostname criado
$HOSTNAME = Read-Host "Digite o hostname completo criado no No-IP (ex: sigma-pli.ddns.net)"

if ([string]::IsNullOrWhiteSpace($HOSTNAME)) {
    Write-Host "Hostname nao pode estar vazio" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configurando Nginx para: $HOSTNAME" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Nome do arquivo de configuração
$CONFIG_NAME = "sigma-pli-" + ($HOSTNAME -replace '\.', '-')

# Criar configuração Nginx
$NGINX_CONFIG = @"
# Configuração Nginx para SIGMA-PLI
# Hostname: $HOSTNAME
# Gerado em: $(Get-Date)

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
        
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # Configuração principal da aplicação
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        
        # Headers para proxy
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        
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
"@

Write-Host "Aplicando configuracao no servidor AWS..." -ForegroundColor Yellow

# Comando SSH para aplicar configuração - versão simplificada
$NGINX_CONFIG_SIMPLE = "server { listen 80; server_name $HOSTNAME; location / { proxy_pass http://localhost:$APP_PORT; proxy_set_header Host `$host; proxy_set_header X-Real-IP `$remote_addr; proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto `$scheme; } }"

$SSH_COMMAND = "sudo bash -c 'echo ""$NGINX_CONFIG_SIMPLE"" > /etc/nginx/sites-available/$CONFIG_NAME && ln -sf /etc/nginx/sites-available/$CONFIG_NAME /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx && echo ""✅ Nginx configurado com sucesso!""'"

# Executar comando no servidor
Write-Host "Conectando ao servidor via SSH..." -ForegroundColor Yellow
Write-Host "Usando chave: $KEY_FILE" -ForegroundColor Gray

try {
    # Verificar conectividade básica primeiro
    Write-Host "Testando conectividade SSH..." -ForegroundColor Yellow
    $TEST_SSH = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP "echo 'Conexao OK'"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no teste de conectividade SSH"
    }
    
    Write-Host "Conectividade OK. Executando configuracao..." -ForegroundColor Green
    
    # Executar comando principal
    ssh -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP $SSH_COMMAND
    $SSH_SUCCESS = $LASTEXITCODE -eq 0
} catch {
    $SSH_SUCCESS = $false
    Write-Host "Erro na conexao SSH: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "DIAGNOSTICO SSH:" -ForegroundColor Yellow
    Write-Host "================" -ForegroundColor Yellow
    Write-Host "1. Verificar se a chave existe: Test-Path '$KEY_FILE'" -ForegroundColor White
    Write-Host "2. Testar conectividade: ssh -i '$KEY_FILE' ubuntu@$SERVER_IP" -ForegroundColor White
    Write-Host "3. Verificar IP do servidor: ping $SERVER_IP" -ForegroundColor White
    Write-Host "4. Verificar se o OpenSSH esta instalado no Windows" -ForegroundColor White
}

if ($SSH_SUCCESS) {
    Write-Host ""
    Write-Host "CONFIGURACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesso principal: http://$HOSTNAME" -ForegroundColor Cyan
    Write-Host "Health check: http://$HOSTNAME/api/health" -ForegroundColor Cyan
    Write-Host "Dashboard: http://$HOSTNAME/dashboard.html" -ForegroundColor Cyan
    Write-Host ""
    
    # Atualizar configuração CORS na aplicação
    Write-Host "Atualizando configuracao CORS na aplicacao..." -ForegroundColor Yellow
    
    $CORS_UPDATE = @"
cd /home/ubuntu/pli_cadastros

# Backup da configuração atual
cp config/.env config/.env.backup.`$(date +%Y%m%d_%H%M%S)

# Atualizar ALLOWED_ORIGINS para incluir o novo hostname
NEW_ORIGINS="http://$HOSTNAME,http://54.237.45.153:8888"
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=`$NEW_ORIGINS|g" config/.env

# Reiniciar aplicação para aplicar mudanças
pm2 restart pli

echo "✅ Configuração CORS atualizada e aplicação reiniciada"
"@
    
    ssh -i $KEY_FILE ubuntu@$SERVER_IP $CORS_UPDATE
    
    Write-Host ""
    Write-Host "TESTANDO CONFIGURACAO..." -ForegroundColor Yellow
    Write-Host "==========================" -ForegroundColor Yellow
    
    # Aguardar um pouco para a configuração ser aplicada
    Start-Sleep -Seconds 5
    
    # Testar conectividade
    try {
        $response = Invoke-WebRequest -Uri "http://$HOSTNAME/api/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
        $HTTP_STATUS = $response.StatusCode
    } catch {
        $HTTP_STATUS = 0
    }
    
    if ($HTTP_STATUS -eq 200) {
        Write-Host "Teste bem-sucedido! Aplicacao respondendo corretamente" -ForegroundColor Green
        Write-Host "Acesse: http://$HOSTNAME" -ForegroundColor Cyan
    } else {
        Write-Host "Aplicacao ainda inicializando ou DNS propagando..." -ForegroundColor Yellow
        Write-Host "Aguarde 5-15 minutos e teste novamente" -ForegroundColor Yellow
        Write-Host "URL para testar: http://$HOSTNAME" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "LOGS PARA MONITORAMENTO:" -ForegroundColor Yellow
    Write-Host "==========================" -ForegroundColor Yellow
    Write-Host "Logs de acesso: sudo tail -f /var/log/nginx/${CONFIG_NAME}_access.log" -ForegroundColor White
    Write-Host "Logs de erro: sudo tail -f /var/log/nginx/${CONFIG_NAME}_error.log" -ForegroundColor White
    Write-Host "Logs da aplicacao: pm2 logs pli" -ForegroundColor White
    
    Write-Host ""
    Write-Host "PROXIMO PASSO OPCIONAL - SSL:" -ForegroundColor Green
    Write-Host "===============================" -ForegroundColor Green
    Write-Host "Para configurar HTTPS (recomendado para producao):" -ForegroundColor Yellow
    Write-Host "sudo apt install certbot python3-certbot-nginx" -ForegroundColor White
    Write-Host "sudo certbot --nginx -d $HOSTNAME" -ForegroundColor White
    Write-Host ""
    Write-Host "PARABENS! Seu dominio www.sigma-pli esta configurado!" -ForegroundColor Green
    
} else {
    Write-Host ""
    Write-Host "ERRO na configuracao do servidor" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possiveis causas e solucoes:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. PROBLEMA NA CHAVE SSH:" -ForegroundColor White
    Write-Host "   - Verificar se a chave existe: $(if (Test-Path $KEY_FILE) { "✅ OK" } else { "❌ NAO ENCONTRADA" })" -ForegroundColor Gray
    Write-Host "   - Chave sendo usada: $KEY_FILE" -ForegroundColor Gray
    Write-Host "   - Solucao: Verifique se o arquivo pli-ec2-key.pem esta no projeto" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. PROBLEMA DE CONECTIVIDADE:" -ForegroundColor White
    Write-Host "   - Testar ping: ping $SERVER_IP" -ForegroundColor Gray
    Write-Host "   - Testar SSH manual: ssh -i '$KEY_FILE' ubuntu@$SERVER_IP" -ForegroundColor Gray
    Write-Host "   - Verificar se o servidor esta ativo" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. PROBLEMA DE PERMISSOES:" -ForegroundColor White
    Write-Host "   - No Windows, a chave SSH precisa de permissoes corretas" -ForegroundColor Gray
    Write-Host "   - Execute: icacls '$KEY_FILE' /inheritance:r /grant:r `"$env:USERNAME:(R)`"" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. COMANDO PARA TESTE MANUAL:" -ForegroundColor Yellow
    Write-Host "   ssh -v -i '$KEY_FILE' ubuntu@$SERVER_IP" -ForegroundColor Cyan
    Write-Host "   (use -v para debug verboso)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
