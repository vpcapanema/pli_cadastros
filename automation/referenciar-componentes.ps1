# Script para padronizar páginas HTML referenciando componentes do base.html
# Autor: GitHub Copilot
# Data: 4 de agosto de 2025

# Função para modificar uma página HTML para referenciar os componentes do base.html
function Update-PageReferences {
    param (
        [string]$filePath,
        [bool]$isPublic,
        [string]$baseHtmlPath
    )
    
    Write-Host "Processando: $filePath"
    
    try {
        # Ler o conteúdo do arquivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Backup do arquivo original
        $backupPath = "$filePath.bak"
        if (-not (Test-Path $backupPath)) {
            Copy-Item -Path $filePath -Destination $backupPath -Force
            Write-Host "Backup criado: $backupPath" -ForegroundColor Yellow
        }
        
        # 1. Substituir a referência de navbar
        $navbarId = if ($isPublic) { "navbar-public" } else { "navbar-restricted" }
        
        # Substitui o container da navbar e o script de carregamento
        $pattern = '<div id="navbar-container">.*?</div>\s*<script src="/static/js/navbar.*?\.js".*?></script>'
        $replacement = "<div id=`"$navbarId`" include-html=`"$baseHtmlPath#$navbarId`"></div>`n<script src=`"/static/js/component-loader.js`"></script>"
        $content = $content -replace $pattern, $replacement
        
        # 2. Substituir a referência de footer
        $pattern = '<div id="footer-container">.*?</div>\s*<script src="/static/js/footer.*?\.js".*?></script>'
        $replacement = '<div id="l-footer" include-html="' + $baseHtmlPath + '#l-footer"></div>'
        $content = $content -replace $pattern, $replacement
        
        # 3. Remover múltiplos footers (alguns arquivos têm referências duplicadas)
        $pattern = '(<div id="l-footer".*?></div>)\s*(<div id="l-footer".*?></div>)'
        $replacement = '$1'
        $content = $content -replace $pattern, $replacement
        
        # 4. Adicionar o script de component-loader se ainda não existir
        if (-not ($content -match 'component-loader\.js')) {
            $content = $content -replace '(</body>)', '<script src="/static/js/component-loader.js"></script>$1'
        }
        
        # 5. Adicionar script de inicialização para carregar componentes
        $initScript = @"

<script>
  // Carregar componentes do template base
  document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carregador de componentes
    initComponentLoader();
  });
</script>
"@
        
        # Adicionar o script de inicialização antes do fechamento do body se não existir
        if (-not ($content -match 'initComponentLoader\(\)')) {
            $content = $content -replace '(</body>)', "$initScript`$1"
        }
        
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
        
        # Salvar a versão modificada
        Set-Content -Path $newFilePath -Value $content -Encoding UTF8
        Write-Host "Arquivo modificado e salvo em: $newFilePath" -ForegroundColor Green
        
    } catch {
        Write-Host "Erro ao processar $filePath`: $_" -ForegroundColor Red
    }
}

