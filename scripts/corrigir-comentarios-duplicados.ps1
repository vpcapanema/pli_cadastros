# Script PowerShell para corrigir comentários duplicados nos arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# Função para corrigir comentários duplicados
function Corrigir-ComentariosDuplicados {
    param (
        [string]$filePath
    )
    
    Write-Host "Corrigindo comentários duplicados em $filePath"
    
    try {
        # Lê o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw
        
        # Corrige comentários duplicados
        $content = $content -replace '<!-- Navegação Modularizada -->\s+<!-- Navegação Modularizada -->', '<!-- Navegação Modularizada -->'
        $content = $content -replace '<!-- Footer Modularizado -->\s+<!-- Footer Modularizado -->', '<!-- Footer Modularizado -->'
        
        # Salva o arquivo com codificação UTF-8
        $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
        
        Write-Host "  Comentários duplicados corrigidos com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "  Erro ao corrigir comentários duplicados: $_" -ForegroundColor Red
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
        Corrigir-ComentariosDuplicados -filePath $file.FullName
    }
}

Write-Host "Correção de comentários duplicados concluída!" -ForegroundColor Green
