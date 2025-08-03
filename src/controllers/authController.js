/**
 * Controlador de Autenticação - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Responsável pela autenticação de usuários e recuperação de senha
 */

// Dependências principais
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const emailService = require('../services/emailService');
const SessionService = require('../services/sessionService');

// Configuração do ambiente
require('dotenv').config({ path: './config/.env' });

// Constantes
const TOKEN_EXPIRATION_MINUTES = 15;

/**
 * Recuperação de Senha - Envia email com token
 */
exports.recuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ sucesso: false, mensagem: 'Email é obrigatório.' });
    // Buscar usuário por email OU email_institucional
    const result = await query(
      `SELECT us.id, us.email, us.email_institucional, pf.nome_completo FROM usuarios.usuario_sistema us JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id WHERE us.email = $1 OR us.email_institucional = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    // Gerar token numérico de 6 dígitos
    const token = (Math.floor(100000 + Math.random() * 900000)).toString();
    // Salvar token na tabela de recuperação
    await query(
      `INSERT INTO usuarios.recuperacao_senha (usuario_id, token, criado_em, expirado) VALUES ($1, $2, NOW(), false)`,
      [user.id, token]
    );
    // Sempre enviar para o email institucional
    const destinatario = user.email_institucional;
    if (!destinatario) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nenhum email institucional encontrado para envio de recuperação de senha.' });
    }
    // Enviar email
    await emailService.enviarRecuperacaoSenha(destinatario, user.nome_completo, token);
    return res.json({ sucesso: true, mensagem: 'Código de verificação enviado para seu email.' });
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar email de recuperação.' });
  }
};

/**
 * Recuperação de Senha - Verifica token
 */
exports.verificarToken = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ sucesso: false, mensagem: 'Email e token são obrigatórios.' });
    // Buscar usuário
    const result = await query(
      `SELECT id FROM usuarios.usuario_sistema WHERE email = $1 OR email_institucional = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    // Buscar token válido
    const tokenResult = await query(
      `SELECT id, criado_em, expirado FROM usuarios.recuperacao_senha WHERE usuario_id = $1 AND token = $2 AND expirado = false ORDER BY criado_em DESC LIMIT 1`,
      [user.id, token]
    );
    const tokenRow = tokenResult.rows[0];
    if (!tokenRow) return res.status(400).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    // Verificar expiração
    const criadoEm = new Date(tokenRow.criado_em);
    const agora = new Date();
    const diffMin = (agora - criadoEm) / 60000;
    if (diffMin > TOKEN_EXPIRATION_MINUTES) {
      await query(`UPDATE usuarios.recuperacao_senha SET expirado = true WHERE id = $1`, [tokenRow.id]);
      return res.status(400).json({ sucesso: false, mensagem: 'Token expirado.' });
    }
    return res.json({ sucesso: true, mensagem: 'Token válido.' });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao verificar token.' });
  }
};

/**
 * Recuperação de Senha - Redefine a senha
 */
