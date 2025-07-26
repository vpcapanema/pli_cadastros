// API RESTful para pessoas físicas
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/pessoa-fisica
router.get('/', async (req, res) => {
  try {
    const sql = `SELECT id, nome_completo, cpf, email_principal, telefone_principal FROM cadastro.pessoa_fisica WHERE ativo = true ORDER BY nome_completo`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pessoas físicas' });
  }
});

module.exports = router;
