/**
 * Security Configuration - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Configurações de segurança centralizadas conforme boas práticas OWASP
 */

const SecurityConfig = {
    /**
     * Whitelist de URLs permitidas para redirecionamento
     * Implementa controles contra Open Redirect (OWASP-WSTG-CLNT-04)
     */
    ALLOWED_REDIRECT_URLS: [
        '/dashboard.html',
        '/pessoa-fisica.html',
        '/pessoa-juridica.html',
        '/usuarios.html',
        '/solicitacoes-cadastro.html',
        '/meus-dados.html',
        '/recursos.html'
    ],
    
    /**
     * Configurações de autenticação
     */
    AUTH: {
        TOKEN_EXPIRY_HOURS: 24,
        MIN_PASSWORD_LENGTH: 8,
        MAX_LOGIN_ATTEMPTS: 3,
        LOCKOUT_DURATION_MINUTES: 15
    },
    
    /**
     * Validadores de segurança
     */
    validators: {
        /**
         * Valida se uma URL de redirecionamento é segura
         * @param {string} url - URL para validar
         * @returns {boolean} - True se válida, false caso contrário
         */
        isValidRedirectUrl(url) {
            if (!url) return false;
            
            try {
                // Aceita apenas URLs relativas que iniciam com /
                if (!url.startsWith('/')) {
                    console.log('[SECURITY] URL rejeitada - não é relativa:', url);
                    return false;
                }
                
                // Verifica se está na whitelist
                const isAllowed = SecurityConfig.ALLOWED_REDIRECT_URLS.includes(url);
                
                if (!isAllowed) {
                    console.log('[SECURITY] URL rejeitada - não está na whitelist:', url);
                }
                
                return isAllowed;
            } catch (error) {
                console.error('[SECURITY] Erro ao validar URL:', error);
                return false;
            }
        },
        
        /**
         * Valida força da senha
         * @param {string} password - Senha para validar
         * @returns {object} - Resultado da validação
         */
        validatePasswordStrength(password) {
            const result = {
                isValid: true,
                errors: []
            };
            
            if (password.length < SecurityConfig.AUTH.MIN_PASSWORD_LENGTH) {
                result.errors.push(`Senha deve ter pelo menos ${SecurityConfig.AUTH.MIN_PASSWORD_LENGTH} caracteres`);
                result.isValid = false;
            }
            
            if (!/[A-Z]/.test(password)) {
                result.errors.push('Senha deve conter pelo menos uma letra maiúscula');
                result.isValid = false;
            }
            
            if (!/[a-z]/.test(password)) {
                result.errors.push('Senha deve conter pelo menos uma letra minúscula');
                result.isValid = false;
            }
            
            if (!/\d/.test(password)) {
                result.errors.push('Senha deve conter pelo menos um número');
                result.isValid = false;
            }
            
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                result.errors.push('Senha deve conter pelo menos um caractere especial');
                result.isValid = false;
            }
            
            return result;
        },
        
        /**
         * Valida formato de email
         * @param {string} email - Email para validar
         * @returns {boolean} - True se válido
         */
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        /**
         * Valida formato de username
         * @param {string} username - Username para validar
         * @returns {boolean} - True se válido
         */
        isValidUsername(username) {
            // Username: apenas letras, números, pontos, hífens e sublinhados
            // Mínimo 3 caracteres, máximo 50
            const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
            return usernameRegex.test(username);
        },
        
        /**
         * Valida se um valor é email ou username válido
         * @param {string} value - Valor para validar
         * @returns {boolean} - True se válido
         */
        isValidEmailOrUsername(value) {
            if (!value || !value.trim()) return false;
            
            // Se contém @ - valida como email
            if (value.includes('@')) {
                return this.isValidEmail(value);
            }
            
            // Se não contém @ - valida como username
            return this.isValidUsername(value);
        }
    },
    
    /**
     * Headers de segurança recomendados
     */
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
};

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.SecurityConfig = SecurityConfig;
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityConfig;
}
