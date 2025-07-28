/**
 * Sistema de Controle de Acesso - SIGMA-PLI
 * Auth Guard para proteção de páginas da área restrita
 */

(function() {
    'use strict';
    
    // Páginas da área restrita
    const RESTRICTED_PAGES = [
        'dashboard.html',
        'pessoa-fisica.html', 
        'pessoa-juridica.html',
        'meus-dados.html',
        'sessions-manager.html',
        'solicitacoes-cadastro.html',
        'usuarios.html'
    ];
    
    // Verificar se a página atual é restrita
    function isRestrictedPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return RESTRICTED_PAGES.some(page => currentPage === page);
    }
    
    // Verificar autenticação
    function isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        
        console.log('[AUTH-GUARD] Verificando autenticação...');
        console.log('[AUTH-GUARD] Token presente:', !!token);
        console.log('[AUTH-GUARD] User presente:', !!user);
        console.log('[AUTH-GUARD] Expiration presente:', !!tokenExpiration);
        
        if (token) console.log('[AUTH-GUARD] Token value:', token.substring(0, 20) + '...');
        if (user) console.log('[AUTH-GUARD] User data:', JSON.parse(user));
        if (tokenExpiration) console.log('[AUTH-GUARD] Token expires at:', new Date(parseInt(tokenExpiration)));
        
        if (!token || !user || !tokenExpiration) {
            console.log('[AUTH-GUARD] Dados de autenticação ausentes');
            return false;
        }
        
        // Verificar expiração
        const now = new Date().getTime();
        const expiration = parseInt(tokenExpiration);
        
        console.log('[AUTH-GUARD] Agora:', new Date(now));
        console.log('[AUTH-GUARD] Expira em:', new Date(expiration));
        console.log('[AUTH-GUARD] Token expirado?', now > expiration);
        
        if (now > expiration) {
            console.log('[AUTH-GUARD] Token expirado - limpando dados');
            clearAuthData();
            return false;
        }
        
        console.log('[AUTH-GUARD] Usuário autenticado ✅');
        return true;
    }
    
    // Limpar dados de autenticação
    function clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('sessionInfo');
        console.log('[AUTH-GUARD] Dados de autenticação limpos');
    }
    
    // Redirecionar para login
    function redirectToLogin() {
        const currentPath = window.location.pathname;
        const loginUrl = `/login.html?next=${encodeURIComponent(currentPath)}`;
        
        console.log('[AUTH-GUARD] Redirecionando para login:', loginUrl);
        window.location.href = loginUrl;
    }
    
    // Configurar evento de fechamento da página
    function setupPageUnloadHandler() {
        // Detectar fechamento da aba/navegador
        window.addEventListener('beforeunload', function() {
            console.log('[AUTH-GUARD] Página sendo fechada - mantendo sessão');
            // Não limpar dados aqui para permitir navegação entre páginas
        });
        
        // Detectar mudança de visibilidade (útil para detectar fechamento)
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                console.log('[AUTH-GUARD] Página ficou oculta');
            } else if (document.visibilityState === 'visible') {
                console.log('[AUTH-GUARD] Página ficou visível - verificando sessão');
                // Verificar se ainda está autenticado quando volta para a página
                if (isRestrictedPage() && !isAuthenticated()) {
                    redirectToLogin();
                }
            }
        });
    }
    
    // Função principal de inicialização
    function init() {
        console.log('[AUTH-GUARD] Inicializando controle de acesso...');
        
        // Verificar se é uma página restrita
        if (!isRestrictedPage()) {
            console.log('[AUTH-GUARD] Página não restrita - auth guard não aplicado');
            return;
        }
        
        console.log('[AUTH-GUARD] Página restrita detectada - aplicando proteção');
        
        // Verificar autenticação
        if (!isAuthenticated()) {
            console.log('[AUTH-GUARD] Usuário não autenticado - redirecionando');
            redirectToLogin();
            return;
        }
        
        // Configurar handlers de eventos
        setupPageUnloadHandler();
        
        console.log('[AUTH-GUARD] ✅ Proteção de página ativada');
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exportar para uso global se necessário
    window.AuthGuard = {
        isAuthenticated,
        clearAuthData,
        redirectToLogin,
        isRestrictedPage
    };
    
})();
