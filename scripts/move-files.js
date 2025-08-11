// Script para mover arquivos soltos para diretórios organizados
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

// Arquivos a serem movidos para o diretório config
const configFiles = ['.env', '.hintrc', 'docker-compose.yml', 'Dockerfile'];

// Arquivos a serem movidos para o diretório tools
const toolsFiles = ['kill_and_clean.js', 'test-db.js'];

// Arquivos de documentação a serem movidos para docs
const docsFiles = ['DIAGNOSTICO_FINAL.md', 'modelo_paginas.md'];

// Mover arquivos para config
console.log('Movendo arquivos para o diretório config...');
configFiles.forEach((file) => {
  const sourcePath = path.join(rootDir, file);
  const targetPath = path.join(rootDir, 'config', file);

  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Arquivo copiado: ${file} -> config/${file}`);
    } catch (err) {
      console.error(`❌ Erro ao copiar ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${file}`);
  }
});

// Mover arquivos para tools
console.log('\nMovendo arquivos para o diretório tools...');
toolsFiles.forEach((file) => {
  const sourcePath = path.join(rootDir, file);
  const targetPath = path.join(rootDir, 'tools', file);

  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Arquivo copiado: ${file} -> tools/${file}`);
    } catch (err) {
      console.error(`❌ Erro ao copiar ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${file}`);
  }
});

// Mover arquivos de documentação para docs
console.log('\nMovendo arquivos de documentação para o diretório docs...');
docsFiles.forEach((file) => {
  const sourcePath = path.join(rootDir, file);
  const targetPath = path.join(rootDir, 'docs', file);

  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Arquivo copiado: ${file} -> docs/${file}`);
    } catch (err) {
      console.error(`❌ Erro ao copiar ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${file}`);
  }
});

console.log('\n✅ Arquivos copiados com sucesso!');
console.log('\nATENÇÃO: Os arquivos originais não foram removidos.');
console.log(
  'Após verificar que tudo está funcionando corretamente, você pode remover os arquivos originais.'
);
