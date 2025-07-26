// API para listar instituições (pessoas jurídicas) cadastradas (razao social)
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const sql = `SELECT id, razao_social, cnpj FROM cadastro.pessoa_juridica WHERE ativo = true ORDER BY razao_social`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instituições' });
  }
});

module.exports = router;
