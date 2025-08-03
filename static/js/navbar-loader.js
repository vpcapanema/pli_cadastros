/**
 * PLI DESIGN SYSTEM - NAVBAR LOADER (MODULARIZADO)
 * Script para carregar navbars dinamicamente nas páginas
 */

const NavbarLoader = {
    // Configurações
    config: {
        paths: {
            navbar: '/components/navbar.html',
            fallback: '/views/components/navbar.html'
        },
        selectors: {
            container: '#navbar-container',
            public: '#navbar-public',
            dashboard: '#navbar-dashboard', 
            internal: '#navbar-internal'
        },
        timeout: 5000
    },

    // Cache para evitar múltiplas requisições
    cache: new Map(),

    /**
     * Carrega navbar com fallback automático
     */
    async loadNavbar(type = 'public') {
        try {
            const container = document.querySelector(this.config.selectors.container);
            if (!container) {
                throw new Error('Container #navbar-container não encontrado');
            }

            // Verifica cache
            const cacheKey = `navbar-${type}`;
            if (this.cache.has(cacheKey)) {
                container.innerHTML = this.cache.get(cacheKey);
                this.initializeNavbar();
                return;
            }

            // Tenta carregar navbar
            const html = await this.fetchNavbarHTML();
            const navbar = this.extractNavbar(html, type);
            
            if (navbar) {
                container.innerHTML = navbar;
                this.cache.set(cacheKey, navbar);
                this.initializeNavbar();
                console.log(`✅ Navbar '${type}' carregado com sucesso`);
            } else {
                throw new Error(`Navbar tipo '${type}' não encontrado`);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar navbar:', error);
            this.loadFallbackNavbar();
        }
    },

    /**
     * Busca HTML do navbar com fallback
     */
    async fetchNavbarHTML() {
        const { navbar, fallback } = this.config.paths;
        
        try {
            // Tenta path principal
            let response = await fetch(navbar);
            if (response.ok) {
                return await response.text();
            }
            
            // Tenta fallback
            response = await fetch(fallback);
            if (response.ok) {
                return await response.text();
            }
            
            throw new Error(`Falha ao carregar de ambos os paths: ${navbar}, ${fallback}`);
        } catch (error) {
            throw new Error(`Erro de rede: ${error.message}`);
        }
    },

    /**
     * Extrai navbar específico do HTML
     */
    extractNavbar(html, type) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const selectorMap = {
            'public': this.config.selectors.public,
            'dashboard': this.config.selectors.dashboard,
            'internal': this.config.selectors.internal
        };
        
        const selector = selectorMap[type] || selectorMap.public;
        const navbar = doc.querySelector(selector);
        
        return navbar ? navbar.outerHTML : null;
    },

    /**
     * Navbar fallback em caso de falha
     */
    loadFallbackNavbar() {
        const container = document.querySelector(this.config.selectors.container);
        if (container) {
            container.innerHTML = `
                <nav class="navbar navbar-expand-lg pli-navbar" id="navbar-fallback">
                    <div class="container">
                        <a class="navbar-brand" href="/index.html">
                            <i class="fas fa-building"></i> SIGMA-PLI
                        </a>
                        <div class="navbar-nav ms-auto">
                            <a class="nav-link" href="/login.html">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </a>
                        </div>
                    </div>
                </nav>
            `;
            this.initializeNavbar();
            console.log('⚠️ Navbar fallback carregado');
        }
    },

    /**
     * Inicializa funcionalidades do navbar
     */
    initializeNavbar() {
        // Marca página atual como ativa
        this.setActiveNavItem();
        
        // Inicializa tooltips se necessário
        this.initializeTooltips();
        
        // Configura eventos customizados
        this.setupCustomEvents();
    },

    /**
     * Marca item de navegação ativo
     */
    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Inicializa tooltips do Bootstrap
     */
    initializeTooltips() {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }
    },

    /**
     * Configura eventos customizados
     */
    setupCustomEvents() {
        // Evento para toggle mobile
        const toggleButton = document.querySelector('.navbar-toggler');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                console.log('🔄 Mobile menu toggle');
            });
        }
    }
};

// Função legacy para compatibilidade
function loadNavbar(type) {
    return NavbarLoader.loadNavbar(type);
}

// Auto-inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#navbar-container');
    if (container) {
        // Detecta tipo de navbar baseado na página
        const pageType = document.body.classList.contains('page-dashboard') ? 'dashboard' : 'public';
        NavbarLoader.loadNavbar(pageType);
    }
});

// Exporta módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarLoader;
}

// Função para detectar automaticamente o tipo de navbar
function autoLoadNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
        // Usuário não logado
        return loadNavbar('public');
    } else {
        // Usuário logado
        if (currentPage === 'dashboard.html') {
            return loadNavbar('dashboard');
        } else {
            return loadNavbar('internal');
        }
    }
}

// Carregar navbar automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    autoLoadNavbar().then(() => {
        console.log('Navbar carregada com sucesso');
    }).catch(error => {
        console.error('Erro ao carregar navbar:', error);
    });
});
