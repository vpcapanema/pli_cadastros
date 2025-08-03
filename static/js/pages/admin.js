/**
 * Admin Panel JavaScript - SIGMA-PLI
 * Responsável pela interface de administração
 */

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.userInfo = null;
        this.charts = {};
        this.init();
    }

    /**
     * Inicializar o painel administrativo
     */
    async init() {
        try {
            // Verificar autenticação
            await this.checkAuth();
            
            // Carregar informações do usuário
            await this.loadUserInfo();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Carregar seção inicial (dashboard)
            await this.loadSection('dashboard');
            
        } catch (error) {
            console.error('[ADMIN] Erro na inicialização:', error);
            this.showError('Erro ao inicializar painel administrativo');
        }
    }

    /**
     * Verificar autenticação e permissões
     */
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login';
            return;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token inválido');
            }

            const data = await response.json();
            
            // Verificar se é ADMIN
            if (!['ADMIN', 'GESTOR', 'ANALISTA'].includes(data.user.role)) {
                Swal.fire({
                    title: 'Acesso Negado',
                    text: 'Você não tem permissão para acessar esta área.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/pages/main';
                });
                return;
            }

            this.userInfo = data.user;

        } catch (error) {
            console.error('[ADMIN] Erro na verificação de auth:', error);
            localStorage.removeItem('token');
            window.location.href = '/pages/login';
        }
    }

    /**
     * Carregar informações do usuário na interface
     */
    loadUserInfo() {
        if (this.userInfo) {
            document.getElementById('userRole').textContent = this.userInfo.role;
            document.getElementById('currentUser').textContent = this.userInfo.username;
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').getAttribute('data-section');
                this.loadSection(section);
            });
        });

        // Refresh button (if exists)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-refresh')) {
                this.loadSection(this.currentSection);
            }
        });
    }

    /**
     * Carregar seção específica
     */
    async loadSection(section) {
        try {
            this.showLoading(true);
            
            // Atualizar navegação ativa
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-section="${section}"]`).classList.add('active');
            
            this.currentSection = section;
            
            // Carregar conteúdo da seção
            switch (section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'usuarios':
                    await this.loadUsuarios();
                    break;
                case 'tabelas':
                    await this.loadTabelas();
                    break;
                case 'auditoria':
                    await this.loadAuditoria();
                    break;
                case 'backup':
                    await this.loadBackup();
                    break;
                case 'exportar':
                    await this.loadExportar();
                    break;
                case 'configuracoes':
                    await this.loadConfiguracoes();
                    break;
                default:
                    this.showError('Seção não encontrada');
            }

        } catch (error) {
            console.error(`[ADMIN] Erro ao carregar seção ${section}:`, error);
            this.showError(`Erro ao carregar ${section}`);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Carregar Dashboard
     */
    async loadDashboard() {
        this.updateSectionTitle('Dashboard Administrativo', 'Visão geral do sistema e métricas principais');

        try {
            // Buscar métricas do dashboard
            const response = await fetch('/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar métricas');
            }

            const data = await response.json();
            const metricas = data.data;

            // Renderizar dashboard
            document.getElementById('contentArea').innerHTML = `
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="metric-card info">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-1">${metricas.total_usuarios}</h3>
                                    <p class="mb-0">Total de Usuários</p>
                                </div>
                                <i class="bi bi-people" style="font-size: 2rem; opacity: 0.8;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="metric-card success">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-1">${metricas.usuarios_aprovados}</h3>
                                    <p class="mb-0">Usuários Aprovados</p>
                                </div>
                                <i class="bi bi-check-circle" style="font-size: 2rem; opacity: 0.8;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="metric-card warning">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-1">${metricas.usuarios_aguardando}</h3>
                                    <p class="mb-0">Aguardando Aprovação</p>
                                </div>
                                <i class="bi bi-clock" style="font-size: 2rem; opacity: 0.8;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="metric-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-1">${metricas.sessoes_ativas}</h3>
                                    <p class="mb-0">Sessões Ativas</p>
                                </div>
                                <i class="bi bi-activity" style="font-size: 2rem; opacity: 0.8;"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6 mb-4">
                        <div class="chart-container">
                            <h5 class="mb-3">Distribuição por Status</h5>
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-4">
                        <div class="chart-container">
                            <h5 class="mb-3">Distribuição por Role</h5>
                            <canvas id="roleChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <div class="table-responsive">
                            <div class="p-3">
                                <h5 class="mb-3">Últimos Usuários Cadastrados</h5>
                                <div id="recentUsers">Carregando...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Criar gráficos
            this.createStatusChart(metricas.por_status);
            this.createRoleChart(metricas.por_role);
            
            // Carregar usuários recentes
            await this.loadRecentUsers();

        } catch (error) {
            console.error('[ADMIN] Erro ao carregar dashboard:', error);
            this.showError('Erro ao carregar dashboard');
        }
    }

    /**
     * Carregar seção de usuários
     */
    async loadUsuarios() {
        this.updateSectionTitle('Gerenciamento de Usuários', 'Visualizar, editar e gerenciar usuários do sistema');

        const content = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <div class="input-group">
                        <input type="text" class="form-control" id="searchUsers" placeholder="Pesquisar usuários...">
                        <button class="btn btn-admin" type="button" onclick="adminPanel.searchUsers()">
                            <i class="bi bi-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="d-flex gap-2">
                        <select class="form-select" id="filterStatus">
                            <option value="">Todos os Status</option>
                            <option value="AGUARDANDO_APROVACAO">Aguardando</option>
                            <option value="APROVADO">Aprovado</option>
                            <option value="REJEITADO">Rejeitado</option>
                            <option value="SUSPENSO">Suspenso</option>
                        </select>
                        <select class="form-select" id="filterRole">
                            <option value="">Todas as Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="GESTOR">Gestor</option>
                            <option value="ANALISTA">Analista</option>
                            <option value="OPERADOR">Operador</option>
                            <option value="VISUALIZADOR">Visualizador</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Usuário</th>
                            <th>Nome/Razão Social</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Ativo</th>
                            <th>Criado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr>
                            <td colspan="9" class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Carregando...</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div id="usersPagination" class="d-flex justify-content-center mt-4">
                <!-- Pagination will be loaded here -->
            </div>
        `;

        document.getElementById('contentArea').innerHTML = content;
        
        // Configurar event listeners para filtros
        document.getElementById('filterStatus').addEventListener('change', () => this.loadUsersTable());
        document.getElementById('filterRole').addEventListener('change', () => this.loadUsersTable());
        document.getElementById('searchUsers').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchUsers();
            }
        });

        // Carregar tabela de usuários
        await this.loadUsersTable();
    }

    /**
     * Carregar tabela de usuários
     */
    async loadUsersTable(page = 1) {
        try {
            const searchTerm = document.getElementById('searchUsers')?.value || '';
            const filterStatus = document.getElementById('filterStatus')?.value || '';
            const filterRole = document.getElementById('filterRole')?.value || '';

            const params = new URLSearchParams({
                page: page,
                limit: 20,
                search: searchTerm,
                status: filterStatus,
                role: filterRole
            });

            const response = await fetch(`/admin/usuarios?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar usuários');
            }

            const data = await response.json();
            const usuarios = data.data.usuarios;
            const pagination = data.data.pagination;

            // Renderizar tabela
            const tbody = document.getElementById('usersTableBody');
            if (usuarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum usuário encontrado</td></tr>';
                return;
            }

            tbody.innerHTML = usuarios.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.nome_completo || 'N/A'}</td>
                    <td>${user.email_institucional}</td>
                    <td><span class="status-badge status-${user.status.toLowerCase()}">${this.formatStatus(user.status)}</span></td>
                    <td><span class="badge bg-secondary">${user.role}</span></td>
                    <td>
                        <span class="badge ${user.ativo ? 'bg-success' : 'bg-danger'}">
                            ${user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="adminPanel.viewUser(${user.id})" title="Visualizar">
                                <i class="bi bi-eye"></i>
                            </button>
                            ${this.userInfo.role === 'ADMIN' ? `
                                <button class="btn btn-outline-warning" onclick="adminPanel.editUser(${user.id})" title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            ` : ''}
                            ${this.userInfo.role === 'ADMIN' || (this.userInfo.role === 'GESTOR' && user.status === 'AGUARDANDO_APROVACAO') ? `
                                <button class="btn btn-outline-success" onclick="adminPanel.changeUserStatus(${user.id}, 'APROVADO')" title="Aprovar">
                                    <i class="bi bi-check"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="adminPanel.changeUserStatus(${user.id}, 'REJEITADO')" title="Rejeitar">
                                    <i class="bi bi-x"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            // Renderizar paginação
            this.renderPagination('usersPagination', pagination, (page) => this.loadUsersTable(page));

        } catch (error) {
            console.error('[ADMIN] Erro ao carregar usuários:', error);
            document.getElementById('usersTableBody').innerHTML = 
                '<tr><td colspan="9" class="text-center text-danger">Erro ao carregar usuários</td></tr>';
        }
    }

    /**
     * Métodos auxiliares
     */

    updateSectionTitle(title, description) {
        document.getElementById('sectionTitle').textContent = title;
        document.getElementById('sectionDescription').textContent = description;
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        Swal.fire({
            title: 'Erro',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Sucesso',
            text: message,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    formatStatus(status) {
        const statusMap = {
            'AGUARDANDO_APROVACAO': 'Aguardando',
            'APROVADO': 'Aprovado',
            'REJEITADO': 'Rejeitado',
            'SUSPENSO': 'Suspenso',
            'INATIVO': 'Inativo'
        };
        return statusMap[status] || status;
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        return fetch(url, { ...options, ...defaultOptions });
    }

    renderPagination(containerId, pagination, onPageClick) {
        const container = document.getElementById(containerId);
        if (!container || !pagination) return;

        let paginationHTML = '<nav><ul class="pagination justify-content-center">';

        // Previous button
        if (pagination.has_prev) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="event.preventDefault(); (${onPageClick})(${pagination.current_page - 1})">
                        Anterior
                    </a>
                </li>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); (${onPageClick})(${i})">${i}</a>
                </li>
            `;
        }

        // Next button
        if (pagination.has_next) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="event.preventDefault(); (${onPageClick})(${pagination.current_page + 1})">
                        Próximo
                    </a>
                </li>
            `;
        }

        paginationHTML += '</ul></nav>';
        container.innerHTML = paginationHTML;
    }

    // Placeholder methods for other sections
    async loadTabelas() { this.updateSectionTitle('Visualizar Tabelas', 'Em desenvolvimento...'); }
    async loadAuditoria() { this.updateSectionTitle('Auditoria', 'Em desenvolvimento...'); }
    async loadBackup() { this.updateSectionTitle('Backup & Restore', 'Em desenvolvimento...'); }
    async loadExportar() { this.updateSectionTitle('Exportar Dados', 'Em desenvolvimento...'); }
    async loadConfiguracoes() { this.updateSectionTitle('Configurações', 'Em desenvolvimento...'); }
    async loadRecentUsers() { document.getElementById('recentUsers').innerHTML = 'Carregando usuários recentes...'; }
    
    createStatusChart(data) { /* Chart implementation */ }
    createRoleChart(data) { /* Chart implementation */ }
    
    searchUsers() { this.loadUsersTable(1); }
    viewUser(id) { console.log('View user:', id); }
    editUser(id) { console.log('Edit user:', id); }
    changeUserStatus(id, status) { console.log('Change status:', id, status); }
}

// Global functions
function logout() {
    Swal.fire({
        title: 'Confirmar Logout',
        text: 'Deseja realmente sair do sistema?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.href = '/pages/login';
        }
    });
}

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
