# TESTE DE CONEXAO SSH
# =====================

# Script para diagnosticar problemas de conexão SSH com o servidor AWS

Write-Host "DIAGNOSTICO DE CONEXAO SSH" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Configurações
$SERVER_IP = "54.237.45.153"
$KEY_FILE = "..\pli-ec2-key.pem"

# Verificar se o arquivo de chave existe
Write-Host ""
Write-Host "1. VERIFICANDO ARQUIVO DE CHAVE..." -ForegroundColor Yellow

if (-not (Test-Path $KEY_FILE)) {
    Write-Host "   ❌ Chave nao encontrada em: $KEY_FILE" -ForegroundColor Red
    
    # Procurar em outros locais
    $POSSIBLE_PATHS = @(
        "..\pli-ec2-key.pem",
        ".\pli-ec2-key.pem", 
        "c:\Users\vinic\pli_cadastros\pli-ec2-key.pem",
        "$PSScriptRoot\..\pli-ec2-key.pem"
    )
    
    Write-Host "   Procurando em outros locais..." -ForegroundColor Yellow
    foreach ($path in $POSSIBLE_PATHS) {
        if (Test-Path $path) {
            $KEY_FILE = $path
            Write-Host "   ✅ Chave encontrada em: $KEY_FILE" -ForegroundColor Green
            break
        } else {
            Write-Host "   ❌ Nao encontrada em: $path" -ForegroundColor Red
        }
    }
    
    if (-not (Test-Path $KEY_FILE)) {
        Write-Host ""
        Write-Host "ERRO: Arquivo pli-ec2-key.pem nao encontrado!" -ForegroundColor Red
        Write-Host "Copie o arquivo para o diretorio do projeto" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ✅ Chave encontrada: $KEY_FILE" -ForegroundColor Green
}

# Verificar SSH disponível
Write-Host ""
Write-Host "2. VERIFICANDO SSH..." -ForegroundColor Yellow

try {
    $SSH_VERSION = ssh -V 2>&1
    if ($SSH_VERSION -like "*OpenSSH*") {
        Write-Host "   ✅ SSH disponivel: $($SSH_VERSION.Split("`n")[0])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SSH nao disponivel" -ForegroundColor Red
        Write-Host "   Instale: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ SSH nao encontrado" -ForegroundColor Red
    Write-Host "   Instale o OpenSSH ou Git for Windows" -ForegroundColor Yellow
    exit 1
}

# Verificar conectividade de rede
Write-Host ""
Write-Host "3. TESTANDO CONECTIVIDADE DE REDE..." -ForegroundColor Yellow

try {
    $PING_RESULT = Test-Connection -ComputerName $SERVER_IP -Count 2 -Quiet
    if ($PING_RESULT) {
        Write-Host "   ✅ Servidor acessivel via ping" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Servidor nao responde ao ping" -ForegroundColor Red
        Write-Host "   Verifique se o servidor esta ativo" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erro no teste de ping" -ForegroundColor Red
}

# Configurar permissões da chave
Write-Host ""
Write-Host "4. CONFIGURANDO PERMISSOES DA CHAVE..." -ForegroundColor Yellow

try {
    # No Windows, usar icacls para definir permissões corretas
    $ICACLS_RESULT = & icacls $KEY_FILE /inheritance:r /grant:r "$env:USERNAME:(R)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Permissoes configuradas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Aviso: Nao foi possivel configurar permissoes automaticamente" -ForegroundColor Yellow
        Write-Host "   Execute manualmente: icacls '$KEY_FILE' /inheritance:r /grant:r '$env:USERNAME:(R)'" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Aviso: Erro ao configurar permissoes" -ForegroundColor Yellow
}

# Testar conexão SSH
Write-Host ""
Write-Host "5. TESTANDO CONEXAO SSH..." -ForegroundColor Yellow
Write-Host "   Conectando em $SERVER_IP..." -ForegroundColor Gray

try {
    Write-Host "   Executando: ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i '$KEY_FILE' ubuntu@$SERVER_IP 'echo Conexao SSH OK'" -ForegroundColor Gray
    
    $SSH_TEST = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $KEY_FILE ubuntu@$SERVER_IP "echo 'Conexao SSH OK'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Conexao SSH bem-sucedida!" -ForegroundColor Green
        Write-Host "   Resposta: $SSH_TEST" -ForegroundColor Green
        
        # Testar comandos básicos
        Write-Host ""
        Write-Host "6. TESTANDO COMANDOS NO SERVIDOR..." -ForegroundColor Yellow
        
        Write-Host "   Verificando Nginx..." -ForegroundColor Gray
        $NGINX_CHECK = ssh -o ConnectTimeout=10 -i $KEY_FILE ubuntu@$SERVER_IP "which nginx && nginx -v 2>&1"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Nginx disponivel: $NGINX_CHECK" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Nginx nao instalado" -ForegroundColor Red
            Write-Host "   Execute no servidor: sudo apt update && sudo apt install nginx" -ForegroundColor Yellow
        }
        
        Write-Host "   Verificando aplicacao..." -ForegroundColor Gray
        $APP_CHECK = ssh -o ConnectTimeout=10 -i $KEY_FILE ubuntu@$SERVER_IP "pm2 status | grep pli || echo 'App nao encontrada'"
        Write-Host "   Status da aplicacao: $APP_CHECK" -ForegroundColor Gray
        
    } else {
        Write-Host "   ❌ Falha na conexao SSH" -ForegroundColor Red
        Write-Host ""
        Write-Host "DIAGNOSTICO AVANCADO:" -ForegroundColor Yellow
        Write-Host "===================" -ForegroundColor Yellow
        Write-Host "Execute o comando abaixo para debug detalhado:" -ForegroundColor White
        Write-Host "ssh -v -i '$KEY_FILE' ubuntu@$SERVER_IP" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Possiveis problemas:" -ForegroundColor Yellow
        Write-Host "- Chave SSH incorreta ou corrompida" -ForegroundColor White
        Write-Host "- Servidor AWS parado ou inacessivel" -ForegroundColor White
        Write-Host "- Security Group bloqueando SSH (porta 22)" -ForegroundColor White
        Write-Host "- Usuario 'ubuntu' nao existe ou chave nao autorizada" -ForegroundColor White
    }
    
} catch {
    Write-Host "   ❌ Erro na execucao do SSH: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "DIAGNOSTICO CONCLUIDO" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "Se todos os testes passaram, voce pode executar:" -ForegroundColor Yellow
Write-Host ".\configure-hostname-nginx.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
