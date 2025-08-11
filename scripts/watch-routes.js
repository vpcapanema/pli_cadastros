/**
 * Script para monitorar alterações no server.js e atualizar o mapa de rotas
 * Este script deve ser executado em segundo plano durante o desenvolvimento
 */

const fs = require('fs');
const path = require('path');
const { extractRoutes } = require('./generate-routes-map');
const logger = require('../src/utils/logger');

// Configurações
const SERVER_FILE = path.join(__dirname, '..', 'server.js');
const ROUTES_DIR = path.join(__dirname, '..', 'src', 'routes');
const UPDATE_DEBOUNCE = 2000; // milissegundos para debounce (evitar múltiplas atualizações)

let timeoutId = null;

/**
 * Função para atualizar o mapa de rotas após um período de debounce
 */
function scheduleUpdate() {
  // Limpar o timeout anterior para evitar múltiplas atualizações
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Agendar nova atualização
  timeoutId = setTimeout(() => {
    logger.info('Alterações detectadas, atualizando mapa de rotas...');
    try {
      const routes = extractRoutes();
      logger.info('✅ Mapa de rotas atualizado com sucesso!');
      logger.info(
        `Rotas encontradas: API: ${routes.apiRoutes.length}, Páginas: ${routes.pageRoutes.length}, Templates: ${routes.templateRoutes.length}, Especiais: ${routes.specialRoutes.length}`
      );
    } catch (error) {
      logger.error('❌ Erro ao atualizar mapa de rotas:', error);
    }
  }, UPDATE_DEBOUNCE);
}

// Monitorar alterações no server.js
logger.info(`📡 Iniciando monitoramento de alterações em ${SERVER_FILE}`);
fs.watch(SERVER_FILE, (eventType) => {
  if (eventType === 'change') {
    logger.info('Alteração detectada no server.js');
    scheduleUpdate();
  }
});

// Monitorar alterações em arquivos de rotas
logger.info(`📡 Iniciando monitoramento de alterações em ${ROUTES_DIR}`);
fs.watch(ROUTES_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && eventType === 'change') {
    logger.info(`Alteração detectada em arquivo de rotas: ${filename}`);
    scheduleUpdate();
  }
});

logger.info('🚀 Monitoramento de rotas iniciado! Pressione Ctrl+C para encerrar.');

// Executar uma extração inicial
scheduleUpdate();

// Manter o processo em execução
process.stdin.resume();

// Lidar com encerramento
process.on('SIGINT', () => {
  logger.info('Encerrando monitoramento de rotas...');
  process.exit(0);
});
