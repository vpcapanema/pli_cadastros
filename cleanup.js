// Script para remover arquivos e diretórios duplicados após a reorganização
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();

// Lista de diretórios e arquivos a serem removidos
const toRemove = [
  // Diretórios duplicados
  'backend',
  'frontend_html',
  'frontend',
  
  // Arquivos ZIP
  'frontend_html.zip',
  'frontend_html1.zip',
  
  // Scripts temporários na raiz (já movidos para scripts/utils)
  'fix-pessoa-fisica-form.js',
  'fix-pessoa-juridica-form.js',
  'fix-usuarios-form.js',
  'form-table-validator.js',
  'listTables.js',
  'start_pli.py.py',
  'python start_frontend.py',
  
  // README duplicado
  'README_CENTRALIZADO.md'
];

console.log('ATENÇÃO: Este script removerá permanentemente os seguintes arquivos e diretórios:');
toRemove.forEach(item => console.log(`- ${item}`));
console.log('\nCertifique-se de que a reorganização foi concluída com sucesso antes de continuar.');
console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');

// Aguardar 5 segundos antes de continuar
setTimeout(() => {
  console.log('\nIniciando limpeza...');
  
  toRemove.forEach(item => {
    const fullPath = path.join(rootDir, item);
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          // Remover diretório recursivamente
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`Diretório removido: ${item}`);
        } else {
          // Remover arquivo
          fs.unlinkSync(fullPath);
          console.log(`Arquivo removido: ${item}`);
        }
      } catch (err) {
        console.error(`Erro ao remover ${item}: ${err.message}`);
      }
    } else {
      console.log(`Item não encontrado: ${item}`);
    }
  });
  
  console.log('\nLimpeza concluída!');
}, 5000);