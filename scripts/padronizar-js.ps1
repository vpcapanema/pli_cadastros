# Script PowerShell para padronizar os links JavaScript em todos os arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# JavaScript do template base (referência)
$baseBootstrapJS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"

# Função para padronizar os links JavaScript em um arquivo HTML
function Padronizar-JS {
    param (
        [string]$filePath
    )
    
    Write-Host "Padronizando JavaScript em $filePath"
    
    # Faz backup do arquivo antes de modificá-lo (se ainda não existir)
    $backupPath = "$filePath.js-bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $filePath -Destination $backupPath
        Write-Host "  Backup criado: $backupPath"
    }
    
    # Lê o conteúdo do arquivo
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    
    # Substitui as versões do Bootstrap JS (qualquer 5.x.x)
    $content = $content -replace 'https://cdn\.jsdelivr\.net/npm/bootstrap@5\.[0-9]+\.[0-9]+/dist/js/bootstrap\.bundle\.min\.js', $baseBootstrapJS
    
    # Corrige comentários incorretos para o Bootstrap JS
    $content = $content -replace '<!-- Bootstrap 5 CSS -->\s*<script src="https://cdn\.jsdelivr\.net/npm/bootstrap@', '<!-- Bootstrap 5 JS -->' + "`n" + '    <script src="https://cdn.jsdelivr.net/npm/bootstrap@'
    $content = $content -replace '<!-- Bootstrap CSS -->\s*<script src="https://cdn\.jsdelivr\.net/npm/bootstrap@', '<!-- Bootstrap 5 JS -->' + "`n" + '    <script src="https://cdn.jsdelivr.net/npm/bootstrap@'
    
    # Salva o conteúdo modificado
    $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
    
    Write-Host "  JavaScript padronizado com sucesso" -ForegroundColor Green
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
        
        Padronizar-JS -filePath $file.FullName
    }
}

Write-Host "Padronização de JavaScript concluída!" -ForegroundColor Green
