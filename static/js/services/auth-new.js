/**
 * Auth Service - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Serviço para autenticação e controle de sessão - VERSÃO RECONFIGURADA
 */

const Auth = {
    /**
     * Realiza login via API e configura sessão
     * @param {string} token - Token JWT
     * @param {object} user - Dados do usuário
     */
    loginFromApi(token, user) {
        console.log('[AUTH] Configurando sessão após login bem-sucedido...');
        
        // Armazenar dados de autenticação
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Definir expiração do token (24 horas)
        const expiration = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiration', expiration);
        
        // Registrar metadados da sessão
        localStorage.setItem('lastLogin', new Date().toISOString());
        localStorage.setItem('sessionActive', 'true');
        
        console.log('[AUTH] ✅ Sessão configurada - usuário autenticado');
        
        // Disparar evento de login
        window.dispatchEvent(new CustomEvent('user-login', { 
            detail: { user, token } 
        }));
    },

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - True se autenticado, false caso contrário
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('tokenExpiration');
        const sessionActive = localStorage.getItem('sessionActive');
        const now = new Date().getTime();
        
        // Verificações básicas
        if (!token || !expiration || sessionActive !== 'true') {
            console.log('[AUTH] Não autenticado: dados ausentes ou sessão inativa');
            return false;
        }
        
        // Verificar expiração
        if (now > parseInt(expiration)) {
            console.log('[AUTH] Token expirado - limpando sessão');
            this.logout();
            return false;
        }
        
        console.log('[AUTH] Usuário autenticado ✅');
        return true;
    },

    /**
     * Realiza logout e limpa dados de sessão
     * @param {boolean} redirect - Se deve redirecionar para login (padrão: true)
     */
    logout(redirect = true) {
        console.log('[AUTH] Realizando logout...');
        
        // Limpar dados de autenticação
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('sessionInfo');
        localStorage.removeItem('lastLogin');
        
        console.log('[AUTH] ✅ Dados de sessão limpos');
        
        // Disparar evento de logout
        window.dispatchEvent(new CustomEvent('user-logout'));
        
        // Redirecionar para login se solicitado
        if (redirect) {
            window.location.href = '/login.html';
        }
    },

    /**
     * Obtém dados do usuário logado
     * @returns {object|null} - Dados do usuário ou null se não autenticado
     */
    getUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        try {
            const userString = localStorage.getItem('user');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('[AUTH] Erro ao obter dados do usuário:', error);
            return null;
        }
    },

    /**
     * Obtém token de autenticação
     * @returns {string|null} - Token ou null se não autenticado
     */
    getToken() {
        return this.isAuthenticated() ? localStorage.getItem('token') : null;
    },

    /**
     * Obtém data do último login
     * @returns {string|null} - Data ISO do último login
     */
    getLastLogin() {
        return localStorage.getItem('lastLogin');
    },

    /**
     * Verifica se usuário tem permissão específica
     * @param {string} permission - Permissão a verificar
     * @returns {boolean} - True se tem permissão
     */
    hasPermission(permission) {
        const user = this.getUser();
        if (!user) return false;
        
        // Implementar lógica de permissões baseada no tipo_usuario
        const userType = user.tipo_usuario;
        const permissionMap = {
            'ADMIN': ['*'], // Admin tem todas as permissões
            'GESTOR': ['read', 'write', 'delete'],
            'ANALISTA': ['read', 'write'],
            'OPERADOR': ['read', 'write'],
            'VISUALIZADOR': ['read']
        };
        
        const userPermissions = permissionMap[userType] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    },

    /**
     * Altera senha do usuário
     * @param {string} currentPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<object>} - Resultado da operação
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await API.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            return response;
        } catch (error) {
            console.error('[AUTH] Erro ao alterar senha:', error);
            throw error;
        }
    },

    /**
     * Atualiza timestamp da última atividade
     */
    updateLastActivity() {
        if (this.isAuthenticated()) {
            localStorage.setItem('lastActivity', new Date().toISOString());
        }
    },

    /**
     * Verifica se sessão está próxima de expirar
     * @param {number} minutesBeforeExpiry - Minutos antes da expiração (padrão: 5)
     * @returns {boolean} - True se próxima de expirar
     */
    isSessionNearExpiry(minutesBeforeExpiry = 5) {
        const expiration = localStorage.getItem('tokenExpiration');
        if (!expiration) return true;
        
        const now = new Date().getTime();
        const expirationTime = parseInt(expiration);
        const timeToExpiry = expirationTime - now;
        const minutesToExpiry = timeToExpiry / (60 * 1000);
        
        return minutesToExpiry <= minutesBeforeExpiry;
    }
};

// Exportar para uso global
window.Auth = Auth;
