/**
 * Recuperar Senha Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de recuperação de senha
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
    // Inicializa validadores
    initValidators();
}

/**
 * Inicializa validadores de formulário
 */
function initValidators() {
    // Formulário de email
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        new FormValidator(emailForm);
    }
    
    // Formulário de token
    const tokenForm = document.getElementById('tokenForm');
    if (tokenForm) {
        new FormValidator(tokenForm);
    }
    
    // Formulário de senha
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        new FormValidator(passwordForm);
    }
}

/**
 * Configura eventos da página
 */
function setupEvents() {
    // Evento para envio do formulário de email
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!emailForm.checkValidity()) {
                e.stopPropagation();
                return;
            }
            
            const email = document.getElementById('email').value;
            
            try {
                // Desabilita o botão
                const btnSendEmail = document.getElementById('btnSendEmail');
                btnSendEmail.disabled = true;
                btnSendEmail.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
                
                // Envia a solicitação
                await API.post('/auth/recuperar-senha', { email });
                
                // Exibe o email no próximo passo
                document.getElementById('emailDisplay').textContent = email;
                
                // Inicia o timer de reenvio
                startResendTimer();
                
                // Avança para o próximo passo
                goToStep(2);
                
                // Habilita o botão novamente
                btnSendEmail.disabled = false;
                btnSendEmail.innerHTML = '<span class="btn-text"><i class="fas fa-paper-plane me-2"></i>Enviar Instruções</span>';
            } catch (error) {
                // Habilita o botão novamente
                btnSendEmail.disabled = false;
                btnSendEmail.innerHTML = '<span class="btn-text"><i class="fas fa-paper-plane me-2"></i>Enviar Instruções</span>';
                
                // Exibe mensagem de erro
                showAlert('danger', `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Erro ao enviar email'}`);
            }
        });
    }
    
    // Evento para reenvio do token
    const resendLink = document.getElementById('resendLink');
    if (resendLink) {
        resendLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (resendLink.classList.contains('disabled')) {
                return;
            }
            
            const email = document.getElementById('emailDisplay').textContent;
            
            try {
                // Desabilita o link
                resendLink.classList.add('disabled');
                
                // Envia a solicitação
                await API.post('/auth/recuperar-senha', { email });
                
                // Exibe mensagem de sucesso
                showAlert('success', '<i class="fas fa-check-circle"></i> Código reenviado com sucesso!');
                
                // Inicia o timer de reenvio
                startResendTimer();
            } catch (error) {
                // Exibe mensagem de erro
                showAlert('danger', `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Erro ao reenviar código'}`);
                
                // Habilita o link novamente
                resendLink.classList.remove('disabled');
            }
        });
    }
    
    // Evento para envio do formulário de token
    const tokenForm = document.getElementById('tokenForm');
    if (tokenForm) {
        tokenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!tokenForm.checkValidity()) {
                e.stopPropagation();
                return;
            }
            
            const email = document.getElementById('emailDisplay').textContent;
            const token = document.getElementById('token').value;
            
            try {
                // Desabilita o botão
                const btnVerifyToken = document.getElementById('btnVerifyToken');
                btnVerifyToken.disabled = true;
                btnVerifyToken.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verificando...';
                
                // Verifica o token
                await API.post('/auth/verificar-token', { email, token });
                
                // Avança para o próximo passo
                goToStep(3);
                
                // Habilita o botão novamente
                btnVerifyToken.disabled = false;
                btnVerifyToken.innerHTML = '<span class="btn-text"><i class="fas fa-check me-2"></i>Verificar Código</span>';
            } catch (error) {
                // Habilita o botão novamente
                btnVerifyToken.disabled = false;
                btnVerifyToken.innerHTML = '<span class="btn-text"><i class="fas fa-check me-2"></i>Verificar Código</span>';
                
                // Exibe mensagem de erro
                showAlert('danger', `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Código inválido ou expirado'}`);
            }
        });
    }
    
    // Evento para envio do formulário de senha
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!passwordForm.checkValidity()) {
                e.stopPropagation();
                return;
            }
            
            const email = document.getElementById('emailDisplay').textContent;
            const token = document.getElementById('token').value;
            const newPassword = document.getElementById('newPassword').value;
            
            try {
                // Desabilita o botão
                const btnResetPassword = document.getElementById('btnResetPassword');
                btnResetPassword.disabled = true;
                btnResetPassword.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Alterando...';
                
                // Altera a senha
                await API.post('/auth/redefinir-senha', { email, token, newPassword });
                
                // Avança para o passo de sucesso
                goToStep(4);
                
                // Habilita o botão novamente
                btnResetPassword.disabled = false;
                btnResetPassword.innerHTML = '<span class="btn-text"><i class="fas fa-save me-2"></i>Alterar Senha</span>';
            } catch (error) {
                // Habilita o botão novamente
                btnResetPassword.disabled = false;
                btnResetPassword.innerHTML = '<span class="btn-text"><i class="fas fa-save me-2"></i>Alterar Senha</span>';
                
                // Exibe mensagem de erro
                showAlert('danger', `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Erro ao alterar senha'}`);
            }
        });
    }
}

