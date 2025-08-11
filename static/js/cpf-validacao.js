/**
 * CPF Validação - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para validação avançada de CPF
 */

document.addEventListener('DOMContentLoaded', function () {
  // Configura a validação de CPF
  setupCPFValidacao();
});

/**
 * Configura a validação avançada de CPF
 */
function setupCPFValidacao() {
  const cpfInput = document.getElementById('cpf');
  if (!cpfInput) return;

  // Aplica máscara ao digitar
  cpfInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 9) {
      e.target.value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      e.target.value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
      e.target.value = value.replace(/^(\d{3})(\d{3})$/, '$1.$2');
    } else {
      e.target.value = value;
    }
  });

  // Valida o CPF ao perder o foco
  cpfInput.addEventListener('blur', function () {
    const cpf = cpfInput.value.replace(/\D/g, '');

    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) {
      if (cpf.length > 0) {
        showValidationMessage(cpfInput, false, 'CPF deve ter 11 dígitos');
      }
      return;
    }

    // Verifica se o CPF é válido
    if (!Utils.validarCPF(cpf)) {
      showValidationMessage(cpfInput, false, 'CPF inválido');
      return;
    }

    // CPF válido
    showValidationMessage(cpfInput, true, 'CPF válido');
  });
}

/**
 * Exibe mensagem de validação
 * @param {HTMLElement} input - Campo de entrada
 * @param {boolean} isValid - Se o campo é válido
 * @param {string} message - Mensagem a ser exibida
 */
function showValidationMessage(input, isValid, message) {
  // Remove mensagens anteriores
  const parent = input.parentNode;
  const existingFeedback = parent.querySelector('.validation-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Cria o elemento de feedback
  const feedback = document.createElement('div');
  feedback.className = `validation-feedback ${isValid ? 'text-success' : 'text-danger'} small mt-1`;
  feedback.innerHTML = `<i class="fas fa-${isValid ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;

  // Adiciona o feedback após o input
  parent.appendChild(feedback);

  // Atualiza as classes do input
  if (isValid) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }

  // Remove a mensagem após 3 segundos se for válido
  if (isValid) {
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
        input.classList.remove('is-valid');
      }
    }, 3000);
  }
}
