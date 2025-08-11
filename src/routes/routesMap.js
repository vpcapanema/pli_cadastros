/**
 * Rotas para o mapa visual de rotas
 * Fornece endpoints para consultar o mapa de rotas da aplicação
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { extractRoutes } = require('../../scripts/generate-routes-map');
const logger = require('../utils/logger');

// Caminho para o arquivo JSON do mapa de rotas
const ROUTES_MAP_FILE = path.join(__dirname, '../../static/data/routes-map.json');

/**
 * @route   GET /api/routes/map
 * @desc    Retorna o mapa completo de rotas
 * @access  Public
 */
router.get('/map', async (req, res) => {
  try {
    // Verificar se o arquivo de mapa de rotas existe e está atualizado
    let routesMap;

    if (fs.existsSync(ROUTES_MAP_FILE)) {
      const stats = fs.statSync(ROUTES_MAP_FILE);
      const fileAge = Date.now() - stats.mtimeMs; // Idade em milissegundos

      // Se o arquivo for mais antigo que 1 hora, regenerar
      if (fileAge > 3600000) {
        logger.info('Mapa de rotas desatualizado. Regenerando...');
        routesMap = extractRoutes();
      } else {
        // Ler o arquivo existente
        const fileContent = fs.readFileSync(ROUTES_MAP_FILE, 'utf8');
        routesMap = JSON.parse(fileContent);
      }
    } else {
      // Arquivo não existe, gerar pela primeira vez
      logger.info('Arquivo de mapa de rotas não encontrado. Gerando...');
      routesMap = extractRoutes();
    }

    res.json(routesMap);
  } catch (error) {
    logger.error('Erro ao obter mapa de rotas:', error);
    res.status(500).json({
      error: 'Erro ao obter mapa de rotas',
      message: error.message,
    });
  }
});

/**
 * @route   POST /api/routes/regenerate
 * @desc    Força a regeneração do mapa de rotas
 * @access  Private
 */
router.post('/regenerate', async (req, res) => {
  try {
    const routesMap = extractRoutes();
    res.json({
      success: true,
      message: 'Mapa de rotas regenerado com sucesso',
      timestamp: new Date().toISOString(),
      counts: {
        api: routesMap.apiRoutes.length,
        pages: routesMap.pageRoutes.length,
        templates: routesMap.templateRoutes.length,
        special: routesMap.specialRoutes.length,
      },
    });
  } catch (error) {
    logger.error('Erro ao regenerar mapa de rotas:', error);
    res.status(500).json({
      error: 'Erro ao regenerar mapa de rotas',
      message: error.message,
    });
  }
});

module.exports = router;
