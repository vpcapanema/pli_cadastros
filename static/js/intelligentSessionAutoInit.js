/**
 * Auto-inicializador do Sistema Inteligente de Sessões - SIGMA-PLI
 * Substitui o sessionMonitor.js existente com funcionalidades avançadas
 */

(function() {
    'use strict';

    // Verificar se já foi inicializado
    if (window.intelligentSessionInitialized) {
        return;
    }

    console.log('[INTELLIGENT SESSION AUTO-INIT] Inicializando sistema inteligente de sessões...');

    // Função para aguardar dependências
    async function waitForDependencies() {
        const maxWait = 10000; // 10 segundos
        const checkInterval = 100; // 100ms
        let elapsed = 0;

        return new Promise((resolve, reject) => {
            const checkDeps = () => {
                if (elapsed >= maxWait) {
                    reject(new Error('Timeout aguardando dependências'));
                    return;
                }

                // Verificar se Auth está disponível
                if (typeof window.Auth !== 'undefined' && window.Auth.isAuthenticated) {
                    resolve();
                    return;
                }

                elapsed += checkInterval;
                setTimeout(checkDeps, checkInterval);
            };

            checkDeps();
        });
    }

    // Função principal de inicialização
    async function initIntelligentSession() {
        try {
            // Aguardar dependências
            await waitForDependencies();

            // Verificar se usuário está autenticado
            if (!Auth.isAuthenticated()) {
                console.log('[INTELLIGENT SESSION AUTO-INIT] Usuário não autenticado - pulando inicialização');
                return;
            }

            // Aguardar carregamento do IntelligentSessionManager
            if (typeof window.IntelligentSessionManager === 'undefined') {
                console.log('[INTELLIGENT SESSION AUTO-INIT] Aguardando carregamento do IntelligentSessionManager...');
                
                // Aguardar até estar disponível
                let attempts = 0;
                const maxAttempts = 50; // 5 segundos
                
                while (typeof window.IntelligentSessionManager === 'undefined' && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (typeof window.IntelligentSessionManager === 'undefined') {
                    console.error('[INTELLIGENT SESSION AUTO-INIT] IntelligentSessionManager não carregou');
                    return;
                }
            }

            // Inicializar o sistema
            await window.IntelligentSessionManager.init();
            
            // Marcar como inicializado
            window.intelligentSessionInitialized = true;
            
            console.log('[INTELLIGENT SESSION AUTO-INIT] ✅ Sistema inteligente de sessões inicializado com sucesso');

            // Adicionar indicador visual na interface
            addSessionIndicator();

            // Configurar controles de interface
            setupUIControls();

        } catch (error) {
            console.error('[INTELLIGENT SESSION AUTO-INIT] ❌ Erro na inicialização:', error);
        }
    }

    // Adiciona indicador visual de sessão
    function addSessionIndicator() {
        try {
            // Verificar se já existe
            if (document.querySelector('#intelligent-session-indicator')) {
                return;
            }

            // Tentar integrar na barra de status primeiro
            const statusContainer = document.getElementById('intelligentSessionContainer');
            
            if (statusContainer) {
                // Criar indicador para a barra de status
                const indicator = document.createElement('div');
                indicator.id = 'intelligent-session-indicator';
                indicator.className = 'd-flex align-items-center';
                indicator.innerHTML = `
                    <i class="fas fa-shield-alt me-2 text-success"></i>
                    <span class="fw-bold">Sessão:</span>
                    <span class="ms-1 session-timer" id="session-timer">--:--:--</span>
                `;
                
                // Adicionar evento de clique para mostrar detalhes
                indicator.addEventListener('click', showSessionDetails);
                indicator.style.cursor = 'pointer';
                indicator.title = 'Sistema de Sessão Inteligente - Clique para detalhes';
                
                statusContainer.appendChild(indicator);
                console.log('[INTELLIGENT SESSION AUTO-INIT] Indicador integrado na barra de status');
            } else {
                // Fallback: criar indicador flutuante como antes
                const indicator = document.createElement('div');
                indicator.id = 'intelligent-session-indicator';
                indicator.innerHTML = `
                    <div class="session-status" title="Sistema de Sessão Inteligente Ativo">
                        <i class="fas fa-shield-alt text-success"></i>
                        <span class="session-timer ms-1" id="session-timer">--:--:--</span>
                    </div>
                `;
                
                indicator.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 0.875rem;
                    z-index: 9999;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                `;

                // Adicionar ao body
                document.body.appendChild(indicator);
                
                // Adicionar evento de clique para mostrar detalhes
                indicator.addEventListener('click', showSessionDetails);
                console.log('[INTELLIGENT SESSION AUTO-INIT] Indicador flutuante criado');
            }

            // Iniciar atualização do timer
            updateSessionTimer();

        } catch (error) {
            console.error('[INTELLIGENT SESSION AUTO-INIT] Erro ao adicionar indicador:', error);
        }
    }

    // Atualiza o timer da sessão
    function updateSessionTimer() {
        const timerElement = document.querySelector('#session-timer');
        if (!timerElement) return;

        const updateTimer = () => {
            try {
                // Verificar se o usuário está autenticado
                if (!Auth.isAuthenticated()) {
                    console.log('[SESSION TIMER DEBUG] Usuário não autenticado');
                    timerElement.textContent = '--:--:--';
                    return;
                }

                const sessionInfo = window.IntelligentSessionManager?.getSessionInfo();
                console.log('[SESSION TIMER DEBUG] SessionInfo:', sessionInfo);
                
                if (sessionInfo && sessionInfo.sessionData && sessionInfo.sessionData.sucesso !== false) {
                    console.log('[SESSION TIMER DEBUG] SessionData:', sessionInfo.sessionData);
                    
                    // Verificar se temos dados de sessão válidos
                    const sessionData = sessionInfo.sessionData.sessao || sessionInfo.sessionData;
                    console.log('[SESSION TIMER DEBUG] Usando sessionData:', sessionData);
                    console.log('[SESSION TIMER DEBUG] Expiration:', sessionData.data_expiracao);
                    
                    if (sessionData.data_expiracao) {
                        const expirationTime = new Date(sessionData.data_expiracao).getTime();
                        const now = Date.now();
                        const timeLeft = Math.max(0, expirationTime - now);
                        
                        console.log('[SESSION TIMER DEBUG] TimeLeft (ms):', timeLeft);
                        
                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                        
                        console.log('[SESSION TIMER DEBUG] Hours:', hours, 'Minutes:', minutes, 'Seconds:', seconds);
                        
                        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        
                        // Mudar cor baseado no tempo restante
                        const indicator = timerElement.closest('.session-status') || timerElement.closest('#intelligent-session-indicator');
                        if (indicator) {
                            const iconElement = indicator.querySelector('.fas');
                            if (timeLeft <= 2 * 60 * 1000) { // Menos de 2 minutos
                                iconElement.className = 'fas fa-shield-alt me-2 text-danger';
                                timerElement.className = 'ms-1 session-timer text-danger fw-bold';
                            } else if (timeLeft <= 5 * 60 * 1000) { // Menos de 5 minutos
                                iconElement.className = 'fas fa-shield-alt me-2 text-warning';
                                timerElement.className = 'ms-1 session-timer text-warning fw-bold';
                            } else {
                                iconElement.className = 'fas fa-shield-alt me-2 text-success';
                                timerElement.className = 'ms-1 session-timer text-success';
                            }
                        }
                    } else {
                        console.log('[SESSION TIMER DEBUG] Sem data_expiracao');
                        timerElement.textContent = '--:--:--';
                    }
                } else {
                    console.log('[SESSION TIMER DEBUG] No sessionData available');
                    timerElement.textContent = '--:--:--';
                }
            } catch (error) {
                console.error('[SESSION TIMER] Erro ao atualizar timer:', error);
                timerElement.textContent = 'ERR';
            }
        };

        // Atualizar a cada segundo
        setInterval(updateTimer, 1000);
        updateTimer(); // Primeira execução
    }

    // Mostra detalhes da sessão
    function showSessionDetails() {
        try {
            // Verificar se o usuário está autenticado
            if (!Auth.isAuthenticated()) {
                alert(`
                Sistema de Sessão Inteligente
                
                ❌ Status: Não autenticado
                ℹ️ Faça login para ativar o sistema de sessão inteligente.
                
                Para acessar o sistema, abra o link em um navegador externo ou faça login diretamente.
                `);
                return;
            }

            const sessionInfo = window.IntelligentSessionManager?.getSessionInfo();
            if (!sessionInfo) {
                console.log('[SESSION DETAILS DEBUG] No session info available');
                alert('Sistema de Sessão Inteligente\n\n❌ Informações de sessão não disponíveis');
                return;
            }

            console.log('[SESSION DETAILS DEBUG] Full sessionInfo:', sessionInfo);

            // Tentar extrair dados do usuário
            let userName = 'N/A';
            if (sessionInfo.sessionData) {
                const sessionData = sessionInfo.sessionData.sessao || sessionInfo.sessionData;
                userName = sessionData.nome || 
                          sessionData.usuario?.nome ||
                          sessionInfo.sessionData.usuario?.nome ||
                          sessionData.username || 
                          'N/A';
            }

            const details = `
                Sessão Inteligente Ativa
                
                🪟 Janela: ${sessionInfo.windowId}
                👤 Usuário: ${userName}
                📊 Status: ${sessionInfo.isActive ? 'Ativo' : 'Inativo'}
                🕒 Última Atividade: ${new Date(sessionInfo.lastActivity).toLocaleTimeString()}
                🔒 Expira em: ${sessionInfo.sessionData?.sessao?.data_expiracao ? new Date(sessionInfo.sessionData.sessao.data_expiracao).toLocaleString() : sessionInfo.sessionData?.data_expiracao ? new Date(sessionInfo.sessionData.data_expiracao).toLocaleString() : 'N/A'}
                🌐 Janelas Ativas: ${sessionInfo.sessionData?.sessao?.janelas_ativas || sessionInfo.sessionData?.janelas_ativas || 0}
                
                Sistema de renovação automática ativo.
                Clique em Logout no menu para encerrar.
            `;

            alert(details);
        } catch (error) {
            console.error('[SESSION DETAILS] Erro ao mostrar detalhes:', error);
        }
    }

    // Configura controles de interface
    function setupUIControls() {
        try {
            // Adicionar data attribute para identificar páginas com sessão inteligente
            document.documentElement.setAttribute('data-intelligent-session', 'active');

            // Interceptar cliques em links de logout
            document.addEventListener('click', (e) => {
                const target = e.target.closest('[data-logout], .logout-btn, #logoutBtn, a[href*="logout"]');
                if (target) {
                    e.preventDefault();
                    if (window.IntelligentSessionManager) {
                        window.IntelligentSessionManager.logout();
                    } else {
                        // Fallback
                        Auth.logout();
                        window.location.href = '/login.html';
                    }
                }
            });

            // Adicionar controle de renovação manual (Ctrl+R)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'r' && window.IntelligentSessionManager) {
                    e.preventDefault();
                    window.IntelligentSessionManager.forceRenewal()
                        .then(() => {
                            console.log('[INTELLIGENT SESSION] Renovação manual realizada');
                        })
                        .catch(err => {
                            console.error('[INTELLIGENT SESSION] Erro na renovação manual:', err);
                        });
                }
            });

        } catch (error) {
            console.error('[INTELLIGENT SESSION AUTO-INIT] Erro ao configurar controles:', error);
        }
    }

    // Função para desabilitar sistema antigo se existir
    function disableOldSessionMonitor() {
        try {
            if (window.SessionMonitor) {
                console.log('[INTELLIGENT SESSION AUTO-INIT] Desabilitando SessionMonitor antigo...');
                
                // Tentar parar o monitor antigo
                if (typeof window.SessionMonitor.cleanup === 'function') {
                    window.SessionMonitor.cleanup();
                }
                
                // Marcar como desabilitado
                window.SessionMonitor.disabled = true;
            }
        } catch (error) {
            console.error('[INTELLIGENT SESSION AUTO-INIT] Erro ao desabilitar monitor antigo:', error);
        }
    }

    // Inicialização baseada no estado do DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                disableOldSessionMonitor();
                initIntelligentSession();
            }, 200);
        });
    } else {
        setTimeout(() => {
            disableOldSessionMonitor();
            initIntelligentSession();
        }, 200);
    }

    // Exportar funções utilitárias
    window.IntelligentSessionAutoInit = {
        reinit: initIntelligentSession,
        showDetails: showSessionDetails,
        version: '1.0.0'
    };

})();
