// backend/src/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const usuarioController = require('../controllers/usuarioController');

const { requireAuth, requireAdmin } = require('../middleware/auth');

// Listar usuários (apenas autenticado)
router.get('/', requireAuth, async (req, res) => {
  try {
    // Buscar usuários do banco de dados com nome completo da pessoa física vinculada
    const sql = `
      SELECT u.id, u.username, u.email, u.tipo_usuario, u.nivel_acesso, u.departamento, u.cargo, u.ativo, u.status, u.primeiro_acesso, u.data_ultimo_login, u.tentativas_login, u.bloqueado_ate, u.fuso_horario, u.idioma,
             u.pessoa_fisica_id, pf.nome_completo AS nome
      FROM usuarios.usuario_sistema u
      LEFT JOIN cadastro.pessoa_fisica pf ON u.pessoa_fisica_id = pf.id
      ORDER BY u.username`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário (público)
router.post('/', usuarioController.criarSolicitacao);

// Listar solicitações pendentes (admin/gestor)
router.get('/solicitacoes/pendentes', requireAdmin, usuarioController.listarSolicitacoesPendentes);

// Aprovar solicitação (admin/gestor)
router.put('/solicitacoes/:id/aprovar', requireAdmin, usuarioController.aprovarSolicitacao);

// Rejeitar solicitação (admin/gestor)
router.put('/solicitacoes/:id/rejeitar', requireAdmin, usuarioController.rejeitarSolicitacao);

// Buscar usuário por ID (apenas autenticado)
router.get('/:id', requireAuth, async (req, res) => {
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

// Atualizar usuário (apenas autenticado)
router.put('/:id', requireAuth, async (req, res) => {
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

// Deletar usuário (apenas admin)
router.delete('/:id', requireAdmin, async (req, res) => {
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
