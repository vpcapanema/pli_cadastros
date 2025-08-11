/**
 * Componente de Controle de Sessão Visual - SIGMA-PLI (RECONFIGURADO)
 * Mostra informações da sessão ativa e permite gerenciamento
 */

class SessionMonitor {
  constructor() {
    this.sessionInfo = null;
    this.updateInterval = null;
    this.initialized = false;
    this.updateFrequency = 30000; // 30 segundos
  }

  /**
   * Inicializa o monitor de sessão
   */
  async init() {
    if (this.initialized) return;

    try {
      console.log('[SESSION MONITOR] Inicializando monitor de sessão...');

      // Verificar se usuário está autenticado
      if (!Auth.isAuthenticated()) {
        console.log('[SESSION MONITOR] Usuário não autenticado - monitor não iniciado');
        return;
      }

      // Carregar informações iniciais da sessão
      await this.loadSessionInfo();

      // Criar elementos visuais
      // this.createSessionIndicator(); // Desabilitado - usando barra de status do dashboard
      this.createSessionModal();

      // Iniciar atualização automática
      this.startAutoUpdate();

      // Configurar eventos
      this.setupEventListeners();

      this.initialized = true;
      console.log('[SESSION MONITOR] ✅ Monitor de sessão inicializado com sucesso');
    } catch (error) {
      console.error('[SESSION MONITOR] ❌ Erro ao inicializar:', error);
    }
  }

  /**
   * Carrega informações da sessão atual
   */
  async loadSessionInfo() {
    try {
      // Simular informações de sessão baseadas no localStorage
      const user = Auth.getUser();
      const lastLogin = Auth.getLastLogin();
      const tokenExpiration = localStorage.getItem('tokenExpiration');

      if (user && lastLogin && tokenExpiration) {
        this.sessionInfo = {
          sucesso: true,
          usuario: user.nome,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          ultima_atividade: lastLogin,
          expira_em: new Date(parseInt(tokenExpiration)).toISOString(),
          sessoes_ativas: 1,
          tempo_restante: Math.max(0, parseInt(tokenExpiration) - new Date().getTime()),
        };

        this.updateSessionDisplay();
        return this.sessionInfo;
      } else {
        throw new Error('Dados de sessão incompletos');
      }
    } catch (error) {
      console.error('[SESSION MONITOR] Erro ao carregar informações da sessão:', error);

      // Se erro de autenticação, fazer logout
      if (!Auth.isAuthenticated()) {
        Auth.logout();
        window.location.href = '/login.html';
      }

      throw error;
    }
  }

  /**
   * Cria o indicador visual de sessão na página
   */
  createSessionIndicator() {
    // Verificar se já existe
    if (document.getElementById('session-indicator')) return;

    // Criar estilos CSS
    this.createSessionStyles();

    const indicator = document.createElement('div');
    indicator.id = 'session-indicator';
    indicator.className = 'session-indicator';
    indicator.innerHTML = `
            <div class="session-status-bar">
                <div class="session-info-left">
                    <div class="session-status-dot" id="sessionDot"></div>
                    <span class="session-user-name" id="sessionUserName">Carregando...</span>
                    <span class="session-time" id="sessionTime"></span>
                </div>
                <div class="session-info-right">
                    <button class="btn btn-sm btn-outline-primary session-details-btn" 
                            onclick="sessionMonitor.showSessionModal()" 
                            title="Ver detalhes da sessão">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger session-logout-btn" 
                            onclick="Auth.logout()" 
                            title="Sair do sistema">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        `;

    // Adicionar no topo da página
    document.body.insertBefore(indicator, document.body.firstChild);

    // Ajustar padding do body para não sobrepor conteúdo
    document.body.style.paddingTop = '60px';

    console.log('[SESSION MONITOR] ✅ Indicador visual criado');
  }

  /**
   * Cria estilos CSS para o monitor de sessão
   */
  createSessionStyles() {
    if (document.getElementById('session-monitor-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'session-monitor-styles';
    styles.textContent = `
            .session-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }
            
            .session-status-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 20px;
                font-size: 14px;
            }
            
            .session-info-left {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .session-status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #4CAF50;
                animation: pulse 2s infinite;
            }
            
            .session-status-dot.warning { background: #FF9800; }
            .session-status-dot.danger { background: #F44336; }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .session-user-name {
                font-weight: 600;
            }
            
            .session-time {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .session-info-right {
                display: flex;
                gap: 10px;
            }
            
            .session-details-btn, .session-logout-btn {
                border: 1px solid rgba(255,255,255,0.3) !important;
                color: white !important;
                font-size: 12px !important;
                padding: 4px 8px !important;
            }
            
            .session-details-btn:hover {
                background: rgba(255,255,255,0.1) !important;
                border-color: rgba(255,255,255,0.5) !important;
            }
            
            .session-logout-btn:hover {
                background: rgba(244, 67, 54, 0.2) !important;
                border-color: #F44336 !important;
            }
        `;

    document.head.appendChild(styles);
  }

  /**
   * Atualiza a exibição das informações de sessão
   */
  updateSessionDisplay() {
    const userNameEl = document.getElementById('sessionUserName');
    const timeEl = document.getElementById('sessionTime');
    const dotEl = document.getElementById('sessionDot');

    if (!this.sessionInfo || !userNameEl || !timeEl || !dotEl) return;

    // Atualizar nome do usuário
    userNameEl.textContent = this.sessionInfo.usuario || 'Usuário';

    // Calcular tempo restante
    const tempoRestante = this.sessionInfo.tempo_restante || 0;
    const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));

    // Atualizar tempo
    if (tempoRestante > 0) {
      timeEl.textContent = `Expira em ${horasRestantes}h ${minutosRestantes}m`;
    } else {
      timeEl.textContent = 'Sessão expirada';
    }

    // Atualizar status visual
    dotEl.className = 'session-status-dot';
    if (tempoRestante <= 0) {
      dotEl.classList.add('danger');
    } else if (tempoRestante <= 300000) {
      // 5 minutos
      dotEl.classList.add('warning');
    }
  }

