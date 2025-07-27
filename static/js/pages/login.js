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
    // Não redireciona automaticamente se já estiver autenticado
    
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
    const token = localStorage.getItem('token');
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
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: email, password, tipo_usuario: tipoUsuario })
        });
        let loginData;
        let logs = [];
        try {
            loginData = await loginResponse.json();
            if (Array.isArray(loginData.logs)) logs = loginData.logs;
        } catch (parseErr) {
            logs.push('[FRONTEND] Erro ao processar resposta da API: ' + parseErr.message);
        }
        // Validação dos passos e exibição detalhada
        if (!loginResponse.ok || !loginData.sucesso) {
            let motivo = loginData.mensagem || 'Credenciais inválidas';
            if (loginData.erro) motivo += `\n[ERRO]: ${loginData.erro}`;
            logs.push('[FRONTEND] Login falhou. Motivo detalhado: ' + motivo);
            showFinalLoginMessage('danger', 'Falha no login', logs, motivo);
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
            return;
        }
        // Inicia sessão via Auth (localStorage)
        Auth.loginFromApi(loginData.token, loginData.user);
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempPassword');
        logs.push('[FRONTEND] Login realizado com sucesso. Sessão iniciada e token armazenado.');
        showFinalLoginMessage('success', 'Login realizado com sucesso!', logs, 'Acesso liberado. Você será direcionado ao dashboard.');
        setTimeout(() => {
            window.open('http://localhost:8888/dashboard.html', '_blank');
        }, 1200);
    } catch (error) {
        let logs = ['[FRONTEND] Erro inesperado ao tentar login: ' + (error.message || error)];
        showFinalLoginMessage('danger', 'Erro inesperado ao fazer login', logs, error.message || 'Erro desconhecido');
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

// Exibe mensagem final de login (sucesso ou fracasso) com todos os passos e logs detalhados
function showFinalLoginMessage(type, mainMessage, logs = [], conclusao = '') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';
    // Mensagem principal
    const mainAlert = document.createElement('div');
    mainAlert.className = `alert alert-${type} alert-dismissible fade show mb-2`;
    mainAlert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
        <strong>${mainMessage}</strong><br>
        <ul class="mb-1 mt-2 ps-3" style="font-size:1rem;">
            ${logs.map(log => `<li>${log}</li>`).join('')}
        </ul>
        <div class="mt-2"><strong>Conclusão:</strong> <span class="fw-bold">${conclusao}</span></div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    alertContainer.appendChild(mainAlert);
    // Não remove automaticamente, só fecha se o usuário clicar no X
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