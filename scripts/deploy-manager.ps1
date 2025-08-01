# SIGMA-PLI | Módulo de Gerenciamento de Cadastros
# Script PowerShell para Deploy/Update na AWS EC2
# ===============================================

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "first-deploy", "update", "status", "logs", "backup", "rollback", "test", "help")]
    [string]$Command = "deploy"
)

# Configurações (EDITE CONFORME NECESSÁRIO)
$EC2_HOST = "54.237.45.153"  # IP ou hostname da instância EC2
$EC2_USER = "ubuntu"
$KEY_FILE = "C:\Users\vinic\pli_cadastros\pli-ec2-key.pem"  # Caminho para sua chave .pem
$APP_DIR = "/home/ubuntu/pli_cadastros"

# Cores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Green "[$timestamp] $message"
}

function Warn($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Yellow "[$timestamp] AVISO: $message"
}

function Error($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Red "[$timestamp] ERRO: $message"
    exit 1
}

# Função para verificar configurações
function Check-Config {
    if ([string]::IsNullOrEmpty($EC2_HOST)) {
        Error "Configure a variável EC2_HOST no início deste script"
    }
    
    if ([string]::IsNullOrEmpty($KEY_FILE)) {
        Error "Configure a variável KEY_FILE no início deste script"
    }
    
    if (!(Test-Path $KEY_FILE)) {
        Error "Arquivo de chave não encontrado: $KEY_FILE"
    }
    
    # Verificar se ssh está disponível
    if (!(Get-Command ssh -ErrorAction SilentlyContinue)) {
        Error "SSH não está disponível. Instale o OpenSSH ou use WSL."
    }
}

# Função para testar conexão SSH
function Test-Connection {
    Log "🔐 Testando conexão SSH..."
    
    $sshTest = ssh -i $KEY_FILE -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'Conexão SSH OK'" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Log "✅ Conexão SSH estabelecida com sucesso"
    } else {
        Error "❌ Não foi possível conectar via SSH. Verifique:`n- IP/hostname da EC2`n- Arquivo de chave`n- Security Groups da EC2"
    }
}

# Função para fazer commit e push das mudanças
function Commit-AndPush {
    Log "📝 Verificando mudanças no Git..."
    
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrEmpty($gitStatus)) {
        Log "ℹ️ Nenhuma mudança local detectada"
        return
    }
    
    Log "📋 Mudanças detectadas:"
    git status --short
    
    $commit = Read-Host "`nDeseja fazer commit dessas mudanças? (y/N)"
    
    if ($commit -match "^[Yy]$") {
        $commitMsg = Read-Host "Digite a mensagem do commit"
        
        if ([string]::IsNullOrEmpty($commitMsg)) {
            $commitMsg = "Deploy automático - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
        
        Log "📤 Fazendo commit e push..."
        git add .
        git commit -m $commitMsg
        git push origin master
        Log "✅ Código enviado para repositório"
    } else {
        Warn "⚠️ Continuando sem fazer commit. Mudanças locais não serão enviadas."
    }
}

# Função para enviar script de deploy para servidor
function Upload-DeployScript {
    Log "📤 Enviando script de deploy para servidor..."
    scp -i $KEY_FILE scripts/deploy-update.sh "$EC2_USER@$EC2_HOST":/tmp/
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "chmod +x /tmp/deploy-update.sh"
}

# Função para executar deploy no servidor
function Execute-Deploy($deployType = "update") {
    Log "🚀 Executando deploy no servidor..."
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "/tmp/deploy-update.sh $deployType"
}

# Função para verificar logs da aplicação
function Check-Logs {
    Log "📋 Verificando logs da aplicação..."
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "cd $APP_DIR && pm2 logs pli-cadastros --lines 20"
}

# Função para verificar status da aplicação
function Check-Status {
    Log "📊 Verificando status da aplicação..."
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "cd $APP_DIR && pm2 status"
}

