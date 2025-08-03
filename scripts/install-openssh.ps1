# INSTALACAO DO OPENSSH PARA WINDOWS
# ===================================

# Script para instalar o OpenSSH Client no Windows

Write-Host "INSTALACAO DO OPENSSH CLIENT" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Verificar se já está instalado
Write-Host ""
Write-Host "Verificando se o OpenSSH ja esta instalado..." -ForegroundColor Yellow

$SSH_INSTALLED = $false
try {
    # Primeiro, verificar se o comando existe
    $SSH_COMMAND = Get-Command ssh -ErrorAction SilentlyContinue
    
    if ($SSH_COMMAND) {
        Write-Host "   ✅ Comando SSH encontrado em: $($SSH_COMMAND.Source)" -ForegroundColor Green
        
        # Tentar obter a versão
        $SSH_VERSION = & ssh -V 2>&1
        
        # Verificar se a saída contém "OpenSSH"
        if ($SSH_VERSION -and ($SSH_VERSION -like "*OpenSSH*" -or $SSH_VERSION.ToString() -like "*OpenSSH*")) {
            $SSH_INSTALLED = $true
            $VERSION_LINE = $SSH_VERSION.ToString().Split("`n")[0]
            Write-Host "   ✅ OpenSSH detectado: $VERSION_LINE" -ForegroundColor Green
        } else {
            Write-Host "   ❌ SSH encontrado mas nao e OpenSSH: $SSH_VERSION" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Comando SSH nao encontrado no PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erro na deteccao do SSH: $($_.Exception.Message)" -ForegroundColor Red
}

# Debug: Mostrar status final
Write-Host "   Status final SSH_INSTALLED: $SSH_INSTALLED" -ForegroundColor Gray

if (-not $SSH_INSTALLED) {
    Write-Host ""
    Write-Host "INSTALANDO OPENSSH CLIENT..." -ForegroundColor Yellow
    Write-Host "==============================" -ForegroundColor Yellow
    
    # Verificar se está executando como administrador
    $IS_ADMIN = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if (-not $IS_ADMIN) {
        Write-Host ""
        Write-Host "ERRO: Este script precisa ser executado como Administrador" -ForegroundColor Red
        Write-Host "=======================================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUCOES:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "OPCAO 1 - Executar como Administrador:" -ForegroundColor Cyan
        Write-Host "1. Feche este PowerShell" -ForegroundColor White
        Write-Host "2. Clique com botao direito no PowerShell" -ForegroundColor White
        Write-Host "3. Selecione 'Executar como administrador'" -ForegroundColor White
        Write-Host "4. Execute novamente: .\install-openssh.ps1" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO 2 - Via Windows Settings:" -ForegroundColor Cyan
        Write-Host "1. Abra Configuracoes do Windows (Win + I)" -ForegroundColor White
        Write-Host "2. Va em Aplicativos > Recursos opcionais" -ForegroundColor White
        Write-Host "3. Clique em 'Adicionar um recurso opcional'" -ForegroundColor White
        Write-Host "4. Procure por 'OpenSSH Client' e instale" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO 3 - Instalar Git for Windows:" -ForegroundColor Cyan
        Write-Host "1. Baixe em: https://git-scm.com/download/win" -ForegroundColor White
        Write-Host "2. Instale (inclui SSH)" -ForegroundColor White
        Write-Host "3. Adicione o Git ao PATH do sistema" -ForegroundColor White
        Write-Host ""
        Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host "Executando como administrador... OK" -ForegroundColor Green
    Write-Host ""
    
    try {
        Write-Host "Instalando OpenSSH Client..." -ForegroundColor Yellow
        
        # Tentar instalar via Windows Capability
        $INSTALL_RESULT = Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
        
        if ($INSTALL_RESULT.State -eq "Installed") {
            Write-Host "✅ OpenSSH Client instalado com sucesso!" -ForegroundColor Green
            
            # Verificar instalação
            Start-Sleep -Seconds 2
            try {
                $SSH_VERSION = ssh -V 2>&1
                Write-Host "✅ SSH esta funcionando: $($SSH_VERSION.Split("`n")[0])" -ForegroundColor Green
                
                Write-Host ""
                Write-Host "INSTALACAO CONCLUIDA!" -ForegroundColor Green
                Write-Host "======================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Agora voce pode:" -ForegroundColor Yellow
                Write-Host "1. Fechar este PowerShell" -ForegroundColor White
                Write-Host "2. Abrir um novo PowerShell (nao precisa ser admin)" -ForegroundColor White
                Write-Host "3. Executar: .\configure-hostname-nginx.ps1" -ForegroundColor Cyan
                
            } catch {
                Write-Host "⚠️  SSH instalado, mas pode precisar reiniciar o terminal" -ForegroundColor Yellow
                Write-Host "Feche e abra um novo PowerShell" -ForegroundColor White
            }
            
        } else {
            throw "Falha na instalacao: $($INSTALL_RESULT.State)"
        }
        
    } catch {
        Write-Host "❌ Erro na instalacao automatica: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "INSTALACAO MANUAL:" -ForegroundColor Yellow
        Write-Host "==================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "OPCAO A - Via PowerShell (execute um por vez):" -ForegroundColor Cyan
        Write-Host "Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Client*'" -ForegroundColor White
        Write-Host "Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO B - Via Chocolatey:" -ForegroundColor Cyan
        Write-Host "choco install openssh" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO C - Git for Windows (recomendado):" -ForegroundColor Cyan
        Write-Host "1. Baixar: https://git-scm.com/download/win" -ForegroundColor White
        Write-Host "2. Instalar com opcoes padrao" -ForegroundColor White
        Write-Host "3. Reiniciar o terminal" -ForegroundColor White
    }
    
} else {
    Write-Host ""
    Write-Host "OpenSSH ja esta disponivel!" -ForegroundColor Green
    Write-Host "Voce pode executar: .\configure-hostname-nginx.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
