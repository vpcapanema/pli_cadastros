/**
 * Form Validator - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Componente para validação de formulários
 */

class FormValidator {
    /**
     * Inicializa o validador de formulários
     * @param {string|HTMLFormElement} formSelector - Seletor CSS ou elemento do formulário
     * @param {Object} options - Opções de configuração
     */
    constructor(formSelector, options = {}) {
        // Configurações padrão
        this.options = {
            validateOnInput: true,
            validateOnBlur: true,
            validateOnSubmit: true,
            showValidFeedback: false,
            ...options
        };
        
        // Obtém o formulário
        this.form = typeof formSelector === 'string' 
            ? document.querySelector(formSelector) 
            : formSelector;
            
        if (!this.form) {
            console.error('Formulário não encontrado:', formSelector);
            return;
        }
        
        // Inicializa os eventos
        this.initEvents();
    }
    
    /**
     * Inicializa os eventos do formulário
     */
    initEvents() {
        // Validação no envio do formulário
        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
        
        // Validação nos campos durante digitação
        if (this.options.validateOnInput) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('input', () => {
                    this.validateField(field);
                });
            });
        }
        
        // Validação nos campos ao perder o foco
        if (this.options.validateOnBlur) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('blur', () => {
                    this.validateField(field);
                });
            });
        }
    }
    
    /**
     * Valida o formulário completo
     * @returns {boolean} - True se válido, false caso contrário
     */
    validateForm() {
        let isValid = true;
        
        // Valida todos os campos
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Valida um campo específico
     * @param {HTMLElement} field - Campo a ser validado
     * @returns {boolean} - True se válido, false caso contrário
     */
    validateField(field) {
        // Ignora campos desabilitados ou ocultos
        if (field.disabled || field.type === 'hidden') {
            return true;
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Validação de campo obrigatório
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }
        
        // Validação de email
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Email inválido';
            }
        }
        
        // Validação de CPF
        if (field.dataset.validation === 'cpf' && field.value.trim()) {
            if (!Utils.validarCPF(field.value)) {
                isValid = false;
                errorMessage = 'CPF inválido';
            }
        }
        
        // Validação de CNPJ
        if (field.dataset.validation === 'cnpj' && field.value.trim()) {
            if (!Utils.validarCNPJ(field.value)) {
                isValid = false;
                errorMessage = 'CNPJ inválido';
            }
        }
        
        // Validação de força de senha
        if (field.dataset.validation === 'password-strength' && field.value.trim()) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'A senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial';
            }
        }
        
        // Validação de confirmação de senha
        if (field.dataset.validation === 'confirm-password') {
            const passwordField = this.form.querySelector('[data-validation="password-strength"]');
            if (passwordField && field.value !== passwordField.value) {
                isValid = false;
                errorMessage = 'As senhas não coincidem';
            }
        }
        
        // Validação de tamanho mínimo
        if (field.minLength && field.value.length < field.minLength && field.value.trim()) {
            isValid = false;
            errorMessage = `Mínimo de ${field.minLength} caracteres`;
        }
        
        // Validação de tamanho máximo
        if (field.maxLength && field.value.length > field.maxLength) {
            isValid = false;
            errorMessage = `Máximo de ${field.maxLength} caracteres`;
        }
        
        // Exibe ou oculta mensagens de erro
        this.updateFieldStatus(field, isValid, errorMessage);
        
        return isValid;
    }
    
    /**
     * Atualiza o status visual do campo
     * @param {HTMLElement} field - Campo a ser atualizado
     * @param {boolean} isValid - Se o campo é válido
     * @param {string} errorMessage - Mensagem de erro
     */
    updateFieldStatus(field, isValid, errorMessage) {
        // Remove classes existentes
        field.classList.remove('is-valid', 'is-invalid');
        
        // Adiciona a classe apropriada
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // Busca o elemento de feedback
        const feedbackElement = field.nextElementSibling;
        
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = errorMessage;
        }
        
        // Exibe feedback positivo se configurado
        if (isValid && this.options.showValidFeedback) {
            const validFeedback = field.parentNode.querySelector('.valid-feedback');
            if (validFeedback) {
                validFeedback.style.display = 'block';
            }
        }
    }
    
    /**
     * Reseta o formulário e as validações
     */
    reset() {
        this.form.reset();
        
        // Remove classes de validação
        this.form.querySelectorAll('.is-valid, .is-invalid').forEach(element => {
            element.classList.remove('is-valid', 'is-invalid');
        });
        
        // Limpa mensagens de erro
        this.form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(element => {
            element.textContent = '';
        });
    }
}

// Função para inicializar validadores em todos os formulários com data-validate
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-validate]').forEach(form => {
        new FormValidator(form);
    });
});