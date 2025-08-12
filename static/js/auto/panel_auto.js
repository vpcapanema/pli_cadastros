// moved from inline <script>

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página admin');
});

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página admin');
});

// converted from on* handlers

document.getElementById('auto_evt_0680d8d9').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      logout();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
