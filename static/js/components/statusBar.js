/**
 * Componente de Barra de Status
 * Sistema SIGMA-PLI - Módulo de Gerenciamento de Cadastros
 */

/**
 * Inicializa a barra de status na página
 */
function initStatusBar() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    const user = Auth.getUser();
    const userName = user ? user.nome || user.email : 'Usuário';
    
    const statusBarHTML = `
        <div id="statusBar" class="status-bar d-flex justify-content-between align-items-center p-2 mb-3">
            <div class="d-flex align-items-center">
                <i class="fas fa-user me-2"></i>
                <span class="fw-bold">Usuário:</span>
                <span class="ms-1" id="statusUser">${userName}</span>
            </div>
            <div class="d-flex align-items-center">
                <i class="fas fa-wifi me-2"></i>
                <span class="fw-bold">Status:</span>
                <span class="ms-1 text-success" id="statusConnection">Online</span>
            </div>
            <div class="d-flex align-items-center">
                <i class="fas fa-history me-2"></i>
                <span class="fw-bold">Última sessão:</span>
                <span class="ms-1" id="statusLastAccess">--</span>
            </div>
            <div class="d-flex align-items-center">
                <i class="fas fa-clock me-2"></i>
                <span class="fw-bold">Timer:</span>
                <span class="ms-1" id="statusTimer">--:--:--</span>
            </div>
        </div>
    `;
    
    // Inserir como primeiro elemento do main
    mainContent.insertAdjacentHTML('afterbegin', statusBarHTML);
    
    // Inicializar o timer da sessão
    startSessionTimer();
    
    // Atualizar último acesso
    updateLastAccess();
}

/**
 * Inicia o timer da sessão
 */
function startSessionTimer() {
    // Pegar o horário de login do localStorage
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        window.sessionStartTime = new Date(loginTime);
    } else {
        // Se não existe, criar agora e salvar
        window.sessionStartTime = new Date();
        localStorage.setItem('loginTime', window.sessionStartTime.toISOString());
    }
    
    // Atualizar imediatamente
    updateSessionTimer();
    
    // Atualizar a cada segundo
    if (window.sessionTimerInterval) {
        clearInterval(window.sessionTimerInterval);
    }
    window.sessionTimerInterval = setInterval(updateSessionTimer, 1000);
}

/**
 * Atualiza o timer da sessão no formato HH:MM:SS (regressivo)
 */
function updateSessionTimer() {
    if (!window.sessionStartTime) return;
    
    const now = new Date();
    const sessionDuration = 4 * 60 * 60 * 1000; // 4 horas em millisegundos
    const elapsed = now - window.sessionStartTime;
    const remaining = sessionDuration - elapsed;
    
    // Se o tempo acabou
    if (remaining <= 0) {
        const timerElement = document.getElementById('statusTimer');
        if (timerElement) {
            timerElement.textContent = '00:00:00';
            timerElement.className = 'fw-bold text-danger';
        }
        return;
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    const formattedTime = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    
    const timerElement = document.getElementById('statusTimer');
    if (timerElement) {
        timerElement.textContent = formattedTime;
        
        // Mudar cor conforme o tempo restante
        if (remaining < 30 * 60 * 1000) { // Menos de 30 minutos
            timerElement.className = 'fw-bold text-danger';
        } else if (remaining < 60 * 60 * 1000) { // Menos de 1 hora
            timerElement.className = 'fw-bold text-warning';
        } else {
            timerElement.className = 'fw-bold text-success';
        }
    }
}

/**
 * Atualiza o status da conexão
 */
function updateConnectionStatus() {
    const statusElement = document.getElementById('statusConnection');
    if (!statusElement) return;
    
    // Verificar se está online
    if (navigator.onLine) {
        statusElement.textContent = 'Online';
        statusElement.className = 'ms-1 text-success';
    } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'ms-1 text-danger';
    }
}

/**
 * Atualiza a informação do último acesso
 */
function updateLastAccess() {
    const lastAccessElement = document.getElementById('statusLastAccess');
    if (!lastAccessElement) return;
    
    // Pegar o último login do localStorage
    const lastLogin = localStorage.getItem('lastLogin');
    if (lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        const formattedDate = lastLoginDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = lastLoginDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        lastAccessElement.textContent = `${formattedDate} às ${formattedTime}`;
    } else {
        lastAccessElement.textContent = 'Primeiro acesso';
    }
}

// Event listeners para status da conexão
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que Auth esteja carregado
    setTimeout(() => {
        initStatusBar();
        updateConnectionStatus();
    }, 100);
});
