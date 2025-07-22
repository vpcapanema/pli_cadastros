// Script para matar processos e limpar diretórios
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const isDockerMode = process.argv.includes('--docker');

if (!isDockerMode) {
  console.log('🔄 Matando todos os processos Node.js...');
  try {
    // No Windows, usamos taskkill para matar processos
    execSync('taskkill /F /IM node.exe', { stdio: 'inherit' });
    console.log('✅ Processos Node.js encerrados com sucesso');
  } catch (error) {
    console.log('⚠️ Nenhum processo Node.js encontrado para encerrar');
  }
} else {
  console.log('🐳 Executando em modo Docker - pulando encerramento de processos');
}

// Aguardar um momento para garantir que os processos foram encerrados
setTimeout(() => {
  console.log('\n🔄 Iniciando limpeza de diretórios...');

  // Lista de diretórios e arquivos a serem removidos
  const toRemove = [
    'backend',
    'frontend_html',
    'cleanup.js',
    'reorganize.js',
    'DIAGNOSTICO_SISTEMA.md'
  ];

  toRemove.forEach(item => {
    const fullPath = path.join(rootDir, item);
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          // Remover diretório recursivamente
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✅ Diretório removido: ${item}`);
        } else {
          // Remover arquivo
          fs.unlinkSync(fullPath);
          console.log(`✅ Arquivo removido: ${item}`);
        }
      } catch (err) {
        console.error(`❌ Erro ao remover ${item}: ${err.message}`);
      }
    } else {
      console.log(`⚠️ Item não encontrado: ${item}`);
    }
  });

  console.log('\n✅ Limpeza concluída!');
  console.log('\n📋 Estrutura final do projeto:');
  
  // Listar diretórios principais
  const mainDirs = [
    'src',
    'public',
    'views',
    'database',
    'scripts',
    'docs'
  ];
  
  mainDirs.forEach(dir => {
    if (fs.existsSync(path.join(rootDir, dir))) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ ${dir}/ (não encontrado)`);
    }
  });
  
  console.log('\n🚀 Projeto reorganizado e limpo com sucesso!');
}, 2000);