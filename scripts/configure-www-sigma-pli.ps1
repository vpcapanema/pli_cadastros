# Script PowerShell para Configurar www.sigma-pli - SIGMA-PLI
# Configuração rápida de domínio personalizado

param(
    [Parameter(Mandatory=$false)]
    [string]$Option = ""
)

# Configurações
$ServerIP = "54.237.45.153"
$AppPort = "8888"
$KeyFile = "pli-ec2-key.pem"

function Show-Header {
    Write-Host "🌐 CONFIGURAÇÃO www.sigma-pli - SIGMA-PLI" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host ""
}

function Show-Menu {
    Write-Host "📋 OPÇÕES PARA www.sigma-pli:" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "1. 🆓 No-IP (Gratuito, 5 minutos)" -ForegroundColor Yellow
    Write-Host "2. 🦆 DuckDNS (Gratuito, 3 minutos)" -ForegroundColor Yellow  
    Write-Host "3. 💼 Domínio próprio (Profissional)" -ForegroundColor Yellow
    Write-Host "4. 📊 Mostrar configuração atual" -ForegroundColor Yellow
    Write-Host "5. 🔗 Abrir links de registro" -ForegroundColor Yellow
    Write-Host "6. 🚪 Sair" -ForegroundColor Yellow
    Write-Host ""
}

function Configure-NoIP {
    Write-Host ""
    Write-Host "📋 CONFIGURAÇÃO NO-IP PARA www.sigma-pli:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "✨ PASSO A PASSO:" -ForegroundColor Green
    Write-Host "1. 🌐 Acesse: https://www.noip.com/sign-up" -ForegroundColor White
    Write-Host "2. 📝 Crie uma conta gratuita" -ForegroundColor White
    Write-Host "3. ➕ No painel, clique em 'Add a Hostname'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "4. 🔧 Configure assim:" -ForegroundColor Green
    Write-Host "   ┌─────────────────────────────────┐" -ForegroundColor Gray
    Write-Host "   │ Hostname: sigma-pli             │" -ForegroundColor White
    Write-Host "   │ Domain: ddns.net                │" -ForegroundColor White
    Write-Host "   │ IP Address: $ServerIP    │" -ForegroundColor White
    Write-Host "   └─────────────────────────────────┘" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. ✅ Clique em 'Create Hostname'" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 RESULTADO: http://sigma-pli.ddns.net" -ForegroundColor Green
    Write-Host ""
    
    # Abrir No-IP automaticamente
    Start-Process "https://www.noip.com/sign-up"
    
    $configured = Read-Host "❓ Já configurou no No-IP? (y/n)"
    
    if ($configured -eq "y") {
        $hostname = Read-Host "📝 Digite o hostname completo (ex: sigma-pli.ddns.net)"
        if ($hostname) {
            Configure-NginxForDomain -Domain $hostname
        }
    } else {
        Write-Host "⏳ Configure primeiro no No-IP e execute este script novamente" -ForegroundColor Yellow
        Write-Host "🔗 Link aberto no navegador!" -ForegroundColor Green
    }
}

function Configure-DuckDNS {
    Write-Host ""
    Write-Host "🦆 CONFIGURAÇÃO DUCKDNS PARA www.sigma-pli:" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "✨ PASSO A PASSO:" -ForegroundColor Green
    Write-Host "1. 🌐 Acesse: https://www.duckdns.org" -ForegroundColor White
    Write-Host "2. 🔑 Faça login com Google/GitHub" -ForegroundColor White
    Write-Host "3. 📝 Digite: sigma-pli" -ForegroundColor White
    Write-Host "4. 🔧 Configure IP: $ServerIP" -ForegroundColor White
    Write-Host "5. ➕ Clique em 'add domain'" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 RESULTADO: http://sigma-pli.duckdns.org" -ForegroundColor Green
    Write-Host ""
    
    # Abrir DuckDNS automaticamente
    Start-Process "https://www.duckdns.org"
    
    $configured = Read-Host "❓ Já configurou no DuckDNS? (y/n)"
    
    if ($configured -eq "y") {
        Configure-NginxForDomain -Domain "sigma-pli.duckdns.org"
    } else {
        Write-Host "⏳ Configure primeiro no DuckDNS e execute este script novamente" -ForegroundColor Yellow
        Write-Host "🔗 Link aberto no navegador!" -ForegroundColor Green
    }
}

