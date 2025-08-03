/**
 * PLI DESIGN SYSTEM - FOOTER LOADER (MODULARIZADO)
 * Script para carregar footer dinamicamente nas páginas
 */

const FooterLoader = {
    // Configurações
    config: {
        paths: {
            footer: '/components/footer.html',
            fallback: '/views/components/footer.html'
        },
        selectors: {
            container: '#footer-container'
        },
        timeout: 5000
    },

    // Cache para evitar múltiplas requisições
    cache: null,

    /**
     * Carrega footer com fallback automático
     */
    async loadFooter() {
        try {
            const container = document.querySelector(this.config.selectors.container);
            if (!container) {
                throw new Error('Container #footer-container não encontrado');
            }

            // Verifica cache
            if (this.cache) {
                container.innerHTML = this.cache;
                this.initializeFooter();
                return;
            }

            // Tenta carregar footer
            const html = await this.fetchFooterHTML();
            
            if (html) {
                container.innerHTML = html;
                this.cache = html;
                this.initializeFooter();
                console.log('✅ Footer carregado com sucesso');
            } else {
                throw new Error('Footer HTML vazio');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar footer:', error);
            this.loadFallbackFooter();
        }
    },

    /**
     * Busca HTML do footer com fallback
     */
    async fetchFooterHTML() {
        const { footer, fallback } = this.config.paths;
        
        try {
            // Tenta path principal
            let response = await fetch(footer);
            if (response.ok) {
                return await response.text();
            }
            
            // Tenta fallback
            response = await fetch(fallback);
            if (response.ok) {
                return await response.text();
            }
            
            throw new Error(`Falha ao carregar de ambos os paths: ${footer}, ${fallback}`);
        } catch (error) {
            throw new Error(`Erro de rede: ${error.message}`);
        }
    },

    /**
     * Footer fallback em caso de falha
     */
    loadFallbackFooter() {
        const container = document.querySelector(this.config.selectors.container);
        if (container) {
            container.innerHTML = `
                <footer class="pli-footer">
                    <div class="pli-footer__container">
                        <div class="pli-footer__content">
                            <p class="pli-footer__text">SIGMA-PLI | Módulo de Gerenciamento de Cadastros</p>
                            <p class="pli-footer__copyright">© 2025 Todos os direitos reservados</p>
                        </div>
                    </div>
                </footer>
            `;
            this.initializeFooter();
            console.log('⚠️ Footer fallback carregado');
        }
    },

    /**
     * Inicializa funcionalidades do footer
     */
    initializeFooter() {
        // Atualiza ano do copyright automaticamente
        this.updateCopyright();
        
        // Inicializa links externos
        this.initializeExternalLinks();
        
        // Configura eventos customizados
        this.setupCustomEvents();
    },

    /**
     * Atualiza ano do copyright
     */
    updateCopyright() {
        const currentYear = new Date().getFullYear();
        const copyrightElements = document.querySelectorAll('.pli-footer__copyright');
        
        copyrightElements.forEach(element => {
            if (element.textContent.includes('2025')) {
                element.textContent = element.textContent.replace('2025', currentYear);
            }
        });
    },

    /**
     * Configura links externos para abrir em nova aba
     */
    initializeExternalLinks() {
        const footerLinks = document.querySelectorAll('.pli-footer a[href^="http"]');
        
        footerLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    },

    /**
     * Configura eventos customizados
     */
    setupCustomEvents() {
        // Adiciona eventos de analytics se necessário
        const footerLinks = document.querySelectorAll('.pli-footer a');
        
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                console.log(`🔗 Link footer clicado: ${href}`);
                // Aqui pode adicionar tracking/analytics
            });
        });
    }
};

// Função legacy para compatibilidade
function loadFooter() {
    return FooterLoader.loadFooter();
}

// Auto-inicialização quando DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#footer-container');
    if (container) {
        FooterLoader.loadFooter();
    }
});

// Exporta módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterLoader;
}