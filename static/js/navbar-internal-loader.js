// Loader dedicado para navbar interna/restrita
// Insere apenas a #navbar-internal do arquivo de componentes
(function() {
    // Função global de logout para o botão "Sair" da navbar
    window.logout = function() {
        if (typeof Auth !== 'undefined' && Auth.logout) {
            Auth.logout();
        }
        // Redireciona para a página de login
        window.location.href = '/login.html';
    };
    // Garante que Auth está disponível no escopo global
    if (typeof Auth === 'undefined' && window.Auth) {
        var Auth = window.Auth;
    }
    let navbarPath = window.location.pathname.includes('/views/') ? '/views/components/navbar.html' : 'components/navbar.html';
    fetch(navbarPath)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const navbar = doc.getElementById('navbar-internal');
            if (navbar) {
                document.body.insertAdjacentHTML('afterbegin', navbar.outerHTML);
                // Preenche status da sessão e nome do usuário
                setTimeout(() => {
                    let status = document.getElementById('sessionStatus');
                    let userName = document.getElementById('userName');
                    if (status) {
                        status.textContent = Auth && Auth.isAuthenticated() ? 'Logado' : 'Desconectado';
                        status.className = 'badge ' + (Auth && Auth.isAuthenticated() ? 'bg-success' : 'bg-danger') + ' align-middle';
                    }
                    if (userName && Auth && Auth.isAuthenticated()) {
                        const user = Auth.getUser && Auth.getUser();
                        userName.textContent = user && user.nome ? user.nome : (user && user.email ? user.email : 'Usuário');
                    }
                }, 100);
            }
        })
        .catch(error => console.error('Erro ao carregar navbar interna:', error));
})();
