/**
 * Script para carregar navbars dinamicamente nas páginas
 */

function loadNavbar(type) {
    return new Promise((resolve, reject) => {
        fetch('components/navbar.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                let navbar;
                switch (type) {
                    case 'dashboard':
                        navbar = doc.getElementById('navbar-dashboard');
                        break;
                    case 'internal':
                        navbar = doc.getElementById('navbar-internal');
                        break;
                    case 'public':
                        navbar = doc.getElementById('navbar-public');
                        break;
                    default:
                        navbar = doc.getElementById('navbar-public');
                }
                
                if (navbar) {
                    // Inserir navbar no início do body
                    document.body.insertAdjacentHTML('afterbegin', navbar.outerHTML);
                    
                    // Carregar scripts do navbar
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => {
                        const newScript = document.createElement('script');
                        newScript.textContent = script.textContent;
                        document.head.appendChild(newScript);
                    });
                    
                    resolve();
                } else {
                    reject('Navbar não encontrada');
                }
            })
            .catch(reject);
    });
}

// Função para detectar automaticamente o tipo de navbar
function autoLoadNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
        // Usuário não logado
        return loadNavbar('public');
    } else {
        // Usuário logado
        if (currentPage === 'dashboard.html') {
            return loadNavbar('dashboard');
        } else {
            return loadNavbar('internal');
        }
    }
}

// Carregar navbar automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    autoLoadNavbar().then(() => {
        console.log('Navbar carregada com sucesso');
    }).catch(error => {
        console.error('Erro ao carregar navbar:', error);
    });
});
