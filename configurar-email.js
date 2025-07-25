/**
 * Script interativo para configurar o serviço de email
 * Execução: node configurar-email.js
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configurar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Caminho do arquivo .env
const envPath = path.resolve(__dirname, 'config/.env');

console.log('='.repeat(60));
console.log('CONFIGURAÇÃO DO SERVIÇO DE EMAIL - PLI CADASTROS');
console.log('='.repeat(60));
console.log('\nEscolha o serviço de email que deseja configurar:');
console.log('1. Gmail (Recomendado para testes)');
console.log('2. Outlook/Microsoft 365');
console.log('3. Outro serviço SMTP');

rl.question('\nDigite sua escolha (1-3): ', (choice) => {
  switch (choice) {
    case '1':
      configureGmail();
      break;
    case '2':
      configureOutlook();
      break;
    case '3':
      configureCustomSMTP();
      break;
    default:
      console.log('Opção inválida. Saindo...');
      rl.close();
  }
});

function configureGmail() {
  console.log('\n=== CONFIGURAÇÃO DO GMAIL ===');
  console.log('\nPara usar o Gmail, você precisa:');
  console.log('1. Ativar a verificação em duas etapas na sua conta Google');
  console.log('2. Criar uma senha de app em: https://myaccount.google.com/apppasswords');
  console.log('   (Selecione App: Email, Dispositivo: Outro (Nome personalizado))');
  
  rl.question('\nDigite seu email Gmail: ', (email) => {
    rl.question('Digite a senha de app gerada: ', (password) => {
      rl.question('Digite o email remetente (ex: "Sistema PLI <seu_email@gmail.com>"): ', (fromEmail) => {
        updateEnvFile({
          host: 'smtp.gmail.com',
          port: '587',
          user: email,
          pass: password,
          from: fromEmail,
          service: 'gmail'
        });
      });
    });
  });
}

function configureOutlook() {
  console.log('\n=== CONFIGURAÇÃO DO OUTLOOK/MICROSOFT 365 ===');
  console.log('\nATENÇÃO: O Outlook/Microsoft 365 geralmente requer OAuth2 para autenticação.');
  console.log('A configuração básica pode não funcionar devido às políticas de segurança da Microsoft.');
  
  rl.question('\nDigite seu email Outlook/Microsoft: ', (email) => {
    rl.question('Digite sua senha: ', (password) => {
      rl.question('Digite o email remetente (ex: "Sistema PLI <seu_email@outlook.com>"): ', (fromEmail) => {
        updateEnvFile({
          host: 'smtp.office365.com',
          port: '587',
          user: email,
          pass: password,
          from: fromEmail,
          service: 'outlook'
        });
      });
    });
  });
}

function configureCustomSMTP() {
  console.log('\n=== CONFIGURAÇÃO DE SERVIÇO SMTP PERSONALIZADO ===');
  
  rl.question('\nDigite o host SMTP (ex: smtp.exemplo.com): ', (host) => {
    rl.question('Digite a porta SMTP (ex: 587): ', (port) => {
      rl.question('Digite o usuário/email: ', (user) => {
        rl.question('Digite a senha: ', (pass) => {
          rl.question('Digite o email remetente (ex: "Sistema PLI <seu_email@exemplo.com>"): ', (fromEmail) => {
            updateEnvFile({
              host: host,
              port: port,
              user: user,
              pass: pass,
              from: fromEmail,
              service: 'custom'
            });
          });
        });
      });
    });
  });
}

function updateEnvFile(config) {
  fs.readFile(envPath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Erro ao ler o arquivo .env:', err);
      rl.close();
      return;
    }

    // Atualizar configurações de email
    let updatedEnv = data;
    
    // Atualizar host
    updatedEnv = updatedEnv.replace(
      /SMTP_HOST=.*/,
      `SMTP_HOST=${config.host}`
    );
    
    // Atualizar porta
    updatedEnv = updatedEnv.replace(
      /SMTP_PORT=.*/,
      `SMTP_PORT=${config.port}`
    );
    
    // Atualizar usuário
    updatedEnv = updatedEnv.replace(
      /SMTP_USER=.*/,
      `SMTP_USER=${config.user}`
    );
    
    // Atualizar senha
    updatedEnv = updatedEnv.replace(
      /SMTP_PASS=.*/,
      `SMTP_PASS=${config.pass}`
    );
    
    // Atualizar email remetente
    updatedEnv = updatedEnv.replace(
      /EMAIL_FROM=.*/,
      `EMAIL_FROM="${config.from}"`
    );
    
    // Atualizar email admin (mesmo que o remetente)
    updatedEnv = updatedEnv.replace(
      /EMAIL_ADMIN=.*/,
      `EMAIL_ADMIN=${config.user}`
    );

    // Escrever o arquivo .env atualizado
    fs.writeFile(envPath, updatedEnv, 'utf8', (err) => {
      if (err) {
        console.error('❌ Erro ao atualizar o arquivo .env:', err);
        rl.close();
        return;
      }

      console.log('\n✅ Configurações de email atualizadas com sucesso!');
      
      if (config.service === 'gmail') {
        console.log('\nDicas para Gmail:');
        console.log('- Certifique-se de que a verificação em duas etapas está ativada');
        console.log('- Use a senha de app gerada, não sua senha normal do Gmail');
        console.log('- Se ocorrerem erros, verifique se "Acesso a app menos seguro" está ativado');
      } else if (config.service === 'outlook') {
        console.log('\nDicas para Outlook/Microsoft 365:');
        console.log('- A autenticação básica pode estar desativada na sua conta');
        console.log('- Considere usar um serviço alternativo como Gmail ou SendGrid');
      }
      
      console.log('\nPara testar o envio de emails, execute:');
      console.log('npm run test-email');
      
      rl.close();
    });
  });
}