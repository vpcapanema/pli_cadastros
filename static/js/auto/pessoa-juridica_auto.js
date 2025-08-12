// moved from inline <script>

// Inicializa scripts específicos da página pessoa-juridica
DataTableScriptLoader.initDataTableScripts(['/static/js/pages/pessoa-juridica.js'])
  .then(() => {
    console.log('Página pessoa-juridica inicializada com sucesso');
  })
  .catch((error) => {
    console.error('Erro na inicialização da página pessoa-juridica:', error);
  });

// Inicializa scripts específicos da página pessoa-juridica
DataTableScriptLoader.initDataTableScripts(['/static/js/pages/pessoa-juridica.js'])
  .then(() => {
    console.log('Página pessoa-juridica inicializada com sucesso');
  })
  .catch((error) => {
    console.error('Erro na inicialização da página pessoa-juridica:', error);
  });

// converted from on* handlers

document.getElementById('auto_evt_de1c5ce3').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      aplicarFiltrosPJ();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.getElementById('auto_evt_207ff879').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      limparFiltrosPJ();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