exports.redefinirSenha = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ sucesso: false, mensagem: 'Email, token e nova senha são obrigatórios.' });
    if (newPassword.length < 8) return res.status(400).json({ sucesso: false, mensagem: 'A senha deve ter pelo menos 8 caracteres.' });
    // Buscar usuário
    const result = await query(
      `SELECT id FROM usuarios.usuario_sistema WHERE email = $1 OR email_institucional = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    // Buscar token válido
    const tokenResult = await query(
      `SELECT id, criado_em, expirado FROM usuarios.recuperacao_senha WHERE usuario_id = $1 AND token = $2 AND expirado = false ORDER BY criado_em DESC LIMIT 1`,
      [user.id, token]
    );
    const tokenRow = tokenResult.rows[0];
    if (!tokenRow) return res.status(400).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
    // Verificar expiração
    const criadoEm = new Date(tokenRow.criado_em);
    const agora = new Date();
    const diffMin = (agora - criadoEm) / 60000;
    if (diffMin > TOKEN_EXPIRATION_MINUTES) {
      await query(`UPDATE usuarios.recuperacao_senha SET expirado = true WHERE id = $1`, [tokenRow.id]);
      return res.status(400).json({ sucesso: false, mensagem: 'Token expirado.' });
    }
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(newPassword, salt);
    // Atualizar senha do usuário
    await query(`UPDATE usuarios.usuario_sistema SET senha_hash = $1 WHERE id = $2`, [senha_hash, user.id]);
    // Invalidar token
    await query(`UPDATE usuarios.recuperacao_senha SET expirado = true WHERE id = $1`, [tokenRow.id]);
    return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha.' });
  }
};
/**
 * Realiza o login do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.login = async (req, res) => {
  try {
    const logs = [];
    const { usuario, password, tipo_usuario } = req.body;
    
    // Debug do body recebido
    console.log('[LOGIN DEBUG] Body completo:', req.body);
    console.log('[LOGIN DEBUG] Usuario recebido:', usuario, typeof usuario);
    console.log('[LOGIN DEBUG] Password recebido:', password ? '[PRESENTE]' : '[AUSENTE]');
    console.log('[LOGIN DEBUG] Tipo usuario recebido:', tipo_usuario);
    
    logs.push(`[LOGIN] Iniciando autenticação para usuário: ${usuario}, tipo: ${tipo_usuario}`);
    const tiposPermitidos = ['ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR'];
    if (!usuario || !password || !tipo_usuario) {
      logs.push('[LOGIN] Falha: Campos obrigatórios não informados.');
      logs.push(`[LOGIN] Debug campos: usuario=${usuario}, password=${password ? 'presente' : 'ausente'}, tipo_usuario=${tipo_usuario}`);
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Usuário (username ou email institucional), senha e tipo de usuário são obrigatórios',
        logs
      });
    }
    if (!tiposPermitidos.includes(String(tipo_usuario).toUpperCase())) {
      logs.push(`[LOGIN] Falha: Tipo de usuário inválido (${tipo_usuario}).`);
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Tipo de usuário inválido.',
        logs
      });
    }
    // Buscar usuário no banco por username OU email_institucional E tipo_usuario
    let user;
    let sqlQuery = '';
    let sqlParams = [];
    
    try {
      logs.push('[LOGIN] Consultando banco de dados...');
      
      // Teste de conexão com o banco primeiro
      const testConnection = await query('SELECT 1 as test');
      logs.push('[LOGIN] Conexão com banco de dados OK');
      
      // Verifica se as tabelas existem
      const checkTables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema IN ('usuarios', 'cadastro') 
        AND table_name IN ('usuario_sistema', 'pessoa_fisica')
      `);
      logs.push(`[LOGIN] Tabelas encontradas: ${checkTables.rows.map(r => r.table_name).join(', ')}`);
      
      // Teste de consulta mais simples primeiro
      const testUser = await query(`
        SELECT COUNT(*) as total 
        FROM usuarios.usuario_sistema 
        WHERE tipo_usuario = $1
      `, [tipo_usuario]);
      logs.push(`[LOGIN] Total de usuários com tipo ${tipo_usuario}: ${testUser.rows[0].total}`);
      
      // Determina se o valor é email ou username
      const isEmail = usuario && usuario.includes && usuario.includes('@');
      sqlQuery = '';
      sqlParams = [];
      
      if (isEmail) {
        // Se for email, busca apenas por email_institucional
        logs.push(`[LOGIN] Identificado como email, buscando por email_institucional: ${usuario}`);
        sqlQuery = `SELECT us.id, us.email, us.username, us.email_institucional, us.senha_hash, us.ativo, us.status, us.email_institucional_verificado, us.nivel_acesso, us.tipo_usuario, us.pessoa_fisica_id
         FROM usuarios.usuario_sistema us
         WHERE us.email_institucional = $1 AND us.tipo_usuario = $2`;
        sqlParams = [usuario, tipo_usuario];
      } else {
        // Se for username, busca apenas por username
        logs.push(`[LOGIN] Identificado como username, buscando por username: ${usuario}`);
        sqlQuery = `SELECT us.id, us.email, us.username, us.email_institucional, us.senha_hash, us.ativo, us.status, us.email_institucional_verificado, us.nivel_acesso, us.tipo_usuario, us.pessoa_fisica_id
         FROM usuarios.usuario_sistema us
         WHERE us.username = $1 AND us.tipo_usuario = $2`;
        sqlParams = [usuario, tipo_usuario];
      }
      
      const result = await query(sqlQuery, sqlParams);
      user = result.rows[0];
      if (!user) {
        const tipoCredencial = usuario.includes('@') ? 'email_institucional' : 'username';
        logs.push(`[LOGIN] Nenhum usuário encontrado com ${tipoCredencial}: ${usuario} e tipo_usuario: ${tipo_usuario}`);
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas',
          logs
        });
      }
      
      // Buscar nome da pessoa física se existir
      let nomeCompleto = user.username; // fallback
      if (user.pessoa_fisica_id) {
        try {
          const pessoaFisica = await query(
            `SELECT nome_completo FROM cadastro.pessoa_fisica WHERE id = $1`,
            [user.pessoa_fisica_id]
          );
          if (pessoaFisica.rows[0]) {
            nomeCompleto = pessoaFisica.rows[0].nome_completo;
          }
        } catch (pfError) {
          logs.push(`[LOGIN] Aviso: Não foi possível buscar nome da pessoa física: ${pfError.message}`);
        }
      }
      user.nome_completo = nomeCompleto;
      
      const tipoCredencial = usuario.includes('@') ? 'email_institucional' : 'username';
      logs.push(`[LOGIN] Usuário encontrado por ${tipoCredencial}: ${user.username || user.email_institucional} | Tipo: ${user.tipo_usuario}`);
    } catch (dbError) {
      logs.push(`[LOGIN] Erro ao buscar usuário no banco: ${dbError.message}`);
      logs.push(`[LOGIN] Código do erro: ${dbError.code || 'N/A'}`);
      logs.push(`[LOGIN] Query executada: ${sqlQuery}`);
      logs.push(`[LOGIN] Parâmetros: ${JSON.stringify(sqlParams)}`);
      
      console.error('Erro completo do banco:', dbError);
      
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar usuário no banco',
        erro: dbError.message,
        detalhes: {
          code: dbError.code,
          query: sqlQuery,
          params: sqlParams
        },
        logs
      });
    }
    // Checagem de status - deve ser APROVADO
    if (String(user.status).toUpperCase() !== 'APROVADO') {
      logs.push(`[LOGIN] Falha: Status do usuário não é APROVADO. Status atual: ${user.status}`);
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Usuário não aprovado. Aguarde a aprovação do administrador.',
        codigo: 'USUARIO_NAO_APROVADO',
        logs
      });
    }

    // Checagem de ativo - deve ser true
    if (!user.ativo) {
      logs.push(`[LOGIN] Falha: Usuário não está ativo. Ativo: ${user.ativo}`);
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Usuário inativo. Entre em contato com o administrador.',
        codigo: 'USUARIO_INATIVO',
        logs
      });
    }

    // Checagem de email institucional verificado - deve ser true
    if (!user.email_institucional_verificado) {
      logs.push(`[LOGIN] Falha: Email institucional não verificado. Verificado: ${user.email_institucional_verificado}`);
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Email institucional não verificado. Verifique seu email antes de fazer login.',
        codigo: 'EMAIL_NAO_VERIFICADO',
        logs
      });
    }
    // Validar senha
    logs.push('[LOGIN] Validando senha...');
    const senhaCorreta = await bcrypt.compare(password, user.senha_hash);
    if (!senhaCorreta) {
      logs.push('[LOGIN] Falha: Senha incorreta.');
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas',
        logs
      });
    }
    logs.push('[LOGIN] Autenticação bem-sucedida. Gerando token...');
    
    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.nome_completo,
        tipo_usuario: user.tipo_usuario,
        nivel_acesso: user.nivel_acesso
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Criar sessão no banco de dados
    try {
      const sessao = await SessionService.criarSessao(user.id, token, req);
      logs.push(`[LOGIN] Sessão criada: ${sessao.session_id}`);
    } catch (sessionError) {
      console.error('[LOGIN] Erro ao criar sessão no banco:', sessionError);
      logs.push('[LOGIN] Aviso: Token gerado mas sessão não foi registrada no banco');
    }
    
    logs.push('[LOGIN] Token JWT gerado e login finalizado.');
    // Retornar token e dados do usuário
    res.status(200).json({
      sucesso: true,
      token,
      user: {
        id: user.id,
        nome: user.nome_completo,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        nivel_acesso: user.nivel_acesso
      },
      mensagem: 'Autenticação realizada com sucesso',
      redirect: '/dashboard.html', // Redirecionamento para área restrita
      logs
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar login',
      erro: error.message,
      logs: [error.message]
    });
  }
};

