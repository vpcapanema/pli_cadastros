# SIGMA-PLI | Script para Criar Banco RDS PostgreSQL
# =================================================

param(
    [string]$DBInstanceIdentifier = "pli-cadastros-db",
    [string]$DBName = "pli_db",
    [string]$MasterUsername = "pli_admin",
    [string]$MasterPassword = "",
    [string]$DBInstanceClass = "db.t3.micro",
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

# Função para gerar senha segura
function Generate-SecurePassword {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $password = ""
    for ($i = 0; $i -lt 16; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

# Banner
Write-ColorOutput Blue @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SIGMA-PLI | RDS Database Creator                          ║
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

# Gerar senha se não fornecida
if ([string]::IsNullOrEmpty($MasterPassword)) {
    $MasterPassword = Generate-SecurePassword
    Log "🔑 Senha gerada automaticamente (será salva no arquivo de configuração)"
}

# Verificar se instância RDS já existe
Log "🔍 Verificando se instância RDS já existe..."
try {
    $existingDb = aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier --output json 2>$null | ConvertFrom-Json
    if ($existingDb) {
        $dbEndpoint = $existingDb.DBInstances[0].Endpoint.Address
        Warn "Instância RDS '$DBInstanceIdentifier' já existe!"
        Log "📍 Endpoint: $dbEndpoint"
        
        $useExisting = Read-Host "Deseja usar a instância existente? (y/N)"
        if ($useExisting -match "^[Yy]$") {
            Log "✅ Usando instância RDS existente"
            
            # Salvar informações
            $dbInfo = @"
SIGMA-PLI | Informações do Banco RDS (Existente)
===============================================

DB Instance Identifier: $DBInstanceIdentifier
Endpoint: $dbEndpoint
Database Name: $DBName
Username: $MasterUsername
Password: [usar senha existente]
Port: 5432
Engine: PostgreSQL

Connection String:
postgresql://$MasterUsername`:[PASSWORD]@$dbEndpoint`:5432/$DBName

Configuração .env:
DB_HOST=$dbEndpoint
DB_PORT=5432
DB_NAME=$DBName
DB_USER=$MasterUsername
DB_PASSWORD=[sua-senha-existente]

Verificado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
            
            $dbInfo | Out-File -FilePath "rds-database-info.txt" -Encoding UTF8
            Log "📄 Informações salvas em: rds-database-info.txt"
            return
        }
    }
} catch {
    Log "✅ Nenhuma instância RDS existente encontrada"
}

# Obter VPC padrão
Log "🌐 Obtendo informações da VPC..."
$defaultVpc = aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text

if (!$defaultVpc -or $defaultVpc -eq "None") {
    Error "❌ VPC padrão não encontrada. Crie uma VPC primeiro."
}

Log "✅ VPC padrão: $defaultVpc"

# Criar Security Group para RDS
Log "🛡️ Criando Security Group para RDS..."
$dbSgName = "pli-db-sg"

try {
    # Verificar se SG já existe
    $existingDbSg = aws ec2 describe-security-groups --group-names $dbSgName --output json 2>$null | ConvertFrom-Json
    if ($existingDbSg) {
        $dbSgId = $existingDbSg.SecurityGroups[0].GroupId
        Warn "Security Group '$dbSgName' já existe. ID: $dbSgId"
    }
} catch {
    # Criar novo Security Group para RDS
    $dbSgResult = aws ec2 create-security-group --group-name $dbSgName --description "PLI Cadastros Database Security Group" --vpc-id $defaultVpc --output json | ConvertFrom-Json
    $dbSgId = $dbSgResult.GroupId
    
    Log "✅ Security Group para RDS criado: $dbSgId"
    
    # Permitir acesso do Security Group da EC2
    $ec2SgId = ""
    try {
        $ec2Sg = aws ec2 describe-security-groups --group-names "pli-cadastros-sg" --output json | ConvertFrom-Json
        $ec2SgId = $ec2Sg.SecurityGroups[0].GroupId
        
        # Adicionar regra para permitir acesso da EC2
        aws ec2 authorize-security-group-ingress --group-id $dbSgId --protocol tcp --port 5432 --source-group $ec2SgId | Out-Null
        Log "✅ Acesso permitido do Security Group da EC2: $ec2SgId"
    } catch {
        Warn "Security Group da EC2 não encontrado. Permitindo acesso de qualquer lugar (menos seguro)"
        aws ec2 authorize-security-group-ingress --group-id $dbSgId --protocol tcp --port 5432 --cidr "0.0.0.0/0" | Out-Null
    }
}

# Criar subnet group
Log "🔧 Criando DB Subnet Group..."
$subnetGroupName = "pli-db-subnet-group"

try {
    # Verificar se subnet group já existe
    $existingSubnetGroup = aws rds describe-db-subnet-groups --db-subnet-group-name $subnetGroupName --output json 2>$null | ConvertFrom-Json
    if ($existingSubnetGroup) {
        Log "✅ DB Subnet Group '$subnetGroupName' já existe"
    }
} catch {
    # Obter subnets da VPC padrão
    $subnets = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$defaultVpc" --query "Subnets[].SubnetId" --output text
    $subnetList = $subnets -split "\s+"
    
    if ($subnetList.Count -lt 2) {
        Error "❌ Pelo menos 2 subnets são necessárias para RDS Multi-AZ"
    }
    
    # Criar subnet group
    aws rds create-db-subnet-group --db-subnet-group-name $subnetGroupName --db-subnet-group-description "PLI Cadastros DB Subnet Group" --subnet-ids $subnetList | Out-Null
    Log "✅ DB Subnet Group criado: $subnetGroupName"
}

# Criar instância RDS
Log "🗄️ Criando instância RDS PostgreSQL..."
Log "⏳ Isso pode levar 10-15 minutos..."

$createDbCommand = @(
    "aws", "rds", "create-db-instance",
    "--db-instance-identifier", $DBInstanceIdentifier,
    "--db-instance-class", $DBInstanceClass,
    "--engine", "postgres",
    "--engine-version", "15.4",
    "--master-username", $MasterUsername,
    "--master-user-password", $MasterPassword,
    "--allocated-storage", "20",
    "--storage-type", "gp3",
    "--db-name", $DBName,
    "--vpc-security-group-ids", $dbSgId,
    "--db-subnet-group-name", $subnetGroupName,
    "--backup-retention-period", "7",
    "--storage-encrypted",
    "--publicly-accessible",
    "--no-multi-az",
    "--no-auto-minor-version-upgrade",
    "--output", "json"
)

try {
    $dbResult = & $createDbCommand[0] $createDbCommand[1..($createDbCommand.Length-1)] | ConvertFrom-Json
    Log "✅ Instância RDS criada: $DBInstanceIdentifier"
} catch {
    Error "❌ Erro ao criar instância RDS: $($_.Exception.Message)"
}

# Aguardar instância ficar disponível
Log "⏳ Aguardando instância RDS ficar disponível..."
Log "📊 Status atual: creating"

do {
    Start-Sleep -Seconds 30
    try {
        $dbStatus = aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].DBInstanceStatus" --output text
        Write-Host "📊 Status: $dbStatus" -ForegroundColor Yellow
    } catch {
        $dbStatus = "unknown"
    }
} while ($dbStatus -ne "available")

Log "✅ Instância RDS disponível!"

# Obter endpoint
$dbEndpoint = aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].Endpoint.Address" --output text

Log "🌐 Endpoint do banco: $dbEndpoint"

# Salvar informações em arquivo
$dbInfo = @"
SIGMA-PLI | Informações do Banco RDS
====================================

DB Instance Identifier: $DBInstanceIdentifier
Endpoint: $dbEndpoint
Database Name: $DBName
Username: $MasterUsername
Password: $MasterPassword
Port: 5432
Engine: PostgreSQL 15.4
Instance Class: $DBInstanceClass
Storage: 20 GB (gp3)
Security Group: $dbSgName ($dbSgId)

Connection String:
postgresql://$MasterUsername:$MasterPassword@$dbEndpoint:5432/$DBName

Configuração .env:
DB_HOST=$dbEndpoint
DB_PORT=5432
DB_NAME=$DBName
DB_USER=$MasterUsername
DB_PASSWORD=$MasterPassword

Comandos úteis:
# Conectar via psql
psql -h $dbEndpoint -U $MasterUsername -d $DBName

# Testar conexão
telnet $dbEndpoint 5432

# Gerenciar via AWS CLI
aws rds describe-db-instances --db-instance-identifier $DBInstanceIdentifier
aws rds start-db-instance --db-instance-identifier $DBInstanceIdentifier
aws rds stop-db-instance --db-instance-identifier $DBInstanceIdentifier

Criado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$dbInfo | Out-File -FilePath "rds-database-info.txt" -Encoding UTF8
Log "📄 Informações salvas em: rds-database-info.txt"

# Atualizar arquivo .env se existir
if (Test-Path ".env") {
    Log "🔧 Atualizando arquivo .env..."
    
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "DB_HOST=.*", "DB_HOST=$dbEndpoint"
    $envContent = $envContent -replace "DB_PORT=.*", "DB_PORT=5432"
    $envContent = $envContent -replace "DB_NAME=.*", "DB_NAME=$DBName"
    $envContent = $envContent -replace "DB_USER=.*", "DB_USER=$MasterUsername"
    $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$MasterPassword"
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Log "✅ Arquivo .env atualizado"
} else {
    Log "📝 Criando arquivo .env..."
    
    $envTemplate = @"
# Database Configuration
DB_HOST=$dbEndpoint
DB_PORT=5432
DB_NAME=$DBName
DB_USER=$MasterUsername
DB_PASSWORD=$MasterPassword

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret-here

# Email Configuration (configure depois)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
"@
    
    $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
    Log "✅ Arquivo .env criado"
}

# Testar conexão (se psql estiver disponível)
if (Get-Command psql -ErrorAction SilentlyContinue) {
    $testConnection = Read-Host "`n🔗 Deseja testar a conexão com o banco? (y/N)"
    if ($testConnection -match "^[Yy]$") {
        Log "🔍 Testando conexão com o banco..."
        $env:PGPASSWORD = $MasterPassword
        psql -h $dbEndpoint -U $MasterUsername -d $DBName -c "SELECT version();"
        Remove-Item Env:PGPASSWORD
    }
} else {
    Warn "psql não está instalado. Instale PostgreSQL client para testar a conexão."
}

# Resumo final
Write-ColorOutput Cyan @"

🎉 BANCO RDS CRIADO COM SUCESSO!
================================

📋 Resumo:
- Instance ID: $DBInstanceIdentifier
- Endpoint: $dbEndpoint
- Database: $DBName
- Username: $MasterUsername
- Password: $MasterPassword

🔧 Próximos passos:
1. Configurar aplicação com as credenciais do banco
2. Executar migrations: npm run migrate
3. Inserir dados iniciais: npm run seed
4. Testar conexão da aplicação

📚 Informações completas salvas em: rds-database-info.txt

⚠️  IMPORTANTE: Guarde a senha em local seguro!

"@

Log "✅ Script concluído!"