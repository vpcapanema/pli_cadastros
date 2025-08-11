// moved from inline <script>

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
            console.log('Bootstrap carregado para página recursos');
        });
    
;

        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página recursos');
        });
    
