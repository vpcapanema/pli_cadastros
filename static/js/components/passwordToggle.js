/**
 * Componente de Toggle de Senha - SIGMA-PLI
 * Funcionalidade para mostrar/ocultar senhas com ícone de olho
 */

class PasswordToggle {
    constructor() {
        this.toggles = new Map();
        this.init();
    }

    /**
     * Inicializa o componente
     */
    init() {
        // Auto-detectar campos de senha e adicionar toggle
        this.autoDetectPasswordFields();
        
        // Observer para campos adicionados dinamicamente
        this.setupMutationObserver();
        
        console.log('[PASSWORD TOGGLE] Componente inicializado');
    }

    /**
     * Auto-detecta campos de senha existentes
     */
    autoDetectPasswordFields() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            this.addToggleToField(field);
        });
    }

    /**
     * Configura observer para campos adicionados dinamicamente
     */
    setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verificar se o nó é um campo de senha
                        if (node.type === 'password') {
                            this.addToggleToField(node);
                        }
                        
                        // Verificar campos de senha dentro do nó
                        const passwordFields = node.querySelectorAll && node.querySelectorAll('input[type="password"]');
                        if (passwordFields) {
                            passwordFields.forEach(field => {
                                this.addToggleToField(field);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Adiciona toggle a um campo de senha específico
     * @param {HTMLInputElement} field - Campo de senha
     */
    addToggleToField(field) {
        // Verificar se já tem toggle
        if (this.toggles.has(field.id) || field.dataset.passwordToggle === 'added') {
            return;
        }

        // Verificar se já existe um botão manual para este campo
        const existingButton = document.querySelector(`#togglePassword, #toggle${field.id.charAt(0).toUpperCase() + field.id.slice(1)}, #toggle_${field.id}, [aria-describedby="${field.id}"]`);
        if (existingButton) {
            // Configurar o botão existente em vez de criar um novo
            this.setupExistingToggle(field, existingButton);
            return;
        }

        // Verificar se o campo está dentro de um container apropriado
        const container = field.closest('.form-floating, .input-group, .form-group, .mb-3, .password-field-container');
        if (!container) {
            console.warn('[PASSWORD TOGGLE] Campo de senha sem container apropriado:', field.id);
            return;
        }

        try {
            this.createToggleButton(field, container);
            field.dataset.passwordToggle = 'added';
            console.log('[PASSWORD TOGGLE] Toggle adicionado ao campo:', field.id);
        } catch (error) {
            console.error('[PASSWORD TOGGLE] Erro ao adicionar toggle:', error);
        }
    }

    /**
     * Configura um botão de toggle existente
     * @param {HTMLInputElement} field - Campo de senha
     * @param {HTMLButtonElement} button - Botão existente
     */
    setupExistingToggle(field, button) {
        // Configurar funcionalidade
        this.setupToggleFunctionality(field, button);

        // Registrar o toggle
        this.toggles.set(field.id, {
            field: field,
            button: button,
            isVisible: false,
            hideTimeout: null
        });

        field.dataset.passwordToggle = 'added';
        console.log('[PASSWORD TOGGLE] Toggle configurado para botão existente:', field.id);
    }

    /**
     * Cria botão de toggle para um campo
     * @param {HTMLInputElement} field - Campo de senha
     * @param {HTMLElement} container - Container do campo
     */
    createToggleButton(field, container) {
        // Gerar ID único para o botão
        const toggleId = `toggle_${field.id || 'pwd_' + Date.now()}`;
        
        // Criar botão
        const button = document.createElement('button');
        button.type = 'button';
        button.id = toggleId;
        button.className = 'btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-1 password-toggle-btn';
        button.title = 'Mostrar senha';
        button.setAttribute('aria-label', 'Mostrar senha');
        button.innerHTML = '<i class="fas fa-eye"></i>';

        // Adicionar estilos se necessário
        if (!container.classList.contains('position-relative')) {
            container.classList.add('position-relative');
        }

        // Ajustar padding do campo para acomodar o botão
        if (!field.classList.contains('pe-5')) {
            field.style.paddingRight = '3rem';
        }

        // Adicionar botão ao container
        container.appendChild(button);

        // Configurar funcionalidade
        this.setupToggleFunctionality(field, button);

        // Registrar o toggle
        this.toggles.set(field.id, {
            field: field,
            button: button,
            isVisible: false,
            hideTimeout: null
        });
    }

    /**
     * Configura a funcionalidade do toggle
     * @param {HTMLInputElement} field - Campo de senha
     * @param {HTMLButtonElement} button - Botão de toggle
     */
    setupToggleFunctionality(field, button) {
        const icon = button.querySelector('i');
        let hideTimeout;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isPassword = field.type === 'password';
            
            // Alternar tipo do campo
            field.type = isPassword ? 'text' : 'password';
            
            // Alternar ícone
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            
            // Alternar tooltip
            const newTitle = isPassword ? 'Ocultar senha' : 'Mostrar senha';
            button.title = newTitle;
            button.setAttribute('aria-label', newTitle);
            
            // Manter foco no campo
            field.focus();

            // Auto-ocultar após 5 segundos quando visível
            if (field.type === 'text') {
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    if (field.type === 'text') {
                        this.hidePassword(field, button, icon);
                    }
                }, 5000);
            } else {
                clearTimeout(hideTimeout);
            }

            // Atualizar registro
            const toggle = this.toggles.get(field.id);
            if (toggle) {
                toggle.isVisible = field.type === 'text';
                toggle.hideTimeout = hideTimeout;
            }
        });

        // Ocultar senha ao perder foco (opcional)
        field.addEventListener('blur', () => {
            setTimeout(() => {
                if (field.type === 'text' && !button.matches(':hover, :focus')) {
                    this.hidePassword(field, button, icon);
                }
            }, 200);
        });
    }

    /**
     * Oculta a senha
     * @param {HTMLInputElement} field - Campo de senha
     * @param {HTMLButtonElement} button - Botão de toggle
     * @param {HTMLElement} icon - Ícone do botão
     */
    hidePassword(field, button, icon) {
        field.type = 'password';
        icon.className = 'fas fa-eye';
        button.title = 'Mostrar senha';
        button.setAttribute('aria-label', 'Mostrar senha');

        const toggle = this.toggles.get(field.id);
        if (toggle) {
            toggle.isVisible = false;
            if (toggle.hideTimeout) {
                clearTimeout(toggle.hideTimeout);
                toggle.hideTimeout = null;
            }
        }
    }

    /**
     * Remove toggle de um campo
     * @param {string} fieldId - ID do campo
     */
    removeToggle(fieldId) {
        const toggle = this.toggles.get(fieldId);
        if (toggle) {
            if (toggle.hideTimeout) {
                clearTimeout(toggle.hideTimeout);
            }
            if (toggle.button && toggle.button.parentNode) {
                toggle.button.parentNode.removeChild(toggle.button);
            }
            this.toggles.delete(fieldId);
        }
    }

    /**
     * Oculta todas as senhas visíveis
     */
    hideAllPasswords() {
        this.toggles.forEach((toggle, fieldId) => {
            if (toggle.isVisible) {
                this.hidePassword(toggle.field, toggle.button, toggle.button.querySelector('i'));
            }
        });
    }

    /**
     * Adiciona CSS necessário se não existir
     */
    static addRequiredCSS() {
        if (document.querySelector('#password-toggle-styles')) return;

        const style = document.createElement('style');
        style.id = 'password-toggle-styles';
        style.textContent = `
            .password-toggle-btn {
                z-index: 10 !important;
                border: none !important;
                background: none !important;
                color: #6c757d !important;
                transition: color 0.2s ease;
            }
            
            .password-toggle-btn:hover {
                color: var(--pli-azul-escuro, #003366) !important;
            }
            
            .password-toggle-btn:focus {
                outline: none;
                box-shadow: none;
            }
            
            .password-field-container {
                position: relative;
            }
            
            .password-field-container .form-control {
                padding-right: 3rem;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Destrói o componente
     */
    destroy() {
        this.toggles.forEach((toggle, fieldId) => {
            this.removeToggle(fieldId);
        });
        this.toggles.clear();
    }
}

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar CSS necessário
    PasswordToggle.addRequiredCSS();
    
    // Inicializar componente
    window.passwordToggle = new PasswordToggle();
});

// Exportar para uso global
window.PasswordToggle = PasswordToggle;
