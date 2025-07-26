// Controle de acesso para páginas restritas SIGMA-PLI
// Redireciona para login se não houver token de autenticação válido
(function() {
    function getToken() {
        // Agora o token é salvo em sessionStorage para expirar ao fechar a aba
        return sessionStorage.getItem('pli_auth_token');
    }

    function isAuthenticated() {
        // Aqui pode-se adicionar lógica extra de validação do token
        var token = getToken();
        return !!token && token.length > 10; // Ajuste conforme o padrão do seu token
    }

    if (!isAuthenticated()) {
        // Redireciona para a página de login
        window.location.href = '/login.html?next=' + encodeURIComponent(window.location.pathname);
    }
})();
