/**
 * Session Monitor - Frontend
 * Sistema de monitoramento visual de sessões
 */

class SessionMonitor {
    constructor() {
        this.sessionData = null;
        this.updateInterval = null;
        this.refreshRate = 30000; // 30 segundos
        this.isInitialized = false;
    }

    /**
     * Inicializa o monitor de sessão
     */
    async init() {
        try {
            console.log('[SESSION MONITOR] Inicializando...');
            
            // Verificar se usuário está autenticado
            if (!Auth.isAuthenticated()) {
                console.log('[SESSION MONITOR] Usuário não autenticado');
                return;
            }

            // Carregar dados da sessão
            await this.loadSessionData();
            
            // Criar indicador visual - DESABILITADO (usando statusBar.js)
            // this.createSessionIndicator();
            
            // Iniciar atualizações automáticas
            this.startAutoUpdate();
            
            this.isInitialized = true;
            console.log('[SESSION MONITOR] Inicializado com sucesso');
            
        } catch (error) {
            console.error('[SESSION MONITOR] Erro na inicialização:', error);
        }
    }

    /**
     * Carrega dados da sessão atual
     */
    async loadSessionData() {
        try {
            const response = await API.get('/sessions/atual');
            
            if (response.sucesso) {
                this.sessionData = response.sessao;
                this.updateDisplay();
            } else {
                console.warn('[SESSION MONITOR] Sessão não encontrada');
            }
            
        } catch (error) {
            console.error('[SESSION MONITOR] Erro ao carregar sessão:', error);
        }
    }

    /**
     * Cria indicador visual da sessão
     */
    createSessionIndicator() {
        // Verificar se já existe
        if (document.getElementById('session-indicator')) {
            return;
        }

        const indicator = document.createElement('div');
        indicator.id = 'session-indicator';
        indicator.className = 'session-indicator';
        indicator.innerHTML = this.getIndicatorHTML();
        
        // Adicionar ao body
        document.body.appendChild(indicator);
        
        // Adicionar event listeners
        this.setupEventListeners();
    }

