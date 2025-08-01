# SIGMA-PLI | Script Completo de Deploy na AWS
# ============================================

param(
    [Parameter(Position=0)]
    [ValidateSet("full", "ec2-only", "rds-only", "deploy-only", "status", "help")]
    [string]$Action = "full"
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

function Show-Help {
    Write-ColorOutput Cyan @"
SIGMA-PLI | Script Completo de Deploy na AWS
============================================

Uso: .\scripts\deploy-complete.ps1 [AÇÃO]

Ações disponíveis:
  full        - Deploy completo (EC2 + RDS + Aplicação) [padrão]
  ec2-only    - Criar apenas instância EC2
  rds-only    - Criar apenas banco RDS
  deploy-only - Deploy apenas da aplicação (requer EC2 existente)
  status      - Verificar status dos recursos
  help        - Mostrar esta ajuda

Exemplos:
  .\scripts\deploy-complete.ps1 full
  .\scripts\deploy-complete.ps1 ec2-only
  .\scripts\deploy-complete.ps1 status

Pré-requisitos:
  - AWS CLI instalado e configurado
  - Conta AWS com Free Tier disponível
  - Git configurado (para deploy da aplicação)

"@
}

function Check-Prerequisites {
    Log "🔍 Verificando pré-requisitos..."
    
    # Verificar AWS CLI
    if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
        Error "AWS CLI não está instalado. Instale em: https://aws.amazon.com/cli/"
    }
    
    # Verificar credenciais AWS
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Log "✅ AWS CLI configurado - Usuário: $($identity.Arn)"
    } catch {
        Error "❌ Credenciais AWS inválidas. Execute: aws configure"
    }
    
    # Verificar se está no diretório correto
    if (!(Test-Path "package.json") -or !(Test-Path "server.js")) {
        Error "Execute este script na raiz do projeto PLI Cadastros"
    }
    
    # Verificar Git (para deploy)
    if ($Action -eq "full" -or $Action -eq "deploy-only") {
        if (!(Get-Command git -ErrorAction SilentlyContinue)) {
            Error "Git não está instalado. Necessário para deploy da aplicação."
        }
    }
    
    Log "✅ Todos os pré-requisitos atendidos"
}

function Show-CostEstimate {
    Write-ColorOutput Yellow @"
💰 ESTIMATIVA DE CUSTOS AWS (Free Tier)
=======================================

Recursos que serão criados:
┌─────────────────────────────────────────────────────────────┐
│ Recurso              │ Tipo           │ Custo/mês (USD)     │
├─────────────────────────────────────────────────────────────┤
│ EC2 Instance         │ t2.micro       │ $0 (Free Tier)     │
│ RDS PostgreSQL       │ db.t3.micro    │ $0 (Free Tier)     │
│ EBS Storage          │ 20 GB gp3      │ $0 (Free Tier)     │
│ RDS Storage          │ 20 GB          │ $0 (Free Tier)     │
│ Data Transfer        │ 15 GB/mês      │ $0 (Free Tier)     │
│ Elastic IP (opcional)│ 1 IP           │ $0 (se associado)  │
├─────────────────────────────────────────────────────────────┤
│ TOTAL ESTIMADO       │                │ $0-5/mês           │
└─────────────────────────────────────────────────────────────┘

⚠️  IMPORTANTE:
- Free Tier válido por 12 meses após criação da conta AWS
- Após Free Tier: ~$15-25/mês
- Monitore uso no AWS Billing Dashboard

"@
    
    $confirm = Read-Host "Deseja continuar com o deploy? (y/N)"
    if ($confirm -notmatch "^[Yy]$") {
        Log "❌ Deploy cancelado pelo usuário"
        exit 0
    }
}

function Create-EC2-Instance {
    Log "🖥️ Iniciando criação da instância EC2..."
    
    if (Test-Path "scripts\create-ec2-instance.ps1") {
        & "scripts\create-ec2-instance.ps1"
        
        if ($LASTEXITCODE -eq 0) {
            Log "✅ Instância EC2 criada com sucesso"
            return $true
        } else {
            Error "❌ Falha na criação da instância EC2"
        }
    } else {
        Error "❌ Script create-ec2-instance.ps1 não encontrado"
    }
}

function Create-RDS-Database {
    Log "🗄️ Iniciando criação do banco RDS..."
    
    if (Test-Path "scripts\create-rds-database.ps1") {
        & "scripts\create-rds-database.ps1"
        
        if ($LASTEXITCODE -eq 0) {
            Log "✅ Banco RDS criado com sucesso"
            return $true
        } else {
            Error "❌ Falha na criação do banco RDS"
        }
    } else {
        Error "❌ Script create-rds-database.ps1 não encontrado"
    }
}

function Deploy-Application {
    Log "🚀 Iniciando deploy da aplicação..."
    
    # Verificar se temos as informações da EC2
    if (!(Test-Path "ec2-instance-info.txt")) {
        Error "❌ Informações da instância EC2 não encontradas. Execute 'ec2-only' primeiro."
    }
    
    # Verificar se o script de deploy está configurado
    if (Test-Path "scripts\deploy-manager.ps1") {
        # Verificar se está configurado
        $deployScript = Get-Content "scripts\deploy-manager.ps1" -Raw
        if ($deployScript -match '\$EC2_HOST = ""') {
            Error "❌ Script deploy-manager.ps1 não está configurado. Execute 'ec2-only' primeiro."
        }
        
        Log "📤 Executando deploy da aplicação..."
        & "scripts\deploy-manager.ps1" "first-deploy"
        
        if ($LASTEXITCODE -eq 0) {
            Log "✅ Aplicação deployada com sucesso"
            return $true
        } else {
            Error "❌ Falha no deploy da aplicação"
        }
    } else {
        Error "❌ Script deploy-manager.ps1 não encontrado"
    }
}

