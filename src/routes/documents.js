// backend/src/routes/documents.js
const express = require('express');
const router = express.Router();

// Listar documentos
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Dados mockados para teste
    const mockDocuments = [
      {
        id: 1,
        nome_arquivo: 'Ata_Reuniao_001.pdf',
        tipo_arquivo: 'PDF',
        status: 'processado',
        data_upload: new Date(),
        usuario_nome: 'João Silva'
      },
      {
        id: 2,
        nome_arquivo: 'Ata_Reuniao_002.pdf',
        tipo_arquivo: 'PDF',
        status: 'processando',
        data_upload: new Date(),
        usuario_nome: 'Maria Santos'
      },
      {
        id: 3,
        nome_arquivo: 'Ata_Reuniao_003.pdf',
        tipo_arquivo: 'PDF',
        status: 'processado',
        data_upload: new Date(),
        usuario_nome: 'Pedro Costa'
      }
    ];
    
    let documents = mockDocuments;
    
    if (limit) {
      documents = documents.slice(0, parseInt(limit));
    }
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar documento por ID
router.get('/:id', async (req, res) => {
  try {
    res.json({ 
      id: req.params.id,
      nome_arquivo: 'Ata_Reuniao_001.pdf',
      tipo_arquivo: 'PDF',
      status: 'processado',
      data_upload: new Date(),
      usuario_nome: 'João Silva'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Download de documento
router.get('/:id/download', async (req, res) => {
  try {
    res.json({ 
      message: 'Download de documento em desenvolvimento',
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de documento
router.post('/upload', async (req, res) => {
  try {
    // Simular upload bem-sucedido
    const mockResponse = {
      success: true,
      message: 'Arquivo enviado com sucesso',
      document: {
        id: Date.now(),
        nome_arquivo: 'arquivo_enviado.pdf',
        tipo_arquivo: 'PDF',
        status: 'processando',
        data_upload: new Date(),
        usuario_nome: 'Sistema'
      }
    };
    
    res.json(mockResponse);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
