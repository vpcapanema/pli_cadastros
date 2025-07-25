/**
 * Script para atualizar todas as páginas HTML para usar o footer compartilhado
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
  // path.join(__dirname, '..', 'public'), // removido: pasta public não existe mais
  path.join(__dirname, '..', 'views')
];

// Código para substituir o footer
const footerCode = `
    <!-- Footer -->
    <div id="footer-container">
        <!-- O footer será carregado aqui via JavaScript -->
    </div>
    
    <script>
        // Carrega o footer compartilhado
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/views/components/footer.html')
                .then(response => response.text())
                .then(html => {
                    document.getElementById('footer-container').innerHTML = html;
                })
                .catch(error => console.error('Erro ao carregar footer:', error));
        });
    </script>
`;

// Regex para encontrar o footer existente
const footerRegex = /<footer[\s\S]*?<\/footer>/;

/**
 * Processa um arquivo HTML
 */
async function processHtmlFile(filePath) {
  try {
    console.log(`Processando: ${filePath}`);
    
    // Lê o conteúdo do arquivo
    const content = await readFile(filePath, 'utf8');
    
    // Verifica se já tem o footer-container
    if (content.includes('id="footer-container"')) {
      console.log(`  - Já possui o footer compartilhado`);
      return;
    }
    
    // Substitui o footer existente pelo código do footer compartilhado
    const updatedContent = content.replace(footerRegex, footerCode);
    
    // Se não encontrou um footer para substituir, não faz nada
    if (updatedContent === content) {
      console.log(`  - Não encontrou footer para substituir`);
      return;
    }
    
    // Salva o arquivo atualizado
    await writeFile(filePath, updatedContent, 'utf8');
    console.log(`  - Footer atualizado com sucesso`);
    
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
  console.log('Iniciando atualização de footers...');
  
  for (const dir of directories) {
    console.log(`\nProcessando diretório: ${dir}`);
    await processDirectory(dir);
  }
  
  console.log('\nProcessamento concluído!');
}

// Executa o script
main().catch(console.error);