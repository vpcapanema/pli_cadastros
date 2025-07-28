/**
 * Login Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de login
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se dependências estão carregadas
    console.log('[LOGIN DEBUG] Verificando dependências...');
    
    if (typeof API === 'undefined') {
        console.error('[LOGIN ERROR] API não está definido! Verifique se api.js está carregado.');
        showAlert('danger', 'Erro de configuração: API não carregado. Recarregue a página.');
        return;
    }
    
    if (typeof Auth === 'undefined') {
        console.error('[LOGIN ERROR] Auth não está definido! Verifique se auth.js está carregado.');
        showAlert('danger', 'Erro de configuração: Auth não carregado. Recarregue a página.');
        return;
    }
    
    console.log('[LOGIN DEBUG] Dependências carregadas com sucesso');
    
    // Inicializa a página
    initPage();
    
    // Configura eventos
    setupEvents();
});

/**
 * Inicializa a página
 */
function initPage() {
    // A página de login é o ponto de entrada para usuários não autenticados
    console.log('[LOGIN DEBUG] Página de login carregada');
}

/**
 * Valida se a URL de redirecionamento é segura
 * Implementa whitelist de URLs permitidas conforme boas práticas OWASP
 * @param {string} url - URL para validar
 * @returns {boolean} - True se válida, false caso contrário
 */
function isValidRedirectUrl(url) {
    // Usa configuração centralizada se disponível, senão fallback local
    if (typeof SecurityConfig !== 'undefined') {
        return SecurityConfig.validators.isValidRedirectUrl(url);
    }
    
    // Fallback local (whitelist básica)
    const allowedUrls = [
        '/dashboard.html',
        '/pessoa-fisica.html',
        '/pessoa-juridica.html',
        '/usuarios.html',
        '/solicitacoes-cadastro.html',
        '/meus-dados.html',
        '/recursos.html'
    ];
    
    try {
        // Verifica se é uma URL relativa simples (inicia com /)
        if (url.startsWith('/')) {
            return allowedUrls.includes(url);
        }
        
        // Rejeita URLs absolutas, protocolos especiais, etc.
        return false;
    } catch (error) {
        console.log('[SECURITY] Erro ao validar URL de redirecionamento:', error);
        return false;
    }
}

/**
 * Configura eventos da página
 */
