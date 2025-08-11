/**
 * Script para configurar o SendGrid como serviço de email
 * Execução: node tools/setup-sendgrid.js
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Configurar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Carregar variáveis de ambiente
const envPath = path.resolve(__dirname, '../config/.env');
dotenv.config({ path: envPath });

console.log('='.repeat(60));
console.log('CONFIGURAÇÃO DO SENDGRID PARA ENVIO DE EMAILS');
console.log('='.repeat(60));
console.log('\nO SendGrid é um serviço de envio de emails confiável e fácil de configurar.');
console.log('Siga os passos abaixo para configurar:\n');
console.log('1. Crie uma conta gratuita em https://sendgrid.com/');
console.log('2. Após criar a conta, vá para "Settings > API Keys" e crie uma nova API Key');
console.log('3. Copie a API Key gerada e cole quando solicitado abaixo\n');

rl.question('Digite sua API Key do SendGrid: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('\n❌ API Key não fornecida. Configuração cancelada.');
    rl.close();
    return;
  }

  // Ler o arquivo .env
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Erro ao ler o arquivo .env:', err);
      rl.close();
      return;
    }

    // Atualizar a API Key do SendGrid
    const updatedEnv = data.replace(/SENDGRID_API_KEY=.*/, `SENDGRID_API_KEY=${apiKey}`);

    // Escrever o arquivo .env atualizado
    fs.writeFile(envPath, updatedEnv, 'utf8', (err) => {
      if (err) {
        console.error('❌ Erro ao atualizar o arquivo .env:', err);
        rl.close();
        return;
      }

      console.log('\n✅ API Key do SendGrid configurada com sucesso!');
      console.log('\nAgora você pode testar o envio de emails com:');
      console.log('npm run test-email');

      rl.question('\nDeseja configurar o email remetente? (s/n): ', (resposta) => {
        if (resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim') {
          rl.question(
            'Digite o email remetente (ex: "Sistema PLI <pli-semil-sp@outlook.com>"): ',
            (emailFrom) => {
              // Atualizar o EMAIL_FROM
              let updatedEnv = fs.readFileSync(envPath, 'utf8');
              updatedEnv = updatedEnv.replace(/EMAIL_FROM=.*/, `EMAIL_FROM="${emailFrom}"`);

              // Escrever o arquivo .env atualizado
              fs.writeFileSync(envPath, updatedEnv, 'utf8');

              console.log('\n✅ Email remetente configurado com sucesso!');
              console.log('\nConfigurações concluídas. Teste o envio de emails com:');
              console.log('npm run test-email');
              rl.close();
            }
          );
        } else {
          rl.close();
        }
      });
    });
  });
});
