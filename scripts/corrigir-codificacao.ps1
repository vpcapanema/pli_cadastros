# Script PowerShell para corrigir a codificação UTF-8 dos arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# Função para corrigir a codificação UTF-8 de um arquivo HTML
function Corrigir-Codificacao {
    param (
        [string]$filePath
    )
    
    Write-Host "Corrigindo codificação de $filePath"
    
    try {
        # Lê o arquivo com a codificação atual
        $content = Get-Content -Path $filePath -Raw
        
        # Salva o arquivo com codificação UTF-8 com BOM
        $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
        
        Write-Host "  Codificação corrigida com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "  Erro ao corrigir codificação: $_" -ForegroundColor Red
    }
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
        Corrigir-Codificacao -filePath $file.FullName
    }
}

Write-Host "Correção de codificação concluída!" -ForegroundColor Green