function Show-Status {
    Log "📊 Verificando status dos recursos AWS..."
    
    # Status EC2
    try {
        $ec2Instances = aws ec2 describe-instances --filters "Name=tag:Name,Values=pli-cadastros-server" "Name=instance-state-name,Values=running,stopped,pending" --query "Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress,InstanceType]" --output table
        
        if ($ec2Instances) {
            Write-ColorOutput Cyan "`n🖥️ INSTÂNCIAS EC2:"
            Write-Output $ec2Instances
        } else {
            Write-ColorOutput Yellow "⚠️ Nenhuma instância EC2 encontrada"
        }
    } catch {
        Write-ColorOutput Red "❌ Erro ao verificar instâncias EC2"
    }
    
    # Status RDS
    try {
        $rdsInstances = aws rds describe-db-instances --query "DBInstances[?contains(DBInstanceIdentifier, 'pli-cadastros')].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address,DBInstanceClass]" --output table
        
        if ($rdsInstances) {
            Write-ColorOutput Cyan "`n🗄️ INSTÂNCIAS RDS:"
            Write-Output $rdsInstances
        } else {
            Write-ColorOutput Yellow "⚠️ Nenhuma instância RDS encontrada"
        }
    } catch {
        Write-ColorOutput Red "❌ Erro ao verificar instâncias RDS"
    }
    
    # Verificar arquivos de informação locais
    if (Test-Path "ec2-instance-info.txt") {
        Write-ColorOutput Green "`n📄 Arquivo de informações EC2 encontrado"
    }
    
    if (Test-Path "rds-database-info.txt") {
        Write-ColorOutput Green "📄 Arquivo de informações RDS encontrado"
    }
    
    # Status da aplicação (se possível)
    if (Test-Path "scripts\deploy-manager.ps1") {
        $deployScript = Get-Content "scripts\deploy-manager.ps1" -Raw
        if ($deployScript -notmatch '\$EC2_HOST = ""') {
            Log "`n🔍 Verificando status da aplicação..."
            try {
                & "scripts\deploy-manager.ps1" "status"
            } catch {
                Warn "Não foi possível verificar status da aplicação"
            }
        }
    }
}

function Show-Summary {
    Write-ColorOutput Cyan @"

🎉 DEPLOY CONCLUÍDO COM SUCESSO!
================================

📋 Recursos criados:
✅ Instância EC2 (pli-cadastros-server)
✅ Banco RDS PostgreSQL (pli-cadastros-db)
✅ Security Groups configurados
✅ Aplicação deployada e rodando

📄 Arquivos gerados:
- ec2-instance-info.txt (informações da EC2)
- rds-database-info.txt (informações do RDS)
- .env (configurações da aplicação)

🔧 Comandos úteis:
# Verificar status
.\scripts\deploy-complete.ps1 status

# Deploy/update da aplicação
.\scripts\deploy-manager.ps1 update

# Conectar via SSH
ssh -i pli-cadastros-key.pem ubuntu@[IP-DA-EC2]

# Logs da aplicação
.\scripts\deploy-manager.ps1 logs

📚 Documentação completa:
- deploy\DEPLOY-COMPLETO-AWS.md
- deploy\GUIA-IMPLEMENTACAO.md

🌐 Próximos passos:
1. Configurar domínio personalizado
2. Configurar SSL/HTTPS
3. Configurar monitoramento
4. Configurar backup automatizado

"@
}

# Banner principal
Write-ColorOutput Blue @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SIGMA-PLI | Deploy Completo AWS                          ║
║                  Módulo de Gerenciamento de Cadastros                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@

# Executar ação
switch ($Action) {
    "help" {
        Show-Help
    }
    
    "status" {
        Check-Prerequisites
        Show-Status
    }
    
    "ec2-only" {
        Check-Prerequisites
        Show-CostEstimate
        Create-EC2-Instance
        Log "✅ Criação da instância EC2 concluída"
    }
    
    "rds-only" {
        Check-Prerequisites
        Show-CostEstimate
        Create-RDS-Database
        Log "✅ Criação do banco RDS concluída"
    }
    
    "deploy-only" {
        Check-Prerequisites
        Deploy-Application
        Log "✅ Deploy da aplicação concluído"
    }
    
    "full" {
        Check-Prerequisites
        Show-CostEstimate
        
        Log "🚀 Iniciando deploy completo..."
        
        # Passo 1: Criar EC2
        Log "`n📍 PASSO 1/3: Criando instância EC2..."
        Create-EC2-Instance
        
        # Passo 2: Criar RDS
        Log "`n📍 PASSO 2/3: Criando banco RDS..."
        Create-RDS-Database
        
        # Aguardar um pouco para tudo estar pronto
        Log "`n⏳ Aguardando recursos ficarem totalmente disponíveis..."
        Start-Sleep -Seconds 60
        
        # Passo 3: Deploy da aplicação
        Log "`n📍 PASSO 3/3: Fazendo deploy da aplicação..."
        Deploy-Application
        
        Show-Summary
    }
    
    default {
        Error "Ação desconhecida: $Action`nUse '.\scripts\deploy-complete.ps1 help' para ver as opções disponíveis"
    }
}

Log "✅ Script concluído!"