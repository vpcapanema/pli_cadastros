/**
 * ================================================
 * PLI CORE SCRIPTS LOADER
 * ================================================
 * Módulo centralizado para carregar scripts comuns
 * Evita duplicação de Bootstrap e outros recursos
 */

const PLIScriptLoader = {
    // URLs dos scripts externos
    EXTERNAL_SCRIPTS: {
        bootstrap: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
        fontawesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        datatables: 'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js',
        datatablesBootstrap: 'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js'
    },

    // Scripts já carregados
    loadedScripts: new Set(),

    /**
     * Carrega um script externo de forma assíncrona
     * @param {string} scriptName - Nome do script (da lista EXTERNAL_SCRIPTS)
     * @param {string} customUrl - URL customizada (opcional)
     * @returns {Promise}
     */
    async loadScript(scriptName, customUrl = null) {
        const url = customUrl || this.EXTERNAL_SCRIPTS[scriptName];
        
        if (!url) {
            console.warn(`Script '${scriptName}' não encontrado na lista de scripts externos`);
            return Promise.reject(`Script não encontrado: ${scriptName}`);
        }

        // Verifica se já foi carregado
        if (this.loadedScripts.has(url)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = () => {
                this.loadedScripts.add(url);
                console.log(`Script carregado: ${scriptName}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`Erro ao carregar script: ${scriptName} - ${url}`);
                reject(new Error(`Falha ao carregar: ${scriptName}`));
            };
            
            document.head.appendChild(script);
        });
    },

    /**
     * Carrega múltiplos scripts em paralelo
     * @param {Array} scriptNames - Array com nomes dos scripts
     * @returns {Promise}
     */
    async loadMultipleScripts(scriptNames) {
        const promises = scriptNames.map(scriptName => this.loadScript(scriptName));
        return Promise.all(promises);
    },

    /**
     * Carrega Bootstrap se ainda não foi carregado
     * @returns {Promise}
     */
    async ensureBootstrap() {
        return this.loadScript('bootstrap');
    },

    /**
     * Carrega DataTables com Bootstrap
     * @returns {Promise}
     */
    async loadDataTables() {
        // jQuery já deve estar disponível via Bootstrap
        await this.loadScript('datatables');
        await this.loadScript('datatablesBootstrap');
    }
};

// Exporta globalmente para uso em outras páginas
window.PLIScriptLoader = PLIScriptLoader;
