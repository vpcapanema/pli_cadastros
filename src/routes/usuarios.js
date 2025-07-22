// backend/src/routes/usuarios.js
const express = require('express');
const router = express.Router();

// Listar usuários
router.get('/', async (req, res) => {
  try {
    // Dados mockados para teste
    const mockUsers = [
      { id: 1, nome: 'João Silva', email: 'joao@pli.com.br', ativo: true },
      { id: 2, nome: 'Maria Santos', email: 'maria@pli.com.br', ativo: true },
      { id: 3, nome: 'Pedro Costa', email: 'pedro@pli.com.br', ativo: true },
      { id: 4, nome: 'Ana Oliveira', email: 'ana@pli.com.br', ativo: true },
      { id: 5, nome: 'Carlos Ferreira', email: 'carlos@pli.com.br', ativo: true }
    ];
    
    res.json(mockUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário
router.post('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Criação de usuário em desenvolvimento',
      endpoint: '/api/usuarios'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

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
