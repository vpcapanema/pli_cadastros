/**
 * Status Bar Simplificado - SIGMA-PLI
 * Sistema de status simplificado sem loops infinitos
 */

(function () {
  'use strict';

  console.log('[STATUS BAR] Inicializando sistema simplificado...');

  // Verificar se já foi inicializado
  if (window.statusBarInitialized) {
    console.log('[STATUS BAR] Já inicializado, ignorando...');
    return;
  }

  // Função para atualizar status uma única vez
  function updateStatusOnce() {
    try {
      // Verificar se usuário está autenticado
      if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
        console.log('[STATUS BAR] Usuário não autenticado');
        return;
      }

      // Buscar elemento da barra de status
      const statusBar = document.querySelector(
        '.session-status-bar, #sessionStatusBar, .status-bar'
      );
      if (statusBar) {
        // Obter dados da sessão do localStorage
        const sessionData = localStorage.getItem('sessionData');
        if (sessionData) {
          try {
            const data = JSON.parse(sessionData);
            const timeRemaining = calculateTimeRemaining(data);

            statusBar.innerHTML = `
                            <div class="status-content">
                                <span class="status-icon">🟢</span>
                                <span class="status-text">Sessão ativa</span>
                                <span class="status-time">${timeRemaining}</span>
                            </div>
                        `;

            console.log('[STATUS BAR] Status atualizado com sucesso');
          } catch (e) {
            console.warn('[STATUS BAR] Erro ao processar sessionData:', e);
          }
        } else {
          statusBar.innerHTML = `
                        <div class="status-content">
                            <span class="status-icon">🟡</span>
                            <span class="status-text">Verificando sessão...</span>
                        </div>
                    `;
        }
      }
    } catch (error) {
      console.error('[STATUS BAR] Erro ao atualizar status:', error);
    }
  }

  // Calcular tempo restante da sessão
  function calculateTimeRemaining(sessionData) {
    try {
      const expiration = sessionData.sessao?.data_expiracao || sessionData.data_expiracao;
      if (!expiration) return 'N/A';

      const exp = new Date(expiration);
      const now = new Date();
      const diff = exp - now;

      if (diff <= 0) return 'Expirada';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.warn('[STATUS BAR] Erro ao calcular tempo:', error);
      return 'Erro';
    }
  }

  // Aguardar DOM e dependências
  function waitAndUpdate() {
    const maxAttempts = 50; // Máximo 5 segundos
    let attempts = 0;

    const check = () => {
      attempts++;

      if (attempts >= maxAttempts) {
        console.warn('[STATUS BAR] Timeout aguardando dependências');
        return;
      }

      if (typeof Auth !== 'undefined' && document.readyState === 'complete') {
        updateStatusOnce();

        // Configurar timer simples (a cada 60 segundos)
        setInterval(updateStatusOnce, 60000);

        // Marcar como inicializado
        window.statusBarInitialized = true;
        console.log('[STATUS BAR] ✅ Sistema inicializado com sucesso');
      } else {
        setTimeout(check, 100);
      }
    };

    check();
  }

  // Aguardar carregamento completo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndUpdate);
  } else {
    waitAndUpdate();
  }
})();
