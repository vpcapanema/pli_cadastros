# Script simplificado para testar se o template base.html está acessível

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/templates/base.html" -UseBasicParsing
    Write-Host "✅ O template base.html está acessível! Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Verifica se contém elementos-chave
    if ($response.Content -match "navbar-public") {
        Write-Host "✅ O template contém o elemento navbar-public" -ForegroundColor Green
    } else {
        Write-Host "❌ Elemento navbar-public não encontrado" -ForegroundColor Red
    }
    
    if ($response.Content -match "l-footer") {
        Write-Host "✅ O template contém o elemento l-footer" -ForegroundColor Green
    } else {
        Write-Host "❌ Elemento l-footer não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao acessar o template base.html" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
