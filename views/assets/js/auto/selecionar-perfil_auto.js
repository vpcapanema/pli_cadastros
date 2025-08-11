// moved from inline <script>

        // Carrega o navbar compartilhado
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/views/components/navbar.html')
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const navbar = doc.querySelector('#navbar-public');
                    document.getElementById('navbar-container').innerHTML = navbar.outerHTML;
                    
                    // Marca o link atual como ativo
                    const currentPath = window.location.pathname;
                    const filename = currentPath.split('/').pop();
                    if (filename) {
                        const navLink = document.querySelector(`#navbar-container .nav-link[href="${filename}"]`);
                        if (navLink) {
                            navLink.classList.add('active');
                        }
                    }
                })
                .catch(error => console.error('Erro ao carregar navbar:', error));
        });
    
;

        // Carrega o footer compartilhado
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/views/components/footer.html')
                .then(response => response.text())
                .then(html => {
                    document.getElementById('footer-container').innerHTML = html;
                })
                .catch(error => console.error('Erro ao carregar footer:', error));
        });
    
;

        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página selecionar-perfil');
        });
    
;

        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página selecionar-perfil');
        });
    