/**
 * Realiza o logout do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.logout = async (req, res) => {
  try {
    // Extrair token do header Authorization
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        // Gerar hash do token para buscar sessão
        const tokenHash = SessionService.gerarHashToken(token);
        
        // Registrar logout na sessão
        await SessionService.registrarLogout(tokenHash, 'LOGOUT_MANUAL');
      } catch (sessionError) {
        console.error('[LOGOUT] Erro ao registrar logout na sessão:', sessionError);
      }
    }
    
    // Limpar cookie de autenticação
    res.clearCookie('token');
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar logout',
      erro: error.message
    });
  }
};

/**
 * Verifica se o usuário está autenticado
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.verificarAutenticacao = async (req, res) => {
  try {
    // O middleware de autenticação já verificou o token
    // e adicionou os dados do usuário ao objeto req
    
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Não autenticado'
      });
    }
    
    res.status(200).json({
      sucesso: true,
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação',
      erro: error.message
    });
  }
};

/**
 * Busca um usuário simulado para demonstração
 * @param {string} email - Email do usuário
 * @param {string} tipo_usuario - Tipo de usuário (opcional)
 * @returns {Object|null} - Usuário encontrado ou null
 */
function buscarUsuarioSimulado(email, tipo_usuario) {
  // Dados simulados de usuários
  const usuarios = [
    {
      id: '1',
      nome_completo: 'Administrador',
      email: 'admin@exemplo.com',
      documento: '123.456.789-00',
      tipo_usuario: 'ADMIN',
      nivel_acesso: 5,
      ativo: true
    },
    {
      id: '2',
      nome_completo: 'Administrador',
      email: 'admin@exemplo.com',
      documento: '123.456.789-00',
      tipo_usuario: 'GESTOR',
      nivel_acesso: 4,
      ativo: true
    },
    {
      id: '3',
      nome_completo: 'João Silva',
      email: 'joao@exemplo.com',
      documento: '987.654.321-00',
      tipo_usuario: 'ANALISTA',
      nivel_acesso: 3,
      ativo: true
    },
    {
      id: '4',
      nome_completo: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      documento: '111.222.333-44',
      tipo_usuario: 'OPERADOR',
      nivel_acesso: 2,
      ativo: true
    },
    {
      id: '5',
      nome_completo: 'Carlos Santos',
      email: 'carlos@exemplo.com',
      documento: '555.666.777-88',
      tipo_usuario: 'VISUALIZADOR',
      nivel_acesso: 1,
      ativo: false // Usuário inativo
    }
  ];
  
  // Filtrar pelo email
  const usuariosFiltrados = usuarios.filter(u => u.email === email);
  
  // Se não especificou tipo, retorna o primeiro usuário encontrado
  if (!tipo_usuario && usuariosFiltrados.length > 0) {
    return usuariosFiltrados[0];
  }
  
  // Se especificou tipo, busca o usuário com esse tipo
  if (tipo_usuario) {
    return usuariosFiltrados.find(u => u.tipo_usuario === tipo_usuario) || null;
  }
  
  return null;
}

