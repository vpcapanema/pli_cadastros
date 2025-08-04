# Script para padronizar páginas HTML, substituindo cabeçalho e rodapé pelo base.html
# Autor: GitHub Copilot
# Data: 4 de agosto de 2025

# Função para extrair o conteúdo principal de uma página HTML
function Extract-MainContent {
    param (
        [string]$htmlContent
    )
    
    # Abordagem mais agressiva: pegar todo conteúdo do body e remover partes não desejadas
    if ($htmlContent -match '<body.*?>(.*?)</body>') {
        $bodyContent = $matches[1]
        
        # Remover cabeçalhos, navbars, footers e scripts
        $cleanContent = $bodyContent
        
        # Remover cabeçalho e navbar
        $cleanContent = $cleanContent -replace '<header.*?</header>', ''
        $cleanContent = $cleanContent -replace '<nav.*?</nav>', ''
        $cleanContent = $cleanContent -replace '<div id="navbar-container">.*?</div>', ''
        $cleanContent = $cleanContent -replace '<script.*?navbar.*?</script>', ''
        
        # Remover footer
        $cleanContent = $cleanContent -replace '<footer.*?</footer>', ''
        $cleanContent = $cleanContent -replace '<div id="footer-container">.*?</div>', ''
        $cleanContent = $cleanContent -replace '<script.*?footer.*?</script>', ''
        
        # Procurar por conteúdo principal usando vários padrões
        if ($cleanContent -match '<main.*?>(.*?)</main>') {
            return $matches[1].Trim()
        }
        
        if ($cleanContent -match '<div class="container.*?>(.*?)</div>') {
            return $matches[1].Trim()
        }
        
        if ($cleanContent -match '<div class="pli-main-content".*?>(.*?)</div>') {
            return $matches[1].Trim()
        }
        
        # Se não encontrou padrões específicos, usar todo o conteúdo limpo
        return $cleanContent.Trim()
    }
    
    # Se não conseguir extrair nada do body, retornar nulo
    return $null
}

# Função para extrair links CSS específicos da página
function Extract-CSS {
    param (
        [string]$htmlContent
    )
    
    $cssLinks = @()
    
    # Extrair links de CSS externos (exceto os que já estão no base.html)
    if ($htmlContent -match '<head.*?>(.*?)</head>') {
        $headContent = $matches[1]
        $cssMatches = [regex]::Matches($headContent, '<link.*?href="(.*?)".*?>')
        
        foreach ($match in $cssMatches) {
            $href = $match.Groups[1].Value
            if ($href -notmatch 'bootstrap|font-awesome|googleapis|main\.css') {
                $cssLinks += "<link href=`"$href`" rel=`"stylesheet`">"
            }
        }
    }
    
    return $cssLinks -join "`n"
}

