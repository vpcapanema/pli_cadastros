/**
 * Auth Service - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Serviço para autenticação e controle de sessão
 */

const Auth = {
    /**
     * Inicia sessão a partir do login da API (usado no login.js)
     * @param {string} token
     * @param {object} user
     */
    loginFromApi(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Define a expiração do token (24 horas)
        const expiration = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiration', expiration);
        // Registra o último login
        localStorage.setItem('lastLogin', new Date().toISOString());
    },
    /**
     * Força logout ao fechar ou recarregar páginas restritas
     * Deve ser chamado no início de cada página restrita
     */
    enableAutoLogoutOnClose() {
        // Evita múltiplos binds
        if (window.__pliAutoLogoutBound) return;
        window.__pliAutoLogoutBound = true;
        window.addEventListener('beforeunload', () => {
            // Só faz logout se estiver autenticado
            if (Auth.isAuthenticated()) {
                Auth.logout(false); // Não redireciona
            }
        });
    },
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - True se autenticado, false caso contrário
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('tokenExpiration');
        const now = new Date().getTime();
        let status = 'NÃO AUTENTICADO';
        if (!token || !expiration) {
            console.log('[SESSION LOG] isAuthenticated: NÃO AUTENTICADO (token ou expiração ausente)');
            return false;
        }
        if (now > parseInt(expiration)) {
            console.log('[SESSION LOG] isAuthenticated: NÃO AUTENTICADO (token expirado)');
            this.logout();
            return false;
        }
        status = 'AUTENTICADO';
        console.log(`[SESSION LOG] isAuthenticated: ${status}`);
        return true;
    },
    
    /**
     * Realiza o login do usuário
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise} - Promise com o resultado do login
     */
    async login(email, password) {
        try {
            const response = await API.post('/auth/login', { email, password });
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Define a expiração do token (24 horas)
                const expiration = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('tokenExpiration', expiration);
                
                // Registra o último login
                localStorage.setItem('lastLogin', new Date().toISOString());
                
                return response;
            } else {
                throw new Error('Token não recebido');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },
    
    /**
     * Realiza o logout do usuário
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        // Permite opção de não redirecionar (ex: ao fechar aba)
        if (arguments.length === 0 || arguments[0] === true) {
            window.location.href = '/login.html';
        }
    },
    
    /**
     * Obtém os dados do usuário logado
     * @returns {Object|null} - Dados do usuário ou null se não estiver logado
     */
    getUser() {
        if (!this.isAuthenticated()) {
            console.log('[SESSION LOG] getUser: Usuário não autenticado');
            return null;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.log('[SESSION LOG] getUser: Dados do usuário não encontrados');
            return null;
        }
        const user = JSON.parse(userStr);
        console.log('[SESSION LOG] getUser:', user);
        return user;
    },
    
    /**
     * Obtém o token de autenticação
     * @returns {string|null} - Token ou null se não estiver logado
     */
    getToken() {
        return localStorage.getItem('token');
    },
    
    /**
     * Obtém a data do último login
     * @returns {string|null} - Data do último login ou null se não houver
     */
    getLastLogin() {
        return localStorage.getItem('lastLogin');
    },
    
    /**
     * Verifica se o usuário tem uma determinada permissão
     * @param {string} permission - Permissão a ser verificada
     * @returns {boolean} - True se tem permissão, false caso contrário
     */
    hasPermission(permission) {
        const user = this.getUser();
        
        if (!user || !user.permissions) {
            return false;
        }
        
        return user.permissions.includes(permission);
    },
    
    /**
     * Altera a senha do usuário
     * @param {string} currentPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise} - Promise com o resultado da alteração
     */
    async changePassword(currentPassword, newPassword) {
        try {
            return await API.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            throw error;
        }
    }
};