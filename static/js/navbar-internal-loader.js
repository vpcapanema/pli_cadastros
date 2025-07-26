// Loader dedicado para navbar interna/restrita
// Insere apenas a #navbar-internal do arquivo de componentes
(function() {
    let navbarPath = window.location.pathname.includes('/views/') ? '/views/components/navbar.html' : 'components/navbar.html';
    fetch(navbarPath)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const navbar = doc.getElementById('navbar-internal');
            if (navbar) {
                document.body.insertAdjacentHTML('afterbegin', navbar.outerHTML);
            }
        })
        .catch(error => console.error('Erro ao carregar navbar interna:', error));
})();