async function setupEvents() {
    // Sincronização do campo oculto username com o campo principal
    setupUsernameSync();
    
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
            const usuario = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Tenta fazer login
            await login(usuario, password);
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
    const usuario = document.getElementById('email');
    const password = document.getElementById('password');
    const tipoUsuarioContainer = document.getElementById('tipoUsuarioContainer');
    const tipoUsuario = document.getElementById('tipoUsuario');
    let isValid = true;
    
    // Valida usuario (email ou username)
    if (!usuario.value.trim()) {
        showError(usuario, 'O usuário (email ou username) é obrigatório');
        isValid = false;
    } else if (!isValidEmailOrUsername(usuario.value)) {
        showError(usuario, 'Digite um email válido ou username válido (apenas letras, números, pontos, hífens e sublinhados)');
        isValid = false;
    } else {
        clearError(usuario);
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
 * Busca os tipos de usuário disponíveis
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
 * Verifica se um valor é um email válido OU um username válido
 * @param {string} value - Valor a ser validado
 * @returns {boolean} - True se válido, false caso contrário
 */
function isValidEmailOrUsername(value) {
    if (!value || !value.trim()) return false;
    
    // Se contém @ - valida como email
    if (value.includes('@')) {
        return isValidEmail(value);
    }
    
    // Se não contém @ - valida como username
    return isValidUsername(value);
}

/**
 * Verifica se um username é válido
 * @param {string} username - Username a ser validado
 * @returns {boolean} - True se válido, false caso contrário
 */
function isValidUsername(username) {
    // Username: apenas letras, números, pontos, hífens e sublinhados
    // Mínimo 3 caracteres, máximo 50
    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    return usernameRegex.test(username);
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
 * Realiza o login do usuário
 * @param {string} usuario - Email/Username do usuário
 * @param {string} password - Senha do usuário
 */
async function login(usuario, password) {
    // Desabilita o botão de login
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
    
    try {
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        
        // Usa o serviço API padronizado
        const loginData = await API.post('/auth/login', { 
            usuario: usuario, 
            password, 
            tipo_usuario: tipoUsuario 
        });
        
        let logs = [];
        if (Array.isArray(loginData.logs)) logs = loginData.logs;
        
        // Validação dos passos e exibição detalhada
        if (!loginData.sucesso) {
            // LOGIN MAL-SUCEDIDO: Mostra erro e permanece na página
            let motivo = loginData.mensagem || 'Credenciais inválidas';
            if (loginData.erro) motivo += ` [ERRO]: ${loginData.erro}`;
            logs.push('[FRONTEND] Login falhou. Motivo detalhado: ' + motivo);
            
            // Exibe mensagem de erro
            showFinalLoginMessage('danger', 'Falha no login', logs, motivo);
            
            // Reabilita o botão de login
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
            
            // Limpa os campos de senha por segurança
            document.getElementById('password').value = '';
            
            console.log('[LOGIN DEBUG] Login mal-sucedido - usuário permanece na página de login');
            return;
        }
        
        // LOGIN BEM-SUCEDIDO: Armazena dados e redireciona
        console.log('[LOGIN DEBUG] Login bem-sucedido - iniciando redirecionamento');
        
        // Inicia sessão via Auth (localStorage)
        Auth.loginFromApi(loginData.token, loginData.user);
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempPassword');
        logs.push('[FRONTEND] Login realizado com sucesso. Sessão iniciada e token armazenado.');
        
        // Exibe mensagem de sucesso
        showFinalLoginMessage('success', 'Login realizado com sucesso!', logs, 'Acesso liberado. Você será direcionado ao dashboard.');
        
        // Redireciona após breve delay
        setTimeout(() => {
            // Verifica se há um parâmetro 'next' na URL para redirecionar
            const urlParams = new URLSearchParams(window.location.search);
            const nextUrl = urlParams.get('next');
            
            if (nextUrl && isValidRedirectUrl(nextUrl)) {
                console.log('[LOGIN DEBUG] Redirecionando para página solicitada:', nextUrl);
                window.location.href = nextUrl;
            } else {
                if (nextUrl) {
                    console.log('[LOGIN DEBUG] URL de redirecionamento inválida ignorada:', nextUrl);
                }
                console.log('[LOGIN DEBUG] Redirecionando para dashboard padrão');
                window.location.href = '/dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        // ERRO INESPERADO: Mostra erro e permanece na página
        console.error('[LOGIN DEBUG] Erro inesperado durante login:', error);
        
        let errorMessage = 'Erro de conexão ou servidor';
        
        // Trata diferentes tipos de erro
        if (error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            errorMessage = `Erro HTTP ${error.status}`;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        let logs = [
            `[FRONTEND] Erro inesperado ao tentar login: ${errorMessage}`,
            `[FRONTEND] Tipo do erro: ${typeof error}`,
            `[FRONTEND] Stack: ${error.stack || 'N/A'}`
        ];
        
        showFinalLoginMessage('danger', 'Erro inesperado ao fazer login', logs, errorMessage);
        
        // Reabilita o botão de login
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<span class="btn-text"><i class="fas fa-sign-in-alt me-2"></i>Entrar</span>';
        
        // Limpa os campos de senha por segurança
        document.getElementById('password').value = '';
        
        console.log('[LOGIN DEBUG] Erro tratado - usuário permanece na página de login');
    }
}

/**
 * Exibe mensagem final de login (sucesso ou fracasso) com todos os passos e logs detalhados
 * @param {string} type - Tipo do alerta (success, danger, warning, info)
 * @param {string} mainMessage - Mensagem principal
 * @param {Array} logs - Array de logs detalhados
 * @param {string} conclusao - Mensagem de conclusão
 */
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

/**
 * Configura sincronização entre campo principal e campo oculto username
 * Para compatibilidade com gerenciadores de senhas e autocomplete
 */
function setupUsernameSync() {
    const emailField = document.getElementById('email');
    const hiddenUsernameField = document.getElementById('username');
    
    if (emailField && hiddenUsernameField) {
        // Sincroniza quando o usuário digita no campo principal
        emailField.addEventListener('input', (e) => {
            hiddenUsernameField.value = e.target.value;
        });
        
        // Sincroniza quando o navegador/gerenciador preenche automaticamente
        emailField.addEventListener('change', (e) => {
            hiddenUsernameField.value = e.target.value;
        });
        
        // Sincronização reversa - quando gerenciador preenche o campo oculto
        hiddenUsernameField.addEventListener('change', (e) => {
            if (e.target.value && !emailField.value) {
                emailField.value = e.target.value;
            }
        });
        
        console.log('[LOGIN DEBUG] Sincronização de campos username configurada');
    }
}