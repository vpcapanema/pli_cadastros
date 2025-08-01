# SIGMA-PLI | Script para Criar Instância EC2 Automaticamente
# =========================================================

param(
    [string]$InstanceName = "pli-cadastros-server",
    [string]$KeyName = "pli-cadastros-key",
    [string]$InstanceType = "t2.micro",
    [string]$Region = "us-east-1"
)

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

# Banner
Write-ColorOutput Blue @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SIGMA-PLI | EC2 Instance Creator                          ║
║                  Módulo de Gerenciamento de Cadastros                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@

# Verificar se AWS CLI está instalado
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Error "AWS CLI não está instalado. Instale em: https://aws.amazon.com/cli/"
}

# Verificar credenciais AWS
Log "🔐 Verificando credenciais AWS..."
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Log "✅ Logado como: $($identity.Arn)"
} catch {
    Error "❌ Credenciais AWS inválidas. Execute: aws configure"
}

# Configurar região
Log "🌍 Configurando região: $Region"
$env:AWS_DEFAULT_REGION = $Region

# Verificar se key pair já existe
Log "🔑 Verificando key pair..."
try {
    $existingKey = aws ec2 describe-key-pairs --key-names $KeyName --output json 2>$null | ConvertFrom-Json
    if ($existingKey) {
        Warn "Key pair '$KeyName' já existe. Usando existente."
    }
} catch {
    Log "📝 Criando novo key pair: $KeyName"
    
    # Criar key pair
    $keyMaterial = aws ec2 create-key-pair --key-name $KeyName --output json | ConvertFrom-Json
    
    # Salvar chave privada
    $keyPath = "$PWD\$KeyName.pem"
    $keyMaterial.KeyMaterial | Out-File -FilePath $keyPath -Encoding ASCII
    
    Log "✅ Key pair criado e salvo em: $keyPath"
    Log "⚠️  IMPORTANTE: Guarde esta chave em local seguro!"
}

# Criar Security Group
Log "🛡️ Criando Security Group..."
$sgName = "pli-cadastros-sg"

try {
    # Verificar se SG já existe
    $existingSg = aws ec2 describe-security-groups --group-names $sgName --output json 2>$null | ConvertFrom-Json
    if ($existingSg) {
        $sgId = $existingSg.SecurityGroups[0].GroupId
        Warn "Security Group '$sgName' já existe. ID: $sgId"
    }
} catch {
    # Criar novo Security Group
    $sgResult = aws ec2 create-security-group --group-name $sgName --description "PLI Cadastros Security Group" --output json | ConvertFrom-Json
    $sgId = $sgResult.GroupId
    
    Log "✅ Security Group criado: $sgId"
    
    # Obter IP público atual
    try {
        $myIp = (Invoke-WebRequest -Uri "https://ipinfo.io/ip" -UseBasicParsing).Content.Trim()
        Log "📍 Seu IP público: $myIp"
    } catch {
        $myIp = "0.0.0.0"
        Warn "Não foi possível detectar seu IP. Usando 0.0.0.0/0 (menos seguro)"
    }
    
    # Adicionar regras de entrada
    Log "🔧 Configurando regras de firewall..."
    
    # SSH (22) - Apenas seu IP
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr "$myIp/32" | Out-Null
    
    # HTTP (80) - Público
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr "0.0.0.0/0" | Out-Null
    
    # HTTPS (443) - Público
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr "0.0.0.0/0" | Out-Null
    
    # Node.js (3000) - Público (temporário)
    aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3000 --cidr "0.0.0.0/0" | Out-Null
    
    Log "✅ Regras de firewall configuradas"
}

# Obter AMI ID mais recente do Ubuntu 22.04
Log "🔍 Buscando AMI mais recente do Ubuntu 22.04..."
$amiResult = aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" --output text

if (!$amiResult) {
    Error "❌ Não foi possível encontrar AMI do Ubuntu 22.04"
}

Log "✅ AMI encontrada: $amiResult"

# Criar instância EC2
Log "🚀 Criando instância EC2..."
$instanceResult = aws ec2 run-instances --image-id $amiResult --count 1 --instance-type $InstanceType --key-name $KeyName --security-group-ids $sgId --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]" --output json | ConvertFrom-Json

$instanceId = $instanceResult.Instances[0].InstanceId

