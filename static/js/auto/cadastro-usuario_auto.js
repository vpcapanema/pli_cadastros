// moved from inline <script>

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página cadastro-usuario');
});

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página cadastro-usuario');
});

// converted from on* handlers

document.getElementById('auto_evt_898c1af1').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      window.location.href = 'index.html';
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
