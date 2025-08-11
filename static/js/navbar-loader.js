/**
 * PLI DESIGN SYSTEM - NAVBAR LOADER (MODULARIZADO)
 * Script para carregar navbars dinamicamente do template base.html
 * Versão atualizada para apontar para o template base.html
 */

const NavbarLoader = {
  // Configurações
  config: {
    paths: {
      base: '/templates/base.html',
      fallback: '/components/navbar.html',
    },
    selectors: {
      container: '#navbar-container',
      public: '#navbar-public',
      restricted: '#navbar-restricted',
    },
    timeout: 5000,
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
   * Busca o HTML do template base
   */
  async fetchNavbarHTML() {
    const { base, fallback } = this.config.paths;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Tenta carregar do template base
      let response = await fetch(base, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.text();
      }

      // Tenta fallback se o template base falhar
      response = await fetch(fallback);
      if (response.ok) {
        return await response.text();
      }

      throw new Error(`Falha ao carregar de ambos os paths: ${base}, ${fallback}`);
    } catch (error) {
      throw new Error(`Erro de rede: ${error.message}`);
    }
  },

  /**
   * Extrai a navbar do HTML do template base
   */
  extractNavbar(html, type) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Determina qual navbar extrair com base no tipo
    let selector;
    if (type === 'public' || type === 'restricted') {
      selector =
        type === 'public' ? this.config.selectors.public : this.config.selectors.restricted;
    } else {
      // Para compatibilidade com chamadas antigas que usam 'dashboard' ou 'internal'
      selector = this.config.selectors.restricted;
    }

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

    navLinks.forEach((link) => {
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
      [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
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
  },
};

// Função legacy para compatibilidade
function loadNavbar(type) {
  return NavbarLoader.loadNavbar(type);
}

// Auto-inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#navbar-container');
  if (container) {
    // Detecta tipo de navbar baseado na página ou no login
    const isLoggedIn = localStorage.getItem('pli_user_logged') === 'true';
    const navbarType =
      isLoggedIn ||
      document.body.classList.contains('page-dashboard') ||
      document.body.classList.contains('p-restricted') ||
      window.location.pathname.includes('/admin/') ||
      window.location.pathname.includes('/app/')
        ? 'restricted'
        : 'public';

    NavbarLoader.loadNavbar(navbarType);
  }
});

// Exporta módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavbarLoader;
}

/**
 * Função para detectar automaticamente o tipo de navbar
 * Versão atualizada para usar os tipos 'public' ou 'restricted'
 */
function autoLoadNavbar() {
  // Determina o tipo com base em múltiplos fatores
  const path = window.location.pathname;
  const isLoggedIn =
    localStorage.getItem('pli_user_logged') === 'true' ||
    localStorage.getItem('userToken') !== null;

  // Páginas restritas conhecidas
  const restrictedPages = [
    'dashboard.html',
    'pessoa-fisica.html',
    'pessoa-juridica.html',
    'usuarios.html',
    'sessions-manager.html',
    'solicitacoes-cadastro.html',
    'meus-dados.html',
    'configuracoes.html',
  ];

  // Verifica se está em seções restritas
  const isRestrictedPath =
    path.includes('/admin/') ||
    path.includes('/app/') ||
    restrictedPages.some((page) => path.endsWith(page));

  // Se logado ou em path restrito, usa navbar restrita
  const navbarType = isLoggedIn || isRestrictedPath ? 'restricted' : 'public';

  return loadNavbar(navbarType);
}

// Não duplicamos o carregamento automático pois já existe um listener acima
