# SIGMA-PLI | Script de Verificação de Deploy
# ==========================================

param(
    [string]$EC2_IP = "",
    [string]$RDS_ENDPOINT = ""
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
    Write-ColorOutput Green "[$timestamp] ✅ $message"
}

function Warn($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Yellow "[$timestamp] ⚠️ $message"
}

function Error($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Red "[$timestamp] ❌ $message"
}

function Test-Port($hostname, $port, $description) {
    try {
        $connection = Test-NetConnection -ComputerName $hostname -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Log "$description - Porta $port acessível"
            return $true
        } else {
            Error "$description - Porta $port não acessível"
            return $false
        }
    } catch {
        Error "$description - Erro ao testar porta $port"
        return $false
    }
}

function Test-HTTP($url, $description) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Log "$description - HTTP OK (Status: $($response.StatusCode))"
            return $true
        } else {
            Warn "$description - HTTP Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Error "$description - Não acessível via HTTP"
        return $false
    }
}

# Banner
Write-ColorOutput Blue @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SIGMA-PLI | Verificação de Deploy                        ║
║                  Módulo de Gerenciamento de Cadastros                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@

# Obter informações dos arquivos se não fornecidas
if ([string]::IsNullOrEmpty($EC2_IP)) {
    if (Test-Path "ec2-instance-info.txt") {
        $ec2Info = Get-Content "ec2-instance-info.txt" -Raw
        if ($ec2Info -match "Public IP: (.+)") {
            $EC2_IP = $matches[1].Trim()
            Log "IP da EC2 obtido do arquivo: $EC2_IP"
        }
    }
}

if ([string]::IsNullOrEmpty($RDS_ENDPOINT)) {
    if (Test-Path "rds-database-info.txt") {
        $rdsInfo = Get-Content "rds-database-info.txt" -Raw
        if ($rdsInfo -match "Endpoint: (.+)") {
            $RDS_ENDPOINT = $matches[1].Trim()
            Log "Endpoint do RDS obtido do arquivo: $RDS_ENDPOINT"
        }
    }
}

# Verificações
$allTests = @()

Write-ColorOutput Cyan "`n🔍 INICIANDO VERIFICAÇÕES...`n"

# 1. Verificar conectividade básica com EC2
if (![string]::IsNullOrEmpty($EC2_IP)) {
    Write-ColorOutput White "📡 Testando conectividade com EC2..."
    
    # Ping
    try {
        $ping = Test-Connection -ComputerName $EC2_IP -Count 2 -Quiet
        if ($ping) {
            Log "EC2 responde ao ping"
            $allTests += @{Test="EC2 Ping"; Status="OK"}
        } else {
            Error "EC2 não responde ao ping"
            $allTests += @{Test="EC2 Ping"; Status="FALHA"}
        }
    } catch {
        Error "Erro ao fazer ping para EC2"
        $allTests += @{Test="EC2 Ping"; Status="ERRO"}
    }
    
    # SSH (porta 22)
    $sshTest = Test-Port $EC2_IP 22 "SSH"
    $allTests += @{Test="SSH (22)"; Status=if($sshTest){"OK"}else{"FALHA"}}
    
    # HTTP (porta 80)
    $httpTest = Test-Port $EC2_IP 80 "HTTP"
    $allTests += @{Test="HTTP (80)"; Status=if($httpTest){"OK"}else{"FALHA"}}
    
    # HTTPS (porta 443)
    $httpsTest = Test-Port $EC2_IP 443 "HTTPS"
    $allTests += @{Test="HTTPS (443)"; Status=if($httpsTest){"OK"}else{"FALHA"}}
    
    # Node.js (porta 3000)
    $nodeTest = Test-Port $EC2_IP 3000 "Node.js"
    $allTests += @{Test="Node.js (3000)"; Status=if($nodeTest){"OK"}else{"FALHA"}}
    
} else {
    Warn "IP da EC2 não fornecido. Pulando testes de conectividade."
}

# 2. Verificar aplicação web
if (![string]::IsNullOrEmpty($EC2_IP)) {
    Write-ColorOutput White "`n🌐 Testando aplicação web..."
    
    # Testar HTTP
    $webTest = Test-HTTP "http://$EC2_IP" "Aplicação Web (HTTP)"
    $allTests += @{Test="Web App HTTP"; Status=if($webTest){"OK"}else{"FALHA"}}
    
    # Testar Node.js direto
    $nodeWebTest = Test-HTTP "http://$EC2_IP:3000" "Node.js Direto"
    $allTests += @{Test="Node.js Direto"; Status=if($nodeWebTest){"OK"}else{"FALHA"}}
}

# 3. Verificar banco RDS
if (![string]::IsNullOrEmpty($RDS_ENDPOINT)) {
    Write-ColorOutput White "`n🗄️ Testando banco RDS..."
    
    # PostgreSQL (porta 5432)
    $dbTest = Test-Port $RDS_ENDPOINT 5432 "PostgreSQL"
    $allTests += @{Test="PostgreSQL (5432)"; Status=if($dbTest){"OK"}else{"FALHA"}}
    
} else {
    Warn "Endpoint do RDS não fornecido. Pulando testes de banco."
}

# 4. Verificar recursos AWS via CLI
Write-ColorOutput White "`n☁️ Verificando recursos AWS..."