# Função para backup remoto
function Create-Backup {
    Log "📦 Criando backup no servidor..."
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "/tmp/deploy-update.sh backup"
}

# Função para rollback
function Start-Rollback {
    Log "🔄 Iniciando rollback..."
    
    # Listar backups disponíveis
    Log "📋 Backups disponíveis:"
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" "ls -la /home/ubuntu/backups/ | grep pli-backup"
    
    $backupName = Read-Host "`nDigite o nome do backup para rollback (ou ENTER para cancelar)"
    
    if ([string]::IsNullOrEmpty($backupName)) {
        Log "ℹ️ Rollback cancelado"
        return
    }
    
    $rollbackScript = @"
cd /home/ubuntu

# Parar aplicação
pm2 stop pli-cadastros || true

# Backup da versão atual
if [ -d "$APP_DIR" ]; then
    mv "$APP_DIR" "${APP_DIR}_before_rollback_`$(date +%Y%m%d_%H%M%S)"
fi

# Restaurar backup
cp -r "backups/$backupName" "$APP_DIR"
cd "$APP_DIR"

# Reinstalar dependências
npm install --production

# Reiniciar aplicação
pm2 restart pli-cadastros || pm2 start ecosystem.config.js
"@
    
    ssh -i $KEY_FILE "$EC2_USER@$EC2_HOST" $rollbackScript
    Log "✅ Rollback concluído"
}

# Função de ajuda
function Show-Help {
    Write-ColorOutput Cyan @"
SIGMA-PLI | Script de Deploy e Gerenciamento
============================================

Uso: .\deploy-manager.ps1 [COMANDO]

Comandos disponíveis:
  deploy       - Deploy/update padrão (default)
  first-deploy - Primeira instalação completa
  update       - Atualização da aplicação
  status       - Verificar status da aplicação
  logs         - Ver logs da aplicação
  backup       - Criar backup no servidor
  rollback     - Voltar para backup anterior
  test         - Testar conexão SSH
  help         - Mostrar esta ajuda

Configuração necessária:
  1. Edite as variáveis EC2_HOST e KEY_FILE no início do script
  2. Certifique-se que sua chave SSH está correta
  3. Configure o Security Group da EC2 para permitir SSH (porta 22)
  4. Tenha o OpenSSH instalado no Windows

"@
}

# Verificar se está no diretório correto
if (!(Test-Path "package.json") -or !(Test-Path "server.js")) {
    Error "Execute este script na raiz do projeto PLI Cadastros"
}

# Banner
Write-ColorOutput Blue @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SIGMA-PLI | Deploy Manager v1.0                          ║
║                  Módulo de Gerenciamento de Cadastros                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@

# Executar comando
switch ($Command) {
    "help" {
        Show-Help
    }
    "test" {
        Check-Config
        Test-Connection
        Log "✅ Teste de conexão concluído"
    }
    "first-deploy" {
        Check-Config
        Test-Connection
        Commit-AndPush
        Upload-DeployScript
        Execute-Deploy "first-deploy"
        Check-Status
    }
    "deploy" {
        Check-Config
        Test-Connection
        Commit-AndPush
        Upload-DeployScript
        Execute-Deploy "update"
        Check-Status
    }
    "update" {
        Check-Config
        Test-Connection
        Commit-AndPush
        Upload-DeployScript
        Execute-Deploy "update"
        Check-Status
    }
    "status" {
        Check-Config
        Test-Connection
        Check-Status
    }
    "logs" {
        Check-Config
        Test-Connection
        Check-Logs
    }
    "backup" {
        Check-Config
        Test-Connection
        Create-Backup
    }
    "rollback" {
        Check-Config
        Test-Connection
        Start-Rollback
        Check-Status
    }
    default {
        Error "Comando desconhecido: $Command`nUse '.\deploy-manager.ps1 help' para ver os comandos disponíveis"
    }
}
