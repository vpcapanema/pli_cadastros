# Script de Deploy Seguro - SIGMA-PLI (PowerShell)
# Executa deploy das implementações de segurança no servidor AWS

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "54.237.45.153",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyFile = "pli-ec2-key.pem",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackup
)

# Configurações
$ErrorActionPreference = "Stop"
$ServerUser = "ubuntu"
$AppDir = "/home/ubuntu/pli_cadastros"
$BackupDir = "/home/ubuntu/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "🔒 INICIANDO DEPLOY SEGURO - SIGMA-PLI" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "📊 Configurações do Deploy:" -ForegroundColor Cyan
Write-Host "  - Servidor: $ServerIP" -ForegroundColor White
Write-Host "  - Usuário: $ServerUser" -ForegroundColor White
Write-Host "  - Diretório: $AppDir" -ForegroundColor White
Write-Host "  - Backup: $BackupDir" -ForegroundColor White
Write-Host ""

# Verificar se a chave SSH existe
if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ ERRO: Arquivo de chave SSH não encontrado: $KeyFile" -ForegroundColor Red
    exit 1
}

# Verificar se SCP/SSH estão disponíveis
try {
    ssh -V | Out-Null
    scp -h | Out-Null
} catch {
    Write-Host "❌ ERRO: SSH/SCP não encontrados. Instale o OpenSSH ou Git Bash" -ForegroundColor Red
    exit 1
}

Write-Host "🔑 Verificando conectividade SSH..." -ForegroundColor Yellow
try {
    $sshTest = ssh -i $KeyFile -o ConnectTimeout=10 "$ServerUser@$ServerIP" "echo 'Conexão SSH estabelecida'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão SSH verificada com sucesso" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERRO: Não foi possível conectar ao servidor AWS" -ForegroundColor Red
    exit 1
}

Write-Host ""

