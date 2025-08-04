# Script para verificar se o mapa de rotas está carregando corretamente

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/routes" -UseBasicParsing
    
    Write-Host "✅ Mapa de rotas carregado com sucesso! Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Verifica erros no conteúdo
    if ($response.Content -match "Failed to load resource") {
        Write-Host "❌ Detectado erro 'Failed to load resource' no conteúdo" -ForegroundColor Red
        
        # Tenta encontrar quais recursos falharam
        if ($response.Content -match "Failed to load resource: the server responded with a status of 404 \(Not Found\)(.*?)") {
            Write-Host "   Recursos não encontrados:" -ForegroundColor Red
            Write-Host $Matches[1]
        }
    } else {
        Write-Host "✅ Nenhum erro 'Failed to load resource' detectado" -ForegroundColor Green
    }
    
    # Verifica se carregou navbar e footer
    if ($response.Content -match "navbar-container") {
        Write-Host "✅ Elemento navbar-container encontrado no HTML" -ForegroundColor Green
    } else {
        Write-Host "❌ Elemento navbar-container não encontrado" -ForegroundColor Red
    }
    
    if ($response.Content -match "footer-container") {
        Write-Host "✅ Elemento footer-container encontrado no HTML" -ForegroundColor Green
    } else {
        Write-Host "❌ Elemento footer-container não encontrado" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro ao acessar o mapa de rotas" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
