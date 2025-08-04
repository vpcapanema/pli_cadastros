# Script para iniciar o servidor e abrir as páginas principais
# Data: 04 de agosto de 2025

Write-Host "Verificando se há servidores rodando na porta 8888..." -ForegroundColor Cyan
$processoExistente = npx kill-port 8888

if ($LASTEXITCODE -eq 0) {
    Write-Host "Porta 8888 liberada!" -ForegroundColor Green
} else {
    Write-Host "Porta 8888 já está disponível" -ForegroundColor Yellow
}

Write-Host "Iniciando o servidor..." -ForegroundColor Cyan

# Navegar para a raiz do projeto
Set-Location ..

# Iniciar o servidor
$nodeCommand = "node server.js"

# Executar o comando em uma nova janela do PowerShell
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $nodeCommand

Write-Host "✅ Servidor iniciado na porta 8888!" -ForegroundColor Green
Write-Host "📄 Páginas que serão abertas:" -ForegroundColor Green
Write-Host "   - http://localhost:8888/index.html" -ForegroundColor White
Write-Host "   - http://localhost:8888/login.html" -ForegroundColor White
Write-Host "⏱️ Aguarde alguns segundos..." -ForegroundColor Yellow

# Esperar um pouco para o servidor iniciar antes de abrir as páginas
Start-Sleep -Seconds 2

Write-Host "🌐 Abrindo navegador..." -ForegroundColor Cyan