# Criar o script component-loader.js se não existir
function Create-ComponentLoader {
    $componentLoaderPath = "C:\Users\vinic\pli_cadastros\static\js\component-loader.js"
    
    if (-not (Test-Path $componentLoaderPath)) {
        $componentLoaderContent = @"
/**
 * Component Loader para SIGMA-PLI
 * Este script carrega componentes HTML do template base para serem reutilizados em páginas
 */

function initComponentLoader() {
  // Encontrar todos os elementos com atributo 'include-html'
  const elements = document.querySelectorAll('[include-html]');
  
  elements.forEach(element => {
    const includeValue = element.getAttribute('include-html');
    
    // Verifica se é uma referência com ID de componente
    if (includeValue.includes('#')) {
      const [filePath, componentId] = includeValue.split('#');
      
      // Carregar o arquivo HTML
      fetch(filePath)
        .then(response => response.text())
        .then(html => {
          // Criar um DOM temporário para extrair o componente
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          // Encontrar o componente pelo ID
          const component = tempDiv.querySelector('#' + componentId);
          
          if (component) {
            // Copiar o conteúdo do componente para o elemento atual
            element.innerHTML = component.outerHTML;
            
            // Copiar os atributos do componente para o elemento atual
            for (let i = 0; i < component.attributes.length; i++) {
              const attr = component.attributes[i];
              if (attr.name !== 'id') {
                element.setAttribute(attr.name, attr.value);
              }
            }
            
            // Executar scripts dentro do componente carregado
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
              const newScript = document.createElement('script');
              Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
              });
              newScript.textContent = script.textContent;
              script.parentNode.replaceChild(newScript, script);
            });
          } else {
            console.error('Componente com ID "' + componentId + '" não encontrado em ' + filePath);
          }
        })
        .catch(error => {
          console.error('Erro ao carregar componente:', error);
          element.innerHTML = '<p>Erro ao carregar componente</p>';
        });
    } else {
      // Carregar arquivo HTML completo
      fetch(includeValue)
        .then(response => response.text())
        .then(html => {
          element.innerHTML = html;
          
          // Executar scripts dentro do componente carregado
          const scripts = element.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
          });
        })
        .catch(error => {
          console.error('Erro ao carregar componente:', error);
          element.innerHTML = '<p>Erro ao carregar componente</p>';
        });
    }
  });
}

// Exportar a função para uso global
window.initComponentLoader = initComponentLoader;
"@
        
        # Criar o diretório se necessário
        $componentLoaderDir = [System.IO.Path]::GetDirectoryName($componentLoaderPath)
        if (-not (Test-Path $componentLoaderDir)) {
            New-Item -ItemType Directory -Path $componentLoaderDir -Force | Out-Null
        }
        
        # Salvar o arquivo
        Set-Content -Path $componentLoaderPath -Value $componentLoaderContent -Encoding UTF8
        Write-Host "Arquivo component-loader.js criado em: $componentLoaderPath" -ForegroundColor Green
    }
}

# Diretórios a processar
$baseDir = "C:\Users\vinic\pli_cadastros"
$publicDir = Join-Path -Path $baseDir -ChildPath "views\public"
$adminDir = Join-Path -Path $baseDir -ChildPath "views\admin"
$appDir = Join-Path -Path $baseDir -ChildPath "views\app"
$baseHtmlPath = "/views/templates/base.html"

# Criar o component-loader.js
Create-ComponentLoader

# Garantir que os diretórios de destino existam
$publicDestDir = Join-Path -Path $baseDir -ChildPath "views\00public"
$adminDestDir = Join-Path -Path $baseDir -ChildPath "views\00admin"
$appDestDir = Join-Path -Path $baseDir -ChildPath "views\00app"

if (-not (Test-Path $publicDestDir)) { New-Item -ItemType Directory -Path $publicDestDir -Force | Out-Null }
if (-not (Test-Path $adminDestDir)) { New-Item -ItemType Directory -Path $adminDestDir -Force | Out-Null }
if (-not (Test-Path $appDestDir)) { New-Item -ItemType Directory -Path $appDestDir -Force | Out-Null }

# Processar arquivos públicos
if (Test-Path $publicDir) {
    Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-PageReferences -filePath $_.FullName -isPublic $true -baseHtmlPath $baseHtmlPath
    }
}

# Processar arquivos administrativos
if (Test-Path $adminDir) {
    Get-ChildItem -Path $adminDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-PageReferences -filePath $_.FullName -isPublic $false -baseHtmlPath $baseHtmlPath
    }
}

# Processar arquivos de aplicação
if (Test-Path $appDir) {
    Get-ChildItem -Path $appDir -Filter "*.html" -Recurse | ForEach-Object {
        Update-PageReferences -filePath $_.FullName -isPublic $false -baseHtmlPath $baseHtmlPath
    }
}

Write-Host "Processo de padronização concluído!" -ForegroundColor Cyan
Write-Host "As páginas HTML foram modificadas para referenciar componentes do base.html e salvas nos diretórios 00admin, 00app e 00public." -ForegroundColor Cyan
