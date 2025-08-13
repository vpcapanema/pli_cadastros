/**
 * PLI DESIGN SYSTEM - FOOTER LOADER (MODULARIZADO)
 * Script para carregar footer dinamicamente do template base.html
 * Versão atualizada para apontar para o template base.html
 */

if (window.FooterLoader) {
  console.warn('FooterLoader já definido - ignorando segunda carga');
} else {
  const FooterLoader = {
    // Configurações
    config: {
      paths: {
        base: '/templates/base.html',
        altBase: '/views/templates/base.html',
        fallback: '/components/footer.html',
        altFallback: '/views/components/footer.html',
      },
      selectors: {
        container: '#footer-container',
        footer: '.l-footer',
      },
      timeout: 5000,
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
          // Garante wrapper l-footer para gradiente e estilo padronizado
          container.innerHTML = html.startsWith('<footer') ? html : `<footer class="l-footer">${html}</footer>`;
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
     * Busca o HTML do template base e extrai o footer
     */
    async fetchFooterHTML() {
      const { base, altBase, fallback, altFallback } = this.config.paths;

      try {
        // Tenta carregar do template base
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        let response = await fetch(base, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const footer = doc.querySelector(this.config.selectors.footer);

          if (footer) {
            return footer.outerHTML;
          }
        }

        // Tenta caminho alternativo (Live Server)
        response = await fetch(altBase);
        if (response.ok) {
          const htmlAlt = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlAlt, 'text/html');
          const footerAlt = doc.querySelector(this.config.selectors.footer);
          if (footerAlt) return footerAlt.outerHTML;
        }

        // Tenta fallback se os templates base falharem
        response = await fetch(fallback);
        if (response.ok) {
          return await response.text();
        }

        // Tenta fallback alternativo
        response = await fetch(altFallback);
        if (response.ok) {
          return await response.text();
        }

        throw new Error(`Falha ao carregar de ambos os paths: ${base}, ${fallback}`);
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
          <footer class="l-footer">
            <div class="pli-footer">
              <div class="pli-footer__container">
                <div class="pli-footer__content">
                  <div class="pli-footer__logo"><i class="fas fa-building me-2"></i> SIGMA/PLI</div>
                  <p class="pli-footer__text">Módulo de Gerenciamento de Cadastros</p>
                  <p class="pli-footer__copyright">© 2025 Desenvolvido e Implementado por <strong>VPC-GEOSER</strong></p>
                </div>
              </div>
            </div>
          </footer>`;
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

      copyrightElements.forEach((element) => {
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

      footerLinks.forEach((link) => {
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

      footerLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          console.log(`🔗 Link footer clicado: ${href}`);
          // Aqui pode adicionar tracking/analytics
        });
      });
    },
  };

  // Função legacy para compatibilidade
  function loadFooter() {
    return FooterLoader.loadFooter();
  }

  // Auto-inicialização quando DOM carrega
  document.addEventListener('DOMContentLoaded', () => {
    if (window.__FOOTER_LOADER_INIT) return; // evita múltipla inicialização
    window.__FOOTER_LOADER_INIT = true;
    const container = document.querySelector('#footer-container');
    if (container) {
      FooterLoader.loadFooter();
    }
  });

  // Exporta módulo
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterLoader;
  }
  window.FooterLoader = FooterLoader;
}
