// Loader dedicado para navbar interna/restrita
// Insere apenas a navbar restrita do template base.html
// Versão atualizada para apontar para o template base.html
(function () {
  // Injeta CSS mínimo do header do base se ainda não existir
  function injectBaseHeaderStyles() {
    if (document.getElementById('pli-base-header-styles')) return;
    const style = document.createElement('style');
    style.id = 'pli-base-header-styles';
    style.textContent = `
      .l-header {
        position: relative;
        top: 0; left: 0; right: 0;
        z-index: 1030;
        min-height: 60px;
        padding: 4px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      }
      @media (max-width: 768px) {
        .l-header { min-height: 52px; }
      }
    `;
    document.head.appendChild(style);
  }
  // Função global de logout para o botão "Sair" da navbar
  window.logout = function () {
    if (typeof Auth !== 'undefined' && Auth.logout) {
      Auth.logout();
    }
    // Limpa o indicador de login
    localStorage.removeItem('pli_user_logged');
    // Redireciona para a página de login
    window.location.href = '/login.html';
  };

  // Garante que Auth está disponível no escopo global
  if (typeof Auth === 'undefined' && window.Auth) {
    var Auth = window.Auth;
  }

  // Usa o template base.html em vez do componente navbar.html
  const basePath = '/templates/base.html';
  const fallbackPath = window.location.pathname.includes('/views/')
    ? '/components/navbar.html'
    : '/components/navbar.html';

  // Tenta carregar o template base
  fetch(basePath)
    .then((response) => {
      if (!response.ok) {
        // Se falhar, tenta o fallback
        return fetch(fallbackPath);
      }
      return response;
    })
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Usa o navbar-restricted em vez de navbar-internal
      const navbar = doc.querySelector('#navbar-restricted');

      if (navbar) {
        // Onde inserir: preferir container dedicado
        const container = document.querySelector('#navbar-container');
        const wrapped = `<header class="l-header">${navbar.outerHTML}</header>`;
        if (container) {
          container.innerHTML = wrapped;
        } else {
          document.body.insertAdjacentHTML('afterbegin', wrapped);
        }
        // Garante estilos mínimos do header do base
        injectBaseHeaderStyles();
        // Preenche status da sessão e nome do usuário
        setTimeout(() => {
          let status = document.getElementById('sessionStatus');
          let userNameElement = document.querySelector('.pli-navbar__profile-name');

          // Verifica se o usuário está autenticado
          const isAuth = Auth && Auth.isAuthenticated && Auth.isAuthenticated();

          if (status) {
            status.textContent = isAuth ? 'Logado' : 'Desconectado';
            status.className = 'badge ' + (isAuth ? 'bg-success' : 'bg-danger') + ' align-middle';
          }

          if (userNameElement && isAuth) {
            const user = Auth.getUser && Auth.getUser();
            userNameElement.textContent =
              user && user.nome ? user.nome : user && user.email ? user.email : 'Usuário';
          }

          // Marca item ativo no menu
          const currentPath = window.location.pathname;
          const navLinks = document.querySelectorAll('.pli-navbar__link');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === currentPath) {
              link.classList.add('pli-navbar__link--active');
            }
          });

          // Define usuário como logado no localStorage
          if (isAuth) {
            localStorage.setItem('pli_user_logged', 'true');
          }
        }, 100);
      }
    })
    .catch((error) => console.error('Erro ao carregar navbar restrita:', error));
  // Função para carregar Bootstrap Dropdown em navbars
  function initializeBootstrapComponents() {
    if (typeof bootstrap !== 'undefined') {
      // Inicializa dropdowns
      const dropdownElements = document.querySelectorAll('.dropdown-toggle');
      dropdownElements.forEach((dropdown) => {
        new bootstrap.Dropdown(dropdown);
      });
    }
  }

  // Inicializa componentes do Bootstrap após um tempo para garantir que foram carregados
  setTimeout(initializeBootstrapComponents, 200);
})();
