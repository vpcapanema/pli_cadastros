/**
 * Rotas de Autenticação e Recuperação de Senha - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarAutenticacao } = require('../middleware/authMiddleware');

// Login com debug de body
router.post('/login', (req, res, next) => {
    console.log('[AUTH DEBUG] Headers recebidos:', req.headers);
    console.log('[AUTH DEBUG] Content-Type:', req.get('Content-Type'));
    console.log('[AUTH DEBUG] Body original:', JSON.stringify(req.body));
    console.log('[AUTH DEBUG] Body keys:', Object.keys(req.body || {}));
    
    // Verificar se o body existe e tem as propriedades necessárias
    if (!req.body) {
        console.log('[AUTH DEBUG] Body está vazio ou undefined');
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados não fornecidos'
        });
    }
    
    next();
}, authController.login);
// Logout
router.post('/logout', authController.logout);
// Verificar autenticação
router.get('/me', verificarAutenticacao, authController.verificarAutenticacao);
// Tipos de usuário
router.get('/tipos-usuario', (req, res) => {
  const tiposUsuario = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'GESTOR', label: 'Gestor' },
    { value: 'ANALISTA', label: 'Analista' },
    { value: 'OPERADOR', label: 'Operador' },
    { value: 'VISUALIZADOR', label: 'Visualizador' }
  ];
  res.json({ sucesso: true, tiposUsuario });
});
// Recuperação de senha
router.post('/recuperar-senha', authController.recuperarSenha);
router.post('/verificar-token', authController.verificarToken);
router.post('/redefinir-senha', authController.redefinirSenha);

// Verificação de email
router.get('/verificar-email/:token', authController.verificarEmail);

module.exports = router;
