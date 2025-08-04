# Script para atualizar links do Bootstrap JS em arquivos HTML
# Este script busca arquivos HTML com referência ao Bootstrap JS e atualiza para a versão 5.3.2

$diretoriosParaPesquisar = @(
    ".",         # Diretório raiz
    "views",
    "static/components",
    "docs"
)

# Padrões antigos que serão substituídos
$padroesJS = @(
    'src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"',
    'src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"',
    'src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"',
    'src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"'
)

# Padrões CSS que serão substituídos
$padroesCSS = @(
    'href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"',
    'href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"',
    'href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css"'
)

# Novos padrões
$novoJS = 'src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"'
$novoCSS = 'href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"'

$contadorArquivosModificados = 0
$arquivosModificados = @()

foreach ($diretorio in $diretoriosParaPesquisar) {
    $arquivosHTML = Get-ChildItem -Path "$diretorio" -Filter "*.html" -Recurse
    
    foreach ($arquivo in $arquivosHTML) {
        $conteudo = Get-Content -Path $arquivo.FullName -Raw
        $modificado = $false
        
        # Atualiza links JS
        foreach ($padraoAntigo in $padroesJS) {
            if ($conteudo -match [regex]::Escape($padraoAntigo)) {
                $conteudo = $conteudo -replace [regex]::Escape($padraoAntigo), $novoJS
                $modificado = $true
            }
        }
        
        # Atualiza links CSS
        foreach ($padraoAntigo in $padroesCSS) {
            if ($conteudo -match [regex]::Escape($padraoAntigo)) {
                $conteudo = $conteudo -replace [regex]::Escape($padraoAntigo), $novoCSS
                $modificado = $true
            }
        }
        
        if ($modificado) {
            Set-Content -Path $arquivo.FullName -Value $conteudo -NoNewline
            $contadorArquivosModificados++
            $arquivosModificados += $arquivo.FullName
            Write-Host "Atualizado: $($arquivo.FullName)"
        }
    }
}

Write-Host "`nResumo da operação:"
Write-Host "Total de arquivos modificados: $contadorArquivosModificados"
if ($contadorArquivosModificados -gt 0) {
    Write-Host "`nArquivos atualizados:"
    foreach ($arquivo in $arquivosModificados) {
        Write-Host "- $arquivo"
    }
}