function Configure-CustomDomain {
    Write-Host ""
    Write-Host "💼 CONFIGURAÇÃO DOMÍNIO PRÓPRIO:" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📋 Sugestões de domínios disponíveis:" -ForegroundColor Green
    Write-Host "   • sigma-pli.com" -ForegroundColor White
    Write-Host "   • sigma-pli.com.br" -ForegroundColor White  
    Write-Host "   • sigmapli.com" -ForegroundColor White
    Write-Host "   • sigma-sistemas.com" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🛒 Onde registrar:" -ForegroundColor Green
    Write-Host "   • Registro.br (.com.br) - R$ 40/ano" -ForegroundColor White
    Write-Host "   • GoDaddy (.com) - $12/ano" -ForegroundColor White
    Write-Host "   • Namecheap (.com) - $10/ano" -ForegroundColor White
    Write-Host ""
    
    $customDomain = Read-Host "📝 Digite seu domínio (ex: sigma-pli.com)"
    
    if ($customDomain) {
        Write-Host ""
        Write-Host "📋 CONFIGURAR DNS:" -ForegroundColor Green
        Write-Host "==================" -ForegroundColor Green
        Write-Host "No painel do seu provedor de domínio, adicione:" -ForegroundColor White
        Write-Host ""
        Write-Host "   Tipo: A" -ForegroundColor Yellow
        Write-Host "   Nome: @" -ForegroundColor Yellow
        Write-Host "   Valor: $ServerIP" -ForegroundColor Yellow
        Write-Host "   TTL: 300" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Tipo: A" -ForegroundColor Yellow
        Write-Host "   Nome: www" -ForegroundColor Yellow
        Write-Host "   Valor: $ServerIP" -ForegroundColor Yellow
        Write-Host "   TTL: 300" -ForegroundColor Yellow
        Write-Host ""
        
        $dnsReady = Read-Host "❓ DNS já está configurado? (y/n)"
        
        if ($dnsReady -eq "y") {
            Configure-NginxForDomain -Domain $customDomain -IsCustom $true
        } else {
            Write-Host "⏳ Configure o DNS primeiro e execute este script novamente" -ForegroundColor Yellow
        }
    }
}

function Configure-NginxForDomain {
    param(
        [string]$Domain,
        [bool]$IsCustom = $false
    )
    
    Write-Host ""
    Write-Host "🔧 Configurando Nginx para: $Domain" -ForegroundColor Green
    
    $configName = "sigma-pli-$($Domain -replace '\.', '-')"
    
    # Configuração Nginx
    if ($IsCustom) {
        $nginxConfig = @"
# Redirecionar para www
server {
    listen 80;
    server_name $Domain;
    return 301 http://www.$Domain`$request_uri;
}

# Configuração principal com www
server {
    listen 80;
    server_name www.$Domain;
    
    # Logs
    access_log /var/log/nginx/${configName}_access.log;
    error_log /var/log/nginx/${configName}_error.log;
    
    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:$AppPort;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$AppPort/api/health;
        access_log off;
    }
}
"@
    } else {
        $nginxConfig = @"
server {
    listen 80;
    server_name $Domain;
    
    # Logs
    access_log /var/log/nginx/${configName}_access.log;
    error_log /var/log/nginx/${configName}_error.log;
    
    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:$AppPort;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$AppPort/api/health;
        access_log off;
    }
}
"@
    }
    
    Write-Host "📄 Aplicando configuração no servidor..." -ForegroundColor Yellow
    
    # Aplicar via SSH
    $sshCommand = @"
