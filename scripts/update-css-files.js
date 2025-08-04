/**
 * Script para atualizar classes CSS nos arquivos CSS
 */

const fs = require('fs');
const path = require('path');

// Diretório de arquivos CSS de páginas
const directory = path.join(__dirname, '..', 'static', 'css', '06-pages');

// Função para atualizar classes nos arquivos CSS
function updateClasses(filePath) {
  console.log(`Processando: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Substituir .page-nome por .p-nome
  const updatedContent = content.replace(/\.page-([a-zA-Z0-9_-]+)/g, '.p-$1');

  // Salvar o arquivo atualizado
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`  ✓ Atualizado: ${filePath}`);
    return true;
  }

  console.log(`  ✓ Sem alterações necessárias: ${filePath}`);
  return false;
}

// Processar todos os arquivos CSS no diretório
let totalFiles = 0;
let updatedFiles = 0;

if (!fs.existsSync(directory)) {
  console.log(`Diretório não encontrado: ${directory}`);
  process.exit(1);
}

const files = fs.readdirSync(directory);
files.forEach((file) => {
  if (
    path.extname(file).toLowerCase() === '.css' &&
    file !== '_forms-page.css' &&
    file !== '_tables-page.css' &&
    file !== '_pages-comum.css'
  ) {
    const filePath = path.join(directory, file);
    totalFiles++;
    if (updateClasses(filePath)) {
      updatedFiles++;
    }
  }
});

console.log(`\nProcessamento concluído!`);
console.log(`Total de arquivos verificados: ${totalFiles}`);
console.log(`Total de arquivos atualizados: ${updatedFiles}`);