/**
 * Avança para o passo especificado
 * @param {number} step - Número do passo (1, 2, 3 ou 4)
 */
function goToStep(step) {
    // Atualiza o indicador de passos
    document.querySelectorAll('.step').forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.remove('active', 'inactive');
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.remove('inactive', 'completed');
            el.classList.add('active');
        } else {
            el.classList.remove('active', 'completed');
            el.classList.add('inactive');
        }
    });
    
    // Atualiza os conectores
    document.querySelectorAll('.step-connector').forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.add('completed');
        } else {
            el.classList.remove('completed');
        }
    });
    
    // Esconde todos os passos
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostra o passo atual
    let currentStep;
    switch (step) {
        case 1:
            currentStep = 'stepEmail';
            document.getElementById('headerTitle').textContent = 'Recuperar Senha';
            document.getElementById('headerSubtitle').textContent = 'Digite seu email para receber as instruções de recuperação';
            document.getElementById('headerIcon').className = 'fas fa-key';
            break;
        case 2:
            currentStep = 'stepToken';
            document.getElementById('headerTitle').textContent = 'Verificar Código';
            document.getElementById('headerSubtitle').textContent = 'Digite o código de verificação enviado para seu email';
            document.getElementById('headerIcon').className = 'fas fa-shield-alt';
            break;
        case 3:
            currentStep = 'stepPassword';
            document.getElementById('headerTitle').textContent = 'Nova Senha';
            document.getElementById('headerSubtitle').textContent = 'Crie uma nova senha para sua conta';
            document.getElementById('headerIcon').className = 'fas fa-lock';
            break;
        case 4:
            currentStep = 'stepSuccess';
            document.getElementById('stepIndicator').style.display = 'none';
            break;
    }
    
    document.getElementById(currentStep).classList.add('active');
    
    // Limpa alertas
    document.getElementById('alertContainer').innerHTML = '';
}

/**
 * Inicia o timer de reenvio
 */
function startResendTimer() {
    const resendLink = document.getElementById('resendLink');
    const resendTimer = document.getElementById('resendTimer');
    
    // Desabilita o link
    resendLink.classList.add('disabled');
    
    // Define o tempo de espera (60 segundos)
    let timeLeft = 60;
    
    // Atualiza o timer
    resendTimer.textContent = `Reenviar em ${timeLeft}s`;
    
    // Inicia o intervalo
    const interval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            // Limpa o intervalo
            clearInterval(interval);
            
            // Habilita o link
            resendLink.classList.remove('disabled');
            
            // Limpa o timer
            resendTimer.textContent = '';
        } else {
            // Atualiza o timer
            resendTimer.textContent = `Reenviar em ${timeLeft}s`;
        }
    }, 1000);
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