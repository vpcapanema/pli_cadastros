/**
 * Rotas para páginas administrativas protegidas
 */
const express = require('express');
const router = express.Router();
const path = require('path');
/*const pageAuthMiddleware = require('../middleware/pageAuthMiddleware');*/

// Aplicar middleware de autenticação para todas as rotas administrativas
// router.use(pageAuthMiddleware); // Desativado pois o middleware não está definido

// Rota para a página de solicitações de cadastro
router.get('/solicitacoes-cadastro.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/solicitacoes-cadastro.html'));
});

// Rota para a página de usuários
router.get('/usuarios.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/usuarios.html'));
});

// Outras páginas administrativas podem ser adicionadas aqui

module.exports = router;