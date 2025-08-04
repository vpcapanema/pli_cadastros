# Script para corrigir problemas específicos em arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin",
    "views\public11"  # Incluindo a pasta public11
)

# Função para corrigir links de início
function Corrigir-Links-Inicio {
    param (
        [string]$filePath
    )
    
    Write-Host "Corrigindo links no arquivo $filePath"
    
    # Faz backup do arquivo se não existir
    $backupPath = "$filePath.bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $filePath -Destination $backupPath
        Write-Host "  Backup criado: $backupPath"
    }
    
    # Lê o conteúdo do arquivo
    $content = Get-Content -Path $filePath -Raw
    
    # Substituir href="/index.html" por href="/"
    $content = $content -replace 'href="/index.html"', 'href="/"'
    
    # Salva o conteúdo modificado
    Set-Content -Path $filePath -Value $content -NoNewline
    
    Write-Host "  Links corrigidos com sucesso"
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
        Corrigir-Links-Inicio -filePath $file.FullName
    }
}

Write-Host "Correção de links concluída!" -ForegroundColor Green
