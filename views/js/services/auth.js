/**
 * Auth Service - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Serviço para autenticação e controle de sessão
 */

const Auth = {
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - True se autenticado, false caso contrário
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('tokenExpiration');
        
        if (!token || !expiration) {
            return false;
        }
        
        // Verifica se o token expirou
        if (new Date().getTime() > parseInt(expiration)) {
            this.logout();
            return false;
        }
        
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
        
        // Redireciona para a página de login
        window.location.href = '/login.html';
    },
    
    /**
     * Obtém os dados do usuário logado
     * @returns {Object|null} - Dados do usuário ou null se não estiver logado
     */
    getUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
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