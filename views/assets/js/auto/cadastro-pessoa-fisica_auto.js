// moved from inline <script>

        // Carrega o footer compartilhado
        document.addEventListener('DOMContentLoaded', function() {
            fetch('/components/footer.html')
                .then(response => response.text())
                .then(html => {
                    document.getElementById('footer-container').innerHTML = html;
                })
                .catch(error => console.error('Erro ao carregar footer:', error));
        });
    
;

        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página cadastro-pessoa-fisica');
        });
    
;

        // Garante carregamento do Bootstrap
        PLIScriptLoader.ensureBootstrap().then(() => {
            console.log('Bootstrap carregado para página cadastro-pessoa-fisica');
        });
    
// converted from on* handlers

document.getElementById("auto_evt_898c1af1").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ window.location.href='index.html' }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});
