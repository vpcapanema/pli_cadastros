/**
 * Script para redirecionar usuários não logados para páginas públicas
 */

document.addEventListener('DOMContentLoaded', function () {
  // Verifica se o usuário está logado
  function isUserLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Configura os links de navegação
  function setupNavLinks() {
    // Se o usuário não estiver logado, redireciona para páginas públicas
    if (!isUserLoggedIn()) {
      // Configura links de cadastro
      const pessoaFisicaLinks = document.querySelectorAll('a[href="pessoa-fisica.html"]');
      pessoaFisicaLinks.forEach((link) => {
        link.href = 'cadastro-pessoa-fisica.html';
      });

      const pessoaJuridicaLinks = document.querySelectorAll('a[href="pessoa-juridica.html"]');
      pessoaJuridicaLinks.forEach((link) => {
        link.href = 'cadastro-pessoa-juridica.html';
      });

      const usuariosLinks = document.querySelectorAll('a[href="usuarios.html"]');
      usuariosLinks.forEach((link) => {
        link.href = 'cadastro-usuario.html';
      });
    }
  }

  // Executa a configuração
  setupNavLinks();
});
