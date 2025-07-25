/**
 * Script para atualizar os botões em todas as páginas HTML
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

// Regex para encontrar botões
const buttonRegex = /<button[^>]*class="([^"]*)(btn-primary|btn-secondary)([^"]*)"([^>]*)>[\s\S]*?<\/button>/g;
const modalButtonRegex = /<a[^>]*class="([^"]*)(btn-primary|btn-secondary)([^"]*)"([^>]*)>[\s\S]*?<\/a>/g;

/**
 * Processa um arquivo HTML
 */
async function processHtmlFile(filePath) {
  try {
    console.log(`Processando: ${filePath}`);
    
    // Lê o conteúdo do arquivo
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    
    // Atualiza botões normais
    content = content.replace(buttonRegex, (match, prefix, btnType, suffix, rest) => {
      // Verifica se já tem as classes btn-lg e px-4
      if (match.includes('btn-lg') && match.includes('px-4')) {
        return match;
      }
      
      // Adiciona as classes btn-lg e px-4
      const newClass = `${prefix}${btnType} btn-lg px-4${suffix}`;
      modified = true;
      return `<button class="${newClass}"${rest}>` + match.substring(match.indexOf('>'));
    });
    
    // Atualiza botões em modais
    content = content.replace(modalButtonRegex, (match, prefix, btnType, suffix, rest) => {
      // Verifica se já tem as classes btn-lg e px-4
      if (match.includes('btn-lg') && match.includes('px-4')) {
        return match;
      }
      
      // Adiciona as classes btn-lg e px-4
      const newClass = `${prefix}${btnType} btn-lg px-4${suffix}`;
      modified = true;
      return `<a class="${newClass}"${rest}>` + match.substring(match.indexOf('>'));
    });
    
    // Se não houve modificações, não faz nada
    if (!modified) {
      console.log(`  - Nenhum botão para atualizar`);
      return;
    }
    
    // Salva o arquivo atualizado
    await writeFile(filePath, content, 'utf8');
    console.log(`  - Botões atualizados com sucesso`);
    
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
  console.log('Iniciando atualização de botões...');
  
  for (const dir of directories) {
    console.log(`\nProcessando diretório: ${dir}`);
    await processDirectory(dir);
  }
  
  console.log('\nProcessamento concluído!');
}

// Executa o script
main().catch(console.error);