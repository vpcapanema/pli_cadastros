/**
 * Gerenciador de Sessões - SIGMA-PLI
 * Interface administrativa para controle de sessões
 */

class SessionsManager {
    constructor() {
        this.sessionsTable = null;
        this.currentSessions = [];
        this.stats = {};
        this.autoRefresh = null;
        this.refreshInterval = 30000; // 30 segundos
    }

    /**
     * Inicializa o gerenciador
     */
    async init() {
        try {
            console.log('[SESSIONS MANAGER] Inicializando...');
            
            // Verificar permissões
            const user = Auth.getUser();
            if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo_usuario)) {
                this.showError('Acesso negado. Apenas ADMIN e GESTOR podem acessar esta página.');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 3000);
                return;
            }

            // Inicializar componentes
            this.initDataTable();
            this.setupEventListeners();
            
            // Carregar dados iniciais
            await this.loadStats();
            await this.loadSessions();
            
            // Iniciar atualização automática
            this.startAutoRefresh();
            
            console.log('[SESSIONS MANAGER] Inicializado com sucesso');
            
        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro na inicialização:', error);
            this.showError('Erro ao inicializar gerenciador de sessões');
        }
    }

    /**
     * Inicializa a DataTable
     */
    initDataTable() {
        this.sessionsTable = $('#sessionsTable').DataTable({
            responsive: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            order: [[3, 'desc']], // Ordenar por data de login desc
            columnDefs: [
                { orderable: false, targets: [0, 8] }, // Status e Ações não ordenáveis
                { width: '80px', targets: [0] },
                { width: '120px', targets: [8] }
            ],
            pageLength: 25,
            dom: '<"d-flex justify-content-between"lf>rtip'
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Filtros
        document.getElementById('filter-status').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-user-type').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-username').addEventListener('input', Utils.debounce(() => this.applyFilters(), 500));
    }

    /**
     * Carrega estatísticas de sessões
     */
    async loadStats() {
        try {
            const response = await API.get('/sessions/estatisticas?dias=1');
            
            if (response.sucesso) {
                this.stats = response.estatisticas;
                this.updateStatsDisplay();
            } else {
                throw new Error(response.mensagem);
            }
            
        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao carregar estatísticas:', error);
            this.showError('Erro ao carregar estatísticas');
        }
    }

    /**
     * Atualiza exibição das estatísticas
     */
    updateStatsDisplay() {
        document.getElementById('stat-active-sessions').textContent = this.stats.sessoes_ativas || 0;
        document.getElementById('stat-unique-users').textContent = this.stats.usuarios_unicos || 0;
        document.getElementById('stat-logins-today').textContent = this.stats.logins_hoje || 0;
        document.getElementById('stat-avg-duration').textContent = `${this.stats.duracao_media_minutos || 0} min`;
    }

    /**
     * Carrega lista de sessões ativas
     */
    async loadSessions() {
        try {
            Loading.show();
            
            const response = await API.get('/sessions/ativas?limit=100');
            
            if (response.sucesso) {
                this.currentSessions = response.sessoes;
                this.renderSessions();
                this.updateLastUpdate();
            } else {
                throw new Error(response.mensagem);
            }
            
        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao carregar sessões:', error);
            this.showError('Erro ao carregar sessões');
        } finally {
            Loading.hide();
        }
    }

    /**
     * Renderiza as sessões na tabela
     */
    renderSessions() {
        // Limpar tabela
        this.sessionsTable.clear();
        
        // Adicionar dados
        this.currentSessions.forEach(sessao => {
            const row = this.createSessionRow(sessao);
            this.sessionsTable.row.add(row);
        });
        
        // Redesenhar tabela
        this.sessionsTable.draw();
    }

    /**
     * Cria linha da tabela para uma sessão
     */
    createSessionRow(sessao) {
        const statusBadge = this.createStatusBadge(sessao.status, sessao.minutos_inativo);
        const userInfo = `
            <div>
                <strong>${sessao.usuario.nome}</strong><br>
                <small class="text-muted">@${sessao.usuario.username}</small>
            </div>
        `;
        
        const typeBadge = `<span class="badge bg-${this.getUserTypeBadgeColor(sessao.usuario.tipo_usuario)}">${sessao.usuario.tipo_usuario}</span>`;
        
        const loginTime = new Date(sessao.data_login).toLocaleString('pt-BR');
        const lastAccess = new Date(sessao.data_ultimo_acesso).toLocaleString('pt-BR');
        
        const deviceInfo = sessao.dispositivo || {};
        const deviceDisplay = `
            <div class="small">
                <div><i class="fab fa-${this.getBrowserIcon(deviceInfo.browser)}"></i> ${deviceInfo.browser}</div>
                <div><i class="fas fa-${this.getOSIcon(deviceInfo.os)}"></i> ${deviceInfo.os}</div>
            </div>
        `;
        
        const duration = this.formatDuration(sessao.minutos_inativo);
        
        const actions = `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="sessionsManager.showSessionDetails('${sessao.session_id}')" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="sessionsManager.invalidateSession('${sessao.session_id}', '${sessao.usuario.nome}')" title="Invalidar sessão">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;

        return [
            statusBadge,
            userInfo,
            typeBadge,
            loginTime,
            lastAccess,
            sessao.endereco_ip,
            deviceDisplay,
            duration,
            actions
        ];
    }

    /**
     * Cria badge de status da sessão
     */
    createStatusBadge(status, minutosInativo) {
        let badgeClass, icon, text;
        
        if (status === 'ATIVA') {
            if (minutosInativo < 5) {
                badgeClass = 'bg-success';
                icon = 'fa-circle';
                text = 'Online';
            } else if (minutosInativo < 30) {
                badgeClass = 'bg-warning';
                icon = 'fa-clock';
                text = 'Ativa';
            } else {
                badgeClass = 'bg-secondary';
                icon = 'fa-pause';
                text = 'Inativa';
            }
        } else {
            badgeClass = 'bg-danger';
            icon = 'fa-times-circle';
            text = status;
        }
        
        return `<span class="badge ${badgeClass}"><i class="fas ${icon} me-1"></i>${text}</span>`;
    }

    /**
     * Retorna cor do badge para tipo de usuário
     */
    getUserTypeBadgeColor(tipo) {
        const colors = {
            'ADMIN': 'danger',
            'GESTOR': 'warning',
            'ANALISTA': 'info',
            'OPERADOR': 'success',
            'VISUALIZADOR': 'secondary'
        };
        return colors[tipo] || 'secondary';
    }

    /**
     * Retorna ícone do navegador
     */
    getBrowserIcon(browser) {
        if (!browser || browser === 'Unknown') return 'globe';
        
        const icons = {
            'Chrome': 'chrome',
            'Firefox': 'firefox',
            'Safari': 'safari',
            'Edge': 'edge',
            'Opera': 'opera'
        };
        
        return icons[browser] || 'globe';
    }

    /**
     * Retorna ícone do sistema operacional
     */
    getOSIcon(os) {
        if (!os || os === 'Unknown') return 'desktop';
        
        const icons = {
            'Windows': 'windows',
            'macOS': 'apple',
            'Linux': 'linux',
            'Android': 'android',
            'iOS': 'apple'
        };
        
        return icons[os] || 'desktop';
    }

    /**
     * Formata duração em texto legível
     */
    formatDuration(minutos) {
        if (minutos < 60) {
            return `${Math.round(minutos)}min`;
        } else if (minutos < 1440) { // 24 horas
            const horas = Math.floor(minutos / 60);
            const mins = Math.round(minutos % 60);
            return `${horas}h ${mins}min`;
        } else {
            const dias = Math.floor(minutos / 1440);
            const horas = Math.floor((minutos % 1440) / 60);
            return `${dias}d ${horas}h`;
        }
    }

    /**
     * Aplica filtros na tabela
     */
    applyFilters() {
        const statusFilter = document.getElementById('filter-status').value;
        const typeFilter = document.getElementById('filter-user-type').value;
        const usernameFilter = document.getElementById('filter-username').value.toLowerCase();

        this.sessionsTable.clear();
        
        const filteredSessions = this.currentSessions.filter(sessao => {
            // Filtro de status
            if (statusFilter && sessao.status !== statusFilter) {
                return false;
            }
            
            // Filtro de tipo de usuário
            if (typeFilter && sessao.usuario.tipo_usuario !== typeFilter) {
                return false;
            }
            
            // Filtro de username/nome
            if (usernameFilter) {
                const matchName = sessao.usuario.nome.toLowerCase().includes(usernameFilter);
                const matchUsername = sessao.usuario.username.toLowerCase().includes(usernameFilter);
                if (!matchName && !matchUsername) {
                    return false;
                }
            }
            
            return true;
        });

        // Adicionar dados filtrados
        filteredSessions.forEach(sessao => {
            const row = this.createSessionRow(sessao);
            this.sessionsTable.row.add(row);
        });
        
        this.sessionsTable.draw();
    }

    /**
     * Mostra detalhes de uma sessão específica
     */
    async showSessionDetails(sessionId) {
        try {
            const sessao = this.currentSessions.find(s => s.session_id === sessionId);
            if (!sessao) {
                this.showError('Sessão não encontrada');
                return;
            }

            const content = this.createSessionDetailsHTML(sessao);
            document.getElementById('session-details-content').innerHTML = content;
            
            // Configurar botão de invalidar
            const invalidateBtn = document.getElementById('btn-invalidate-session');
            invalidateBtn.onclick = () => this.invalidateSession(sessionId, sessao.usuario.nome);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('sessionDetailsModal'));
            modal.show();
            
        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao mostrar detalhes:', error);
            this.showError('Erro ao carregar detalhes da sessão');
        }
    }

    /**
     * Cria HTML com detalhes da sessão
     */
    createSessionDetailsHTML(sessao) {
        const deviceInfo = sessao.dispositivo || {};
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary mb-3">Informações do Usuário</h6>
                    <div class="session-detail-item">
                        <strong>Nome:</strong> ${sessao.usuario.nome}
                    </div>
                    <div class="session-detail-item">
                        <strong>Username:</strong> ${sessao.usuario.username}
                    </div>
                    <div class="session-detail-item">
                        <strong>Tipo:</strong> <span class="badge bg-${this.getUserTypeBadgeColor(sessao.usuario.tipo_usuario)}">${sessao.usuario.tipo_usuario}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary mb-3">Informações da Sessão</h6>
                    <div class="session-detail-item">
                        <strong>ID da Sessão:</strong><br>
                        <span class="font-monospace small">${sessao.session_id}</span>
                    </div>
                    <div class="session-detail-item">
                        <strong>Status:</strong> ${this.createStatusBadge(sessao.status, sessao.minutos_inativo)}
                    </div>
                    <div class="session-detail-item">
                        <strong>Login:</strong> ${new Date(sessao.data_login).toLocaleString('pt-BR')}
                    </div>
                    <div class="session-detail-item">
                        <strong>Último Acesso:</strong> ${new Date(sessao.data_ultimo_acesso).toLocaleString('pt-BR')}
                    </div>
                    <div class="session-detail-item">
                        <strong>IP:</strong> <span class="font-monospace">${sessao.endereco_ip}</span>
                    </div>
                    <div class="session-detail-item">
                        <strong>Dispositivo:</strong><br>
                        <i class="fab fa-${this.getBrowserIcon(deviceInfo.browser)}"></i> ${deviceInfo.browser} ${deviceInfo.version || ''}<br>
                        <i class="fas fa-${this.getOSIcon(deviceInfo.os)}"></i> ${deviceInfo.os}<br>
                        <i class="fas fa-desktop"></i> ${deviceInfo.device}
                    </div>
                    <div class="session-detail-item">
                        <strong>Duração:</strong> ${this.formatDuration(sessao.minutos_inativo)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Invalida uma sessão específica
     */
    async invalidateSession(sessionId, userName) {
        const result = await Swal.fire({
            title: 'Invalidar Sessão',
            text: `Deseja realmente invalidar a sessão de ${userName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, invalidar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            // Encontrar usuário da sessão
            const sessao = this.currentSessions.find(s => s.session_id === sessionId);
            if (!sessao) {
                throw new Error('Sessão não encontrada');
            }

            const response = await API.post(`/sessions/invalidar-usuario/${sessao.usuario.id}`, {
                motivo: 'ADMIN_FORCED'
            });

            if (response.sucesso) {
                Notification.success(`Sessão de ${userName} invalidada com sucesso!`);
                
                // Fechar modal se estiver aberto
                const modal = bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal'));
                if (modal) modal.hide();
                
                // Recarregar dados
                await this.loadSessions();
                await this.loadStats();
            } else {
                throw new Error(response.mensagem);
            }

        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao invalidar sessão:', error);
            this.showError('Erro ao invalidar sessão: ' + error.message);
        }
    }

    /**
     * Limpa sessões expiradas
     */
    async cleanExpiredSessions() {
        const result = await Swal.fire({
            title: 'Limpar Sessões Expiradas',
            text: 'Deseja limpar todas as sessões expiradas do sistema?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, limpar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await API.post('/sessions/limpar-expiradas');

            if (response.sucesso) {
                Notification.success(`${response.sessoes_limpas} sessão(ões) expirada(s) limpa(s)!`);
                
                // Recarregar dados
                await this.loadSessions();
                await this.loadStats();
            } else {
                throw new Error(response.mensagem);
            }

        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao limpar sessões:', error);
            this.showError('Erro ao limpar sessões: ' + error.message);
        }
    }

    /**
     * Atualiza estatísticas e sessões
     */
    async refreshStats() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadSessions()
            ]);
            
            Notification.success('Dados atualizados com sucesso!');
            
        } catch (error) {
            console.error('[SESSIONS MANAGER] Erro ao atualizar:', error);
            this.showError('Erro ao atualizar dados');
        }
    }

    /**
     * Inicia atualização automática
     */
    startAutoRefresh() {
        this.autoRefresh = setInterval(async () => {
            try {
                await this.loadStats();
                await this.loadSessions();
                console.log('[SESSIONS MANAGER] Dados atualizados automaticamente');
            } catch (error) {
                console.warn('[SESSIONS MANAGER] Erro na atualização automática:', error);
            }
        }, this.refreshInterval);
    }

    /**
     * Para atualização automática
     */
    stopAutoRefresh() {
        if (this.autoRefresh) {
            clearInterval(this.autoRefresh);
            this.autoRefresh = null;
        }
    }

    /**
     * Atualiza timestamp da última atualização
     */
    updateLastUpdate() {
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString('pt-BR');
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        Notification.error(message);
    }

    /**
     * Limpa recursos ao sair da página
     */
    destroy() {
        this.stopAutoRefresh();
        
        if (this.sessionsTable) {
            this.sessionsTable.destroy();
        }
    }
}

// Instância global
window.sessionsManager = new SessionsManager();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sessionsManager.init();
});

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', function() {
    sessionsManager.destroy();
});
