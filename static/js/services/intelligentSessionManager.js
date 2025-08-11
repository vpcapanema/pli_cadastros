/**
 * Gerenciador Inteligente de Sessões - SIGMA-PLI
 * Sistema avançado de controle de sessões com renovação automática e inteligente
 */

class IntelligentSessionManager {
  constructor() {
    this.sessionDuration = 15 * 60 * 1000; // 15 minutos em ms
    this.renewalThreshold = 5 * 60 * 1000; // Renovar quando restam 5 minutos
    this.activityTimeout = 2 * 60 * 1000; // 2 minutos sem atividade para marcar como inativo

    // Estado da sessão
    this.sessionData = null;
    this.lastActivity = Date.now();
    this.isActive = true;
    this.renewalTimer = null;
    this.activityTimer = null;
    this.heartbeatInterval = null;

    // Controle de janelas
    this.windowId = this.generateWindowId();
    this.isMainWindow = false;
    this.windowCount = 0;

    // Eventos de atividade
    this.activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'blur',
    ];

    // Estado de inicialização
    this.initialized = false;

    console.log('[INTELLIGENT SESSION] Manager inicializado com ID:', this.windowId);
  }

  /**
   * Inicializa o gerenciador de sessões
   */
  async init() {
    if (this.initialized) return;

    try {
      console.log('[INTELLIGENT SESSION] Inicializando sistema inteligente...');

      // Verificar autenticação
      if (!Auth.isAuthenticated()) {
        console.log(
          '[INTELLIGENT SESSION] Usuário não autenticado - sistema não será inicializado'
        );
        return;
      }

      // Registrar esta janela
      await this.registerWindow();

      // Carregar dados da sessão
      await this.loadSessionData();

      // Se não conseguiu carregar dados da sessão, não inicializar o resto
      if (!this.sessionData) {
        console.log('[INTELLIGENT SESSION] Sem dados de sessão - inicialização parcial');
        return;
      }

      // Configurar monitoramento de atividade
      this.setupActivityMonitoring();

      // Configurar renovação automática
      this.setupAutoRenewal();

      // Configurar controle de janelas
      this.setupWindowControl();

      // Configurar heartbeat
      this.setupHeartbeat();

      // Configurar eventos de página
      this.setupPageEvents();

      this.initialized = true;
      console.log('[INTELLIGENT SESSION] ✅ Sistema inicializado com sucesso');
    } catch (error) {
      console.error('[INTELLIGENT SESSION] ❌ Erro na inicialização:', error);

      // Não chamar handleSessionError se é um problema de autenticação
      if (!error.message.includes('autenticação') && !error.message.includes('Token')) {
        this.handleSessionError(error);
      }
    }
  }

  /**
   * Gera ID único para a janela/aba
   */
  generateWindowId() {
    return 'window_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Registra a janela no controle de sessões
   */
  async registerWindow() {
    try {
      const response = await fetch('/api/session/register-window', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: JSON.stringify({
          windowId: this.windowId,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.isMainWindow = data.isMainWindow;
        this.windowCount = data.totalWindows;
        console.log('[INTELLIGENT SESSION] Janela registrada:', {
          id: this.windowId,
          isMain: this.isMainWindow,
          total: this.windowCount,
        });
      }
    } catch (error) {
      console.error('[INTELLIGENT SESSION] Erro ao registrar janela:', error);
    }
  }

  /**
   * Carrega dados atuais da sessão
   */
  async loadSessionData() {
    try {
      console.log('[INTELLIGENT SESSION] Tentando carregar dados da sessão...');

      // Verificar se há token de autenticação
      if (!Auth.isAuthenticated()) {
        console.log(
          '[INTELLIGENT SESSION] Usuário não autenticado - não é possível carregar dados da sessão'
        );
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/session/info', {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      });

      console.log('[INTELLIGENT SESSION] Response status:', response.status);

      if (response.ok) {
        this.sessionData = await response.json();
        console.log('[INTELLIGENT SESSION] Dados da sessão carregados:', this.sessionData);
      } else {
        const errorData = await response.text();
        console.log('[INTELLIGENT SESSION] Erro na resposta:', errorData);
        throw new Error(`Falha ao carregar dados da sessão: ${response.status}`);
      }
    } catch (error) {
      console.error('[INTELLIGENT SESSION] Erro ao carregar dados da sessão:', error);

      // Se é erro de autenticação, não re-lançar o erro para evitar loops
      if (error.message.includes('autenticação') || error.message.includes('Token')) {
        this.sessionData = null;
        return;
      }

      throw error;
    }
  }

  /**
   * Configura monitoramento de atividade do usuário
   */
  setupActivityMonitoring() {
    // Adicionar listeners para eventos de atividade
    this.activityEvents.forEach((eventType) => {
      document.addEventListener(
        eventType,
        () => {
          this.recordActivity();
        },
        { passive: true }
      );
    });

    // Monitorar visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.recordActivity();
      }
    });

    console.log('[INTELLIGENT SESSION] Monitoramento de atividade configurado');
  }

  /**
   * Registra atividade do usuário
   */
  recordActivity() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Só processar se passou tempo suficiente (throttling)
    if (timeSinceLastActivity > 1000) {
      // 1 segundo
      this.lastActivity = now;
      this.isActive = true;

      // Verificar se precisa renovar baseado na atividade
      this.checkActivityBasedRenewal();

      // Reset do timer de inatividade
      this.resetActivityTimer();
    }
  }

  /**
   * Verifica se deve renovar a sessão baseado na atividade
   */
  checkActivityBasedRenewal() {
    if (!this.sessionData) return;

    const timeUntilExpiration = new Date(this.sessionData.data_expiracao).getTime() - Date.now();

    // Se restam menos que o threshold, renovar
    if (timeUntilExpiration <= this.renewalThreshold) {
      console.log('[INTELLIGENT SESSION] Renovação baseada em atividade triggered');
      this.renewSession('ACTIVITY_BASED');
    }
  }

  /**
   * Reset do timer de inatividade
   */
  resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      this.isActive = false;
      console.log('[INTELLIGENT SESSION] Usuário marcado como inativo');
    }, this.activityTimeout);
  }

  /**
   * Configura renovação automática da sessão
   */
  setupAutoRenewal() {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
    }

    // Verificar a cada minuto se precisa renovar
    this.renewalTimer = setInterval(() => {
      this.checkAndRenewSession();
    }, 60 * 1000); // 1 minuto

    console.log('[INTELLIGENT SESSION] Renovação automática configurada');
  }

  /**
   * Verifica e renova a sessão se necessário
   */
  async checkAndRenewSession() {
    if (!this.sessionData) return;

    const now = Date.now();
    const expirationTime = new Date(this.sessionData.data_expiracao).getTime();
    const timeUntilExpiration = expirationTime - now;

    // Se a sessão já expirou
    if (timeUntilExpiration <= 0) {
      console.log('[INTELLIGENT SESSION] Sessão expirou - realizando logout');
      await this.handleSessionExpiry();
      return;
    }

    // Se está próximo do limite e usuário está ativo
    if (timeUntilExpiration <= this.renewalThreshold && this.isActive) {
      console.log('[INTELLIGENT SESSION] Renovação automática triggered');
      await this.renewSession('AUTO_RENEWAL');
    }
  }

  /**
   * Renova a sessão
   */
  async renewSession(reason = 'MANUAL') {
    try {
      console.log(`[INTELLIGENT SESSION] Renovando sessão - Motivo: ${reason}`);

      const response = await fetch('/api/session/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: JSON.stringify({
          windowId: this.windowId,
          reason: reason,
          lastActivity: this.lastActivity,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Atualizar dados da sessão
        this.sessionData = data.sessionData;

        // Atualizar token se fornecido
        if (data.newToken) {
          Auth.updateToken(data.newToken);
        }

        console.log('[INTELLIGENT SESSION] ✅ Sessão renovada com sucesso');
        this.notifySessionRenewal();
      } else {
        throw new Error('Falha na renovação da sessão');
      }
    } catch (error) {
      console.error('[INTELLIGENT SESSION] ❌ Erro ao renovar sessão:', error);
      await this.handleSessionError(error);
    }
  }

  /**
   * Configura controle de janelas
   */
  setupWindowControl() {
    // Storage event para comunicação entre janelas
    window.addEventListener('storage', (e) => {
      if (e.key === 'pli_session_logout') {
        console.log('[INTELLIGENT SESSION] Logout detectado em outra janela');
        this.handleCrossWindowLogout();
      }
    });

    // Antes de fechar a janela
    window.addEventListener('beforeunload', () => {
      this.unregisterWindow();
    });

    console.log('[INTELLIGENT SESSION] Controle de janelas configurado');
  }

  /**
   * Remove registro da janela
   */
  async unregisterWindow() {
    try {
      navigator.sendBeacon(
        '/api/session/unregister-window',
        JSON.stringify({
          windowId: this.windowId,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('[INTELLIGENT SESSION] Erro ao desregistrar janela:', error);
    }
  }

  /**
   * Configura heartbeat para manter conexão
   */
  setupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Heartbeat a cada 30 segundos
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30 * 1000);

    console.log('[INTELLIGENT SESSION] Heartbeat configurado');
  }

  /**
   * Envia heartbeat para o servidor
   */
  async sendHeartbeat() {
    try {
      const response = await fetch('/api/session/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: JSON.stringify({
          windowId: this.windowId,
          isActive: this.isActive,
          lastActivity: this.lastActivity,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok && response.status === 401) {
        console.log('[INTELLIGENT SESSION] Heartbeat falhou - sessão inválida');
        await this.handleSessionExpiry();
      }
    } catch (error) {
      console.error('[INTELLIGENT SESSION] Erro no heartbeat:', error);
    }
  }

  /**
   * Configura eventos da página
   */
  setupPageEvents() {
    // Interceptar botões de logout
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-logout], .logout-btn, #logoutBtn')) {
        e.preventDefault();
        this.logout();
      }
    });
  }

  /**
   * Realiza logout completo
   */
  async logout() {
    try {
      console.log('[INTELLIGENT SESSION] Iniciando logout...');

      // Marcar logout no localStorage para outras janelas
      localStorage.setItem('pli_session_logout', Date.now().toString());

      // Limpar timers
      this.cleanup();

      // Desregistrar janela
      await this.unregisterWindow();

      // Logout no servidor
      const response = await fetch('/api/session/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: JSON.stringify({
          windowId: this.windowId,
          reason: 'USER_LOGOUT',
        }),
      });

      // Limpar dados locais
      Auth.logout();

      // Redirecionar
      window.location.href = '/login.html';
    } catch (error) {
      console.error('[INTELLIGENT SESSION] Erro durante logout:', error);
      // Mesmo com erro, limpar dados locais
      Auth.logout();
      window.location.href = '/login.html';
    }
  }

  /**
   * Trata expiração da sessão
   */
  async handleSessionExpiry() {
    console.log('[INTELLIGENT SESSION] Tratando expiração da sessão');

    // Limpar timers
    this.cleanup();

    // Notificar usuário
    this.notifySessionExpiry();

    // Aguardar um pouco e fazer logout
    setTimeout(() => {
      Auth.logout();
      window.location.href = '/login.html?reason=session_expired';
    }, 3000);
  }

  /**
   * Trata logout de outra janela
   */
  handleCrossWindowLogout() {
    console.log('[INTELLIGENT SESSION] Logout de outra janela detectado');

    this.cleanup();
    Auth.logout();
    window.location.href = '/login.html?reason=logged_out_elsewhere';
  }

  /**
   * Trata erros de sessão
   */
  async handleSessionError(error) {
    console.error('[INTELLIGENT SESSION] Erro na sessão:', error);

    if (error.message.includes('401') || error.message.includes('Token')) {
      await this.handleSessionExpiry();
    }
  }

  /**
   * Notifica renovação da sessão
   */
  notifySessionRenewal() {
    // Criar notificação discreta
    this.showNotification('Sessão renovada automaticamente', 'success', 2000);
  }

  /**
   * Notifica expiração da sessão
   */
  notifySessionExpiry() {
    this.showNotification('Sua sessão expirou. Redirecionando...', 'warning', 3000);
  }

  /**
   * Mostra notificação
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Usar sistema de notificação existente se disponível
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Limpa todos os timers e listeners
   */
  cleanup() {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
    }

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Remover listeners de atividade
    this.activityEvents.forEach((eventType) => {
      document.removeEventListener(eventType, this.recordActivity);
    });

    console.log('[INTELLIGENT SESSION] Cleanup concluído');
  }

  /**
   * Obtém informações da sessão atual
   */
  getSessionInfo() {
    return {
      windowId: this.windowId,
      isMainWindow: this.isMainWindow,
      windowCount: this.windowCount,
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      sessionData: this.sessionData,
    };
  }

  /**
   * Força renovação manual da sessão
   */
  async forceRenewal() {
    await this.renewSession('MANUAL_FORCE');
  }
}

// Instância global
window.IntelligentSessionManager =
  window.IntelligentSessionManager || new IntelligentSessionManager();

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.IntelligentSessionManager.init(), 100);
  });
} else {
  setTimeout(() => window.IntelligentSessionManager.init(), 100);
}
