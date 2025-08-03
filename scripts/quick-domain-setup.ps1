# Script Simples para Configurar www.sigma-pli

Write-Host "🌐 CONFIGURAÇÃO www.sigma-pli - SIGMA-PLI" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

$ServerIP = "54.237.45.153"
$AppPort = "8888"

Write-Host "📋 OPÇÕES RÁPIDAS PARA www.sigma-pli:" -ForegroundColor Cyan
Write-Host ""

Write-Host "🆓 OPÇÃO 1: No-IP (GRATUITO - 5 minutos)" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "1. Acesse: https://www.noip.com/sign-up" -ForegroundColor White
Write-Host "2. Crie conta gratuita" -ForegroundColor White
Write-Host "3. Configure:" -ForegroundColor White
Write-Host "   • Hostname: sigma-pli" -ForegroundColor Green
Write-Host "   • Domain: ddns.net" -ForegroundColor Green
Write-Host "   • IP: $ServerIP" -ForegroundColor Green
Write-Host "4. Resultado: http://sigma-pli.ddns.net" -ForegroundColor Cyan
Write-Host ""

Write-Host "🦆 OPÇÃO 2: DuckDNS (GRATUITO - 3 minutos)" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "1. Acesse: https://www.duckdns.org" -ForegroundColor White
Write-Host "2. Login com Google" -ForegroundColor White
Write-Host "3. Configure: sigma-pli.duckdns.org" -ForegroundColor White
Write-Host "4. IP: $ServerIP" -ForegroundColor Green
Write-Host "5. Resultado: http://sigma-pli.duckdns.org" -ForegroundColor Cyan
Write-Host ""

Write-Host "💼 OPÇÃO 3: Domínio Próprio (PROFISSIONAL)" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Sugestões disponíveis:" -ForegroundColor White
Write-Host "• sigma-pli.com" -ForegroundColor Green
Write-Host "• sigma-pli.com.br" -ForegroundColor Green
Write-Host "• sigmapli.com" -ForegroundColor Green
Write-Host ""

Write-Host "📊 STATUS ATUAL:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "🖥️ Servidor: $ServerIP" -ForegroundColor White
Write-Host "🚪 Porta: $AppPort" -ForegroundColor White
Write-Host "🌐 URL atual: http://$ServerIP`:$AppPort" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Escolha uma opção (1-3) ou Enter para abrir links"

switch ($choice) {
    "1" {
        Write-Host "🚀 Abrindo No-IP..." -ForegroundColor Green
        Start-Process "https://www.noip.com/sign-up"
    }
    "2" {
        Write-Host "🚀 Abrindo DuckDNS..." -ForegroundColor Green
        Start-Process "https://www.duckdns.org"
    }
    "3" {
        Write-Host "🚀 Abrindo sites de registro..." -ForegroundColor Green
        Start-Process "https://registro.br"
        Start-Process "https://www.godaddy.com"
    }
    default {
        Write-Host "🚀 Abrindo todos os links..." -ForegroundColor Green
        Start-Process "https://www.noip.com/sign-up"
        Start-Process "https://www.duckdns.org"
    }
}

Write-Host ""
Write-Host "✅ Links abertos no navegador!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "1. Configure o domínio escolhido" -ForegroundColor White
Write-Host "2. Aponte para IP: $ServerIP" -ForegroundColor Yellow
Write-Host "3. Teste o acesso após configurar" -ForegroundColor White
Write-Host "4. Informe o domínio configurado para finalizar" -ForegroundColor White

Write-Host ""
Read-Host "Pressione Enter para continuar"