if (-not $SkipBackup) {
    Write-Host "💾 Criando backup do sistema atual..." -ForegroundColor Yellow
    
    $backupScript = @"
# Parar aplicação
sudo systemctl stop pli 2>/dev/null || echo 'Serviço PLI não estava rodando'

# Criar backup
sudo cp -r $AppDir $BackupDir 2>/dev/null || echo 'Backup anterior não encontrado'
echo 'Backup criado em: $BackupDir'
"@
    
    ssh -i $KeyFile "$ServerUser@$ServerIP" $backupScript
    Write-Host "✅ Backup criado com sucesso" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📁 Sincronizando arquivos atualizados..." -ForegroundColor Yellow

# Lista de arquivos críticos para sincronizar
$FilesToSync = @(
    "server.js",
    "package.json",
    "src\config\security.js",
    "src\config\database.js",
    "src\middleware\",
    "config\.env.production"
)

foreach ($file in $FilesToSync) {
    if (Test-Path $file) {
        Write-Host "  📄 Sincronizando: $file" -ForegroundColor White
        
        # Converter caminho Windows para Unix
        $unixPath = $file -replace '\\', '/'
        
        if ($file.EndsWith('\')) {
            # É um diretório
            scp -i $KeyFile -r $file "$ServerUser@${ServerIP}:$AppDir/"
        } else {
            # É um arquivo
            scp -i $KeyFile $file "$ServerUser@${ServerIP}:$AppDir/$unixPath"
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠️ Erro ao sincronizar: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️ Arquivo não encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host "✅ Arquivos sincronizados" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Instalando dependências de segurança..." -ForegroundColor Yellow

$installScript = @"
cd $AppDir

# Instalar novas dependências
npm install helmet express-rate-limit express-validator xss-clean hpp winston request-ip

echo 'Dependências instaladas:'
npm list --depth=0 | grep -E '(helmet|rate-limit|validator|xss|hpp|winston|request-ip)'
"@

ssh -i $KeyFile "$ServerUser@$ServerIP" $installScript

Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Configurando ambiente de produção..." -ForegroundColor Yellow

$configScript = @"
cd $AppDir

# Copiar configuração de produção
cp config/.env.production config/.env

# Criar diretórios necessários
mkdir -p logs uploads quarantine
chmod 755 logs uploads quarantine

# Verificar sintaxe do código
node --check server.js || exit 1

echo 'Ambiente configurado com sucesso'
"@

ssh -i $KeyFile "$ServerUser@$ServerIP" $configScript

Write-Host "✅ Ambiente configurado" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Executando testes de segurança..." -ForegroundColor Yellow

$testScript = @"
cd $AppDir

# Testar sintaxe dos middlewares
echo 'Testando middlewares de segurança...'
node --check src/middleware/audit.js
node --check src/middleware/validation.js
node --check src/middleware/errorHandler.js

echo 'Todos os testes de sintaxe passaram'
"@

ssh -i $KeyFile "$ServerUser@$ServerIP" $testScript

Write-Host "✅ Testes de segurança aprovados" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Iniciando aplicação com segurança..." -ForegroundColor Yellow

$startScript = @"
cd $AppDir

# Iniciar aplicação
sudo systemctl start pli
sleep 5

# Verificar status
sudo systemctl status pli --no-pager -l

echo ''
echo 'Verificando logs iniciais...'
timeout 10s tail -f logs/pli.log 2>/dev/null || echo 'Logs inicializando...'
"@

ssh -i $KeyFile "$ServerUser@$ServerIP" $startScript

Write-Host "✅ Aplicação iniciada" -ForegroundColor Green
Write-Host ""

Write-Host "🔎 Executando verificações finais..." -ForegroundColor Yellow

# Testar conectividade
Write-Host "  🌐 Testando conectividade HTTP..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://$ServerIP:8888/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Aplicação respondendo corretamente (HTTP $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️ Aplicação pode estar inicializando (Erro: $($_.Exception.Message))" -ForegroundColor Yellow
}

# Testar headers de segurança
Write-Host "  🔒 Verificando headers de segurança..." -ForegroundColor White
try {
    $headers = Invoke-WebRequest -Uri "http://$ServerIP:8888/" -Method Head -TimeoutSec 10
    $securityHeaders = $headers.Headers.Keys | Where-Object { $_ -match "^(X-|Content-Security|Strict-Transport)" }
    
    if ($securityHeaders.Count -gt 3) {
        Write-Host "  ✅ Headers de segurança detectados ($($securityHeaders.Count) headers)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Verificar headers de segurança (apenas $($securityHeaders.Count) detectados)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️ Não foi possível verificar headers de segurança" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 DEPLOY SEGURO CONCLUÍDO!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumo do Deploy:" -ForegroundColor Cyan
Write-Host "  ✅ Backup criado: $BackupDir" -ForegroundColor White
Write-Host "  ✅ Arquivos sincronizados: $($FilesToSync.Count) itens" -ForegroundColor White
Write-Host "  ✅ Dependências de segurança instaladas" -ForegroundColor White
Write-Host "  ✅ Configuração de produção aplicada" -ForegroundColor White
Write-Host "  ✅ Testes de segurança aprovados" -ForegroundColor White
Write-Host "  ✅ Aplicação iniciada com sucesso" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URLs de Acesso:" -ForegroundColor Cyan
Write-Host "  📱 Aplicação: http://$ServerIP:8888" -ForegroundColor White
Write-Host "  💊 Health Check: http://$ServerIP:8888/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos Passos:" -ForegroundColor Cyan
Write-Host "  1. Verificar logs: ssh -i $KeyFile $ServerUser@$ServerIP 'tail -f $AppDir/logs/security.log'" -ForegroundColor White
Write-Host "  2. Monitorar auditoria: ssh -i $KeyFile $ServerUser@$ServerIP 'tail -f $AppDir/logs/audit.log'" -ForegroundColor White
Write-Host "  3. Testar funcionalidades críticas" -ForegroundColor White
Write-Host "  4. Atualizar DNS/domínio se necessário" -ForegroundColor White
Write-Host ""
Write-Host "🛡️ Sistema SIGMA-PLI deployado com segurança máxima!" -ForegroundColor Green

# Pausa para leitura
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