Log "✅ Instância criada: $instanceId"
Log "⏳ Aguardando instância ficar disponível..."

# Aguardar instância ficar running
do {
    Start-Sleep -Seconds 10
    $instanceState = aws ec2 describe-instances --instance-ids $instanceId --query "Reservations[0].Instances[0].State.Name" --output text
    Write-Host "." -NoNewline
} while ($instanceState -ne "running")

Write-Host ""
Log "✅ Instância está rodando!"

# Obter IP público
$publicIp = aws ec2 describe-instances --instance-ids $instanceId --query "Reservations[0].Instances[0].PublicIpAddress" --output text

Log "🌐 IP Público: $publicIp"

# Criar Elastic IP (opcional)
$createEip = Read-Host "`n🔗 Deseja criar um Elastic IP (IP fixo)? (y/N)"
if ($createEip -match "^[Yy]$") {
    Log "📌 Criando Elastic IP..."
    $eipResult = aws ec2 allocate-address --domain vpc --output json | ConvertFrom-Json
    $allocationId = $eipResult.AllocationId
    $elasticIp = $eipResult.PublicIp
    
    # Associar EIP à instância
    aws ec2 associate-address --instance-id $instanceId --allocation-id $allocationId | Out-Null
    
    Log "✅ Elastic IP criado e associado: $elasticIp"
    $finalIp = $elasticIp
} else {
    $finalIp = $publicIp
}

# Aguardar SSH ficar disponível
Log "⏳ Aguardando SSH ficar disponível..."
do {
    Start-Sleep -Seconds 10
    $sshTest = Test-NetConnection -ComputerName $finalIp -Port 22 -InformationLevel Quiet -WarningAction SilentlyContinue
    Write-Host "." -NoNewline
} while (!$sshTest)

Write-Host ""
Log "✅ SSH disponível!"

# Salvar informações em arquivo
$infoFile = "ec2-instance-info.txt"
$instanceInfo = @"
SIGMA-PLI | Informações da Instância EC2
========================================

Instance ID: $instanceId
Instance Type: $InstanceType
AMI ID: $amiResult
Key Pair: $KeyName
Security Group: $sgName ($sgId)
Public IP: $finalIp
Region: $Region

Comandos para conectar:
ssh -i $KeyName.pem ubuntu@$finalIp

Comandos para gerenciar:
aws ec2 describe-instances --instance-ids $instanceId
aws ec2 start-instances --instance-ids $instanceId
aws ec2 stop-instances --instance-ids $instanceId
aws ec2 terminate-instances --instance-ids $instanceId

Criado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$instanceInfo | Out-File -FilePath $infoFile -Encoding UTF8
Log "📄 Informações salvas em: $infoFile"

# Atualizar script de deploy
if (Test-Path "scripts\deploy-manager.ps1") {
    Log "🔧 Atualizando script de deploy..."
    
    $deployScript = Get-Content "scripts\deploy-manager.ps1" -Raw
    $deployScript = $deployScript -replace '\$EC2_HOST = ""', "`$EC2_HOST = `"$finalIp`""
    $deployScript = $deployScript -replace '\$KEY_FILE = ""', "`$KEY_FILE = `"$PWD\$KeyName.pem`""
    
    $deployScript | Out-File -FilePath "scripts\deploy-manager.ps1" -Encoding UTF8
    Log "✅ Script de deploy atualizado"
}

# Resumo final
Write-ColorOutput Cyan @"

🎉 INSTÂNCIA EC2 CRIADA COM SUCESSO!
====================================

📋 Resumo:
- Instance ID: $instanceId
- IP Público: $finalIp
- Key Pair: $KeyName.pem
- Security Group: $sgName

🔧 Próximos passos:
1. Conectar via SSH: ssh -i $KeyName.pem ubuntu@$finalIp
2. Executar deploy: .\scripts\deploy-manager.ps1 first-deploy
3. Configurar banco RDS (se necessário)

📚 Documentação completa: deploy\DEPLOY-COMPLETO-AWS.md

"@

# Perguntar se quer conectar agora
$connectNow = Read-Host "🔗 Deseja conectar via SSH agora? (y/N)"
if ($connectNow -match "^[Yy]$") {
    Log "🔐 Conectando via SSH..."
    ssh -i "$KeyName.pem" "ubuntu@$finalIp"
}

Log "✅ Script concluído!"