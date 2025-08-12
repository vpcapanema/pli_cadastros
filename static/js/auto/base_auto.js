// moved from inline <script>

// Toggle entre navbars baseado no estado de login
function toggleNavbar(isLoggedIn) {
  const publicNavbar = document.getElementById('navbar-public');
  const restrictedNavbar = document.getElementById('navbar-restricted');

  if (isLoggedIn) {
    publicNavbar.style.display = 'none';
    restrictedNavbar.style.display = 'block';
  } else {
    publicNavbar.style.display = 'block';
    restrictedNavbar.style.display = 'none';
  }
}

// Função para atualizar o status do sistema
function updateSystemStatus(status = 'online') {
  const statusIndicator = document.querySelector('.pli-footer__status-indicator');
  const statusText = document.querySelector('.pli-footer__status span:last-child');

  if (statusIndicator && statusText) {
    statusIndicator.className = 'pli-footer__status-indicator';

    switch (status) {
      case 'online':
        statusIndicator.classList.add('pli-footer__status-indicator--online');
        statusText.textContent = 'Sistema Online';
        break;
      case 'warning':
        statusIndicator.classList.add('pli-footer__status-indicator--warning');
        statusText.textContent = 'Manutenção Programada';
        break;
      case 'error':
        statusIndicator.classList.add('pli-footer__status-indicator--error');
        statusText.textContent = 'Sistema Instável';
        break;
    }
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  // Verificar estado de login e ajustar navbar
  const isLoggedIn = localStorage.getItem('pli_user_logged') === 'true';
  toggleNavbar(isLoggedIn);

  // Atualizar status do sistema
  updateSystemStatus('online');

  // Adicionar classe ativa no link atual
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.pli-navbar__link');
  navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('pli-navbar__link--active');
    }
  });
});