/**
 * Verificação de Email - Valida token de verificação de email
 */
exports.verificarEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Token de verificação é obrigatório.' 
      });
    }

    // Buscar o usuário pelo token de verificação diretamente na tabela usuario_sistema
    const result = await query(
      `SELECT us.id, us.email, us.email_institucional, pf.nome_completo 
       FROM usuarios.usuario_sistema us
       JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id
       WHERE us.token_verificacao_email = $1 
       AND us.email_institucional_verificado = false
       AND us.token_expira_em > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Token inválido, já utilizado ou expirado.' 
      });
    }

    const usuario = result.rows[0];
    
    // Marcar o email institucional como verificado e limpar o token
    await query(
      `UPDATE usuarios.usuario_sistema 
       SET email_institucional_verificado = true, 
           token_verificacao_email = NULL,
           token_expira_em = NULL,
           data_atualizacao = NOW() 
       WHERE id = $1`,
      [usuario.id]
    );
    
    console.log(`[EMAIL] Email institucional verificado com sucesso para usuário ID: ${usuario.id}`);
    
    // Redirecionar para página de sucesso
    res.redirect(`/email-verificado.html?email=${encodeURIComponent(usuario.email)}&nome=${encodeURIComponent(usuario.nome_completo)}`);
    
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor.' 
    });
  }
};