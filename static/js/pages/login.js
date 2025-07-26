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
        window.location.href = '/dashboard.html';
        return;
    }
    
    // Exibe links de desenvolvimento em ambiente de desenvolvimento (removido, não há mais devLinks)
}

/**
 * Configura eventos da página
 */
function setupEvents() {
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
    const emailInput = document.getElementById('email');
    if (emailInput) {
        // Usar debounce para não fazer muitas requisições
        let timeout;
        emailInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const email = e.target.value;
                if (isValidEmail(email)) {
                    await buscarTiposUsuario(email);
                } else {
                    document.getElementById('tipoUsuarioContainer').classList.add('d-none');
                }
            }, 500);
        });
    }
    
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
async function buscarTiposUsuario(email) {
    try {
        // Faz a requisição para a API
        const response = await fetch(`/api/auth/tipos-usuario/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar tipos de usuário');
        }
        
        const data = await response.json();
        
        // Verifica se há tipos de usuário disponíveis
        if (data.sucesso && data.tiposUsuario && data.tiposUsuario.length > 0) {
            // Preenche o select de tipos de usuário
            const tipoUsuarioSelect = document.getElementById('tipoUsuario');
            tipoUsuarioSelect.innerHTML = '<option value="">Selecione o tipo de usuário</option>';
            
            data.tiposUsuario.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo;
                option.textContent = getTipoUsuarioNome(tipo);
                tipoUsuarioSelect.appendChild(option);
            });
            
            // Exibe o campo de seleção de tipo de usuário
            document.getElementById('tipoUsuarioContainer').classList.remove('d-none');
            
            return data.tiposUsuario.length > 1; // Retorna true se houver mais de um tipo
        } else {
            // Oculta o campo de seleção de tipo de usuário
            document.getElementById('tipoUsuarioContainer').classList.add('d-none');
            return false;
        }
    } catch (error) {
        console.error('Erro ao buscar tipos de usuário:', error);
        // Oculta o campo de seleção de tipo de usuário
        document.getElementById('tipoUsuarioContainer').classList.add('d-none');
        return false;
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
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
        return false;
    }
    
    // Verifica se o token expirou
    if (new Date().getTime() > parseInt(expiration)) {
        logout();
        return false;
    }
    
    return true;
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
        // Busca os tipos de usuário disponíveis
        const response = await fetch(`/api/auth/tipos-usuario/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error('Erro ao verificar tipos de usuário disponíveis');
        }
        
        const data = await response.json();
        
        // Verifica se há múltiplos tipos de usuário disponíveis
        if (data.sucesso && data.tiposUsuario && data.tiposUsuario.length > 1) {
            // Armazena temporariamente as credenciais para uso na página de seleção de perfil
            localStorage.setItem('tempEmail', email);
            localStorage.setItem('tempPassword', password);
            
            // Redireciona para a página de seleção de perfil
            const perfisParam = encodeURIComponent(JSON.stringify(data.tiposUsuario));
            window.location.href = `/selecionar-perfil.html?perfis=${perfisParam}`;
            return;
        }
        
        // Se não há tipos disponíveis ou há apenas um, continua com o login normal
        const tipoUsuario = data.tiposUsuario && data.tiposUsuario.length === 1 ? data.tiposUsuario[0] : 
                           document.getElementById('tipoUsuario').value;
        
        // Faz a requisição de login
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, tipo_usuario: tipoUsuario })
        });
        
        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            throw new Error(error.mensagem || 'Credenciais inválidas');
        }
        
        const loginData = await loginResponse.json();
        
        // Armazena o token e os dados do usuário
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        // Define a expiração do token (24 horas ou 30 dias se "lembrar-me" estiver marcado)
        const expiration = new Date().getTime() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;
        localStorage.setItem('tokenExpiration', expiration);
        
        // Registra o último login
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        // Limpar dados temporários
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempPassword');
        
        // Redireciona para o dashboard
        window.location.href = '/dashboard.html';
    } catch (error) {
        // Exibe mensagem de erro
        showAlert('danger', `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Erro ao fazer login'}`);
        
        // Habilita o botão de login novamente
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
    }
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