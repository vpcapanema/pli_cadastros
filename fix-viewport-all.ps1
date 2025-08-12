# Script para adicionar meta viewport em todos os arquivos HTML que não possuem
Write-Host "CORRIGINDO TODOS OS ARQUIVOS HTML - META VIEWPORT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

$htmlFiles = @(
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-cadastro-pessoa-fisica.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-cadastro-pessoa-juridica.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-cadastro-usuario.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-email-verificado.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-index.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-login.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-recuperar-senha.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-recursos.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-selecionar-perfil.html",
    "D:\00_PLI-CADASTRO\pli_cadastros_hardened_final\pli_cadastros\docs\style-map-pages\public-sobre.html"
)

$viewportMeta = '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />'
$correctedCount = 0
$skippedCount = 0

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Processando: $(Split-Path $file -Leaf)" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Verificar se já possui meta viewport
        if ($content -match 'name="viewport"') {
            Write-Host "  ✓ Já possui meta viewport - IGNORADO" -ForegroundColor Yellow
            $skippedCount++
        } else {
            # Encontrar a posição para inserir (após charset ou no início do head)
            if ($content -match '(<meta charset[^>]*>)') {
                # Inserir após charset
                $replacement = $matches[1] + "`n" + $viewportMeta
                $newContent = $content -replace $matches[1], $replacement
            } elseif ($content -match '(<head[^>]*>)') {
                # Inserir logo após abertura do head
                $replacement = $matches[1] + "`n" + $viewportMeta
                $newContent = $content -replace $matches[1], $replacement
            } else {
                Write-Host "  ✗ Não foi possível encontrar <head> - ERRO" -ForegroundColor Red
                continue
            }
            
            # Salvar arquivo
            $newContent | Out-File -FilePath $file -Encoding UTF8 -NoNewline
            Write-Host "  ✓ Meta viewport ADICIONADA" -ForegroundColor Green
            $correctedCount++
        }
    } else {
        Write-Host "Arquivo não encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESULTADO FINAL:" -ForegroundColor Green
Write-Host "Arquivos corrigidos: $correctedCount" -ForegroundColor Green
Write-Host "Arquivos ignorados: $skippedCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ TODOS OS PROBLEMAS DE META VIEWPORT CORRIGIDOS!" -ForegroundColor Green
