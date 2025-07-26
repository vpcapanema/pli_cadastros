/**
 * Envia email de confirmação de redefinição de senha
 * @param {string} email - Email do usuário
 * @param {string} nome - Nome completo do usuário
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.enviarConfirmacaoRedefinicaoSenha = async (email, nome) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; background: #f9fafb;">
        <h2 style="color: #244b72;">Senha Redefinida com Sucesso</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Sua senha foi redefinida com sucesso no <strong>SIGMA-PLI | Módulo de Gerenciamento de Cadastros</strong>.</p>
        <p>Se você não realizou esta alteração, entre em contato imediatamente com o suporte.</p>
        <hr style="margin: 24px 0;">
        <p style="font-size: 0.9em; color: #666; text-align: center;">&copy; ${new Date().getFullYear()} SIGMA-PLI • Módulo de Gerenciamento de Cadastros</p>
      </div>
    `;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Confirmação de Redefinição de Senha - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de confirmação de redefinição de senha:', error);
    return false;
  }
};
/**
 * Serviço de Email - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Responsável pelo envio de emails do sistema
 */
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../config/.env') });

// Função para criar o transporter adequado com base nas configurações disponíveis
function criarTransporter() {
  // Verificar se estamos usando Gmail
  const isGmail = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail');
  
  // Opção 1: Gmail (configuração otimizada)
  if (isGmail) {
    console.log('Usando Gmail para envio de emails');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Opção 2: SendGrid (recomendado para produção)
  else if (process.env.SENDGRID_API_KEY) {
    console.log('Usando SendGrid para envio de emails');
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Opção 3: OAuth2 para Microsoft (recomendado para contas Microsoft/Outlook)
  else if (process.env.OAUTH2_CLIENT_ID && 
           process.env.OAUTH2_CLIENT_SECRET && 
           process.env.OAUTH2_REFRESH_TOKEN) {
    console.log('Usando OAuth2 para envio de emails');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        refreshToken: process.env.OAUTH2_REFRESH_TOKEN,
        accessToken: process.env.OAUTH2_ACCESS_TOKEN
      }
    });
  }
  
  // Opção 4: Autenticação básica (configuração genérica)
  else {
    console.log('Usando autenticação básica para envio de emails');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Apenas para desenvolvimento
      }
    });
  }
}

// Criar o transporter
const transporter = criarTransporter();

/**
 * Gera um HTML com o comprovante de solicitação de cadastro
 * @param {Object} usuario - Dados do usuário
 * @returns {string} - HTML do comprovante
 */
