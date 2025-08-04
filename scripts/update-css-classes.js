/**
 * Script para atualizar classes CSS nas páginas HTML
 * Este script substitui prefixos de classe "page-" por "p-" em arquivos HTML
 */

const fs = require('fs');
const path = require('path');

// Diretórios para buscar arquivos HTML
const directories = [
  path.join(__dirname, '..', 'views', 'app'),
  path.join(__dirname, '..', 'views', 'admin'),
  path.join(__dirname, '..', 'views', 'components'),
  path.join(__dirname, '..', 'views', 'public'),
  path.join(__dirname, '..', 'views', 'templates'),
  path.join(__dirname, '..'), // Raiz do projeto
];

// Função para criar backup de um arquivo
function backupFile(filePath) {
  const backupPath = `${filePath}.bak`;
  console.log(`  → Criando backup: ${backupPath}`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Função para atualizar classes nos arquivos HTML
function updateClasses(filePath) {
  console.log(`Processando: ${filePath}`);

  // Criar backup antes de modificar
  backupFile(filePath);

  let content = fs.readFileSync(filePath, 'utf8');

  // Substituir classes "page-xxx" por "p-xxx" em todos os contextos
  let updatedContent = content;

  // Procura por class="page-nome"
  updatedContent = updatedContent.replace(/class="page-([^"]+)"/g, 'class="p-$1"');

  // Procura por class="algo page-nome"
  updatedContent = updatedContent.replace(/class="([^"]*)\s+page-([^"]+)"/g, 'class="$1 p-$2"');

  // Procura por class="page-nome algo"
  updatedContent = updatedContent.replace(/class="page-([^"]+)\s+([^"]+)"/g, 'class="p-$1 $2"');

  // Procura por class="algo page-nome algo"
  updatedContent = updatedContent.replace(/class="([^"]*)\s+page-([^"]+)\s+([^"]+)"/g, 'class="$1 p-$2 $3"');

  // Salvar o arquivo atualizado
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`  ✓ Atualizado: ${filePath}`);
    return true;
  }

  console.log(`  ✓ Sem alterações necessárias: ${filePath}`);
  return false;
}

// Processar todos os arquivos HTML nos diretórios especificados
let totalFiles = 0;
let updatedFiles = 0;

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Diretório não encontrado: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (path.extname(file).toLowerCase() === '.html') {
      const filePath = path.join(dir, file);
      totalFiles++;
      if (updateClasses(filePath)) {
        updatedFiles++;
      }
    }
  });
});

console.log(`\nProcessamento concluído!`);
console.log(`Total de arquivos verificados: ${totalFiles}`);
console.log(`Total de arquivos atualizados: ${updatedFiles}`);
