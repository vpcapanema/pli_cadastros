// backend/src/routes/pessoaFisica.js
const express = require('express');
const router = express.Router();

// Listar pessoas físicas
router.get('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Lista de pessoas físicas em desenvolvimento',
      endpoint: '/api/pessoa-fisica',
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pessoa física
router.post('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Criação de pessoa física em desenvolvimento',
      endpoint: '/api/pessoa-fisica'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pessoa física por ID
router.get('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Busca de pessoa física por ID em desenvolvimento',
      endpoint: `/api/pessoa-fisica/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar pessoa física
router.put('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Atualização de pessoa física em desenvolvimento',
      endpoint: `/api/pessoa-fisica/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar pessoa física
router.delete('/:id', async (req, res) => {
  try {
    res.json({ 
      message: 'Exclusão de pessoa física em desenvolvimento',
      endpoint: `/api/pessoa-fisica/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
