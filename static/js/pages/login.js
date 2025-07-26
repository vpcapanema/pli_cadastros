/**
 * Login Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de login
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a página
    initPage();
    
    // Configura eventos
    setupEvents();
});

/**
 * Inicializa a página
 */
function initPage() {
    // Verifica se já está autenticado
    if (isAuthenticated()) {
        // Se veio de um next, redireciona para lá, senão dashboard
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        window.location.href = next && next !== '/login.html' ? next : '/dashboard.html';
        return;
    }
    
    // Exibe links de desenvolvimento em ambiente de desenvolvimento (removido, não há mais devLinks)
}

/**
 * Configura eventos da página
 */
async function setupEvents() {
    // Evento para envio do formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Valida o formulário
            if (!validateForm()) {
                return;
            }
            
            // Obtém os dados do formulário
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Tenta fazer login
            await login(email, password, rememberMe);
        });
    }
    
    // Evento para verificar tipos de usuário ao digitar o email
    // Preenche o select de tipo de usuário com a lista fixa
    preencherTiposUsuario();
    
    // Função para mostrar o modal Sobre
    window.showAbout = function() {
        const aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));
        aboutModal.show();
    };
}

/**
 * Valida o formulário de login
 * @returns {boolean} - True se válido, false caso contrário
 */
function validateForm() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const tipoUsuarioContainer = document.getElementById('tipoUsuarioContainer');
    const tipoUsuario = document.getElementById('tipoUsuario');
    let isValid = true;
    
    // Valida email
    if (!email.value.trim()) {
        showError(email, 'O email é obrigatório');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Email inválido');
        isValid = false;
    } else {
        clearError(email);
    }
    
    // Valida senha
    if (!password.value.trim()) {
        showError(password, 'A senha é obrigatória');
        isValid = false;
    } else {
        clearError(password);
    }
    
    // Valida tipo de usuário se estiver visível
    if (!tipoUsuarioContainer.classList.contains('d-none') && !tipoUsuario.value) {
        showError(tipoUsuario, 'Selecione um tipo de usuário');
        isValid = false;
    } else if (!tipoUsuarioContainer.classList.contains('d-none')) {
        clearError(tipoUsuario);
    }
    
    return isValid;
}

/**
 * Busca os tipos de usuário disponíveis para um email
 * @param {string} email - Email do usuário
 */
function preencherTiposUsuario() {
    const tipos = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'GESTOR', label: 'Gestor' },
        { value: 'ANALISTA', label: 'Analista' },
        { value: 'OPERADOR', label: 'Operador' },
        { value: 'VISUALIZADOR', label: 'Visualizador' }
    ];
    const tipoUsuarioSelect = document.getElementById('tipoUsuario');
    if (tipoUsuarioSelect) {
        tipoUsuarioSelect.innerHTML = '<option value="">Selecione o tipo de usuário</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.value;
            option.textContent = tipo.label;
            tipoUsuarioSelect.appendChild(option);
        });
    document.getElementById('tipoUsuarioContainer').classList.remove('d-none');
}
}

/**
 * Retorna o nome amigável do tipo de usuário
 * @param {string} tipo - Tipo de usuário
 * @returns {string} - Nome amigável
 */
function getTipoUsuarioNome(tipo) {
    const tipos = {
        'ADMIN': 'Administrador',
        'GESTOR': 'Gestor',
        'ANALISTA': 'Analista',
        'OPERADOR': 'Operador',
        'VISUALIZADOR': 'Visualizador'
    };
    
    return tipos[tipo] || tipo;
}

/**
 * Verifica se um email é válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} - True se válido, false caso contrário
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Exibe uma mensagem de erro em um campo
 * @param {HTMLElement} input - Campo com erro
 * @param {string} message - Mensagem de erro
 */
function showError(input, message) {
    input.classList.add('is-invalid');
    const feedback = input.nextElementSibling.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

/**
 * Limpa a mensagem de erro de um campo
 * @param {HTMLElement} input - Campo a ser limpo
 */
function clearError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.nextElementSibling.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
    }
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - True se autenticado, false caso contrário
 */
function isAuthenticated() {
    const token = sessionStorage.getItem('pli_auth_token');
    return !!token && token.length > 10;
}

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {boolean} rememberMe - Se deve lembrar o usuário
 */
async function login(email, password, rememberMe) {
    // Desabilita o botão de login
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
    
    try {
        // Usa apenas o select fixo do HTML para tipo de usuário
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        // Faz a requisição de login
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // O backend espera 'usuario' (username ou email institucional)
            body: JSON.stringify({ usuario: email, password, tipo_usuario: tipoUsuario })
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            // Exibe mensagem de erro principal e logs detalhados
            showBackendLogs('danger', loginData.mensagem || 'Credenciais inválidas', loginData.logs);
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
            return;
        }
        // Armazena o token e os dados do usuário na sessionStorage (sessão expira ao fechar aba)
        sessionStorage.setItem('pli_auth_token', loginData.token);
        sessionStorage.setItem('pli_user', JSON.stringify(loginData.user));
        // Limpar dados temporários do localStorage
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempPassword');
        // Exibe logs de sucesso antes de redirecionar
        showBackendLogs('success', 'Login realizado com sucesso!', loginData.logs);
        setTimeout(() => {
            // Se veio de um next, redireciona para lá, senão dashboard
            const params = new URLSearchParams(window.location.search);
            const next = params.get('next');
            window.location.href = next && next !== '/login.html' ? next : '/dashboard.html';
        }, 1200);
    } catch (error) {
        // Exibe mensagem de erro genérica
        showBackendLogs('danger', error.message || 'Erro ao fazer login');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
    }
}

/**
 * Exibe logs detalhados do backend como mensagens estilizadas no #alertContainer
 * @param {string} type - Tipo do alerta (success, danger, warning, info)
 * @param {string} mainMessage - Mensagem principal
 * @param {Array} logs - Array de logs detalhados
 */
function showBackendLogs(type, mainMessage, logs = []) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';
    // Mensagem principal
    const mainAlert = document.createElement('div');
    mainAlert.className = `alert alert-${type} alert-dismissible fade show mb-2`;
    mainAlert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
        ${mainMessage}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    alertContainer.appendChild(mainAlert);
    // Logs detalhados
    if (Array.isArray(logs) && logs.length > 0) {
        logs.forEach(log => {
            const logAlert = document.createElement('div');
            logAlert.className = `alert alert-${type} alert-dismissible fade show py-2 px-3 mb-1 small`;
            logAlert.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'danger' ? 'fa-exclamation-triangle' : 'fa-info'} me-1"></i>
                <span>${log}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar" style="font-size:0.8rem;"></button>
            `;
            alertContainer.appendChild(logAlert);
        });
    }
    // Remove todos os alertas após 7s
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 7000);
}

/**
 * Exibe um alerta na página
 * @param {string} type - Tipo do alerta (success, danger, warning, info)
 * @param {string} message - Mensagem do alerta
 */
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    
    // Limpa alertas anteriores
    alertContainer.innerHTML = '';
    
    // Cria o alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adiciona o alerta ao container
    alertContainer.appendChild(alert);
    
    // Remove o alerta após 5 segundos
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}