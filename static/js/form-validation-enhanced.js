/**
 * Form Validation Enhanced - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para validação avançada de formulários
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configura validações avançadas para todos os formulários
    setupEnhancedValidations();
});

/**
 * Configura validações avançadas para formulários
 */
function setupEnhancedValidations() {
    // Validação de e-mail
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (input.value) {
                const isValid = validateEmail(input.value);
                if (!isValid) {
                    input.classList.add('is-invalid');
                    
                    // Adiciona mensagem de erro se não existir
                    let feedback = input.nextElementSibling;
                    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
                        feedback = document.createElement('div');
                        feedback.className = 'invalid-feedback';
                        input.parentNode.appendChild(feedback);
                    }
                    
                    feedback.textContent = 'E-mail inválido';
                } else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                    
                    // Remove a classe is-valid após 2 segundos
                    setTimeout(() => {
                        input.classList.remove('is-valid');
                    }, 2000);
                }
            }
        });
    });
    
    // Validação de telefone
    const telefoneInputs = document.querySelectorAll('input[name*="telefone"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length === 11) {
                e.target.value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length === 10) {
                e.target.value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
            } else {
                e.target.value = value;
            }
        });
    });
    
    // Validação de CEP
    const cepInputs = document.querySelectorAll('input[name="cep"]');
    cepInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            
            if (value.length === 8) {
                e.target.value = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            } else {
                e.target.value = value;
            }
        });
    });
    
    // Validação de campos obrigatórios
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                
                // Adiciona mensagem de erro se não existir
                let feedback = input.nextElementSibling;
                if (!feedback || !feedback.classList.contains('invalid-feedback')) {
                    feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    input.parentNode.appendChild(feedback);
                }
                
                feedback.textContent = 'Este campo é obrigatório';
            } else {
                input.classList.remove('is-invalid');
            }
        });
    });
}

/**
 * Valida um endereço de e-mail
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} - True se válido, false caso contrário
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}