    /**
     * Retorna HTML do indicador
     */
    getIndicatorHTML() {
        const user = Auth.getUser();
        const isOnline = this.sessionData && this.sessionData.status === 'ATIVA';
        
        return `
            <div class="session-status ${isOnline ? 'online' : 'offline'}">
                <div class="status-dot"></div>
                <span class="status-text">${isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div class="session-info">
                <div class="user-name">${user?.nome || 'Usuário'}</div>
                <div class="session-time" id="session-time">--:--</div>
            </div>
            <div class="session-actions">
                <button class="btn-session-details" onclick="sessionMonitor.showSessionModal()">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        `;
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        const indicator = document.getElementById('session-indicator');
        
        // Hover para mostrar detalhes
        indicator.addEventListener('mouseenter', () => {
            this.showTooltip();
        });
        
        indicator.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    /**
     * Atualiza exibição do indicador
     */
    updateDisplay() {
        if (!this.sessionData) return;
        
        const indicator = document.getElementById('session-indicator');
        if (!indicator) return;
        
        const statusElement = indicator.querySelector('.session-status');
        const timeElement = indicator.querySelector('#session-time');
        
        // Atualizar status
        const isOnline = this.sessionData.status === 'ATIVA';
        statusElement.className = `session-status ${isOnline ? 'online' : 'offline'}`;
        statusElement.querySelector('.status-text').textContent = isOnline ? 'Online' : 'Offline';
        
        // Atualizar tempo
        if (timeElement && this.sessionData.data_login) {
            const duration = this.calculateSessionDuration();
            timeElement.textContent = duration;
        }
    }

    /**
     * Calcula duração da sessão
     */
    calculateSessionDuration() {
        if (!this.sessionData?.data_login) return '--:--';
        
        const loginTime = new Date(this.sessionData.data_login);
        const now = new Date();
        const diffMs = now - loginTime;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * Mostra tooltip com informações
     */
    showTooltip() {
        if (!this.sessionData) return;
        
        const tooltip = document.createElement('div');
        tooltip.id = 'session-tooltip';
        tooltip.className = 'session-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">Informações da Sessão</div>
            <div class="tooltip-content">
                <div><strong>Login:</strong> ${new Date(this.sessionData.data_login).toLocaleString('pt-BR')}</div>
                <div><strong>IP:</strong> ${this.sessionData.endereco_ip}</div>
                <div><strong>Dispositivo:</strong> ${this.sessionData.dispositivo?.browser || 'N/A'}</div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionar próximo ao indicador
        const indicator = document.getElementById('session-indicator');
        const rect = indicator.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.right = `20px`;
    }

    /**
     * Esconde tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('session-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Mostra modal com detalhes completos
     */
    async showSessionModal() {
        if (!this.sessionData) {
            await this.loadSessionData();
        }
        
        const modal = this.createSessionModal();
        document.body.appendChild(modal);
        
        // Mostrar modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Remover após fechar
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    /**
     * Cria modal com detalhes da sessão
     */
    createSessionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'sessionDetailsModal';
        modal.tabIndex = -1;
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-user-circle me-2"></i>
                            Detalhes da Sessão
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${this.getSessionDetailsHTML()}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Fechar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="sessionMonitor.logout()">
                            <i class="fas fa-sign-out-alt me-1"></i>
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    /**
     * Retorna HTML com detalhes da sessão
     */
    getSessionDetailsHTML() {
        if (!this.sessionData) {
            return '<p>Dados da sessão não disponíveis.</p>';
        }
        
        const user = Auth.getUser();
        const deviceInfo = this.sessionData.dispositivo || {};
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary mb-3">Usuário</h6>
                    <div class="session-detail">
                        <strong>Nome:</strong> ${user.nome}
                    </div>
                    <div class="session-detail">
                        <strong>Username:</strong> ${user.username}
                    </div>
                    <div class="session-detail">
                        <strong>Tipo:</strong> <span class="badge bg-info">${user.tipo_usuario}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary mb-3">Sessão</h6>
                    <div class="session-detail">
                        <strong>Status:</strong> 
                        <span class="badge ${this.sessionData.status === 'ATIVA' ? 'bg-success' : 'bg-danger'}">
                            ${this.sessionData.status}
                        </span>
                    </div>
                    <div class="session-detail">
                        <strong>Login:</strong> ${new Date(this.sessionData.data_login).toLocaleString('pt-BR')}
                    </div>
                    <div class="session-detail">
                        <strong>Duração:</strong> ${this.calculateSessionDuration()}
                    </div>
                    <div class="session-detail">
                        <strong>IP:</strong> <code>${this.sessionData.endereco_ip}</code>
                    </div>
                    <div class="session-detail">
                        <strong>Navegador:</strong> ${deviceInfo.browser || 'N/A'}
                    </div>
                    <div class="session-detail">
                        <strong>SO:</strong> ${deviceInfo.os || 'N/A'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Inicia atualizações automáticas
     */
    startAutoUpdate() {
        this.updateInterval = setInterval(async () => {
            await this.loadSessionData();
        }, this.refreshRate);
    }

    /**
     * Para atualizações automáticas
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Faz logout do usuário
     */
    async logout() {
        try {
            await Auth.logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('[SESSION MONITOR] Erro no logout:', error);
            Notification.error('Erro ao fazer logout');
        }
    }

    /**
     * Limpa recursos
     */
    destroy() {
        this.stopAutoUpdate();
        
        const indicator = document.getElementById('session-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        const tooltip = document.getElementById('session-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        this.isInitialized = false;
    }
}

// CSS inline para o indicador
const sessionIndicatorCSS = `
.session-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 10px 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1050;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.session-indicator:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.session-status {
    display: flex;
    align-items: center;
    gap: 5px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.session-status.online .status-dot {
    background-color: #28a745;
}

.session-status.offline .status-dot {
    background-color: #dc3545;
}

.status-text {
    font-weight: 600;
    color: #495057;
}

.session-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-weight: 600;
    color: #343a40;
}

.session-time {
    font-size: 0.75rem;
    color: #6c757d;
    font-family: monospace;
}

.session-actions {
    display: flex;
    align-items: center;
}

.btn-session-details {
    background: none;
    border: none;
    color: #007bff;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-session-details:hover {
    background-color: #f8f9fa;
    color: #0056b3;
}

.session-tooltip {
    position: fixed;
    background: #343a40;
    color: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1060;
    font-size: 0.875rem;
    min-width: 200px;
}

.tooltip-header {
    font-weight: 600;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid #495057;
}

.tooltip-content div {
    margin-bottom: 4px;
}

.session-detail {
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #f8f9fa;
}

.session-detail:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

@media (max-width: 768px) {
    .session-indicator {
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        font-size: 0.8rem;
    }
    
    .session-info {
        display: none;
    }
}
`;

// Adicionar CSS
if (!document.getElementById('session-monitor-css')) {
    const style = document.createElement('style');
    style.id = 'session-monitor-css';
    style.textContent = sessionIndicatorCSS;
    document.head.appendChild(style);
}

// Instância global
window.sessionMonitor = new SessionMonitor();

// Auto-inicializar se não for página de login
if (!window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        sessionMonitor.init();
    });
}

// Limpar ao sair da página
window.addEventListener('beforeunload', () => {
    sessionMonitor.destroy();
});
