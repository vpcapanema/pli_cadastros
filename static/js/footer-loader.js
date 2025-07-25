/**
 * Script para carregar o footer dinamicamente nas páginas
 */

function loadFooter() {
    return new Promise((resolve, reject) => {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extrair o elemento footer
                const footer = doc.querySelector('footer');
                
                if (footer) {
                    // Inserir footer no final do body
                    document.body.insertAdjacentHTML('beforeend', footer.outerHTML);
                    
                    // Carregar scripts do footer
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => {
                        const newScript = document.createElement('script');
                        newScript.textContent = script.textContent;
                        document.head.appendChild(newScript);
                    });
                    
                    // Carregar estilos do footer
                    const styles = doc.querySelectorAll('style');
                    styles.forEach(style => {
                        const newStyle = document.createElement('style');
                        newStyle.textContent = style.textContent;
                        document.head.appendChild(newStyle);
                    });
                    
                    resolve();
                } else {
                    reject('Footer não encontrado');
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