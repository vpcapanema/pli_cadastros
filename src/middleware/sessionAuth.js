/**
 * Middleware de Autenticação com Controle de Sessão - SIGMA-PLI
 * Verificação de tokens JWT e controle de sessões no banco de dados
 */

const jwt = require('jsonwebtoken');
const SessionService = require('../services/sessionService');

// Carregar variáveis de ambiente
require('dotenv').config({ path: './config/.env' });

/**
 * Middleware para verificar autenticação e sessão ativa
 */
const verificarAutenticacao = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token de acesso não fornecido',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar validade do JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        // Token expirado - marcar sessão como expirada
        try {
          const tokenHash = SessionService.gerarHashToken(token);
          await SessionService.registrarLogout(tokenHash, 'TOKEN_EXPIRADO');
        } catch (sessionError) {
          console.error('[AUTH] Erro ao marcar sessão como expirada:', sessionError);
        }

        return res.status(401).json({
          sucesso: false,
          mensagem: 'Token expirado',
          codigo: 'TOKEN_EXPIRADO',
        });
      }

      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido',
        codigo: 'TOKEN_INVALIDO',
      });
    }

    // Gerar hash do token para verificar sessão
    const tokenHash = SessionService.gerarHashToken(token);

    // Verificar se a sessão está ativa no banco
    const sessao = await SessionService.verificarSessao(tokenHash);

    if (!sessao) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Sessão inválida ou expirada',
        codigo: 'SESSAO_INVALIDA',
      });
    }

    // Verificar se o usuário ainda está ativo
    if (!sessao.usuario_ativo) {
      await SessionService.registrarLogout(tokenHash, 'USUARIO_INATIVO');

      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário inativo',
        codigo: 'USUARIO_INATIVO',
      });
    }

    // Adicionar informações do usuário e sessão à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nome: decoded.nome,
      tipo_usuario: decoded.tipo_usuario,
      nivel_acesso: decoded.nivel_acesso,
      username: sessao.username,
    };

    req.sessao = {
      id: sessao.id,
      session_id: sessao.session_id,
      data_login: sessao.data_login,
      endereco_ip: sessao.endereco_ip,
      dispositivo_info: sessao.dispositivo_info,
    };

    // Continuar para próximo middleware
    next();
  } catch (error) {
    console.error('[AUTH] Erro no middleware de autenticação:', error);

    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno de autenticação',
    });
  }
};

/**
 * Middleware para verificar tipo de usuário específico
 * @param {Array|string} tiposPermitidos - Tipos de usuário permitidos
 */
const verificarTipoUsuario = (tiposPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não autenticado',
      });
    }

    const tipos = Array.isArray(tiposPermitidos) ? tiposPermitidos : [tiposPermitidos];

    if (!tipos.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado - privilégios insuficientes',
        codigo: 'ACESSO_NEGADO',
      });
    }

    next();
  };
};

/**
 * Middleware para verificar nível de acesso mínimo
 * @param {number} nivelMinimo - Nível mínimo de acesso necessário
 */
const verificarNivelAcesso = (nivelMinimo) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não autenticado',
      });
    }

    if (req.user.nivel_acesso < nivelMinimo) {
      return res.status(403).json({
        sucesso: false,
        mensagem: `Nível de acesso insuficiente. Mínimo: ${nivelMinimo}`,
        codigo: 'NIVEL_INSUFICIENTE',
      });
    }

    next();
  };
};

/**
 * Middleware para endpoints que só ADMIN pode acessar
 */
const verificarAdmin = verificarTipoUsuario('ADMIN');

/**
 * Middleware para endpoints que ADMIN e GESTOR podem acessar
 */
const verificarGestao = verificarTipoUsuario(['ADMIN', 'GESTOR']);

/**
 * Middleware para endpoints que ADMIN, GESTOR e ANALISTA podem acessar
 */
const verificarAnalise = verificarTipoUsuario(['ADMIN', 'GESTOR', 'ANALISTA']);

/**
 * Middleware para verificar se é uma sessão web (não API)
 */
const verificarSessaoWeb = (req, res, next) => {
  // Verificar se tem user agent de navegador
  const userAgent = req.headers['user-agent'] || '';

  if (
    !userAgent.includes('Mozilla') &&
    !userAgent.includes('Chrome') &&
    !userAgent.includes('Safari')
  ) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso permitido apenas via navegador web',
      codigo: 'ACESSO_WEB_APENAS',
    });
  }

  next();
};

module.exports = {
  verificarAutenticacao,
  verificarTipoUsuario,
  verificarNivelAcesso,
  verificarAdmin,
  verificarGestao,
  verificarAnalise,
  verificarSessaoWeb,
};