  /**
   * Cria modal com detalhes da sessão
   */
  createSessionModal() {
    if (document.getElementById('session-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'session-modal';
    modal.className = 'modal fade';
    modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-clock"></i> Detalhes da Sessão
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="session-details-content">
                            <p><i class="fas fa-user"></i> <strong>Usuário:</strong> <span id="modal-user-name">-</span></p>
                            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> <span id="modal-user-email">-</span></p>
                            <p><i class="fas fa-clock"></i> <strong>Último Login:</strong> <span id="modal-last-login">-</span></p>
                            <p><i class="fas fa-hourglass-half"></i> <strong>Expira em:</strong> <span id="modal-expires">-</span></p>
                            <p><i class="fas fa-shield-alt"></i> <strong>Tipo de Usuário:</strong> <span id="modal-user-type">-</span></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <button type="button" class="btn btn-primary" onclick="sessionMonitor.refreshSession()">
                            <i class="fas fa-sync"></i> Atualizar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="Auth.logout()">
                            <i class="fas fa-sign-out-alt"></i> Sair
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  /**
   * Mostra modal com detalhes da sessão
   */
  showSessionModal() {
    const modal = new bootstrap.Modal(document.getElementById('session-modal'));

    // Atualizar conteúdo do modal
    if (this.sessionInfo) {
      document.getElementById('modal-user-name').textContent = this.sessionInfo.usuario || '-';
      document.getElementById('modal-user-email').textContent = this.sessionInfo.email || '-';
      document.getElementById('modal-last-login').textContent =
        new Date(this.sessionInfo.ultima_atividade).toLocaleString('pt-BR') || '-';
      document.getElementById('modal-expires').textContent =
        new Date(this.sessionInfo.expira_em).toLocaleString('pt-BR') || '-';
      document.getElementById('modal-user-type').textContent = this.sessionInfo.tipo_usuario || '-';
    }

    modal.show();
  }

  /**
   * Atualiza informações da sessão
   */
  async refreshSession() {
    try {
      console.log('[SESSION MONITOR] Atualizando informações da sessão...');
      await this.loadSessionInfo();
      console.log('[SESSION MONITOR] ✅ Sessão atualizada');
    } catch (error) {
      console.error('[SESSION MONITOR] Erro ao atualizar sessão:', error);
    }
  }

  /**
   * Inicia atualização automática
   */
  startAutoUpdate() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      if (Auth.isAuthenticated()) {
        await this.refreshSession();
      } else {
        this.destroy();
      }
    }, this.updateFrequency);

    console.log('[SESSION MONITOR] ✅ Atualização automática iniciada');
  }

  /**
   * Para atualização automática
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[SESSION MONITOR] Atualização automática parada');
    }
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Listener para logout do usuário
    window.addEventListener('user-logout', () => {
      console.log('[SESSION MONITOR] Logout detectado - removendo monitor');
      this.destroy();
    });

    // Listener para login do usuário
    window.addEventListener('user-login', () => {
      console.log('[SESSION MONITOR] Login detectado - reiniciando monitor');
      setTimeout(() => this.init(), 1000);
    });

    // Listener para atividade do usuário
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
    activityEvents.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          Auth.updateLastActivity();
        },
        { passive: true, once: false }
      );
    });
  }

  /**
   * Remove o monitor de sessão
   */
  destroy() {
    // Parar atualizações
    this.stopAutoUpdate();

    // Remover elementos visuais
    const indicator = document.getElementById('session-indicator');
    const modal = document.getElementById('session-modal');
    const styles = document.getElementById('session-monitor-styles');

    if (indicator) indicator.remove();
    if (modal) modal.remove();
    if (styles) styles.remove();

    // Restaurar padding do body
    document.body.style.paddingTop = '';

    this.initialized = false;
    console.log('[SESSION MONITOR] Monitor removido');
  }
}

// Instância global
window.sessionMonitor = new SessionMonitor();
