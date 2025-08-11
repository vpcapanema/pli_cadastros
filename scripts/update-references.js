// Script para atualizar referências aos arquivos movidos
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

// Arquivos que podem conter referências
const filesToCheck = ['server.js', 'package.json', 'src/config/database.js', 'README.md'];

// Mapeamento de arquivos movidos
const fileMapping = {
  '.env': 'config/.env',
  '.hintrc': 'config/.hintrc',
  'docker-compose.yml': 'config/docker-compose.yml',
  Dockerfile: 'config/Dockerfile',
  'kill_and_clean.js': 'tools/kill_and_clean.js',
  'test-db.js': 'tools/test-db.js',
  'DIAGNOSTICO_FINAL.md': 'docs/DIAGNOSTICO_FINAL.md',
  'modelo_paginas.md': 'docs/modelo_paginas.md',
};

// Função para atualizar referências em um arquivo
function updateReferences(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Verificar e atualizar referências
  Object.entries(fileMapping).forEach(([oldPath, newPath]) => {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath, 'g'), newPath);
      updated = true;
      console.log(`✅ Referência atualizada em ${filePath}: ${oldPath} -> ${newPath}`);
    }
  });

  // Salvar arquivo se houver alterações
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Arquivo atualizado: ${filePath}`);
  } else {
    console.log(`ℹ️ Nenhuma referência encontrada em: ${filePath}`);
  }
}

// Atualizar referências em todos os arquivos
console.log('Atualizando referências aos arquivos movidos...');
filesToCheck.forEach((file) => {
  const filePath = path.join(rootDir, file);
  console.log(`\nVerificando arquivo: ${file}`);
  updateReferences(filePath);
});

console.log('\n✅ Atualização de referências concluída!');
