# Script para padronizar páginas HTML referenciando o template base.html
# Autor: GitHub Copilot
# Data: 4 de agosto de 2025

# Função para transformar uma página HTML em uma que referencia o template base.html
function Convert-ToTemplateReference {
    param (
        [string]$filePath,
        [bool]$isPublic,
        [string]$outputDir
    )
    
    Write-Host "Processando: $filePath"
    
    try {
        # Ler o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Extrair informações úteis
        $title = "Página"
        if ($content -match '<title>(.*?)</title>') {
            $fullTitle = $matches[1]
            $title = $fullTitle -replace ' \| SIGMA/PLI$', '' -replace ' - .*$', ''
        }
        
        $bodyClass = ""
        if ($content -match '<body class="([^"]*)"') {
            $bodyClass = $matches[1]
        }
        
        # Extrair conteúdo principal
        $mainContent = "<!-- Conteúdo principal não encontrado -->"
        
        # Tenta encontrar o conteúdo principal usando diferentes padrões
        if ($content -match '<main.*?>(.*?)</main>' -or 
            $content -match '<div class="pli-main-content".*?>(.*?)</div>' -or
            $content -match '<div class="container.*?>(.*?)</div>') {
            $mainContent = $matches[1].Trim()
        }
        elseif ($content -match '(?:</header>|</nav>|<div id="navbar-container">.*?</div>)(.*?)(?:<footer|<div id="footer-container")') {
            $mainContent = $matches[1].Trim()
        }
        
        # Extrair CSS específico
        $cssLinks = @()
        if ($content -match '<head.*?>(.*?)</head>') {
            $headContent = $matches[1]
            $cssMatches = [regex]::Matches($headContent, '<link.*?href="(.*?)".*?>')
            
            foreach ($match in $cssMatches) {
                $href = $match.Groups[1].Value
                if ($href -notmatch 'bootstrap|font-awesome|googleapis|main\.css') {
                    $cssLinks += "<link href=`"$href`" rel=`"stylesheet`">"
                }
            }
        }
        
        # Extrair scripts específicos
        $scripts = @()
        
        # Scripts externos
        $scriptMatches = [regex]::Matches($content, '<script.*?src="(.*?)".*?></script>')
        foreach ($match in $scriptMatches) {
            $src = $match.Groups[1].Value
            if ($src -notmatch 'bootstrap|navbar|footer') {
                $scripts += "<script src=`"$src`"></script>"
            }
        }
        
        # Scripts internos
        $inlineMatches = [regex]::Matches($content, '<script(?![^>]*src=)[^>]*>(.*?)</script>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        foreach ($match in $inlineMatches) {
            $scriptContent = $match.Groups[1].Value
            if ($scriptContent -notmatch 'navbar|footer|updateSystemStatus') {
                $scripts += "<script>$scriptContent</script>"
            }
        }
        
        # Criar o novo conteúdo que referencia o template base.html
        $newContent = @"
{% extends "templates/base.html" %}

{% block page_title %}$title{% endblock %}

{% block additional_css %}
$($cssLinks -join "`n")
{% endblock %}

{% block body_class %}$bodyClass{% endblock %}

{% block main_content %}
$mainContent
{% endblock %}

{% block additional_js %}
$($scripts -join "`n")
{% endblock %}
"@
        
        # Determinar o novo caminho do arquivo
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $subfolders = ""
        
        # Manter estrutura de subpastas relativas ao diretório principal
        $baseDirName = [System.IO.Path]::GetFileName([System.IO.Path]::GetDirectoryName($filePath))
        $parentDirPath = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetDirectoryName($filePath))
        
        if ($filePath -match "\\([^\\]+)\\([^\\]+\.html)$") {
            $baseDirName = $matches[1]  # admin, app, ou public
            $fileName = $matches[2]     # nome do arquivo
            
            # Verificar se há subpastas além do diretório base
            $relPath = $filePath.Substring($parentDirPath.Length + 1)
            $relPath = $relPath.Substring($baseDirName.Length + 1)
            $relPath = [System.IO.Path]::GetDirectoryName($relPath)
            
            if (-not [string]::IsNullOrEmpty($relPath)) {
                $subfolders = $relPath
            }
        }
        
        # Determinar o novo diretório de saída com base na estrutura
        $newDirName = if ($baseDirName -eq "admin") { "00admin" }
                   elseif ($baseDirName -eq "app") { "00app" }
                   elseif ($baseDirName -eq "public") { "00public" }
                   else { $baseDirName }
        
        $newDir = Join-Path -Path $outputDir -ChildPath $newDirName
        
        # Adicionar subpastas se existirem
        if (-not [string]::IsNullOrEmpty($subfolders)) {
            $newDir = Join-Path -Path $newDir -ChildPath $subfolders
        }
        
        # Criar o diretório de destino se não existir
        if (-not (Test-Path $newDir)) {
            New-Item -ItemType Directory -Path $newDir -Force | Out-Null
            Write-Host "Diretório criado: $newDir" -ForegroundColor Yellow
        }
        
        # Caminho completo para o arquivo de saída
        $newFilePath = Join-Path -Path $newDir -ChildPath $fileName
        
        # Salvar o novo conteúdo
        Set-Content -Path $newFilePath -Value $newContent -Encoding UTF8
        Write-Host "Arquivo padronizado criado: $newFilePath" -ForegroundColor Green
        
    } catch {
        Write-Host "Erro ao processar $filePath`: $_" -ForegroundColor Red
    }
}

# Diretórios a processar
$baseDir = "C:\Users\vinic\pli_cadastros\views"
$publicDir = Join-Path -Path $baseDir -ChildPath "public"
$adminDir = Join-Path -Path $baseDir -ChildPath "admin"
$appDir = Join-Path -Path $baseDir -ChildPath "app"

# Processar arquivos públicos
if (Test-Path $publicDir) {
    Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse | ForEach-Object {
        Convert-ToTemplateReference -filePath $_.FullName -isPublic $true -outputDir $baseDir
    }
}

# Processar arquivos administrativos
if (Test-Path $adminDir) {
    Get-ChildItem -Path $adminDir -Filter "*.html" -Recurse | ForEach-Object {
        Convert-ToTemplateReference -filePath $_.FullName -isPublic $false -outputDir $baseDir
    }
}

# Processar arquivos de aplicação
if (Test-Path $appDir) {
    Get-ChildItem -Path $appDir -Filter "*.html" -Recurse | ForEach-Object {
        Convert-ToTemplateReference -filePath $_.FullName -isPublic $false -outputDir $baseDir
    }
}

Write-Host "Processo de padronização concluído!" -ForegroundColor Cyan
Write-Host "As páginas HTML foram convertidas para referenciar o template base.html e salvas nos diretórios 00admin, 00app e 00public." -ForegroundColor Cyan
