/**
 * Middleware de autenticação e autorização
 * Verifica se o usuário está autenticado e tem permissões adequadas
 */
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config/.env' });

/**
 * Middleware para verificar se o usuário está autenticado
 */
exports.verificarAutenticacao = (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Acesso não autorizado. Token não fornecido.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar dados do usuário ao objeto de requisição
    req.usuario = decoded;

    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Acesso não autorizado. Token inválido ou expirado.',
    });
  }
};

/**
 * Middleware para verificar se o usuário tem permissão de administrador ou gestor
 */
exports.verificarPermissaoAdminGestor = (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Acesso não autorizado. Usuário não autenticado.',
      });
    }

    // Verificar se o usuário é administrador ou gestor
    const tipoUsuario = req.usuario.tipo_usuario;
    if (tipoUsuario !== 'ADMIN' && tipoUsuario !== 'GESTOR') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Permissão insuficiente.',
      });
    }

    next();
  } catch (error) {
    console.error('Erro de autorização:', error);
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado.',
    });
  }
};

/**
 * Middleware para verificar se o usuário tem permissão de administrador
 */
exports.verificarPermissaoAdmin = (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Acesso não autorizado. Usuário não autenticado.',
      });
    }

    // Verificar se o usuário é administrador
    if (req.usuario.tipo_usuario !== 'ADMIN') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Permissão insuficiente.',
      });
    }

    next();
  } catch (error) {
    console.error('Erro de autorização:', error);
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado.',
    });
  }
};
