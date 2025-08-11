/**
 * Rotas de Gerenciamento Inteligente de Sessões - SIGMA-PLI
 * API endpoints para controle avançado de sessões com renovação automática
 */

const express = require('express');
const router = express.Router();
const SessionService = require('../services/sessionService');
const { verificarAutenticacao } = require('../middleware/sessionAuth');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAutenticacao);

/**
 * Registra uma nova janela/aba da aplicação
 */
router.post('/register-window', async (req, res) => {
  try {
    const { windowId, url, timestamp } = req.body;
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    console.log(`[SESSION API] Registrando janela ${windowId} para usuário ${userId}`);

    // Registrar janela no serviço de sessão
    const result = await SessionService.registrarJanela(
      userId,
      sessionId,
      windowId,
      url,
      req.ip,
      timestamp
    );

    res.json({
      sucesso: true,
      windowId: windowId,
      isMainWindow: result.isMainWindow,
      totalWindows: result.totalWindows,
      sessionData: result.sessionData,
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao registrar janela:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor',
      erro: error.message,
    });
  }
});

/**
 * Remove registro de janela/aba
 */
router.post('/unregister-window', async (req, res) => {
  try {
    const { windowId, timestamp } = req.body;
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    console.log(`[SESSION API] Desregistrando janela ${windowId} para usuário ${userId}`);

    // Desregistrar janela
    const result = await SessionService.desregistrarJanela(userId, sessionId, windowId, timestamp);

    // Se foi a última janela, marcar para logout automático
    if (result.isLastWindow) {
      console.log(`[SESSION API] Última janela fechada - agendando logout automático`);

      // Agendar logout em 30 segundos (tempo para reabrir se foi acidental)
      setTimeout(async () => {
        try {
          await SessionService.verificarEMarcarLogoutSeNecessario(sessionId);
        } catch (error) {
          console.error('[SESSION API] Erro no logout automático:', error);
        }
      }, 30000);
    }

    res.json({
      sucesso: true,
      isLastWindow: result.isLastWindow,
      remainingWindows: result.remainingWindows,
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao desregistrar janela:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor',
      erro: error.message,
    });
  }
});

/**
 * Renova a sessão atual
 */
router.post('/renew', async (req, res) => {
  try {
    const { windowId, reason, lastActivity } = req.body;
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    console.log(`[SESSION API] Renovando sessão para usuário ${userId} - Motivo: ${reason}`);

    // Renovar sessão
    const result = await SessionService.renovarSessao(
      sessionId,
      windowId,
      reason,
      lastActivity,
      req.ip
    );

    res.json({
      sucesso: true,
      sessionData: result.sessionData,
      newToken: result.newToken, // Opcional: novo token JWT se necessário
      renovadaEm: result.renovadaEm,
      proximaRenovacao: result.proximaRenovacao,
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao renovar sessão:', error);

    // Se erro de sessão inválida, retornar 401
    if (error.message.includes('inválida') || error.message.includes('expirada')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Sessão inválida ou expirada',
        codigo: 'SESSAO_EXPIRADA',
      });
    }

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor',
      erro: error.message,
    });
  }
});

/**
 * Heartbeat - mantém sessão ativa
 */
router.post('/heartbeat', async (req, res) => {
  try {
    const { windowId, isActive, lastActivity, timestamp } = req.body;
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    // Atualizar última atividade
    await SessionService.atualizarAtividade(sessionId, windowId, isActive, lastActivity, timestamp);

    res.json({
      sucesso: true,
      timestamp: Date.now(),
      sessionStatus: 'ATIVA',
    });
  } catch (error) {
    console.error('[SESSION API] Erro no heartbeat:', error);

    // Se sessão inválida, retornar 401
    if (error.message.includes('inválida') || error.message.includes('expirada')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Sessão inválida',
        codigo: 'SESSAO_INVALIDA',
      });
    }

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro no heartbeat',
      erro: error.message,
    });
  }
});

/**
 * Informações detalhadas da sessão atual
 */
router.get('/info', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    console.log(`[SESSION API] Carregando informações da sessão para usuário ${userId}`);

    // Buscar informações completas da sessão
    const sessionInfo = await SessionService.obterInformacoesSessao(sessionId);

    res.json({
      sucesso: true,
      usuario: {
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
        tipo_usuario: req.user.tipo_usuario,
      },
      sessao: sessionInfo,
      servidor: {
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao carregar informações da sessão:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao carregar informações da sessão',
      erro: error.message,
    });
  }
});

/**
 * Logout manual da sessão
 */
router.post('/logout', async (req, res) => {
  try {
    const { windowId, reason } = req.body;
    const userId = req.user.id;
    const sessionId = req.sessao.session_id;

    console.log(`[SESSION API] Logout manual para usuário ${userId} - Motivo: ${reason}`);

    // Realizar logout completo
    await SessionService.registrarLogout(
      SessionService.gerarHashToken(req.headers.authorization.replace('Bearer ', '')),
      reason || 'USER_LOGOUT',
      windowId
    );

    res.json({
      sucesso: true,
      mensagem: 'Logout realizado com sucesso',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[SESSION API] Erro no logout:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro no logout',
      erro: error.message,
    });
  }
});

/**
 * Lista todas as janelas ativas da sessão
 */
router.get('/windows', async (req, res) => {
  try {
    const sessionId = req.sessao.session_id;

    const windows = await SessionService.listarJanelasAtivas(sessionId);

    res.json({
      sucesso: true,
      janelas: windows,
      total: windows.length,
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao listar janelas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar janelas',
      erro: error.message,
    });
  }
});

/**
 * Força expiração de sessão (admin)
 */
router.post('/force-expire/:sessionId', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.tipo_usuario !== 'ADMIN') {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado',
      });
    }

    const { sessionId } = req.params;
    const { reason } = req.body;

    await SessionService.forcarExpiracaoSessao(sessionId, reason || 'ADMIN_FORCE');

    res.json({
      sucesso: true,
      mensagem: 'Sessão expirada com sucesso',
    });
  } catch (error) {
    console.error('[SESSION API] Erro ao forçar expiração:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao forçar expiração',
      erro: error.message,
    });
  }
});

module.exports = router;
