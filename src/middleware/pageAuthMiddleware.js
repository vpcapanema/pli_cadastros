/**
 * Middleware para proteger páginas administrativas
 * Verifica se o usuário está autenticado e tem permissões adequadas
 */
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: './config/.env' });

/**
 * Middleware para proteger páginas administrativas
 * Redireciona para a página de login se o usuário não estiver autenticado
 * ou não tiver permissões adequadas
 */
module.exports = (req, res, next) => {
  try {
    // Verificar se há um token no cookie
    const token = req.cookies && req.cookies.token;
    
    if (!token) {
      // Redirecionar para a página de login
      return res.redirect('/login.html?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário é administrador ou gestor
    const tipoUsuario = decoded.tipo_usuario;
    if (tipoUsuario !== 'ADMIN' && tipoUsuario !== 'GESTOR') {
      // Redirecionar para a página de acesso negado
      return res.redirect('/acesso-negado.html');
    }
    
    // Adicionar dados do usuário ao objeto de requisição
    req.usuario = decoded;
    
    next();
  } catch (error) {
    console.error('Erro de autenticação para página protegida:', error);
    // Redirecionar para a página de login
    return res.redirect('/login.html?redirect=' + encodeURIComponent(req.originalUrl));
  }
};