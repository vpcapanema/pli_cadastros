// Script para automatizar a reorganização e limpeza do projeto
const { execSync } = require('child_process');
const path = require('path');

const rootDir = process.cwd();

console.log('🚀 Iniciando reorganização e limpeza do projeto PLI Cadastros...');

try {
  // Executar reorganização
  console.log('\n📂 Executando reorganização de diretórios...');
  execSync('node reorganize.js', { stdio: 'inherit' });

  // Verificar se o usuário quer continuar com a limpeza
  const forceMode = process.argv.includes('--force');

  if (forceMode) {
    // Executar limpeza em modo forçado
    console.log('\n🧹 Executando limpeza em modo forçado...');
    execSync('node cleanup.js --force', { stdio: 'inherit' });

    // Executar kill_and_clean em modo Docker
    console.log('\n🔄 Finalizando limpeza...');
    execSync('node kill_and_clean.js --docker', { stdio: 'inherit' });
  } else {
    console.log('\n⚠️ Para completar o processo com limpeza, execute:');
    console.log('   node cleanup.js');
    console.log('   node kill_and_clean.js');
  }

  console.log('\n✅ Processo de reorganização concluído!');
  console.log('\n📋 Para executar todo o processo em um único comando, use:');
  console.log('   node scripts/organize-project.js --force');
} catch (error) {
  console.error('\n❌ Erro durante o processo:', error.message);
  process.exit(1);
}