echo '$nginxConfig' | sudo tee /etc/nginx/sites-available/$configName > /dev/null
sudo ln -sf /etc/nginx/sites-available/$configName /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configurado com sucesso!"
"@
    
    try {
        ssh -i $KeyFile ubuntu@$ServerIP $sshCommand
        
        # Atualizar CORS
        Update-AppCors -Domain $Domain -IsCustom $IsCustom
        
        Write-Host ""
        Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
        Write-Host "==========================" -ForegroundColor Green
        
        if ($IsCustom) {
            Write-Host "🌐 Acesso: http://www.$Domain" -ForegroundColor White
            Write-Host "🔒 Para SSL: sudo certbot --nginx -d $Domain -d www.$Domain" -ForegroundColor Yellow
        } else {
            Write-Host "🌐 Acesso: http://$Domain" -ForegroundColor White
        }
        
        Write-Host "💊 Health: http://$Domain/health" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Erro ao configurar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Update-AppCors {
    param(
        [string]$Domain,
        [bool]$IsCustom = $false
    )
    
    Write-Host "⚙️ Atualizando configuração CORS..." -ForegroundColor Yellow
    
    $newOrigin = if ($IsCustom) { "http://$Domain,http://www.$Domain" } else { "http://$Domain" }
    
    $corsCommand = @"
cd /home/ubuntu/pli_cadastros
cp config/.env config/.env.backup
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$newOrigin,http://$ServerIP:$AppPort|g" config/.env
pm2 restart pli
echo "✅ Configuração da aplicação atualizada"
"@
    
    ssh -i $KeyFile ubuntu@$ServerIP $corsCommand
}

function Show-CurrentStatus {
    Write-Host ""
    Write-Host "📊 STATUS ATUAL - SIGMA-PLI:" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "🖥️ Servidor: $ServerIP" -ForegroundColor White
    Write-Host "🚪 Porta: $AppPort" -ForegroundColor White
    Write-Host "🌐 URL atual: http://$ServerIP`:$AppPort" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Links funcionais:" -ForegroundColor Green
    Write-Host "   📱 Aplicação: http://$ServerIP`:$AppPort" -ForegroundColor White
    Write-Host "   💊 Health: http://$ServerIP`:$AppPort/api/health" -ForegroundColor White
    Write-Host "   📊 Dashboard: http://$ServerIP`:$AppPort/dashboard.html" -ForegroundColor White
    Write-Host ""
    
    # Verificar domínios configurados
    Write-Host "📁 Domínios configurados:" -ForegroundColor Green
    try {
        $domains = ssh -i $KeyFile ubuntu@$ServerIP "ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep sigma || echo 'Nenhum domínio personalizado configurado'"
        Write-Host $domains -ForegroundColor White
    } catch {
        Write-Host "Erro ao verificar domínios configurados" -ForegroundColor Red
    }
    Write-Host ""
}

function Open-RegistrationLinks {
    Write-Host ""
    Write-Host "🔗 ABRINDO LINKS DE REGISTRO:" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    
    Write-Host "🆓 Serviços Gratuitos:" -ForegroundColor Green
    Start-Process "https://www.noip.com/sign-up"
    Start-Process "https://www.duckdns.org"
    
    Write-Host "💼 Domínios Próprios:" -ForegroundColor Green
    Start-Process "https://registro.br"
    Start-Process "https://www.godaddy.com"
    Start-Process "https://www.namecheap.com"
    
    Write-Host "✅ Links abertos no navegador!" -ForegroundColor Green
}

# Verificar dependências
function Test-Dependencies {
    Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow
    
    if (-not (Test-Path $KeyFile)) {
        Write-Host "❌ Chave SSH não encontrada: $KeyFile" -ForegroundColor Red
        Write-Host "💡 Certifique-se de que a chave está no diretório atual" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🔑 Testando conexão SSH..." -ForegroundColor Yellow
    try {
        $result = ssh -i $KeyFile -o ConnectTimeout=5 ubuntu@$ServerIP "echo 'Conexão OK'"
        if ($result -eq "Conexão OK") {
            Write-Host "✅ Dependências verificadas" -ForegroundColor Green
        } else {
            throw "Falha na conexão"
        }
    } catch {
        Write-Host "❌ Não foi possível conectar ao servidor" -ForegroundColor Red
        Write-Host "💡 Verifique se a chave SSH e o IP estão corretos" -ForegroundColor Yellow
        exit 1
    }
}

# Execução principal
function Main {
    Show-Header
    Test-Dependencies
    
    if ($Option) {
        switch ($Option) {
            "1" { Configure-NoIP }
            "2" { Configure-DuckDNS }  
            "3" { Configure-CustomDomain }
            "4" { Show-CurrentStatus }
            "5" { Open-RegistrationLinks }
            default { Show-Menu }
        }
    } else {
        while ($true) {
            Show-Menu
            $choice = Read-Host "👆 Escolha uma opção (1-6)"
            
            switch ($choice) {
                "1" { Configure-NoIP }
                "2" { Configure-DuckDNS }
                "3" { Configure-CustomDomain }
                "4" { Show-CurrentStatus }
                "5" { Open-RegistrationLinks }
                "6" { 
                    Write-Host "👋 Saindo..." -ForegroundColor Green
                    exit 0 
                }
                default { 
                    Write-Host "❌ Opção inválida" -ForegroundColor Red 
                }
            }
            
            Write-Host ""
            Read-Host "⏸️ Pressione Enter para continuar"
        }
    }
}

# Executar
Main
