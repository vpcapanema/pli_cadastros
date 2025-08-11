// moved from inline <script>

// Inicializa scripts específicos da página de usuários
DataTableScriptLoader.initUsuariosPage()
  .then(() => {
    console.log('Página de usuários inicializada com sucesso');
  })
  .catch((error) => {
    console.error('Erro na inicialização da página de usuários:', error);
  });

// converted from on* handlers

document.getElementById('auto_evt_42d33e56').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      aplicarFiltrosUsuarios();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.getElementById('auto_evt_015f0f39').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      limparFiltrosUsuarios();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
