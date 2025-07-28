// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const { query } = require('../config/database');

/**
 * Middleware para verificar token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    // Buscar token no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'NO_TOKEN'
      });
    }

    // Extrair token (formato: "Bearer TOKEN")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    // Adicionar dados do usuário à requisição (padronizado)
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      nome: decoded.nome,
      tipo_usuario: decoded.tipo_usuario,
      nivel_acesso: decoded.nivel_acesso,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno na verificação de autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware para verificar se usuário ainda existe no banco
 */
const verifyUserExists = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, tipo_usuario, nivel_acesso, ativo FROM usuarios.usuario_sistema WHERE id = $1 AND ativo = true',
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
    }

    // Atualizar dados do usuário com informações atuais do banco
    req.usuario = { ...req.usuario, ...result.rows[0] };
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na verificação do usuário',
      code: 'USER_VERIFICATION_ERROR'
    });
  }
};

/**
 * Middleware para verificar tipo de acesso/permissões
 */
const requirePermission = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const userPermission = req.usuario.tipo_usuario;
      
      // Se não há permissões específicas requeridas, permite
      if (requiredPermissions.length === 0) {
        return next();
      }

      // Verificar se usuário tem permissão
      if (!requiredPermissions.includes(userPermission)) {
        return res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para esta operação',
          code: 'INSUFFICIENT_PERMISSION',
          required: requiredPermissions,
          current: userPermission
        });
      }

      next();
    } catch (error) {
      console.error('❌ Erro na verificação de permissão:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erro interno na verificação de permissões',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

/**
 * Middleware combinado para autenticação completa
 */
const authenticate = [verifyToken, verifyUserExists];

/**
 * Middleware para rotas administrativas
 */
const requireAdmin = [
  ...authenticate,
  requirePermission(['ADMIN', 'SUPER_ADMIN'])
];

/**
 * Middleware para rotas que requerem usuário logado
 */
const requireAuth = authenticate;

/**
 * Middleware opcional - não bloqueia se não autenticado
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }

  // Se tem token, tenta verificar
  verifyToken(req, res, (err) => {
    if (err) {
      req.user = null;
    }
    next();
  });
};

module.exports = {
  verifyToken,
  verifyUserExists,
  requirePermission,
  authenticate,
  requireAdmin,
  requireAuth,
  optionalAuth
};
