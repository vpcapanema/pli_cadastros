/**
 * Rotas de Autenticação e Recuperação de Senha - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarAutenticacao } = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);
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

module.exports = router;
