/**
 * Sistema de Feedback Padronizado PLI
 * Implementa Modal Feedbacks (padrão) e Progress Feedback (login/cadastro)
 * @version 1.0.0
 * @author PLI Team
 */

class PLIFeedbackSystem {
    constructor() {
        this.init();
    }

    init() {
        this.createModalStructure();
        this.loadStyles();
    }

    /**
     * Cria a estrutura do modal de feedback se não existir
     */
    createModalStructure() {
        if (!document.getElementById('pli-feedback-modal')) {
            const modalHTML = `
                <div class="modal fade" id="pli-feedback-modal" tabindex="-1" aria-labelledby="pli-feedback-title" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content pli-card border-0">
                            <div class="modal-body text-center p-4">
                                <div class="feedback-icon mb-3" id="pli-feedback-icon"></div>
                                <h4 class="text-pli-dark mb-3" id="pli-feedback-title">Título</h4>
                                <p class="text-muted mb-4" id="pli-feedback-message">Mensagem</p>
                                <div id="pli-feedback-buttons">
                                    <button type="button" class="btn btn-primary btn-lg px-4" data-bs-dismiss="modal">
                                        <i class="fas fa-check me-2"></i>OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Carrega os estilos CSS necessários
     */
    loadStyles() {
        if (!document.getElementById('pli-feedback-styles')) {
            const styles = `
                <style id="pli-feedback-styles">
                    /* Modal Feedback Styles */
                    .feedback-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }
                    
                    .feedback-icon.success { color: #28a745; }
                    .feedback-icon.error { color: #dc3545; }
                    .feedback-icon.warning { color: #ffc107; }
                    .feedback-icon.info { color: #17a2b8; }
                    .feedback-icon.confirmation { color: #6c757d; }

                    /* Progress Feedback Styles */
                    .progress-feedback-container {
                        background: white;
                        border-radius: 16px;
                        padding: 2rem;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                        border: 1px solid #e9ecef;
                        margin: 2rem 0;
                    }

                    .progress-step {
                        display: flex;
                        align-items: center;
                        margin: 1.5rem 0;
                        padding: 1rem;
                        border-radius: 12px;
                        transition: all 0.3s ease;
                        border-left: 4px solid transparent;
                    }

                    .progress-step.pending {
                        background: #f8f9fa;
                        border-left-color: #dee2e6;
                    }

                    .progress-step.processing {
                        background: rgba(255, 193, 7, 0.1);
                        border-left-color: #ffc107;
                        animation: pulse 1.5s infinite;
                    }

                    .progress-step.completed {
                        background: rgba(40, 167, 69, 0.1);
                        border-left-color: #28a745;
                    }

                    .progress-step.error {
                        background: rgba(220, 53, 69, 0.1);
                        border-left-color: #dc3545;
                    }

                    .step-icon {
                        font-size: 1.5rem;
                        margin-right: 1rem;
                        width: 40px;
                        text-align: center;
                        transition: all 0.3s ease;
                    }

                    .step-content {
                        flex-grow: 1;
                    }

                    .step-title {
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                        color: var(--pli-azul-escuro, #0f203e);
                    }

                    .step-description {
                        color: #6c757d;
                        font-size: 0.9rem;
                        margin: 0;
                    }

                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                    }

                    /* Overlay para Progress */
                    .progress-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                    }

                    .progress-overlay.show {
                        opacity: 1;
                        visibility: visible;
                    }

                    .progress-content {
                        background: white;
                        border-radius: 16px;
                        padding: 2rem;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }

                    .progress-header {
                        text-align: center;
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 2px solid #e9ecef;
                    }

                    .progress-header h4 {
                        color: var(--pli-azul-escuro, #0f203e);
                        margin-bottom: 0.5rem;
                    }

                    .progress-header p {
                        color: #6c757d;
                        margin: 0;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    /**
     * Exibe modal de feedback padrão
     * @param {string} type - Tipo do feedback (success, error, warning, info, confirmation)
     * @param {string} title - Título do modal
     * @param {string} message - Mensagem do modal
     * @param {Object} options - Opções adicionais
     */
    showModal(type, title, message, options = {}) {
        const modal = document.getElementById('pli-feedback-modal');
        const icon = document.getElementById('pli-feedback-icon');
        const titleElement = document.getElementById('pli-feedback-title');
        const messageElement = document.getElementById('pli-feedback-message');
        const buttonsContainer = document.getElementById('pli-feedback-buttons');

        // Configurações por tipo
        const configs = {
            success: {
                icon: '<i class="fas fa-check-circle feedback-icon success"></i>',
                buttonClass: 'btn-success'
            },
            error: {
                icon: '<i class="fas fa-times-circle feedback-icon error"></i>',
                buttonClass: 'btn-danger'
            },
            warning: {
                icon: '<i class="fas fa-exclamation-triangle feedback-icon warning"></i>',
                buttonClass: 'btn-warning'
            },
            info: {
                icon: '<i class="fas fa-info-circle feedback-icon info"></i>',
                buttonClass: 'btn-info'
            },
            confirmation: {
                icon: '<i class="fas fa-question-circle feedback-icon confirmation"></i>',
                buttonClass: 'btn-primary'
            }
        };

        const config = configs[type] || configs.info;

        // Atualiza conteúdo
        icon.innerHTML = config.icon;
        titleElement.textContent = title;
        messageElement.textContent = message;

        // Configura botões
        if (options.buttons) {
            buttonsContainer.innerHTML = '';
            options.buttons.forEach((button, index) => {
                const btnClass = index === 0 ? config.buttonClass : 'btn-secondary';
                const btnHTML = `
                    <button type="button" class="btn ${btnClass} btn-lg px-4 me-2" 
                            onclick="${button.onclick || ''}" 
                            ${button.dismiss !== false ? 'data-bs-dismiss="modal"' : ''}>
                        ${button.icon ? `<i class="${button.icon} me-2"></i>` : ''}
                        ${button.text}
                    </button>
                `;
                buttonsContainer.insertAdjacentHTML('beforeend', btnHTML);
            });
        } else {
            buttonsContainer.innerHTML = `
                <button type="button" class="btn ${config.buttonClass} btn-lg px-4" data-bs-dismiss="modal">
                    <i class="fas fa-check me-2"></i>OK
                </button>
            `;
        }

        // Exibe modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        return bootstrapModal;
    }

    /**
     * Métodos de conveniência para diferentes tipos de feedback
     */
    success(title, message, options = {}) {
        return this.showModal('success', title, message, options);
    }

    error(title, message, options = {}) {
        return this.showModal('error', title, message, options);
    }

    warning(title, message, options = {}) {
        return this.showModal('warning', title, message, options);
    }

    info(title, message, options = {}) {
        return this.showModal('info', title, message, options);
    }

    confirm(title, message, onConfirm, onCancel = null) {
        const options = {
            buttons: [
                {
                    text: 'Confirmar',
                    icon: 'fas fa-check',
                    onclick: `(${onConfirm.toString()})(); bootstrap.Modal.getInstance(document.getElementById('pli-feedback-modal')).hide();`,
                    dismiss: false
                },
                {
                    text: 'Cancelar',
                    icon: 'fas fa-times',
                    onclick: onCancel ? `(${onCancel.toString()})()` : ''
                }
            ]
        };
        return this.showModal('confirmation', title, message, options);
    }
}

/**
 * Sistema de Progress Feedback para Login e Cadastro
 */
class PLIProgressFeedback {
    constructor() {
        this.overlay = null;
        this.currentSteps = [];
        this.currentStepIndex = 0;
    }

    /**
     * Inicia o feedback de progresso
     * @param {Array} steps - Array de objetos com { title, description }
     * @param {string} title - Título do processo
     * @param {string} subtitle - Subtítulo do processo
     */
    start(steps, title = 'Processando...', subtitle = 'Aguarde enquanto processamos sua solicitação') {
        this.currentSteps = steps;
        this.currentStepIndex = 0;
        this.createOverlay(title, subtitle);
        this.showOverlay();
    }

    /**
     * Cria o overlay de progresso
     */
    createOverlay(title, subtitle) {
        if (this.overlay) {
            this.overlay.remove();
        }

        const stepsHTML = this.currentSteps.map((step, index) => `
            <div class="progress-step pending" id="progress-step-${index}">
                <div class="step-icon">
                    <i class="fas fa-circle"></i>
                </div>
                <div class="step-content">
                    <div class="step-title">${step.title}</div>
                    <p class="step-description">${step.description}</p>
                </div>
            </div>
        `).join('');

        const overlayHTML = `
            <div class="progress-overlay" id="pli-progress-overlay">
                <div class="progress-content">
                    <div class="progress-header">
                        <h4><i class="fas fa-cog me-2"></i>${title}</h4>
                        <p>${subtitle}</p>
                    </div>
                    <div class="progress-steps">
                        ${stepsHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        this.overlay = document.getElementById('pli-progress-overlay');
    }

    /**
     * Exibe o overlay
     */
    showOverlay() {
        if (this.overlay) {
            setTimeout(() => {
                this.overlay.classList.add('show');
            }, 100);
        }
    }

    /**
     * Oculta o overlay
     */
    hideOverlay() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.remove();
                    this.overlay = null;
                }
            }, 300);
        }
    }

    /**
     * Avança para o próximo passo
     * @param {boolean} success - Se o passo foi concluído com sucesso
     * @param {string} errorMessage - Mensagem de erro (opcional)
     */
    nextStep(success = true, errorMessage = null) {
        const stepElement = document.getElementById(`progress-step-${this.currentStepIndex}`);
        
        if (stepElement) {
            stepElement.classList.remove('pending', 'processing');
            
            if (success) {
                stepElement.classList.add('completed');
                stepElement.querySelector('.step-icon i').className = 'fas fa-check-circle text-success';
            } else {
                stepElement.classList.add('error');
                stepElement.querySelector('.step-icon i').className = 'fas fa-times-circle text-danger';
                if (errorMessage) {
                    stepElement.querySelector('.step-description').textContent = errorMessage;
                }
                return; // Para no erro
            }
        }

        this.currentStepIndex++;
        
        if (this.currentStepIndex < this.currentSteps.length) {
            this.processStep(this.currentStepIndex);
        } else {
            // Todos os passos concluídos
            setTimeout(() => {
                this.hideOverlay();
            }, 1500);
        }
    }

    /**
     * Processa um passo específico
     * @param {number} stepIndex - Índice do passo
     */
    processStep(stepIndex) {
        const stepElement = document.getElementById(`progress-step-${stepIndex}`);
        if (stepElement) {
            stepElement.classList.remove('pending');
            stepElement.classList.add('processing');
            stepElement.querySelector('.step-icon i').className = 'fas fa-spinner fa-spin text-warning';
        }
    }

    /**
     * Força o erro em um passo específico
     * @param {number} stepIndex - Índice do passo
     * @param {string} errorMessage - Mensagem de erro
     */
    errorStep(stepIndex, errorMessage) {
        const stepElement = document.getElementById(`progress-step-${stepIndex}`);
        if (stepElement) {
            stepElement.classList.remove('pending', 'processing');
            stepElement.classList.add('error');
            stepElement.querySelector('.step-icon i').className = 'fas fa-times-circle text-danger';
            stepElement.querySelector('.step-description').textContent = errorMessage;
        }
    }

    /**
     * Inicia o primeiro passo
     */
    begin() {
        if (this.currentSteps.length > 0) {
            this.processStep(0);
        }
    }

    /**
     * Reinicia o progresso
     */
    reset() {
        this.currentStepIndex = 0;
        this.currentSteps.forEach((_, index) => {
            const stepElement = document.getElementById(`progress-step-${index}`);
            if (stepElement) {
                stepElement.className = 'progress-step pending';
                stepElement.querySelector('.step-icon i').className = 'fas fa-circle';
                stepElement.querySelector('.step-description').textContent = this.currentSteps[index].description;
            }
        });
    }
}

// Instância global do sistema de feedback
window.PLIFeedback = new PLIFeedbackSystem();
window.PLIProgress = new PLIProgressFeedback();

// Métodos de conveniência globais
window.showSuccess = (title, message, options) => PLIFeedback.success(title, message, options);
window.showError = (title, message, options) => PLIFeedback.error(title, message, options);
window.showWarning = (title, message, options) => PLIFeedback.warning(title, message, options);
window.showInfo = (title, message, options) => PLIFeedback.info(title, message, options);
window.showConfirm = (title, message, onConfirm, onCancel) => PLIFeedback.confirm(title, message, onConfirm, onCancel);

// Função de compatibilidade para showToast
window.showToast = (message, type = 'info', duration = 5000) => {
    const title = type === 'success' ? 'Sucesso' : 
                  type === 'error' ? 'Erro' : 
                  type === 'warning' ? 'Aviso' : 'Informação';
    
    if (type === 'success') {
        PLIFeedback.success(title, message);
    } else if (type === 'error') {
        PLIFeedback.error(title, message);
    } else if (type === 'warning') {
        PLIFeedback.warning(title, message);
    } else {
        PLIFeedback.info(title, message);
    }
};

// Compatibilidade com PLIFeedbackSystem
window.PLIFeedbackSystem = {
    showToast: window.showToast
};

// Funções específicas para login e cadastro
window.startLoginProcess = () => {
    const steps = [
        { title: 'Validando credenciais', description: 'Verificando usuário e senha...' },
        { title: 'Carregando permissões', description: 'Buscando dados do usuário...' },
        { title: 'Preparando dashboard', description: 'Configurando interface...' },
        { title: 'Finalizando login', description: 'Redirecionando...' }
    ];
    PLIProgress.start(steps, 'Realizando Login', 'Aguarde enquanto validamos suas credenciais');
    PLIProgress.begin();
};

window.startCadastroProcess = () => {
    const steps = [
        { title: 'Validando dados', description: 'Verificando informações fornecidas...' },
        { title: 'Salvando no banco', description: 'Persistindo dados no sistema...' },
        { title: 'Enviando notificações', description: 'Notificando usuários relevantes...' },
        { title: 'Finalizando cadastro', description: 'Concluindo operação...' }
    ];
    PLIProgress.start(steps, 'Processando Cadastro', 'Aguarde enquanto criamos sua conta');
    PLIProgress.begin();
};

console.log('✅ Sistema de Feedback PLI carregado com sucesso!');
