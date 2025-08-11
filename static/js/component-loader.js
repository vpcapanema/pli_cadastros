/**
 * Component Loader para SIGMA-PLI
 * Este script carrega componentes HTML do template base para serem reutilizados em pÃ¡ginas
 */

function initComponentLoader() {
  // Encontrar todos os elementos com atributo 'include-html'
  const elements = document.querySelectorAll('[include-html]');

  elements.forEach((element) => {
    const includeValue = element.getAttribute('include-html');

    // Verifica se Ã© uma referÃªncia com ID de componente
    if (includeValue.includes('#')) {
      const [filePath, componentId] = includeValue.split('#');

      // Carregar o arquivo HTML
      fetch(filePath)
        .then((response) => response.text())
        .then((html) => {
          // Criar um DOM temporÃ¡rio para extrair o componente
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          // Encontrar o componente pelo ID
          const component = tempDiv.querySelector('#' + componentId);

          if (component) {
            // Copiar o conteÃºdo do componente para o elemento atual
            element.innerHTML = component.outerHTML;

            // Copiar os atributos do componente para o elemento atual
            for (let i = 0; i < component.attributes.length; i++) {
              const attr = component.attributes[i];
              if (attr.name !== 'id') {
                element.setAttribute(attr.name, attr.value);
              }
            }

            // Executar scripts dentro do componente carregado
            const scripts = element.querySelectorAll('script');
            scripts.forEach((script) => {
              const newScript = document.createElement('script');
              Array.from(script.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
              });
              newScript.textContent = script.textContent;
              script.parentNode.replaceChild(newScript, script);
            });
          } else {
            console.error('Componente com ID "' + componentId + '" nÃ£o encontrado em ' + filePath);
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar componente:', error);
          element.innerHTML = '<p>Erro ao carregar componente</p>';
        });
    } else {
      // Carregar arquivo HTML completo
      fetch(includeValue)
        .then((response) => response.text())
        .then((html) => {
          element.innerHTML = html;

          // Executar scripts dentro do componente carregado
          const scripts = element.querySelectorAll('script');
          scripts.forEach((script) => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
          });
        })
        .catch((error) => {
          console.error('Erro ao carregar componente:', error);
          element.innerHTML = '<p>Erro ao carregar componente</p>';
        });
    }
  });
}

// Exportar a funÃ§Ã£o para uso global
window.initComponentLoader = initComponentLoader;
