/**
 * Rotas do Módulo Administrador - SIGMA-PLI
 * Responsável pelas rotas de gerenciamento administrativo
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// ============================================
// ROTAS DO DASHBOARD ADMINISTRATIVO
// ============================================

/**
 * GET /admin/dashboard
 * Dashboard principal com métricas gerais
 * Acesso: ADMIN
 */
router.get('/dashboard', requireAdmin, adminController.getDashboardMetrics);

/**
 * GET /admin/dashboard/estatisticas
 * Estatísticas detalhadas do sistema
 * Acesso: ADMIN
 */
router.get('/dashboard/estatisticas', requireAdmin, adminController.getEstatisticasDetalhadas);

// ============================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS
// ============================================

/**
 * GET /admin/usuarios
 * Listar todos os usuários com filtros
 * Acesso: ADMIN
 */
router.get('/usuarios', requireAdmin, adminController.getUsuarios);

/**
 * GET /admin/usuarios/:id
 * Obter detalhes específicos de um usuário
 * Acesso: ADMIN
 */
router.get('/usuarios/:id', requireAdmin, adminController.getUsuario);

/**
 * PUT /admin/usuarios/:id/status
 * Alterar status de um usuário
 * Acesso: ADMIN
 */
router.put('/usuarios/:id/status', requireAdmin, adminController.alterarStatusUsuario);

/**
 * PUT /admin/usuarios/:id/ativo
 * Ativar/Desativar um usuário
 * Acesso: ADMIN
 */
router.put('/usuarios/:id/ativo', requireAdmin, adminController.alterarAtivoUsuario);

/**
 * PUT /admin/usuarios/:id/role
 * Alterar role de um usuário
 * Acesso: ADMIN
 */
router.put('/usuarios/:id/role', requireAdmin, adminController.alterarRoleUsuario);

/**
 * DELETE /admin/usuarios/:id
 * Excluir um usuário (soft delete)
 * Acesso: ADMIN
 */
router.delete('/usuarios/:id', requireAdmin, adminController.excluirUsuario);

// ============================================
// ROTAS DE VISUALIZAÇÃO DE TABELAS
// ============================================

/**
 * GET /admin/tabelas
 * Listar todas as tabelas disponíveis
 * Acesso: ADMIN
 */
router.get('/tabelas', requireAdmin, adminController.getTabelas);

/**
 * GET /admin/tabelas/:nomeTabela
 * Obter dados de uma tabela específica
 * Acesso: ADMIN
 */
router.get('/tabelas/:nomeTabela', requireAdmin, adminController.getDadosTabela);

// ============================================
// ROTAS DE AUDITORIA E LOGS
// ============================================

/**
 * GET /admin/logs
 * Listar logs do sistema
 * Acesso: ADMIN
 */
router.get('/logs', requireAdmin, adminController.getLogs);

/**
 * GET /admin/logs/:id
 * Obter detalhes de um log específico
 * Acesso: ADMIN
 */
router.get('/logs/:id', requireAdmin, adminController.getLog);

/**
 * GET /admin/auditoria
 * Listar registros de auditoria
 * Acesso: ADMIN
 */
router.get('/auditoria', requireAdmin, adminController.getAuditoria);

// ============================================
// ROTAS DE NOTIFICAÇÕES
// ============================================

/**
 * GET /admin/notificacoes
 * Listar notificações do sistema
 * Acesso: ADMIN
 */
router.get('/notificacoes', requireAdmin, adminController.getNotificacoes);

/**
 * POST /admin/notificacoes
 * Criar nova notificação
 * Acesso: ADMIN
 */
router.post('/notificacoes', requireAdmin, adminController.criarNotificacao);

/**
 * PUT /admin/notificacoes/:id
 * Atualizar notificação
 * Acesso: ADMIN
 */
router.put('/notificacoes/:id', requireAdmin, adminController.atualizarNotificacao);

/**
 * DELETE /admin/notificacoes/:id
 * Excluir notificação
 * Acesso: ADMIN
 */
router.delete('/notificacoes/:id', requireAdmin, adminController.excluirNotificacao);

// ============================================
// ROTAS DE CONFIGURAÇÕES DO SISTEMA
// ============================================

/**
 * GET /admin/configuracoes
 * Obter configurações do sistema
 * Acesso: ADMIN
 */
router.get('/configuracoes', requireAdmin, adminController.getConfiguracoes);

/**
 * PUT /admin/configuracoes
 * Atualizar configurações do sistema
 * Acesso: ADMIN
 */
router.put('/configuracoes', requireAdmin, adminController.atualizarConfiguracoes);

// ============================================
// ROTAS DE RELATÓRIOS
// ============================================

/**
 * GET /admin/relatorios/usuarios
 * Relatório de usuários
 * Acesso: ADMIN
 */
router.get('/relatorios/usuarios', requireAdmin, adminController.getRelatorioUsuarios);

/**
 * GET /admin/relatorios/atividade
 * Relatório de atividade do sistema
 * Acesso: ADMIN
 */
router.get('/relatorios/atividade', requireAdmin, adminController.getRelatorioAtividade);

/**
 * GET /admin/relatorios/performance
 * Relatório de performance
 * Acesso: ADMIN
 */
router.get('/relatorios/performance', requireAdmin, adminController.getRelatorioPerformance);

// ============================================
// ROTAS DE MONITORAMENTO
// ============================================

/**
 * GET /admin/monitoramento/saude
 * Status de saúde do sistema
 * Acesso: ADMIN
 */
router.get('/monitoramento/saude', requireAdmin, adminController.getSaudeSistema);

/**
 * GET /admin/monitoramento/metricas
 * Métricas em tempo real
 * Acesso: ADMIN
 */
router.get('/monitoramento/metricas', requireAdmin, adminController.getMetricasTempoReal);

// ============================================
// ROTAS DE BACKUP E MANUTENÇÃO
// ============================================

/**
 * POST /admin/backup
 * Iniciar backup do sistema
 * Acesso: ADMIN
 */
router.post('/backup', requireAdmin, adminController.iniciarBackup);

/**
 * GET /admin/backup/status
 * Status do backup
 * Acesso: ADMIN
 */
router.get('/backup/status', requireAdmin, adminController.getStatusBackup);

/**
 * POST /admin/manutencao/limpeza
 * Executar limpeza de dados antigos
 * Acesso: ADMIN
 */
router.post('/manutencao/limpeza', requireAdmin, adminController.executarLimpeza);

module.exports = router;
