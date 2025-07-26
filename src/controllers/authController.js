// const crypto = require('crypto'); // Removido duplicidade, já deve existir no topo
const { query } = require('../config/database');
const emailService = require('../services/emailService');
const TOKEN_EXPIRATION_MINUTES = 15;

exports.recuperarSenha = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email é obrigatório' });
  }
  try {
    // Buscar usuário por email OU email_institucional
    const { query } = require('../config/database');
    const result = await query(
      `SELECT id, email, email_institucional, username, nome_completo FROM usuarios.usuario_sistema us JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id WHERE us.email = $1 OR us.email_institucional = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado para este email' });
    }
    // Gerar token de 6 dígitos
    const token = (Math.floor(100000 + Math.random() * 900000)).toString();
    // Salvar token em memória (expira em 10 min)
    recoveryTokens[email] = { token, expires: Date.now() + 10 * 60 * 1000 };
    // Simular envio de email (log)
    console.log(`[RECUPERAÇÃO DE SENHA] Token para ${email}: ${token}`);
    // TODO: Integrar com serviço de email real
    return res.json({ sucesso: true, mensagem: 'Token enviado para o email informado' });
  } catch (error) {
    console.error('Erro ao enviar token de recuperação:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar token de recuperação' });
  }
};

/**
 * Recuperação de Senha - Verifica token
 */
exports.verificarToken = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email e token são obrigatórios' });
  }
  const entry = recoveryTokens[email];
  if (!entry || entry.token !== token) {
    return res.status(400).json({ sucesso: false, mensagem: 'Token inválido' });
  }
  if (Date.now() > entry.expires) {
    delete recoveryTokens[email];
    return res.status(400).json({ sucesso: false, mensagem: 'Token expirado' });
  }
  return res.json({ sucesso: true, mensagem: 'Token válido' });
};

/**
 * Recuperação de Senha - Redefine a senha
 */
exports.redefinirSenha = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ sucesso: false, mensagem: 'Email, token e nova senha são obrigatórios' });
  }
  const entry = recoveryTokens[email];
  if (!entry || entry.token !== token) {
    return res.status(400).json({ sucesso: false, mensagem: 'Token inválido' });
  }
  if (Date.now() > entry.expires) {
    delete recoveryTokens[email];
    return res.status(400).json({ sucesso: false, mensagem: 'Token expirado' });
  }
  // Validação de senha forte (mínimo 8, maiúscula, minúscula, número, especial)
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!strong.test(newPassword)) {
    return res.status(400).json({ sucesso: false, mensagem: 'A senha não atende aos requisitos de segurança.' });
  }
  try {
    // Gerar hash da nova senha
    const salt = crypto.randomBytes(16).toString('hex');
    const senha_hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha512').toString('hex');
    // Atualizar senha no banco
    const { query } = require('../config/database');
    await query(
      `UPDATE usuarios.usuario_sistema SET senha_hash = $1, salt = $2 WHERE email = $3 OR email_institucional = $3`,
      [senha_hash, salt, email]
    );
    // Buscar nome e email institucional para confirmação
    const result = await query(
      `SELECT us.email_institucional, pf.nome_completo FROM usuarios.usuario_sistema us JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id WHERE us.email = $1 OR us.email_institucional = $1`,
      [email]
    );
    const user = result.rows[0];
    if (user && user.email_institucional) {
      await emailService.enviarConfirmacaoRedefinicaoSenha(user.email_institucional, user.nome_completo);
    }
    // Invalida o token
    delete recoveryTokens[email];
    return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha' });
  }
};
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
 * Controlador de Autenticação - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Responsável pela autenticação de usuários
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './config/.env' });

/**
 * Realiza o login do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.login = async (req, res) => {
  try {
    const logs = [];
    const { usuario, password, tipo_usuario } = req.body;
    logs.push(`[LOGIN] Iniciando autenticação para usuário: ${usuario}, tipo: ${tipo_usuario}`);
    const tiposPermitidos = ['ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR'];
    if (!usuario || !password || !tipo_usuario) {
      logs.push('[LOGIN] Falha: Campos obrigatórios não informados.');
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
    const { query } = require('../config/database');
    let user;
    try {
      logs.push('[LOGIN] Consultando banco de dados...');
      const result = await query(
        `SELECT us.id, us.email, us.username, us.email_institucional, us.senha_hash, us.ativo, us.nivel_acesso, us.tipo_usuario, pf.nome_completo
         FROM usuarios.usuario_sistema us
         JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id
         WHERE (us.username = $1 OR us.email_institucional = $1) AND us.tipo_usuario = $2`,
        [usuario, tipo_usuario]
      );
      user = result.rows[0];
      if (!user) {
        logs.push('[LOGIN] Nenhum usuário encontrado com as credenciais fornecidas (username/email_institucional + tipo_usuario).');
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Credenciais inválidas',
          logs
        });
      }
      logs.push(`[LOGIN] Usuário encontrado: ${user.username || user.email_institucional} | Tipo: ${user.tipo_usuario}`);
    } catch (dbError) {
      logs.push(`[LOGIN] Erro ao buscar usuário no banco: ${dbError.message}`);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar usuário no banco',
        erro: dbError.message,
        logs
      });
    }
    if (!user.ativo) {
      logs.push('[LOGIN] Falha: Usuário inativo.');
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Usuário inativo. Aguarde a aprovação do administrador.',
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
    // Em uma implementação real, poderia invalidar o token no servidor
    // ou adicionar à lista de tokens inválidos
    
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