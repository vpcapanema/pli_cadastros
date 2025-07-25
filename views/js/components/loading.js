/**
 * Loading Component - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Componente para exibição de indicadores de carregamento
 */

const Loading = {
    /**
     * Exibe um indicador de carregamento na tela inteira
     * @param {string} message - Mensagem a ser exibida
     */
    show(message = 'Carregando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },
    
    /**
     * Oculta o indicador de carregamento
     */
    hide() {
        Swal.close();
    },
    
    /**
     * Exibe um indicador de carregamento em um elemento específico
     * @param {string|HTMLElement} element - Elemento ou seletor onde o indicador será exibido
     * @param {Object} options - Opções adicionais
     */
    showInElement(element, options = {}) {
        const targetElement = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
            
        if (!targetElement) {
            console.error('Elemento não encontrado:', element);
            return;
        }
        
        // Salva o conteúdo original
        targetElement.dataset.originalContent = targetElement.innerHTML;
        
        // Configurações padrão
        const settings = {
            size: options.size || 'md',
            color: options.color || 'primary',
            message: options.message || '',
            spinnerOnly: options.spinnerOnly || false
        };
        
        // Define as classes do spinner
        const spinnerClasses = `spinner-border text-${settings.color}`;
        const spinnerSize = settings.size === 'sm' ? 'spinner-border-sm' : '';
        
        // Cria o HTML do spinner
        let spinnerHtml = `
            <div class="${spinnerClasses} ${spinnerSize}" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        `;
        
        // Adiciona a mensagem se necessário
        if (!settings.spinnerOnly && settings.message) {
            spinnerHtml += `<span class="ms-2">${settings.message}</span>`;
        }
        
        // Insere o spinner no elemento
        targetElement.innerHTML = spinnerHtml;
        
        // Adiciona classe para indicar que está carregando
        targetElement.classList.add('is-loading');
        
        // Desabilita o elemento se for um botão ou input
        if (targetElement.tagName === 'BUTTON' || targetElement.tagName === 'INPUT') {
            targetElement.disabled = true;
        }
    },
    
    /**
     * Restaura o conteúdo original de um elemento após o carregamento
     * @param {string|HTMLElement} element - Elemento ou seletor a ser restaurado
     */
    hideInElement(element) {
        const targetElement = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
            
        if (!targetElement) {
            console.error('Elemento não encontrado:', element);
            return;
        }
        
        // Restaura o conteúdo original
        if (targetElement.dataset.originalContent) {
            targetElement.innerHTML = targetElement.dataset.originalContent;
            delete targetElement.dataset.originalContent;
        }
        
        // Remove a classe de carregamento
        targetElement.classList.remove('is-loading');
        
        // Habilita o elemento se for um botão ou input
        if (targetElement.tagName === 'BUTTON' || targetElement.tagName === 'INPUT') {
            targetElement.disabled = false;
        }
    }
};