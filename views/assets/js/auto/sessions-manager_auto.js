// moved from inline <script>

        // Inicializa scripts específicos da página sessions-manager
        DataTableScriptLoader.initDataTableScripts([
            '/static/js/pages/sessions-manager.js'
        ]).then(() => {
            console.log('Página sessions-manager inicializada com sucesso');
        }).catch(error => {
            console.error('Erro na inicialização da página sessions-manager:', error);
        });
    
;

        // Inicializa scripts específicos da página sessions-manager
        DataTableScriptLoader.initDataTableScripts([
            '/static/js/pages/sessions-manager.js'
        ]).then(() => {
            console.log('Página sessions-manager inicializada com sucesso');
        }).catch(error => {
            console.error('Erro na inicialização da página sessions-manager:', error);
        });
    
// converted from on* handlers

document.getElementById("auto_evt_fb0076a4").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ sessionsManager.refreshStats() }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});


document.getElementById("auto_evt_14965b10").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ sessionsManager.cleanExpiredSessions() }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});


document.getElementById("auto_evt_c80c3a47").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ sessionsManager.applyFilters() }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});
