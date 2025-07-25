/**
 * Rotas de Usuários - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 */
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAutenticacao, verificarPermissaoAdminGestor } = require('../middleware/authMiddleware');

// Rota para criar solicitação de usuário (pública)
router.post('/solicitacao', usuarioController.criarSolicitacao);

// Rotas protegidas (requerem autenticação e permissão de admin/gestor)

// Listar solicitações pendentes
router.get('/solicitacoes/pendentes', 
  verificarAutenticacao, 
  verificarPermissaoAdminGestor, 
  usuarioController.listarSolicitacoesPendentes
);

// Aprovar solicitação
router.put('/solicitacoes/:id/aprovar', 
  verificarAutenticacao, 
  verificarPermissaoAdminGestor, 
  usuarioController.aprovarSolicitacao
);

// Rejeitar solicitação
router.put('/solicitacoes/:id/rejeitar', 
  verificarAutenticacao, 
  verificarPermissaoAdminGestor, 
  usuarioController.rejeitarSolicitacao
);

module.exports = router;