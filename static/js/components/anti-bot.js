/**
 * Anti-Bot Protection - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Implementa proteções contra bots em formulários públicos
 */

class AntiBotProtection {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.honeypotField = null;
        this.timeCheckField = null;
        this.captchaField = null;
        this.captchaAnswer = null;
        this.formStartTime = Date.now();
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Adiciona honeypot (campo oculto que bots tendem a preencher)
        this.addHoneypot();
        
        // Adiciona verificação de tempo (submissões muito rápidas são suspeitas)
        this.addTimeCheck();
        
        // Adiciona CAPTCHA simples
        this.addCaptcha();
        
        // Adiciona validação no envio do formulário
        this.form.addEventListener('submit', this.validateSubmission.bind(this));
    }
    
    addHoneypot() {
        // Cria um campo oculto que humanos não verão, mas bots tentarão preencher
        const honeypotContainer = document.createElement('div');
        honeypotContainer.style.opacity = '0';
        honeypotContainer.style.position = 'absolute';
        honeypotContainer.style.height = '0';
        honeypotContainer.style.overflow = 'hidden';
        honeypotContainer.style.zIndex = '-1';
        
        const honeypotInput = document.createElement('input');
        honeypotInput.type = 'text';
        honeypotInput.name = 'website';
        honeypotInput.id = 'website';
        honeypotInput.autocomplete = 'off';
        
        honeypotContainer.appendChild(honeypotInput);
        this.form.appendChild(honeypotContainer);
        
        this.honeypotField = honeypotInput;
    }
    
    addTimeCheck() {
        // Adiciona campo oculto para verificar o tempo de preenchimento
        const timeCheckInput = document.createElement('input');
        timeCheckInput.type = 'hidden';
        timeCheckInput.name = 'form_start_time';
        timeCheckInput.id = 'form_start_time';
        timeCheckInput.value = this.formStartTime;
        
        this.form.appendChild(timeCheckInput);
        this.timeCheckField = timeCheckInput;
    }
    
    addCaptcha() {
        // Gera um CAPTCHA simples baseado em operações matemáticas
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.captchaAnswer = num1 + num2;
        
        const captchaContainer = document.createElement('div');
        captchaContainer.className = 'mb-3';
        
        const captchaLabel = document.createElement('label');
        captchaLabel.className = 'form-label';
        captchaLabel.htmlFor = 'captcha';
        captchaLabel.innerHTML = `<i class="fas fa-shield-alt me-2"></i>Verificação de Segurança: Quanto é ${num1} + ${num2}? *`;
        
        const captchaInput = document.createElement('input');
        captchaInput.type = 'number';
        captchaInput.className = 'form-control';
        captchaInput.id = 'captcha';
        captchaInput.name = 'captcha';
        captchaInput.required = true;
        captchaInput.min = 0;
        
        const invalidFeedback = document.createElement('div');
        invalidFeedback.className = 'invalid-feedback';
        invalidFeedback.textContent = 'Por favor, resolva a operação matemática corretamente.';
        
        captchaContainer.appendChild(captchaLabel);
        captchaContainer.appendChild(captchaInput);
        captchaContainer.appendChild(invalidFeedback);
        
        // Procura pelo protection-container e insere o CAPTCHA lá
        const protectionContainer = document.getElementById('protection-container');
        if (protectionContainer) {
            protectionContainer.appendChild(captchaContainer);
        } else {
            // Fallback: Adiciona antes do botão de submit
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (submitButton && submitButton.parentNode) {
                submitButton.parentNode.insertBefore(captchaContainer, submitButton);
            } else {
                this.form.appendChild(captchaContainer);
            }
        }
        
        this.captchaField = captchaInput;
    }
    
    validateSubmission(event) {
        // Verifica honeypot - se preenchido, provavelmente é um bot
        if (this.honeypotField && this.honeypotField.value) {
            event.preventDefault();
            console.log('Honeypot triggered');
            this.showError('Erro de validação. Por favor, tente novamente mais tarde.');
            return false;
        }
        
        // Verifica tempo - submissões muito rápidas (< 3 segundos) são suspeitas
        if (this.timeCheckField) {
            const startTime = parseInt(this.timeCheckField.value);
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < 3000) {
                event.preventDefault();
                console.log('Time check triggered');
                this.showError('Por favor, revise os dados antes de enviar o formulário.');
                return false;
            }
        }
        
        // Verifica CAPTCHA
        if (this.captchaField) {
            const userAnswer = parseInt(this.captchaField.value);
            if (userAnswer !== this.captchaAnswer) {
                event.preventDefault();
                console.log('CAPTCHA failed');
                this.captchaField.classList.add('is-invalid');
                return false;
            }
        }
        
        return true;
    }
    
    showError(message) {
        // Exibe mensagem de erro usando SweetAlert2 se disponível
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Erro de Validação',
                text: message,
                confirmButtonColor: '#3949ab'
            });
        } else {
            alert(message);
        }
    }
    
    // Método para atualizar o CAPTCHA
    refreshCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.captchaAnswer = num1 + num2;
        
        const captchaLabel = this.captchaField.previousElementSibling;
        captchaLabel.innerHTML = `<i class="fas fa-shield-alt me-2"></i>Verificação de Segurança: Quanto é ${num1} + ${num2}? *`;
        
        this.captchaField.value = '';
        this.captchaField.classList.remove('is-invalid');
    }
}