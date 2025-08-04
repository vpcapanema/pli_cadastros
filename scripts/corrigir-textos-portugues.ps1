# Script PowerShell para corrigir textos em português nos arquivos HTML
# Data: 04 de agosto de 2025

$rootDir = "C:\Users\vinic\pli_cadastros"
$directories = @(
    "views\public",
    "views\app",
    "views\admin"
)

# Função para corrigir textos em português
function Corrigir-Textos {
    param (
        [string]$filePath
    )
    
    Write-Host "Corrigindo textos em $filePath"
    
    try {
        # Lê o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw
        
        # Mapa de substituições para textos comuns em português
        $substituicoes = @{
            'NavegaÃ§Ã£o Modularizada' = 'Navegação Modularizada'
            'InÃ­cio' = 'Início'
            'MÃ³dulo' = 'Módulo'
            'CodificaÃ§Ã£o' = 'Codificação'
            'TÃ­tulo' = 'Título'
            'ObrigatÃ³rio' = 'Obrigatório'
            'PÃ¡gina' = 'Página'
            'SessÃµes' = 'Sessões'
            'InformaÃ§Ãµes' = 'Informações'
            'CorreÃ§Ã£o' = 'Correção'
            'AÃ§Ãµes' = 'Ações'
            'ConfiguraÃ§Ãµes' = 'Configurações'
            'UsuÃ¡rio' = 'Usuário'
            'FÃ­sica' = 'Física'
            'JurÃ­dica' = 'Jurídica'
            'EndereÃ§o' = 'Endereço'
            'NÃ­vel' = 'Nível'
            'PadrÃ£o' = 'Padrão'
            'ServiÃ§os' = 'Serviços'
            'CÃ³digo' = 'Código'
            'PorÃ©m' = 'Porém'
            'NÃ£o' = 'Não'
            'VersÃ£o' = 'Versão'
            'AplicaÃ§Ã£o' = 'Aplicação'
        }
        
        # Aplica as substituições
        foreach ($key in $substituicoes.Keys) {
            $content = $content.Replace($key, $substituicoes[$key])
        }
        
        # Salva o arquivo com codificação UTF-8
        $utf8Encoding = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
        
        Write-Host "  Textos corrigidos com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "  Erro ao corrigir textos: $_" -ForegroundColor Red
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
        Corrigir-Textos -filePath $file.FullName
    }
}

Write-Host "Correção de textos concluída!" -ForegroundColor Green
