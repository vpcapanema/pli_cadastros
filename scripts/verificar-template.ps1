# Script para testar o carregamento do template base.html
# Verifica se o arquivo está sendo servido corretamente

$templateUrl = "http://localhost:8888/templates/base.html"
$statusCode = $null

try {
    $response = Invoke-WebRequest -Uri $templateUrl -UseBasicParsing
    $statusCode = $response.StatusCode
    
    Write-Host "Status do template base.html: $statusCode"
    
    if ($statusCode -eq 200) {
        Write-Host "✅ O template base.html está sendo servido corretamente!" -ForegroundColor Green
        
        # Verifica se contém elementos-chave
        $content = $response.Content
        
        if ($content -match "navbar-public" -and $content -match "navbar-restricted") {
            Write-Host "✅ O template contém os elementos de navbar esperados." -ForegroundColor Green
        } else {
            Write-Host "⚠️ O template não contém todos os elementos de navbar esperados." -ForegroundColor Yellow
        }
        
        if ($content -match "l-footer") {
            Write-Host "✅ O template contém o elemento de footer esperado." -ForegroundColor Green
        } else {
            Write-Host "⚠️ O template não contém o elemento de footer esperado." -ForegroundColor Yellow
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Erro ao acessar o template: $statusCode" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Verifica loaders de navbar e footer
$loaderFiles = @(
    "http://localhost:8888/static/js/navbar-loader.js",
    "http://localhost:8888/static/js/footer-loader.js",
    "http://localhost:8888/static/js/navbar-internal-loader.js"
)

foreach ($file in $loaderFiles) {
    try {
        $response = Invoke-WebRequest -Uri $file -UseBasicParsing
        $status = $response.StatusCode
        Write-Host "✅ Loader $file está acessível (Status: $status)" -ForegroundColor Green
    } catch {
        $errStatus = "N/A"
        if ($_.Exception.Response) {
            $errStatus = $_.Exception.Response.StatusCode.value__
        }
        $fileUrl = $file
        Write-Host "❌ Erro ao acessar loader: $errStatus" -ForegroundColor Red
        Write-Host "   URL: $fileUrl" -ForegroundColor Red
    }
}

# Verificar a página de mapa de rotas
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/routes" -UseBasicParsing
    $status = $response.StatusCode
    Write-Host "✅ Mapa de rotas carregado com sucesso (Status: $status)" -ForegroundColor Green
    
    # Verifica se há erros no console (simplificado)
    if ($response.Content -match "Failed to load resource") {
        Write-Host "⚠️ Detectados possíveis erros de carregamento no mapa de rotas" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Nenhum erro de carregamento detectado no conteúdo" -ForegroundColor Green
    }
} catch {
    $errStatus = "N/A"
    if ($_.Exception.Response) {
        $errStatus = $_.Exception.Response.StatusCode.value__
    }
    Write-Host "❌ Erro ao acessar o mapa de rotas: $errStatus" -ForegroundColor Red
}
