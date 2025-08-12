// moved from inline <script>

// Inicializa scripts específicos da página pessoa-fisica
DataTableScriptLoader.initDataTableScripts(['/static/js/pages/pessoa-fisica.js'])
  .then(() => {
    console.log('Página pessoa-fisica inicializada com sucesso');
  })
  .catch((error) => {
    console.error('Erro na inicialização da página pessoa-fisica:', error);
  });

// converted from on* handlers

document.getElementById('auto_evt_28e381f9').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      aplicarFiltros();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.getElementById('auto_evt_0143508e').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      limparFiltros();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
