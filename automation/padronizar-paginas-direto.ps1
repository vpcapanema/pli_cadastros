# Script para padronizar páginas HTML substituindo header e footer
# Autor: GitHub Copilot
# Data: 4 de agosto de 2025

# Extrair cabeçalho (navbar) do template base
function Get-HeaderTemplate {
    param (
        [bool]$isPublic
    )
    
    # Caminho para o template base
    $baseTemplateFile = "C:\Users\vinic\pli_cadastros\views\templates\base.html"
    $baseContent = Get-Content -Path $baseTemplateFile -Raw -Encoding UTF8
    
    # Extrair o header completo
    if ($baseContent -match '<header class="l-header">(.*?)</header>') {
        $headerContent = $matches[1]
        
        # Configurar a exibição das navbars
        if ($isPublic) {
            # Para páginas públicas, exibir apenas navbar pública
            $headerContent = $headerContent -replace 'style="display: \'\{\{public_navbar_display\|default\(\'block\'\)\}\}\';"', 'style="display: block;"'
            $headerContent = $headerContent -replace 'style="display: \'\{\{restricted_navbar_display\|default\(\'none\'\)\}\}\';"', 'style="display: none;"'
        } else {
            # Para páginas restritas, exibir apenas navbar restrita
            $headerContent = $headerContent -replace 'style="display: \'\{\{public_navbar_display\|default\(\'block\'\)\}\}\';"', 'style="display: none;"'
            $headerContent = $headerContent -replace 'style="display: \'\{\{restricted_navbar_display\|default\(\'none\'\)\}\}\';"', 'style="display: block;"'
        }
        
        # Remover variáveis template
        $headerContent = $headerContent -replace '\{\{[^}]+\}\}', 'Usuário'
        
        return "<header class=`"l-header`">$headerContent</header>"
    }
    
    return $null
}

# Extrair rodapé do template base
function Get-FooterTemplate {
    # Caminho para o template base
    $baseTemplateFile = "C:\Users\vinic\pli_cadastros\views\templates\base.html"
    $baseContent = Get-Content -Path $baseTemplateFile -Raw -Encoding UTF8
    
    # Extrair o footer completo
    if ($baseContent -match '<footer class="l-footer">(.*?)</footer>') {
        return "<footer class=`"l-footer`">$($matches[1])</footer>"
    }
    
    return $null
}

# Extrair dependências CSS e JavaScript do template base
function Get-BaseDependencies {
    # Caminho para o template base
    $baseTemplateFile = "C:\Users\vinic\pli_cadastros\views\templates\base.html"
    $baseContent = Get-Content -Path $baseTemplateFile -Raw -Encoding UTF8
    
    $dependencies = @{
        CSS = @()
        JavaScript = @()
    }
    
    # Extrair CSS
    if ($baseContent -match '<head>(.*?)</head>') {
        $headContent = $matches[1]
        $cssMatches = [regex]::Matches($headContent, '<link.*?href="(.*?)".*?>')
        
        foreach ($match in $cssMatches) {
            $href = $match.Groups[1].Value
            $dependencies.CSS += $href
        }
    }
    
    # Extrair JavaScript
    if ($baseContent -match '<script src="https://cdn\.jsdelivr\.net/npm/bootstrap@.*?"></script>') {
        $dependencies.JavaScript += $matches[0]
    }
    
    return $dependencies
}

