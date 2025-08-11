// Script para remover os arquivos originais após a reorganização
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = process.cwd();

// Lista de arquivos a serem removidos
const filesToRemove = [
  '.env',
  '.hintrc',
  'docker-compose.yml',
  'Dockerfile',
  'kill_and_clean.js',
  'test-db.js',
  'DIAGNOSTICO_FINAL.md',
  'modelo_paginas.md',
];

// Verificar se o modo forçado está ativado
const forceMode = process.argv.includes('--force');

// Função para remover arquivos
function removeFiles() {
  console.log('Removendo arquivos originais...');

  filesToRemove.forEach((file) => {
    const filePath = path.join(rootDir, file);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Arquivo removido: ${file}`);
      } catch (err) {
        console.error(`❌ Erro ao remover ${file}: ${err.message}`);
      }
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${file}`);
    }
  });

  console.log('\n✅ Remoção de arquivos originais concluída!');
}

// Solicitar confirmação do usuário
if (forceMode) {
  removeFiles();
} else {
  console.log('ATENÇÃO: Este script removerá permanentemente os seguintes arquivos:');
  filesToRemove.forEach((file) => console.log(`- ${file}`));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nTem certeza que deseja continuar? (s/N): ', (answer) => {
    if (answer.toLowerCase() === 's') {
      removeFiles();
    } else {
      console.log('Operação cancelada pelo usuário.');
    }
    rl.close();
  });
}
