/**
 * Script para atualizar todas as páginas HTML para usar o navbar compartilhado
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Diretórios a serem verificados
const directories = [
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'views')
];

// Código para substituir o navbar
const navbarCode = `
    <!-- Navegação -->
    <div id="navbar-container">
        <!-- O navbar será carregado aqui via JavaScript -->
    </div>
    
    <script>
        // Carrega o navbar compartilhado
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/views/includes/navbars.html')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const navbar = doc.querySelector('#navbar-public');
                    document.getElementById('navbar-container').innerHTML = navbar.outerHTML;
                    
                    // Marca o link atual como ativo
                    const currentPath = window.location.pathname;
                    const filename = currentPath.split('/').pop();
                    if (filename) {
                        const navLink = document.querySelector(\`#navbar-container .nav-link[href="\${filename}"]\`);
                        if (navLink) {
                            navLink.classList.add('active');
                        }
                    }
                })
                .catch(error => console.error('Erro ao carregar navbar:', error));
        });
    </script>
`;

// Regex para encontrar o navbar existente
const navbarRegex = /<nav[\s\S]*?<\/nav>/;

/**
 * Processa um arquivo HTML
 */
async function processHtmlFile(filePath) {
  try {
    console.log(`Processando: ${filePath}`);
    
    // Lê o conteúdo do arquivo
    const content = await readFile(filePath, 'utf8');
    
    // Verifica se já tem o navbar-container
    if (content.includes('id="navbar-container"')) {
      console.log(`  - Já possui o navbar compartilhado`);
      return;
    }
    
    // Substitui o navbar existente pelo código do navbar compartilhado
    const updatedContent = content.replace(navbarRegex, navbarCode);
    
    // Se não encontrou um navbar para substituir, não faz nada
    if (updatedContent === content) {
      console.log(`  - Não encontrou navbar para substituir`);
      return;
    }
    
    // Salva o arquivo atualizado
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`  - Navbar atualizado com sucesso`);
    
  } catch (error) {
    console.error(`  - Erro ao processar ${filePath}:`, error);
  }
}

/**
 * Processa um diretório recursivamente
 */
async function processDirectory(dir) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        // Ignora node_modules e outros diretórios de dependências
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          await processDirectory(filePath);
        }
      } else if (file.endsWith('.html')) {
        await processHtmlFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Erro ao processar diretório ${dir}:`, error);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('Iniciando atualização de navbars...');
  
  for (const dir of directories) {
    console.log(`\nProcessando diretório: ${dir}`);
    await processDirectory(dir);
  }
  
  console.log('\nProcessamento concluído!');
}

// Executa o script
main().catch(console.error);