# Função para extrair scripts específicos da página
function Extract-Scripts {
    param (
        [string]$htmlContent
    )
    
    $scripts = @()
    
    # Scripts externos
    $scriptMatches = [regex]::Matches($htmlContent, '<script.*?src="(.*?)".*?></script>')
    foreach ($match in $scriptMatches) {
        $src = $match.Groups[1].Value
        if ($src -notmatch 'bootstrap|navbar|footer') {
            $scripts += "<script src=`"$src`"></script>"
        }
    }
    
    # Scripts internos
    $inlineMatches = [regex]::Matches($htmlContent, '<script(?![^>]*src=)[^>]*>(.*?)</script>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($match in $inlineMatches) {
        $content = $match.Groups[1].Value
        if ($content -notmatch 'navbar|footer|updateSystemStatus') {
            $scripts += "<script>$content</script>"
        }
    }
    
    return $scripts -join "`n"
}

# Função para extrair o título da página
function Extract-Title {
    param (
        [string]$htmlContent
    )
    
    if ($htmlContent -match '<title>(.*?)</title>') {
        $fullTitle = $matches[1]
        # Remover a parte "- SIGMA/PLI" se existir
        $title = $fullTitle -replace ' \| SIGMA/PLI$', '' -replace ' - .*$', ''
        return $title
    }
    
    return "Página"  # Título padrão
}

# Função para determinar a classe do body
function Extract-BodyClass {
    param (
        [string]$htmlContent
    )
    
    if ($htmlContent -match '<body class="([^"]*)"') {
        return $matches[1]
    }
    
    if ($htmlContent -match '<body.*?>') {
        return ""  # Body sem classe
    }
    
    return ""  # Padrão
}

# Função para aplicar a padronização diretamente no arquivo existente
function Process-HtmlFile {
    param (
        [string]$filePath,
        [bool]$isPublic
    )
    
    Write-Host "Processando: $filePath"
    
    try {
        # Ler o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Extrair informações
        $mainContent = Extract-MainContent -htmlContent $content
        $cssLinks = Extract-CSS -htmlContent $content
        $scripts = Extract-Scripts -htmlContent $content
        $title = Extract-Title -htmlContent $content
        $bodyClass = Extract-BodyClass -htmlContent $content
        
        if ($null -eq $mainContent) {
            Write-Host "Não foi possível extrair o conteúdo principal de $filePath" -ForegroundColor Red
            return
        }
        
        # Configurar qual navbar deve ser visível
        $publicDisplay = if ($isPublic) { "block" } else { "none" }
        $restrictedDisplay = if ($isPublic) { "none" } else { "block" }
        
        # Construir a nova página HTML
        $newHtml = @"
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="SIGMA/PLI - Sistema de Gerenciamento de Cadastros" />
    <meta name="author" content="VPC-GEOSER" />

    <!-- Título da página -->
    <title>$title | SIGMA/PLI</title>

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />

    <!-- Google Fonts - Montserrat -->
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <!-- PLI Design System CSS -->
    <link href="/static/css/main.css" rel="stylesheet" />

    <!-- CSS específico da página -->
    $cssLinks
  </head>

  <body class="$bodyClass">
    <!-- HEADER - NAVBAR -->
    <header class="l-header">
      <!-- Navbar Público (não logado) -->
      <nav
        class="navbar navbar-expand-lg pli-navbar"
        id="navbar-public"
        style="display: $publicDisplay;"
      >
        <div class="pli-navbar__container">
          <!-- Brand/Logo -->
          <a class="pli-navbar__brand" href="/index.html"> <i class="fas fa-building me-2"></i>SIGMA-Cadastro PLI </a>

          <!-- Mobile Toggle -->
          <button
            class="pli-navbar__toggle d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarPublic"
            aria-controls="navbarPublic"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i class="fas fa-bars"></i>
          </button>

          <!-- Navigation Links -->
          <div class="collapse navbar-collapse" id="navbarPublic">
            <ul class="pli-navbar__nav ms-auto">
              <li class="nav-item">
                <a class="pli-navbar__link" href="/index.html"> <i class="fas fa-home me-1"></i>Início </a>
              </li>
              <li class="nav-item dropdown pli-navbar__dropdown">
                <a
                  class="pli-navbar__link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fas fa-user-plus me-1"></i>Cadastros
                </a>
                <ul class="pli-navbar__dropdown-menu">
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/cadastro-pessoa-fisica.html">
                      <i class="fas fa-user me-2"></i>Pessoa Física
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/cadastro-pessoa-juridica.html">
                      <i class="fas fa-building me-2"></i>Pessoa Jurídica
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/cadastro-usuario.html">
                      <i class="fas fa-users me-2"></i>Usuários
                    </a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="pli-navbar__link" href="/login.html"> <i class="fas fa-sign-in-alt me-1"></i>Login </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Navbar Restrito (usuário logado) -->
      <nav
        class="navbar navbar-expand-lg pli-navbar"
        id="navbar-restricted"
        style="display: $restrictedDisplay;"
      >
        <div class="pli-navbar__container">
          <!-- Brand/Logo -->
          <a class="pli-navbar__brand" href="/dashboard.html"> <i class="fas fa-building me-2"></i>SIGMA-Cadastro </a>

          <!-- Mobile Toggle -->
          <button
            class="pli-navbar__toggle d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarRestricted"
            aria-controls="navbarRestricted"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i class="fas fa-bars"></i>
          </button>

          <!-- Navigation Links -->
          <div class="collapse navbar-collapse" id="navbarRestricted">
            <ul class="pli-navbar__nav me-auto">
              <li class="nav-item">
                <a class="pli-navbar__link" href="/dashboard.html">
                  <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item dropdown pli-navbar__dropdown">
                <a
                  class="pli-navbar__link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fas fa-users me-1"></i>Cadastros
                </a>
                <ul class="pli-navbar__dropdown-menu">
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/pessoa-fisica.html">
                      <i class="fas fa-user me-2"></i>Pessoa Física
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/pessoa-juridica.html">
                      <i class="fas fa-building me-2"></i>Pessoa Jurídica
                    </a>
                  </li>
                </ul>
              </li>
              <li class="nav-item dropdown pli-navbar__dropdown">
                <a
                  class="pli-navbar__link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fas fa-cogs me-1"></i>Gerencial
                </a>
                <ul class="pli-navbar__dropdown-menu">
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/usuarios.html">
                      <i class="fas fa-users-cog me-2"></i>Usuários
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/solicitacoes-cadastro.html">
                      <i class="fas fa-clipboard-list me-2"></i>Solicitações
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/sessions-manager.html">
                      <i class="fas fa-network-wired me-2"></i>Sessões
                    </a>
                  </li>
                </ul>
              </li>
            </ul>

            <!-- User Profile Section -->
            <div class="pli-navbar__utilities">
              <!-- Notifications -->
              <div class="pli-navbar__notification">
                <i class="fas fa-bell"></i>
                <span
                  class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle"
                  style="font-size: 0.6rem"
                  >3</span
                >
              </div>

              <!-- User Dropdown -->
              <div class="dropdown pli-navbar__dropdown">
                <a
                  class="pli-navbar__link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div class="pli-navbar__profile">
                    <img src="/static/images/avatar-default.png" alt="Avatar" class="pli-navbar__profile-avatar me-2" />
                    <span class="pli-navbar__profile-name d-none d-md-inline">Usuário</span>
                  </div>
                </a>
                <ul class="pli-navbar__dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/meus-dados.html">
                      <i class="fas fa-user-edit me-2"></i>Meus Dados
                    </a>
                  </li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/configuracoes.html">
                      <i class="fas fa-cog me-2"></i>Configurações
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="pli-navbar__dropdown-link" href="/logout">
                      <i class="fas fa-sign-out-alt me-2"></i>Sair
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- MAIN CONTENT -->
    <main class="l-main">
      <div class="container-fluid">
        $mainContent
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="l-footer">
      <div class="pli-footer pli-footer--compact">
        <div class="pli-footer__container">
          <div class="pli-footer__content">
            <!-- Grupo 1: Logo e sistema -->
            <div class="pli-footer__group">
              <div class="pli-footer__logo">
                <i class="fas fa-building me-1"></i>SIGMA-Sistema de Gerenciamento de Cadastro
              </div>
            </div>

            <!-- Grupo 2: Links do footer -->
            <nav class="pli-footer__links">
              <a href="/sobre.html" class="pli-footer__link"
                ><i class="fas fa-info-circle"></i><span class="link-text">Sobre</span></a
              >
              <a href="/ajuda.html" class="pli-footer__link"
                ><i class="fas fa-question-circle"></i><span class="link-text">Ajuda</span></a
              >
              <a href="/contato.html" class="pli-footer__link"
                ><i class="fas fa-envelope"></i><span class="link-text">Contato</span></a
              >
              <a href="/privacidade.html" class="pli-footer__link"
                ><i class="fas fa-shield-alt"></i><span class="link-text">Privacidade</span></a
              >
            </nav>

            <!-- Grupo 3: Copyright e status -->
            <div class="pli-footer__group">
              <p class="pli-footer__copyright">
                &copy; 2025 <strong>Desenvolvido e implementado por VPC-GEOSER</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- JavaScript Dependencies -->
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- JavaScript específico da página -->
    $scripts

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

        # Determinar o novo caminho do arquivo
        $originalDir = [System.IO.Path]::GetDirectoryName($filePath)
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $newDir = ""
        
        # Determinar o novo diretório baseado no original
        if ($originalDir -like "*\public*") {
            $newDir = $originalDir -replace "\\public", "\00public"
        } elseif ($originalDir -like "*\admin*") {
            $newDir = $originalDir -replace "\\admin", "\00admin"
        } elseif ($originalDir -like "*\app*") {
            $newDir = $originalDir -replace "\\app", "\00app"
        } else {
            $newDir = $originalDir
        }
        
        # Criar o novo diretório se ele não existir
        if (-not (Test-Path $newDir)) {
            New-Item -ItemType Directory -Path $newDir -Force | Out-Null
            Write-Host "Diretório criado: $newDir" -ForegroundColor Yellow
        }
        
        # Caminho do novo arquivo
        $newFilePath = Join-Path -Path $newDir -ChildPath $fileName
        
        # Salvar a versão padronizada no novo local
        Set-Content -Path $newFilePath -Value $newHtml -Encoding UTF8
        Write-Host "Arquivo padronizado: $newFilePath" -ForegroundColor Green
        
    } catch {
        Write-Host "Erro ao processar $filePath`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Diretórios a processar
$publicDir = "C:\Users\vinic\pli_cadastros\views\public"
$adminDir = "C:\Users\vinic\pli_cadastros\views\admin"
$appDir = "C:\Users\vinic\pli_cadastros\views\app"

# Garantir que os diretórios de destino existam
$publicDestDir = "C:\Users\vinic\pli_cadastros\views\00public"
$adminDestDir = "C:\Users\vinic\pli_cadastros\views\00admin"
$appDestDir = "C:\Users\vinic\pli_cadastros\views\00app"

# Criar diretórios de destino se não existirem
if (-not (Test-Path $publicDestDir)) { New-Item -ItemType Directory -Path $publicDestDir -Force | Out-Null }
if (-not (Test-Path $adminDestDir)) { New-Item -ItemType Directory -Path $adminDestDir -Force | Out-Null }
if (-not (Test-Path $appDestDir)) { New-Item -ItemType Directory -Path $appDestDir -Force | Out-Null }

Write-Host "Diretórios de destino criados:" -ForegroundColor Cyan
Write-Host "- $publicDestDir" -ForegroundColor Cyan
Write-Host "- $adminDestDir" -ForegroundColor Cyan
Write-Host "- $appDestDir" -ForegroundColor Cyan

# Processar arquivos públicos
if (Test-Path $publicDir) {
    Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse | ForEach-Object {
        Process-HtmlFile -filePath $_.FullName -isPublic $true
    }
}

# Processar arquivos administrativos
if (Test-Path $adminDir) {
    Get-ChildItem -Path $adminDir -Filter "*.html" -Recurse | ForEach-Object {
        Process-HtmlFile -filePath $_.FullName -isPublic $false
    }
}

# Processar arquivos de aplicação
if (Test-Path $appDir) {
    Get-ChildItem -Path $appDir -Filter "*.html" -Recurse | ForEach-Object {
        Process-HtmlFile -filePath $_.FullName -isPublic $false
    }
}

Write-Host "Processo de padronização concluído!" -ForegroundColor Cyan
