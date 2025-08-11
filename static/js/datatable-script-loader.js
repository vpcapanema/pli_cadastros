/**
 * ================================================
 * DATATABLE PAGES - Script Loader Module
 * ================================================
 * Módulo para carregar scripts necessários para páginas
 * que utilizam DataTables
 */

const DataTableScriptLoader = {
  // Scripts necessários para DataTables
  REQUIRED_SCRIPTS: [
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js',
    'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js',
  ],

  // Scripts locais da aplicação
  LOCAL_SCRIPTS: [
    '/static/js/services/api.js',
    '/static/js/services/auth.js',
    '/static/js/services/utils.js',
    '/static/js/services/sessionMonitor.js',
    '/static/js/session-auto-init.js',
    '/static/js/components/form-validator.js',
    '/static/js/components/passwordToggle.js',
    '/static/js/components/notification.js',
    '/static/js/components/loading.js',
    '/static/js/components/statusBar.js',
  ],

  // Scripts já carregados
  loadedScripts: new Set(),

  /**
   * Carrega um script de forma assíncrona
   * @param {string} src - URL do script
   * @returns {Promise}
   */
  loadScript(src) {
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Falha ao carregar: ${src}`));
      };

      document.head.appendChild(script);
    });
  },

  /**
   * Carrega todos os scripts necessários para DataTables
   * @param {Array} additionalScripts - Scripts adicionais específicos da página
   * @returns {Promise}
   */
  async loadDataTableScripts(additionalScripts = []) {
    try {
      // Carrega scripts externos primeiro
      for (const script of this.REQUIRED_SCRIPTS) {
        await this.loadScript(script);
      }

      // Carrega scripts locais da aplicação
      for (const script of this.LOCAL_SCRIPTS) {
        await this.loadScript(script);
      }

      // Carrega scripts adicionais específicos da página
      for (const script of additionalScripts) {
        await this.loadScript(script);
      }

      console.log('Todos os scripts DataTable foram carregados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao carregar scripts DataTable:', error);
      return false;
    }
  },

  /**
   * Inicialização específica para página de usuários
   */
  async initUsuariosPage() {
    const pageScripts = [
      '/static/js/pages/usuarios.js',
      '/static/js/pages/usuarios-modal-enhancer.js',
    ];

    return this.loadDataTableScripts(pageScripts);
  },

  /**
   * Inicialização específica para página de pessoa física
   */
  async initPessoaFisicaPage() {
    const pageScripts = ['/static/js/pages/pessoa-fisica.js'];

    return this.loadDataTableScripts(pageScripts);
  },

  /**
   * Inicialização específica para página de pessoa jurídica
   */
  async initPessoaJuridicaPage() {
    const pageScripts = ['/static/js/pages/pessoa-juridica.js'];

    return this.loadDataTableScripts(pageScripts);
  },
};

// Exporta globalmente
window.DataTableScriptLoader = DataTableScriptLoader;