function gerarComprovanteHTML(usuario) {
  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprovante de Solicitação de Cadastro - PLI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #244b72; }
        .section { margin-bottom: 25px; border: 1px solid #ddd; border-radius: 5px; padding: 15px; }
        .section-title { background-color: #244b72; color: white; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 5px 5px 0 0; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #666; }
        .protocol { background-color: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Comprovante de Solicitação de Cadastro</h1>
          <p>Sistema de Gerenciamento de Cadastros PLI</p>
        </div>
        
        <div class="protocol">
          Protocolo: ${usuario.id || 'PLI-' + Math.random().toString(36).substring(2, 10).toUpperCase()}<br>
          Data/Hora: ${dataFormatada}
        </div>
        
        <div class="section">
          <h3 class="section-title">Dados Pessoais</h3>
          <div class="field">
            <span class="field-label">Nome Completo:</span> ${usuario.nome_completo || ''}
          </div>
          <div class="field">
            <span class="field-label">Email:</span> ${usuario.email || ''}
          </div>
          <div class="field">
            <span class="field-label">Telefone:</span> ${usuario.telefone || ''}
          </div>
          <div class="field">
            <span class="field-label">CPF:</span> ${usuario.documento || ''}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Dados Profissionais</h3>
          <div class="field">
            <span class="field-label">Instituição:</span> ${usuario.instituicao || ''}
          </div>
          <div class="field">
            <span class="field-label">Departamento:</span> ${usuario.departamento || ''}
          </div>
          <div class="field">
            <span class="field-label">Cargo:</span> ${usuario.cargo || ''}
          </div>
          <div class="field">
            <span class="field-label">Email Institucional:</span> ${usuario.email_institucional || ''}
          </div>
          <div class="field">
            <span class="field-label">Telefone Institucional:</span> ${usuario.telefone_institucional || ''}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Dados de Acesso</h3>
          <div class="field">
            <span class="field-label">Tipo de Usuário:</span> ${usuario.tipo_usuario || ''}
          </div>
          <div class="field">
            <span class="field-label">Nome de Usuário:</span> ${usuario.username || ''}
          </div>
        </div>
        
        <div class="footer">
          <p>Este documento é um comprovante de solicitação de cadastro no SIGMA-PLI | Módulo de Gerenciamento de Cadastros.</p>
          <p>A solicitação está sujeita à aprovação pelos administradores do sistema.</p>
          <p>&copy; ${new Date().getFullYear()} Módulo de Gerenciamento de Cadastros (SIGMA-PLI)</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia email de confirmação para o usuário que solicitou acesso
 * @param {Object} usuario - Dados do usuário
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.enviarConfirmacaoSolicitacao = async (usuario) => {
  try {
    // Gerar o comprovante HTML
    const comprovanteHTML = gerarComprovanteHTML(usuario);
    
    // Lista de destinatários
    const destinatarios = [];
    
    // Adicionar email pessoal
    if (usuario.email) {
      destinatarios.push(usuario.email);
    }
    
    // Adicionar email institucional se for diferente do pessoal
    if (usuario.email_institucional && usuario.email_institucional !== usuario.email) {
      destinatarios.push(usuario.email_institucional);
    }
    
    // Se não houver destinatários, não enviar email
    if (destinatarios.length === 0) {
      console.error('Nenhum email de destinatário encontrado');
      return false;
    }
    
    // Enviar email com o comprovante anexado
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinatarios.join(', '),
      subject: "Solicitação de Acesso Recebida - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #244b72;">Solicitação de Acesso Recebida</h2>
          <p>Olá ${usuario.nome_completo},</p>
          <p>Sua solicitação de acesso ao SIGMA-PLI | Módulo de Gerenciamento de Cadastros foi recebida com sucesso.</p>
          <p><strong>Protocolo:</strong> ${usuario.id || 'PLI-' + Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          
          <h3>Próximos Passos:</h3>
          <ol>
            <li><strong>Etapa Atual:</strong> Solicitação recebida e aguardando análise.</li>
            <li><strong>Próxima Etapa:</strong> Análise pelos administradores ou gestores do sistema.</li>
            <li><strong>Etapa Final:</strong> Aprovação ou rejeição da solicitação.</li>
          </ol>
          
          <p>Você receberá um email quando sua solicitação for analisada.</p>
          <p>Em anexo, você encontrará o comprovante da sua solicitação de cadastro.</p>
          
          <p>Atenciosamente,<br>Equipe PLI</p>
        </div>
      `,
      attachments: [
        {
          filename: `Comprovante_Solicitacao_${usuario.nome_completo.replace(/\s+/g, '_')}.html`,
          content: comprovanteHTML,
          contentType: 'text/html'
        }
      ]
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    return false;
  }
};

/**
 * Busca emails de administradores e gestores no banco de dados
 * @returns {Promise<string[]>} - Lista de emails
 */
async function buscarEmailsAdministradoresGestores() {
  try {
    // Em um ambiente real, isso buscaria os emails no banco de dados
    // Aqui estamos simulando com valores fixos para demonstração
    const emailsAdmins = [process.env.EMAIL_ADMIN]; // Email do admin principal
    
    // Adicionar outros emails de administradores e gestores
    // Na implementação real, isso viria do banco de dados
    const outrosEmails = [
      // Adicione aqui outros emails de administradores e gestores
      // 'outro.admin@exemplo.com',
      // 'gestor@exemplo.com'
    ];
    
    return [...emailsAdmins, ...outrosEmails].filter(email => email && email.trim() !== '');
  } catch (error) {
    console.error('Erro ao buscar emails de administradores e gestores:', error);
    // Em caso de erro, retornar pelo menos o email admin principal
    return [process.env.EMAIL_ADMIN].filter(email => email && email.trim() !== '');
  }
}

/**
 * Notifica administradores e gestores sobre nova solicitação de acesso
 * @param {Object} usuario - Dados do usuário
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.notificarAdministradores = async (usuario) => {
  try {
    // Gerar o comprovante HTML
    const comprovanteHTML = gerarComprovanteHTML(usuario);
    
    // Buscar emails de administradores e gestores
    const emailsAdmins = await buscarEmailsAdministradoresGestores();
    
    if (emailsAdmins.length === 0) {
      console.error('Nenhum email de administrador ou gestor encontrado');
      return false;
    }
    
    // Enviar email para todos os administradores e gestores
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailsAdmins.join(', '),
      subject: "Nova Solicitação de Acesso - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #244b72;">Nova Solicitação de Acesso</h2>
          <p>Uma nova solicitação de acesso foi recebida:</p>
          <ul>
            <li><strong>Nome:</strong> ${usuario.nome_completo}</li>
            <li><strong>Email:</strong> ${usuario.email}</li>
            <li><strong>Email Institucional:</strong> ${usuario.email_institucional || 'Não informado'}</li>
            <li><strong>Instituição:</strong> ${usuario.instituicao}</li>
            <li><strong>Departamento:</strong> ${usuario.departamento || 'Não informado'}</li>
            <li><strong>Cargo:</strong> ${usuario.cargo || 'Não informado'}</li>
            <li><strong>Tipo de Usuário:</strong> ${usuario.tipo_usuario}</li>
            <li><strong>Nome de Usuário:</strong> ${usuario.username}</li>
          </ul>
          
          <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            <strong>Ação Necessária:</strong> Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.
          </p>
          
          <p>
            <a href="http://localhost:${process.env.PORT || 8888}/views/usuarios.html" 
               style="background-color: #244b72; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Acessar Painel de Usuários
            </a>
          </p>
          
          <p>Atenciosamente,<br>SIGMA-PLI | Módulo de Gerenciamento de Cadastros</p>
        </div>
      `,
      attachments: [
        {
          filename: `Comprovante_Solicitacao_${usuario.nome_completo.replace(/\s+/g, '_')}.html`,
          content: comprovanteHTML,
          contentType: 'text/html'
        }
      ]
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao notificar administradores:', error);
    return false;
  }
};

/**
 * Envia email de aprovação para o usuário
 * @param {Object} usuario - Dados do usuário
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.enviarAprovacao = async (usuario) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: "Acesso Aprovado - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #244b72;">Acesso Aprovado!</h2>
          <p>Olá ${usuario.nome_completo},</p>
          <p>Sua solicitação de acesso ao SIGMA-PLI | Módulo de Gerenciamento de Cadastros foi <strong style="color: green;">APROVADA</strong>.</p>
          <p>Você já pode acessar o sistema utilizando seu nome de usuário e senha cadastrados.</p>
          <p><a href="https://pli-cadastros.exemplo.com/login" style="background-color: #244b72; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Acessar o Sistema</a></p>
          <p>Atenciosamente,<br>Equipe PLI</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
    return false;
  }
};

/**
 * Envia email de rejeição para o usuário
 * @param {Object} usuario - Dados do usuário
 * @param {string} motivo - Motivo da rejeição
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.enviarRejeicao = async (usuario, motivo) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: "Solicitação de Acesso Não Aprovada - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #244b72;">Solicitação de Acesso Não Aprovada</h2>
          <p>Olá ${usuario.nome_completo},</p>
          <p>Sua solicitação de acesso ao SIGMA-PLI | Módulo de Gerenciamento de Cadastros não foi aprovada neste momento.</p>
          ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
          <p>Se você acredita que isso é um erro ou precisa de mais informações, entre em contato conosco respondendo a este email.</p>
          <p>Atenciosamente,<br>Equipe PLI</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de rejeição:', error);
    return false;
  }
};

/**
 * Envia email de recuperação de senha para o usuário
 * @param {string} email - Email do usuário
 * @param {string} nome - Nome completo do usuário
 * @param {string} token - Token de verificação
 * @returns {Promise<boolean>} - Sucesso ou falha no envio
 */
exports.enviarRecuperacaoSenha = async (email, nome, token) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; background: #f9fafb;">
        <h2 style="color: #244b72;">Recuperação de Senha</h2>
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir a senha de acesso ao <strong>SIGMA-PLI | Módulo de Gerenciamento de Cadastros</strong>.</p>
        <p>Utilize o código abaixo para continuar o processo de recuperação de senha:</p>
        <div style="font-size: 2rem; font-weight: bold; color: #244b72; letter-spacing: 4px; margin: 24px 0; text-align: center;">${token}</div>
        <p style="margin-bottom: 0.5rem;">O código expira em até 30 minutos.</p>
        <p style="font-size: 0.95em; color: #888;">Se você não solicitou a recuperação de senha, ignore este email.</p>
        <hr style="margin: 24px 0;">
        <p style="font-size: 0.9em; color: #666; text-align: center;">&copy; ${new Date().getFullYear()} SIGMA-PLI • Módulo de Gerenciamento de Cadastros</p>
      </div>
    `;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Recuperação de Senha - SIGMA-PLI | Módulo de Gerenciamento de Cadastros",
      html
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de recuperação de senha:', error);
    return false;
  }
};

/**
 * Testa a conexão com o servidor de email
 * @returns {Promise<boolean>} - Sucesso ou falha na conexão
 */
exports.testarConexao = async () => {
  try {
    const verificacao = await transporter.verify();
    console.log('Conexão com servidor de email estabelecida:', verificacao);
    return verificacao;
  } catch (error) {
    console.error('Erro ao conectar com servidor de email:', error);
    return false;
  }
};