/**
 * Script para testar a conexão com o servidor de email
 * Execução: node tools/test-email.js
 */
const emailService = require('../src/services/emailService');

async function testarEmail() {
  console.log('Testando conexão com servidor de email...');
  
  try {
    // Testa a conexão com o servidor
    const conexaoOk = await emailService.testarConexao();
    
    if (conexaoOk) {
      console.log('✅ Conexão com servidor de email estabelecida com sucesso!');
      
      // Envia um email de teste para o administrador
      console.log('Enviando email de teste...');
      
      const usuarioTeste = {
        nome_completo: 'Usuário de Teste',
        email: process.env.EMAIL_ADMIN,
        instituicao: 'Instituição de Teste',
        tipo_usuario: 'VISUALIZADOR'
      };
      
      const resultado = await emailService.enviarConfirmacaoSolicitacao(usuarioTeste);
      
      if (resultado) {
        console.log('✅ Email de teste enviado com sucesso!');
        console.log(`Email enviado para: ${process.env.EMAIL_ADMIN}`);
      } else {
        console.error('❌ Falha ao enviar email de teste.');
      }
    } else {
      console.error('❌ Não foi possível conectar ao servidor de email.');
      console.log('Verifique as configurações no arquivo .env:');
      console.log(`- SMTP_HOST: ${process.env.SMTP_HOST}`);
      console.log(`- SMTP_PORT: ${process.env.SMTP_PORT}`);
      console.log(`- SMTP_USER: ${process.env.SMTP_USER}`);
      console.log('- SMTP_PASS: ********');
    }
  } catch (error) {
    console.error('❌ Erro ao testar email:', error);
  }
}

testarEmail();