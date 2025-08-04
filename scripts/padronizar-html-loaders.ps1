# Script PowerShell para padronizar todos os arquivos HTML para usar loaders específicos
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# Função para padronizar um arquivo HTML
function Padronizar-Arquivo {
    param (
        [string]$filePath
    )
    
    Write-Host "Padronizando $filePath"
    
    # Faz backup do arquivo antes de modificá-lo
    $backupPath = "$filePath.bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $filePath -Destination $backupPath
        Write-Host "  Backup criado: $backupPath"
    }
    
    # Lê o conteúdo do arquivo
    $content = Get-Content -Path $filePath -Raw
    
    # Padrões para substituir
    
    # 1. Substituir a div navbar com include-html pelo container com loader
    $content = $content -replace '<div id="navbar-public" include-html="/views/templates/base\.html#navbar-public"></div>\s*<script src="/static/js/component-loader\.js"></script>', @'
    <!-- Navegação Modularizada -->
    <div id="navbar-container"></div>
    <script src="/static/js/navbar-loader.js"></script>
'@
    
    # 2. Substituir a div navbar-restricted com include-html
    $content = $content -replace '<div id="navbar-restricted" include-html="/views/templates/base\.html#navbar-restricted"></div>\s*<script src="/static/js/component-loader\.js"></script>', @'
    <!-- Navegação Modularizada -->
    <div id="navbar-container"></div>
    <script src="/static/js/navbar-internal-loader.js"></script>
'@
    
    # 3. Substituir o footer com include-html
    $content = $content -replace '<div id="l-footer" include-html="/views/templates/base\.html#l-footer"></div>', @'
    <!-- Footer Modularizado -->
    <div id="footer-container"></div>
    <script src="/static/js/footer-loader.js"></script>
'@
    
    # 4. Remover o script de inicialização do component-loader
    $content = $content -replace '<script>\s*// Carregar componentes do template base\s*document\.addEventListener\(''DOMContentLoaded'', function\(\) \{\s*// Inicializar carregador de componentes\s*initComponentLoader\(\);\s*\}\);\s*</script>', ''
    
    # Salva o conteúdo modificado
    Set-Content -Path $filePath -Value $content -NoNewline
    
    Write-Host "  Arquivo padronizado com sucesso"
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
        Padronizar-Arquivo -filePath $file.FullName
    }
}

Write-Host "Padronização concluída!" -ForegroundColor Green
