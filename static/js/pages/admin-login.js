/**
 * Script para página de login administrativo
 * SIGMA-PLI - Módulo de Gerenciamento de Cadastros
 */

// Variáveis globais
let isLoading = false;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminLogin();
    console.log('Admin Login page initialized');
});

/**
 * Inicializa a página de login administrativo
 */
function initializeAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (form) {
        form.addEventListener('submit', handleAdminLogin);
    }

    // Verificar se usuário já está logado
    checkExistingSession();

    // Configurar tecla Enter para envio
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleAdminLogin();
        }
    });

    // Auto-foco no campo email
    setTimeout(() => {
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.focus();
        }
    }, 100);
}

/**
 * Verifica se já existe uma sessão ativa
 */
function checkExistingSession() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (token && userType === 'ADMIN') {
        // Verificar se o token ainda é válido
        api.validateToken()
            .then(response => {
                if (response.valid) {
                    console.log('Valid admin session found, redirecting...');
                    window.location.href = '/admin/dashboard';
                }
            })
            .catch(() => {
                // Token inválido, limpar storage
                localStorage.clear();
            });
    }
}

/**
 * Manipula o envio do formulário de login administrativo
 */
async function handleAdminLogin(event) {
    if (event) {
        event.preventDefault();
    }

    if (isLoading) return;

    const form = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const rememberMe = document.getElementById('rememberMe');
    const btnLogin = document.getElementById('btnAdminLogin');

    // Validação básica
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        showAlert('Por favor, preencha todos os campos.', 'warning');
        return;
    }

    // Validação de email
    if (!isValidEmail(email)) {
        showAlert('Por favor, insira um e-mail válido.', 'warning');
        emailInput.focus();
        return;
    }

    try {
        setLoading(true);
        
        // Dados do login com tipo fixo ADMIN
        const loginData = {
            usuario: email,  // Campo "usuario" que pode ser email ou username
            password: senha,
            tipo_usuario: 'ADMIN',
            rememberMe: rememberMe.checked
        };

        console.log('Attempting admin login for:', email);

        // Fazer requisição de login
        const response = await api.post('/auth/login', loginData);

        if (response.success) {
            // Verificar se o usuário é realmente admin
            if (response.data.user.tipo_usuario !== 'ADMIN') {
                throw new Error('Acesso negado. Esta área é restrita para administradores.');
            }

            // Armazenar dados de autenticação
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('userEmail', response.data.user.email);
            localStorage.setItem('userName', response.data.user.nome);
            localStorage.setItem('userType', response.data.user.tipo_usuario);

            console.log('Admin login successful');
            
            showAlert('Login administrativo realizado com sucesso!', 'success');

            // Limpar formulário
            form.reset();
            form.classList.remove('was-validated');

            // Aguardar um pouco e redirecionar
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 1000);

        } else {
            throw new Error(response.message || 'Erro no login administrativo');
        }

    } catch (error) {
        console.error('Admin login error:', error);
        
        let errorMessage = 'Erro no login administrativo. Verifique suas credenciais.';
        
        if (error.message.includes('Acesso negado')) {
            errorMessage = error.message;
        } else if (error.message.includes('não encontrado')) {
            errorMessage = 'E-mail não encontrado ou não é um administrador.';
        } else if (error.message.includes('senha')) {
            errorMessage = 'Senha incorreta.';
        } else if (error.message.includes('tipo')) {
            errorMessage = 'Acesso negado. Esta área é restrita para administradores.';
        }

        showAlert(errorMessage, 'danger');
        senhaInput.focus();
        senhaInput.select();

    } finally {
        setLoading(false);
    }
}

/**
 * Define o estado de carregamento
 */
function setLoading(loading) {
    isLoading = loading;
    const btnLogin = document.getElementById('btnAdminLogin');
    const btnText = btnLogin.querySelector('.btn-text');

    if (loading) {
        btnLogin.disabled = true;
        btnText.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Autenticando...';
    } else {
        btnLogin.disabled = false;
        btnText.innerHTML = '<i class="fas fa-shield-alt me-2"></i>Acesso Administrativo';
    }
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Exibe alerta na página
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    // Remover alertas existentes
    alertContainer.innerHTML = '';

    // Mapear tipos para classes Bootstrap
    const alertClasses = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };

    const alertClass = alertClasses[type] || 'alert-info';

    // Criar elemento de alerta
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
    alertElement.role = 'alert';

    // Ícones para cada tipo
    const icons = {
        'success': 'fas fa-check-circle',
        'danger': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };

    const icon = icons[type] || icons['info'];

    alertElement.innerHTML = `
        <i class="${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;

    alertContainer.appendChild(alertElement);

    // Auto-remover após 5 segundos (exceto para erros)
    if (type !== 'danger') {
        setTimeout(() => {
            if (alertElement && alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }
}

/**
 * Mostra modal "Sobre"
 */
function showAbout() {
    const aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));
    aboutModal.show();
}

// Função global para compatibilidade
window.showAbout = showAbout;