# Função para padronizar uma página HTML existente
function Update-HtmlFile {
    param (
        [string]$filePath,
        [bool]$isPublic
    )
    
    Write-Host "Processando: $filePath"
    
    try {
        # Ler o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Obter templates
        $headerTemplate = Get-HeaderTemplate -isPublic $isPublic
        $footerTemplate = Get-FooterTemplate
        
        if ($null -eq $headerTemplate -or $null -eq $footerTemplate) {
            Write-Host "Erro: Não foi possível extrair o cabeçalho ou rodapé do template base" -ForegroundColor Red
            return
        }
        
        # Extrair o conteúdo principal da página atual
        $mainContent = $null
        if ($content -match '<main.*?>(.*?)</main>' -or 
            $content -match '<div class="pli-main-content".*?>(.*?)</div>' -or
            $content -match '<div class="container.*?>(.*?)</div>') {
            $mainContent = $matches[1]
        }
        
        if ($null -eq $mainContent) {
            # Alternativa: pegar todo o conteúdo entre o fechamento do header e o início do footer
            if ($content -match '</header>(.*?)<footer' -or $content -match '</nav>(.*?)<footer') {
                $mainContent = $matches[1]
            }
        }
        
        if ($null -eq $mainContent) {
            Write-Host "Erro: Não foi possível extrair o conteúdo principal de $filePath" -ForegroundColor Red
            return
        }
        
        # Extrair o head da página original (para preservar CSS e metadados específicos)
        $headContent = ""
        if ($content -match '<head>(.*?)</head>') {
            $headContent = $matches[1]
        }
        
        # Extrair scripts da página original (para preservar JavaScript específico)
        $scriptContent = ""
        $scriptMatches = [regex]::Matches($content, '<script.*?</script>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        foreach ($match in $scriptMatches) {
            if ($match.Value -notmatch 'bootstrap|navbar|footer|toggleNavbar|updateSystemStatus') {
                $scriptContent += $match.Value + "`n"
            }
        }
        
        # Construir a página padronizada
        $newContent = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    $headContent
</head>
<body class="$(if ($content -match '<body class="([^"]*)"') { $matches[1] } else { "" })">
    $headerTemplate
    
    <!-- MAIN CONTENT -->
    <main class="l-main">
      <div class="container-fluid">
        $mainContent
      </div>
    </main>
    
    $footerTemplate
    
    <!-- JavaScript Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript específico da página -->
    $scriptContent
    
    <!-- PLI System JavaScript -->
    <script>
      // Toggle entre navbars baseado no estado de login
      function toggleNavbar(isLoggedIn) {
        const publicNavbar = document.getElementById('navbar-public');
        const restrictedNavbar = document.getElementById('navbar-restricted');

        if (isLoggedIn) {
          publicNavbar.style.display = 'none';
          restrictedNavbar.style.display = 'block';
        } else {
          publicNavbar.style.display = 'block';
          restrictedNavbar.style.display = 'none';
        }
      }

      // Inicialização
      document.addEventListener('DOMContentLoaded', function () {
        // Verificar estado de login e ajustar navbar
        const isLoggedIn = localStorage.getItem('pli_user_logged') === 'true';
        toggleNavbar(isLoggedIn);

        // Adicionar classe ativa no link atual
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.pli-navbar__link');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === currentPath) {
            link.classList.add('pli-navbar__link--active');
          }
        });
      });
    </script>
</body>
</html>
"@
        
        # Caminho para o arquivo padronizado
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $outputPath = [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($filePath), "$fileName.padronizado")
        
        # Salvar o arquivo padronizado
        Set-Content -Path $outputPath -Value $newContent -Encoding UTF8
        Write-Host "Arquivo padronizado criado: $outputPath" -ForegroundColor Green
        
    } catch {
        Write-Host "Erro ao processar $filePath: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Diretórios a processar
$publicDir = "C:\Users\vinic\pli_cadastros\views\public"
$adminDir = "C:\Users\vinic\pli_cadastros\views\admin"
$appDir = "C:\Users\vinic\pli_cadastros\views\app"

# Processar arquivos públicos
if (Test-Path $publicDir) {
    Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-HtmlFile -filePath $_.FullName -isPublic $true
    }
}

# Processar arquivos administrativos
if (Test-Path $adminDir) {
    Get-ChildItem -Path $adminDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-HtmlFile -filePath $_.FullName -isPublic $false
    }
}

# Processar arquivos de aplicação
if (Test-Path $appDir) {
    Get-ChildItem -Path $appDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-HtmlFile -filePath $_.FullName -isPublic $false
    }
}

Write-Host "Processo de padronização concluído!" -ForegroundColor Cyan