try {
    # Verificar instâncias EC2
    $ec2Instances = aws ec2 describe-instances --filters "Name=tag:Name,Values=pli-cadastros-server" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].InstanceId" --output text
    
    if ($ec2Instances -and $ec2Instances -ne "None") {
        Log "Instância EC2 encontrada e rodando: $ec2Instances"
        $allTests += @{Test="EC2 Status"; Status="OK"}
    } else {
        Error "Nenhuma instância EC2 rodando encontrada"
        $allTests += @{Test="EC2 Status"; Status="FALHA"}
    }
} catch {
    Error "Erro ao verificar instâncias EC2"
    $allTests += @{Test="EC2 Status"; Status="ERRO"}
}

try {
    # Verificar instâncias RDS
    $rdsInstances = aws rds describe-db-instances --query "DBInstances[?contains(DBInstanceIdentifier, 'pli-cadastros') && DBInstanceStatus=='available'].DBInstanceIdentifier" --output text
    
    if ($rdsInstances -and $rdsInstances -ne "None") {
        Log "Instância RDS encontrada e disponível: $rdsInstances"
        $allTests += @{Test="RDS Status"; Status="OK"}
    } else {
        Error "Nenhuma instância RDS disponível encontrada"
        $allTests += @{Test="RDS Status"; Status="FALHA"}
    }
} catch {
    Error "Erro ao verificar instâncias RDS"
    $allTests += @{Test="RDS Status"; Status="ERRO"}
}

# 5. Verificar arquivos locais
Write-ColorOutput White "`n📄 Verificando arquivos de configuração..."

$configFiles = @(
    @{File="ec2-instance-info.txt"; Description="Informações da EC2"},
    @{File="rds-database-info.txt"; Description="Informações do RDS"},
    @{File=".env"; Description="Variáveis de ambiente"},
    @{File="pli-cadastros-key.pem"; Description="Chave SSH"}
)

foreach ($config in $configFiles) {
    if (Test-Path $config.File) {
        Log "$($config.Description) - Arquivo encontrado"
        $allTests += @{Test=$config.Description; Status="OK"}
    } else {
        Warn "$($config.Description) - Arquivo não encontrado"
        $allTests += @{Test=$config.Description; Status="FALHA"}
    }
}

# 6. Resumo dos testes
Write-ColorOutput Cyan "`n📊 RESUMO DOS TESTES"
Write-ColorOutput Cyan "===================="

$okTests = ($allTests | Where-Object {$_.Status -eq "OK"}).Count
$failTests = ($allTests | Where-Object {$_.Status -eq "FALHA"}).Count
$errorTests = ($allTests | Where-Object {$_.Status -eq "ERRO"}).Count
$totalTests = $allTests.Count

Write-ColorOutput White "`nResultados:"
foreach ($test in $allTests) {
    $color = switch ($test.Status) {
        "OK" { "Green" }
        "FALHA" { "Red" }
        "ERRO" { "Yellow" }
        default { "White" }
    }
    
    $icon = switch ($test.Status) {
        "OK" { "✅" }
        "FALHA" { "❌" }
        "ERRO" { "⚠️" }
        default { "❓" }
    }
    
    Write-ColorOutput $color "$icon $($test.Test): $($test.Status)"
}

# Estatísticas
Write-ColorOutput White "`nEstatísticas:"
Write-ColorOutput Green "✅ Sucessos: $okTests"
Write-ColorOutput Red "❌ Falhas: $failTests"
Write-ColorOutput Yellow "⚠️ Erros: $errorTests"
Write-ColorOutput White "📊 Total: $totalTests"

# Avaliação geral
$successRate = [math]::Round(($okTests / $totalTests) * 100, 1)

Write-ColorOutput White "`n🎯 Taxa de Sucesso: $successRate%"

if ($successRate -ge 80) {
    Write-ColorOutput Green "`n🎉 DEPLOY VERIFICADO COM SUCESSO!"
    Write-ColorOutput Green "Sua aplicação está funcionando corretamente."
} elseif ($successRate -ge 60) {
    Write-ColorOutput Yellow "`n⚠️ DEPLOY PARCIALMENTE FUNCIONAL"
    Write-ColorOutput Yellow "Algumas funcionalidades podem não estar disponíveis."
} else {
    Write-ColorOutput Red "`n❌ PROBLEMAS DETECTADOS NO DEPLOY"
    Write-ColorOutput Red "Verifique os erros acima e execute correções."
}

# Próximos passos
if (![string]::IsNullOrEmpty($EC2_IP)) {
    Write-ColorOutput Cyan @"

🔧 PRÓXIMOS PASSOS:
==================

1. Acessar aplicação:
   http://$EC2_IP

2. Conectar via SSH:
   ssh -i pli-cadastros-key.pem ubuntu@$EC2_IP

3. Ver logs da aplicação:
   .\scripts\deploy-manager.ps1 logs

4. Atualizar aplicação:
   .\scripts\deploy-manager.ps1 update

5. Configurar domínio personalizado (opcional)
6. Configurar SSL/HTTPS (opcional)

"@
}

# Comandos de troubleshooting
if ($failTests -gt 0 -or $errorTests -gt 0) {
    Write-ColorOutput Yellow @"

🆘 COMANDOS DE TROUBLESHOOTING:
==============================

# Verificar status AWS
.\scripts\deploy-complete.ps1 status

# Testar conexão SSH
.\scripts\deploy-manager.ps1 test

# Ver logs detalhados
.\scripts\deploy-manager.ps1 logs

# Restart da aplicação
.\scripts\deploy-manager.ps1 update

# Verificar Security Groups no console AWS
# Verificar se instâncias estão rodando no console AWS

"@
}

Log "Verificação concluída!"