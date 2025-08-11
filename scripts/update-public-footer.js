/**
 * Script para aplicar o rodapé em todas as páginas HTML da pasta public
 */

const fs = require('fs');
const path = require('path');

// Diretório public
const publicDir = path.join(__dirname, '..', 'public');

// Função para processar arquivos HTML
function processHtmlFiles(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursivamente processar subdiretórios
      processHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      updateFooter(filePath);
    }
  });
}

// Função para atualizar o rodapé em um arquivo HTML
function updateFooter(filePath) {
  console.log(`Processando: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Verificar se o arquivo já tem o footer
    if (content.includes('pli-footer')) {
      console.log(`  - Já possui rodapé`);
      return;
    }

    // Remover qualquer elemento <footer> existente
    content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');

    // Adicionar o footer antes do fechamento do body
    const footer = `
    <!-- Footer -->
    <footer class="pli-footer mt-auto py-4">
        <div class="container text-center">
            <!-- Conteúdo centralizado -->
            <div class="footer-content">
                <div class="mb-1">
                    <span class="text-white">SIGMA © 2025 - Sistema Integrado de Gestão, Monitoramento e Análise</span>
                </div>
                <div class="mb-1">
                    <span class="text-white">Módulo de Gereciamento de cadastros</span>
                </div>
                <div>
                    <span class="text-white">Desenvolvido e implementado por VPC-GEOSER</span>
                </div>
            </div>
            
            <!-- Informações de sessão (apenas para usuários logados) -->
            <div class="row mt-3 d-none" id="sessionInfo">
                <div class="col-12">
                    <div class="card bg-dark border-secondary">
                        <div class="card-body py-2">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <small class="text-muted">
                                        <i class="fas fa-user me-1"></i>
                                        Usuário: <span id="footerUserName" class="text-light">-</span>
                                    </small>
                                </div>
                                <div class="col-md-4">
                                    <small class="text-muted">
                                        <i class="fas fa-clock me-1"></i>
                                        Login: <span id="loginTime" class="text-light">-</span>
                                    </small>
                                </div>
                                <div class="col-md-4 text-md-end">
                                    <small class="text-muted">
                                        <i class="fas fa-timer me-1"></i>
                                        Sessão: <span id="sessionTimer" class="text-light">-</span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <style>
    .pli-footer {
        background-color: #1a1a1a;
        color: white;
    }

    .footer-content {
        padding: 10px 0;
    }

    #sessionInfo {
        animation: slideIn 0.5s ease-in-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    </style>

    <script>
    /**
     * Inicialização do footer
     */
    document.addEventListener('DOMContentLoaded', function() {
        initializeFooter();
        updateSessionInfo();
    });

    /**
     * Inicializa componentes do footer
     */
    function initializeFooter() {
        // Verifica se o usuário está logado
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.nome) {
            document.getElementById('sessionInfo').classList.remove('d-none');
            startSessionTimer();
        }
    }

    /**
     * Atualiza informações da sessão
     */
    function updateSessionInfo() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const loginTime = localStorage.getItem('loginTime');
        
        if (user.nome) {
            document.getElementById('footerUserName').textContent = user.nome;
            
            if (loginTime) {
                const login = new Date(loginTime);
                document.getElementById('loginTime').textContent = login.toLocaleTimeString();
            }
        }
    }

    /**
     * Inicia timer da sessão
     */
    function startSessionTimer() {
        const loginTime = localStorage.getItem('loginTime');
        if (!loginTime) return;
        
        const startTime = new Date(loginTime);
        const timerElement = document.getElementById('sessionTimer');
        
        function updateTimer() {
            const now = new Date();
            const elapsed = now - startTime;
            
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            
            timerElement.textContent = \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    </script>`;

    content = content.replace(/<\/body>/i, `${footer}\n</body>`);

    // Salvar o arquivo atualizado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  - Atualizado com sucesso`);
  } catch (error) {
    console.error(`  - Erro ao processar ${filePath}:`, error.message);
  }
}

// Executar o processamento
console.log('Iniciando aplicação de rodapés na pasta public...');
processHtmlFiles(publicDir);
console.log('Aplicação de rodapés concluída!');
