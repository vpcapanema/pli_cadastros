/**
 * Auto-inicializador do Monitor de Sessão - SIGMA-PLI
 * Carrega automaticamente o monitor de sessão em páginas autenticadas
 */

(function() {
    'use strict';
    
    // Lista de páginas que devem ter o monitor de sessão
    const RESTRICTED_PAGES = [
        'dashboard.html',
        'usuarios.html',
        'pessoa-fisica.html',
        'pessoa-juridica.html',
        'meus-dados.html',
        'recursos.html',
        'solicitacoes-cadastro.html',
        'todas-rotas.html'
    ];
    
    // Verifica se a página atual deve ter o monitor
    function shouldInitSessionMonitor() {
        const currentPage = window.location.pathname.split('/').pop();
        console.log('[SESSION AUTO-INIT] Página atual:', currentPage);
        
        const shouldInit = RESTRICTED_PAGES.some(page => currentPage.includes(page)) || 
               currentPage === '' || 
               currentPage === 'index.html' ||
               window.location.pathname.includes('/dashboard');
               
        console.log('[SESSION AUTO-INIT] Deve iniciar monitor?', shouldInit);
        return shouldInit;
    }
    
    // Inicializa o monitor quando a página estiver pronta
    function initSessionMonitor() {
        console.log('[SESSION AUTO-INIT] Tentando inicializar monitor...');
        
        // Aguardar carregamento completo da página e dependências
        if (typeof Auth === 'undefined' || typeof API === 'undefined') {
            console.log('[SESSION AUTO-INIT] Aguardando Auth/API... Retry em 100ms');
            setTimeout(initSessionMonitor, 100);
            return;
        }
        
        // Verificar se usuário está autenticado
        if (!Auth.isAuthenticated()) {
            console.log('[SESSION AUTO-INIT] Usuário não autenticado - monitor não iniciado');
            return;
        }
        
        // Verificar se é uma página restrita
        if (!shouldInitSessionMonitor()) {
            console.log('[SESSION AUTO-INIT] Página não requer monitor de sessão');
            return;
        }
        
        // Aguardar carregamento do SessionMonitor
        if (typeof SessionMonitor === 'undefined') {
            console.log('[SESSION AUTO-INIT] Aguardando SessionMonitor... Retry em 100ms');
            setTimeout(initSessionMonitor, 100);
            return;
        }
        
        // Criar instância global se não existir
        if (typeof sessionMonitor === 'undefined') {
            console.log('[SESSION AUTO-INIT] Criando instância do SessionMonitor...');
            window.sessionMonitor = new SessionMonitor();
        }
        
        // Inicializar o monitor - DESABILITADO (usando apenas statusBar.js)
        console.log('[SESSION AUTO-INIT] SessionMonitor desabilitado - usando statusBar.js');
        /*
        sessionMonitor.init().then(() => {
            console.log('[SESSION AUTO-INIT] ✅ Monitor de sessão iniciado automaticamente');
        }).catch(error => {
            console.warn('[SESSION AUTO-INIT] ❌ Erro ao iniciar monitor:', error);
        });
        */
    }
    
    // Iniciar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSessionMonitor);
    } else {
        // DOM já está pronto
        setTimeout(initSessionMonitor, 100);
    }
    
    // Também iniciar quando a página estiver completamente carregada
    if (document.readyState !== 'complete') {
        window.addEventListener('load', initSessionMonitor);
    }
    
})();
