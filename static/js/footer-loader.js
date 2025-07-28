/**
 * Script para carregar o footer dinamicamente nas páginas
 */

function loadFooter() {
    return new Promise((resolve, reject) => {
        fetch('/components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const footerContainer = document.getElementById('footer-container');
                if (footerContainer) {
                    footerContainer.innerHTML = html;
                    resolve();
                } else {
                    reject('Container #footer-container não encontrado');
                }
            })
            .catch(reject);
    });
}

// Carregar footer automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadFooter().then(() => {
        console.log('Footer carregado com sucesso');
    }).catch(error => {
        console.error('Erro ao carregar footer:', error);
    });
});