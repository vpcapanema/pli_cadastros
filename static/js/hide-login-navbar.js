// Esconde o botão de login da navbar se o usuário já estiver autenticado
(function() {
    var token = localStorage.getItem('pli_auth_token');
    if (token && token.length > 10) {
        var loginBtn = document.querySelector('a[href="/login.html"]');
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
    }
})();
