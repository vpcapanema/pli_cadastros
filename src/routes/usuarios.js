// backend/src/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const usuarioController = require('../controllers/usuarioController');

// Listar usuários
router.get('/', async (req, res) => {
  try {
    // Buscar usuários do banco de dados com colunas reais
    const sql = `SELECT id, username, email, tipo_usuario, nivel_acesso, departamento, cargo, ativo, email_verificado, primeiro_acesso, data_ultimo_login, tentativas_login, bloqueado_ate, fuso_horario, idioma FROM usuarios.usuario_sistema ORDER BY username`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário
router.post('/', usuarioController.criarSolicitacao);

// Listar solicitações pendentes
router.get('/solicitacoes/pendentes', usuarioController.listarSolicitacoesPendentes);

// Aprovar solicitação
router.put('/solicitacoes/:id/aprovar', usuarioController.aprovarSolicitacao);

// Rejeitar solicitação
router.put('/solicitacoes/:id/rejeitar', usuarioController.rejeitarSolicitacao);

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Busca de usuário por ID em desenvolvimento',
      endpoint: `/api/usuarios/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Atualização de usuário em desenvolvimento',
      endpoint: `/api/usuarios/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Exclusão de usuário em desenvolvimento',
      endpoint: `/api/usuarios/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
