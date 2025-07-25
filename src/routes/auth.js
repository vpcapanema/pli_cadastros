/**
 * Rotas de Autenticação - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarAutenticacao } = require('../middleware/authMiddleware');

// Rota de login
router.post('/login', authController.login);

// Rota de logout
router.post('/logout', authController.logout);

// Rota para verificar autenticação
router.get('/me', verificarAutenticacao, authController.verificarAutenticacao);

// Rota para listar tipos de usuário disponíveis para um email
router.get('/tipos-usuario/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Em produção, isso seria uma consulta ao banco de dados
    // const tiposUsuario = await usuarioModel.buscarTiposUsuarioPorEmail(email);
    
    // Simulação para demonstração
    const usuarios = [
      { email: 'admin@exemplo.com', tipo_usuario: 'ADMIN', ativo: true },
      { email: 'admin@exemplo.com', tipo_usuario: 'GESTOR', ativo: true },
      { email: 'joao@exemplo.com', tipo_usuario: 'ANALISTA', ativo: true },
      { email: 'maria@exemplo.com', tipo_usuario: 'OPERADOR', ativo: true },
      { email: 'carlos@exemplo.com', tipo_usuario: 'VISUALIZADOR', ativo: false }
    ];
    
    const tiposUsuario = usuarios
      .filter(u => u.email === email && u.ativo)
      .map(u => u.tipo_usuario);
    
    res.json({
      sucesso: true,
      tiposUsuario
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar tipos de usuário',
      erro: error.message
    });
  }
});

module.exports = router;
