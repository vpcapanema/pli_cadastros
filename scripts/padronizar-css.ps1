# Script PowerShell para padronizar os links CSS em todos os arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# Limpar os arquivos index.html e outros que possam ter meta tags duplicadas
$filesToClean = @(
    "views\public\index.html"
)

foreach ($file in $filesToClean) {
    $filePath = Join-Path -Path $rootDir -ChildPath $file
    if (Test-Path $filePath) {
        Write-Host "Limpando meta tags duplicadas em $filePath"
        
        # Faz backup do arquivo antes de modificá-lo (se ainda não existir)
        $backupPath = "$filePath.clean-bak"
        if (-not (Test-Path $backupPath)) {
            Copy-Item -Path $filePath -Destination $backupPath
        }
        
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Remove meta tags duplicados
        $content = $content -replace '<meta name="description"[^>]*>[\s\r\n]*<meta name="author"[^>]*>', ''
        
        # Salva o conteúdo modificado
        $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
        
        Write-Host "  Meta tags duplicadas removidas com sucesso" -ForegroundColor Green
    }
}

# CSS do template base (referência)
$baseBootstrap = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
$baseFontAwesome = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
$baseMetaTags = @"
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SIGMA/PLI - Sistema de Gerenciamento de Cadastros">
    <meta name="author" content="VPC-GEOSER">
"@

# Função para padronizar os links CSS em um arquivo HTML
function Padronizar-CSS {
    param (
        [string]$filePath
    )
    
    Write-Host "Padronizando CSS em $filePath"
    
    # Faz backup do arquivo antes de modificá-lo (se ainda não existir)
    $backupPath = "$filePath.css-bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $filePath -Destination $backupPath
        Write-Host "  Backup criado: $backupPath"
    }
    
    # Lê o conteúdo do arquivo
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    
    # Substitui as versões do Bootstrap (qualquer 5.x.x)
    $content = $content -replace 'https://cdn\.jsdelivr\.net/npm/bootstrap@5\.[0-9]+\.[0-9]+/dist/css/bootstrap\.min\.css', $baseBootstrap
    
    # Substitui as versões do Font Awesome (qualquer 6.x.x)
    $content = $content -replace 'https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/6\.[0-9]+\.[0-9]+/css/all\.min\.css', $baseFontAwesome
    
    # Substitui os meta tags (preservando o título existente)
    $metaPattern = '(?s)<meta charset="UTF-8">.*?<meta name="viewport".*?>'
    if ($content -match $metaPattern) {
        $content = $content -replace $metaPattern, $baseMetaTags
    }
    
    # Remove meta tags duplicados
    $content = $content -replace '<meta name="description"[^>]*>[\s\r\n]*<meta name="description"[^>]*>', '<meta name="description" content="SIGMA/PLI - Sistema de Gerenciamento de Cadastros">'
    $content = $content -replace '<meta name="author"[^>]*>[\s\r\n]*<meta name="author"[^>]*>', '<meta name="author" content="VPC-GEOSER">'
    
    # Adiciona meta description e author se não existirem
    if ($content -notmatch '<meta name="description"') {
        $viewportTag = [regex]::Match($content, '<meta name="viewport".*?>').Value
        if ($viewportTag) {
            $content = $content.Replace($viewportTag, $viewportTag + "`n    <meta name=`"description`" content=`"SIGMA/PLI - Sistema de Gerenciamento de Cadastros`">")
        }
    }
    
    if ($content -notmatch '<meta name="author"') {
        $descriptionTag = [regex]::Match($content, '<meta name="description".*?>').Value
        if ($descriptionTag) {
            $content = $content.Replace($descriptionTag, $descriptionTag + "`n    <meta name=`"author`" content=`"VPC-GEOSER`">")
        }
        else {
            $viewportTag = [regex]::Match($content, '<meta name="viewport".*?>').Value
            if ($viewportTag) {
                $content = $content.Replace($viewportTag, $viewportTag + "`n    <meta name=`"author`" content=`"VPC-GEOSER`">")
            }
        }
    }
    
    # Padroniza comentários de CSS
    $content = $content -replace '<!-- Bootstrap [^>]*-->', '<!-- Bootstrap 5 CSS -->'
    $content = $content -replace '<!-- Font Awesome [^>]*-->', '<!-- Font Awesome -->'
    $content = $content -replace '<!-- CSS PLI [^>]*-->', '<!-- PLI Design System CSS -->'
    
    # Salva o conteúdo modificado
    $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
    
    Write-Host "  CSS padronizado com sucesso" -ForegroundColor Green
}

# Processa cada diretório
foreach ($dir in $directories) {
    $fullPath = Join-Path -Path $rootDir -ChildPath $dir
    
    # Verifica se o diretório existe
    if (-not (Test-Path $fullPath)) {
        Write-Host "Diretório não encontrado: $fullPath" -ForegroundColor Yellow
        continue
    }
    
    # Obtém todos os arquivos HTML no diretório
    $files = Get-ChildItem -Path $fullPath -Filter "*.html"
    
    Write-Host "Encontrados $($files.Count) arquivos HTML em $fullPath" -ForegroundColor Cyan
    
    # Processa cada arquivo
    foreach ($file in $files) {
        # Ignora arquivos que usam template engine (já herdam do base.html)
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        if ($content -match '{% extends "templates/base.html" %}') {
            Write-Host "Ignorando $($file.FullName) (usa template engine)" -ForegroundColor Yellow
            continue
        }
        
        Padronizar-CSS -filePath $file.FullName
    }
}

Write-Host "Padronização de CSS concluída!" -ForegroundColor Green
