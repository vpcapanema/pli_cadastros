/**
 * Servidor Express para o SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Conectado ao banco de dados PostgreSQL
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, 'config/.env') });
// Validação de ambiente (falha rápida em produção)
try {
  const { validateEnv } = require('./src/config/envValidation');
  validateEnv();
} catch (e) {
  console.error('Falha na validação de ambiente:', e.message);
  process.exit(1); // Encerrar o servidor se a validação falhar
}

// Importar configurações de segurança
const {
  rateLimitConfigs,
  helmetConfig,
  corsConfig,
  xssClean,
  hppProtection,
  compressionMiddleware,
  removeXPoweredBy,
  additionalSecurity,
} = require('./src/config/security');

// Importar conexão com banco de dados
const { testConnection } = require('./src/config/database');

// Importar middlewares de auditoria e validação
const { auditMiddleware, finalizeAudit, detectSQLInjection, detectXSS } = require('./src/middleware/audit');
const sanitizeInput = require('./src/middleware/validation').sanitizeInput;

// Importar middlewares de validação e sanitização
const { preventSQLInjection } = require('./src/middleware/validation');

// Importar middlewares de tratamento de erro
const {
  handle404,
  globalErrorHandler,
  validateJSON,
  requestTimeout,
  detectBruteForce,
} = require('./src/middleware/errorHandler');

// Importar rotas
const estatisticasRoutes = require('./src/routes/estatisticas');
const pessoaFisicaRoutes = require('./src/routes/pessoaFisica');
const pessoaJuridicaRoutes = require('./src/routes/pessoaJuridica');
const usuariosRoutes = require('./src/routes/usuarios');
const authRoutes = require('./src/routes/auth');
const pagesRoutes = require('./src/routes/pages');
const adminRoutes = require('./src/routes/admin');
const apiPessoasFisicas = require('./src/routes/apiPessoasFisicas');
const apiInstituicoes = require('./src/routes/apiInstituicoes');
const routesMapRoutes = require('./src/routes/routesMap'); // Adicionar rota do mapa de rotas

const app = express();
const PORT = process.env.PORT || 8888;

// === CONFIGURAÇÕES DE SEGURANÇA (PRIMEIRA PRIORIDADE) ===

// 0. Timeout de requisições (30 segundos)
app.use(requestTimeout(30000));

// 0.1. Middlewares de auditoria (devem vir primeiro)
app.use(auditMiddleware);
app.use(finalizeAudit);

// 0.1. Detecção de ataques
app.use(detectSQLInjection);
app.use(detectXSS);

// 0.2. Sanitização e validação de entrada
app.use(sanitizeInput);
app.use(preventSQLInjection);

// 1. Remover header X-Powered-By
app.use(removeXPoweredBy);

// 2. Configurar headers de segurança com Helmet
app.use(helmetConfig);

// 3. Middleware de segurança adicional
app.use(additionalSecurity);

// 4. Configurar CORS de forma segura
app.use(cors(corsConfig));

// 5. Rate limiting geral
app.use('/api/', rateLimitConfigs.general);

// 6. Proteção XSS
app.use(xssClean);

// 7. Proteção contra HTTP Parameter Pollution
app.use(hppProtection);

// 8. Compressão de responses
app.use(compressionMiddleware);

// Tratamento para requisições automáticas do Chrome DevTools
const WELL_KNOWN_CHROME_DEVTOOLS = '/.well-known/appspecific/com.chrome.devtools.json';
// Responde 204 para requisições do Chrome DevTools
app.get(WELL_KNOWN_CHROME_DEVTOOLS, (req, res) => {
  res.status(204).end();
});

// Middleware para servir arquivos estáticos
// app.use(express.static(path.join(__dirname, 'public'))); // Removido: public não existe mais

// Servir arquivos estáticos da pasta /static corretamente
app.use('/static', express.static(path.join(__dirname, 'static')));
// Servir arquivos estáticos da pasta views (HTML)
app.use(express.static(path.join(__dirname, 'views')));

// === CONFIGURAÇÃO DO TEMPLATE ENGINE ===
// Configurar EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger detalhado
const logger = require('./src/utils/logger');
// Middleware para logar requisições detalhadamente
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { ip: req.ip, userAgent: req.headers['user-agent'] });
  if (req.method === 'POST' || req.method === 'PUT') {
    logger.debug('Body recebido', req.body);
  }
  next();
});

// Middleware para cookies (necessário para autenticação baseada em cookies)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// === RATE LIMITING ESPECÍFICO PARA ROTAS SENSÍVEIS ===

// Rate limiting para login (mais restritivo)
app.use('/api/auth/login', rateLimitConfigs.login);

// Rate limiting para rotas sensíveis
app.use(
  ['/api/auth/recuperar-senha', '/api/auth/redefinir-senha', '/api/usuarios', '/api/admin'],
  rateLimitConfigs.sensitive
);

// Registrar rotas
app.use('/api/estatisticas', estatisticasRoutes);
app.use('/api/pessoas-fisicas', apiPessoasFisicas);
app.use('/api/instituicoes', apiInstituicoes);
app.use('/api/pessoa-fisica', pessoaFisicaRoutes);
app.use('/api/pessoa-juridica', pessoaJuridicaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', require('./src/routes/sessions'));
app.use('/api/session', require('./src/routes/sessionRoutes')); // Nova rota para sessões inteligentes
app.use('/api/pages', pagesRoutes);
app.use('/api/routes', routesMapRoutes); // Adicionar rota do mapa de rotas

// Log de rotas registradas
logger.info('Rotas registradas:');
logger.info('- /api/estatisticas');
logger.info('- /api/pessoa-fisica');
logger.info('- /api/pessoa-juridica');
logger.info('- /api/usuarios');
logger.info('- /api/auth');
logger.info('- /api/sessions');
logger.info('- /api/pages');
logger.info('- /api/documents');
logger.info('- /api/pages');

// Rotas para páginas administrativas protegidas
app.use('/admin', adminRoutes);

// === ESTRUTURA DE ROTAS ORGANIZADA ===
//
// 1. /api/*          - Rotas que retornam JSON (APIs)
// 2. /pages/*         - Páginas HTML estáticas (sendFile)
// 3. /templates/*     - Templates EJS renderizados (render)
// 4. Rotas diretas    - Compatibilidade com URLs existentes
//

// === ROTAS PARA PÁGINAS HTML ESTÁTICAS ===
// Todas as rotas que servem arquivos HTML estáticos

// Rota para a página inicial: serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'index.html'));
});

// Rota específica para /index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'index.html'));
});

// Rota para o mapa visual de rotas
app.get('/routes', (req, res) => {
  res.sendFile(path.join(__dirname, 'mapa-de-rotas.html'));
});

// === PÁGINAS PÚBLICAS (HTML estático) ===
app.get('/pages/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'login.html'));
});

app.get('/pages/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'admin-login.html'));
});

app.get('/pages/cadastro-usuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-usuario.html'));
});

app.get('/pages/cadastro-pessoa-fisica', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-pessoa-fisica.html'));
});

app.get('/pages/cadastro-pessoa-juridica', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-pessoa-juridica.html'));
});

app.get('/pages/recuperar-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'recuperar-senha.html'));
});

app.get('/pages/sobre', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'sobre.html'));
});

app.get('/pages/recursos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'recursos.html'));
});

app.get('/pages/acesso-negado', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'acesso-negado.html'));
});

app.get('/pages/email-verificado', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'email-verificado.html'));
});

app.get('/pages/selecionar-perfil', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'selecionar-perfil.html'));
});

// === PÁGINAS DA APLICAÇÃO AUTENTICADA (HTML estático) ===
app.get('/pages/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'dashboard.html'));
});

app.get('/pages/pessoa-fisica', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'pessoa-fisica.html'));
});

app.get('/pages/pessoa-juridica', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'pessoa-juridica.html'));
});

app.get('/pages/meus-dados', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'meus-dados.html'));
});

app.get('/pages/sessions-manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'sessions-manager.html'));
});

app.get('/pages/solicitacoes-cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'solicitacoes-cadastro.html'));
});

app.get('/pages/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'usuarios.html'));
});

// === PÁGINAS ADMINISTRATIVAS (HTML estático) ===
app.get('/pages/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

app.get('/pages/admin/panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

// === COMPONENTES (HTML estático) ===
app.get('/pages/components/footer', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'components', 'footer.html'));
});

app.get('/pages/components/navbar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'components', 'navbar.html'));
});

// === ROTAS DE COMPATIBILIDADE (mantém URLs existentes) ===
// Redireciona URLs antigas para as novas organizadas
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'login.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'admin-login.html'));
});

app.get('/cadastro-usuario.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-usuario.html'));
});

app.get('/cadastro-usuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-usuario.html'));
});

app.get('/cadastro-pessoa-fisica.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-pessoa-fisica.html'));
});

app.get('/cadastro-pessoa-juridica.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'cadastro-pessoa-juridica.html'));
});

app.get('/recuperar-senha.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'recuperar-senha.html'));
});

app.get('/sobre.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'sobre.html'));
});

app.get('/recursos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'recursos.html'));
});

app.get('/acesso-negado.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'acesso-negado.html'));
});

app.get('/email-verificado.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'email-verificado.html'));
});

app.get('/selecionar-perfil.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'public', 'selecionar-perfil.html'));
});

// === PÁGINAS DA APLICAÇÃO (AUTENTICADAS) ===
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'dashboard.html'));
});

app.get('/pessoa-fisica.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'pessoa-fisica.html'));
});

app.get('/pessoa-juridica.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'pessoa-juridica.html'));
});

app.get('/meus-dados.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'meus-dados.html'));
});

app.get('/sessions-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'sessions-manager.html'));
});

app.get('/solicitacoes-cadastro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'solicitacoes-cadastro.html'));
});

app.get('/usuarios.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app', 'usuarios.html'));
});

// === PÁGINAS ADMINISTRATIVAS ===
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

app.get('/admin/panel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

// === COMPONENTES ===
// === COMPONENTES ===
app.get('/components/footer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'components', 'footer.html'));
});

app.get('/components/navbar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'components', 'navbar.html'));
});

// =====================================================
// === ROTAS DE TEMPLATES EJS (RENDERIZAÇÃO DINÂMICA) ===
// =====================================================
// Todas essas rotas usam res.render() e retornam HTML renderizado
// com dados dinâmicos usando o template engine EJS

// === TEMPLATE BASE E EXEMPLOS ===
// Rota de teste simples para verificar EJS
app.get('/templates/test', (req, res) => {
  try {
    res.render('templates/test-simple', {
      title: 'Teste EJS',
      message: 'Se você está vendo esta mensagem, o EJS está funcionando!',
    });
  } catch (error) {
    console.error('Erro no template test:', error);
    res.status(500).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro - Template Test</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; }
                    .error { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
                    .error h1 { color: #dc3545; }
                    pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Erro no Template Test</h1>
                    <p><strong>Mensagem:</strong> ${error.message}</p>
                    <p><a href="/health">← Voltar ao Status do Sistema</a></p>
                </div>
            </body>
            </html>
        `);
  }
});

// Rota para visualizar o template base
app.get('/templates/base', (req, res) => {
  try {
    res.render('templates/base', {
      page_title: 'Template Base',
      body_class: 'page-template-base',
      public_navbar_display: 'block',
      restricted_navbar_display: 'none',
      user_name: '',
      system_version: '1.0.0',
      breadcrumb_content: `
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/">Início</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Template Base</li>
                </ol>
            </nav>
        `,
      alerts_content: `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Template Base carregado com sucesso!</strong> Este é o template principal do sistema PLI.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `,
      main_content: `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="text-center mb-5">
                            <h1 class="display-4 fw-bold text-pli-azul-escuro">
                                <i class="fas fa-layer-group me-3"></i>
                                Template Base PLI
                            </h1>
                            <p class="lead text-muted">
                                Este é o template base do sistema SIGMA/PLI. Ele contém a estrutura padrão com header fixo, body dinâmico e footer fixo.
                            </p>
                        </div>
                        
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="card text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-header fa-3x text-primary mb-3"></i>
                                        <h5 class="card-title">Header Fixo</h5>
                                        <p class="card-text">Navegação consistente com navbar duplo (público/restrito)</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-window-maximize fa-3x text-success mb-3"></i>
                                        <h5 class="card-title">Body Dinâmico</h5>
                                        <p class="card-text">Conteúdo adaptável com suporte a breadcrumb e alertas</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-shoe-prints fa-3x text-info mb-3"></i>
                                        <h5 class="card-title">Footer Fixo</h5>
                                        <p class="card-text">Informações do sistema e status em tempo real</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-center mt-5">
                            <a href="/templates/example" class="btn btn-primary btn-lg me-3">
                                <i class="fas fa-eye me-2"></i>Ver Exemplo de Uso
                            </a>
                            <a href="/templates/login-demo" class="btn btn-outline-secondary btn-lg">
                                <i class="fas fa-sign-in-alt me-2"></i>Demo Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `,
      additional_css: `
            <style>
                .card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--pli-shadow-lg);
                }
            </style>
        `,
    });
  } catch (error) {
    console.error('Erro no template base:', error);
    res.status(500).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Erro - Template Base | SIGMA/PLI</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                <style>
                    body { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); min-height: 100vh; }
                    .error-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
                    .error-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
                    .error-header { background: #dc3545; color: white; padding: 1.5rem; border-radius: 12px 12px 0 0; }
                    .error-body { padding: 2rem; }
                    .error-details { background: #f8f9fa; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
                    pre { font-size: 0.9rem; max-height: 300px; overflow-y: auto; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <div class="error-card">
                        <div class="error-header">
                            <h1><i class="fas fa-exclamation-triangle me-2"></i>Erro no Template Base</h1>
                            <p class="mb-0">Ocorreu um erro ao renderizar o template base do sistema PLI</p>
                        </div>
                        <div class="error-body">
                            <div class="alert alert-danger">
                                <h5><i class="fas fa-bug me-2"></i>Detalhes do Erro:</h5>
                                <p><strong>Mensagem:</strong> ${error.message}</p>
                            </div>
                            
                            <div class="error-details">
                                <h6><i class="fas fa-code me-2"></i>Stack Trace:</h6>
                                <pre>${error.stack}</pre>
                            </div>
                            
                            <div class="mt-4">
                                <h6><i class="fas fa-tools me-2"></i>Ações Disponíveis:</h6>
                                <div class="d-flex gap-2 flex-wrap">
                                    <a href="/templates/test" class="btn btn-primary">
                                        <i class="fas fa-vial me-1"></i>Testar Template Simples
                                    </a>
                                    <a href="/health" class="btn btn-info">
                                        <i class="fas fa-heartbeat me-1"></i>Status do Sistema
                                    </a>
                                    <a href="/routes/docs" class="btn btn-secondary" target="_blank">
                                        <i class="fas fa-book me-1"></i>Documentação das Rotas
                                    </a>
                                    <a href="/" class="btn btn-outline-primary">
                                        <i class="fas fa-home me-1"></i>Página Inicial
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
  }
});

// Rota para o exemplo de uso do template
app.get('/templates/example', (req, res) => {
  try {
    res.render('templates/example-usage');
  } catch (error) {
    console.error('Erro no template example:', error);
    res.status(500).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro - Template Example | SIGMA/PLI</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4><i class="fas fa-exclamation-triangle me-2"></i>Erro no Template Example</h4>
                        <p>Mensagem: ${error.message}</p>
                        <hr>
                        <a href="/templates/base" class="btn btn-primary">← Voltar ao Template Base</a>
                        <a href="/templates/test" class="btn btn-outline-secondary">Testar Template Simples</a>
                    </div>
                </div>
            </body>
            </html>
        `);
  }
});

// Rota para demonstração de login com navbar restrito
app.get('/templates/login-demo', (req, res) => {
  try {
    res.render('templates/base', {
      page_title: 'Demo Login',
      body_class: 'page-login-demo',
      public_navbar_display: 'none',
      restricted_navbar_display: 'block',
      user_name: 'João Silva',
      system_version: '1.0.0',
      breadcrumb_content: `
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/">Início</a></li>
                    <li class="breadcrumb-item"><a href="/templates/base">Templates</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Demo Login</li>
                </ol>
            </nav>
        `,
      alerts_content: `
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <i class="fas fa-user-check me-2"></i>
                <strong>Usuário logado:</strong> Esta é a visualização com navbar restrito para usuários autenticados.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `,
      main_content: `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-10">
                        <div class="text-center mb-5">
                            <h1 class="display-4 fw-bold text-pli-azul-escuro">
                                <i class="fas fa-user-shield me-3"></i>
                                Área Restrita - Demo
                            </h1>
                            <p class="lead text-muted">
                                Demonstração do template base com navbar restrito para usuários autenticados.
                            </p>
                        </div>
                        
                        <div class="row g-4">
                            <div class="col-lg-3 col-md-6">
                                <div class="card bg-primary text-white">
                                    <div class="card-body text-center">
                                        <i class="fas fa-tachometer-alt fa-3x mb-3"></i>
                                        <h5 class="card-title">Dashboard</h5>
                                        <p class="card-text">Painel principal do sistema</p>
                                        <a href="/dashboard.html" class="btn btn-light">Acessar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card bg-success text-white">
                                    <div class="card-body text-center">
                                        <i class="fas fa-users fa-3x mb-3"></i>
                                        <h5 class="card-title">Cadastros</h5>
                                        <p class="card-text">Gestão de pessoas físicas e jurídicas</p>
                                        <a href="/pessoa-fisica.html" class="btn btn-light">Acessar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card bg-warning text-white">
                                    <div class="card-body text-center">
                                        <i class="fas fa-cogs fa-3x mb-3"></i>
                                        <h5 class="card-title">Gerencial</h5>
                                        <p class="card-text">Usuários e solicitações</p>
                                        <a href="/usuarios.html" class="btn btn-light">Acessar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <div class="card bg-info text-white">
                                    <div class="card-body text-center">
                                        <i class="fas fa-user-edit fa-3x mb-3"></i>
                                        <h5 class="card-title">Perfil</h5>
                                        <p class="card-text">Meus dados e configurações</p>
                                        <a href="/meus-dados.html" class="btn btn-light">Acessar</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-5">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">
                                        <i class="fas fa-bell me-2"></i>
                                        Notificações Recentes
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <div class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-user-plus text-success me-2"></i>
                                                Nova solicitação de cadastro
                                            </div>
                                            <small class="text-muted">2 min atrás</small>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-check-circle text-info me-2"></i>
                                                Cadastro aprovado
                                            </div>
                                            <small class="text-muted">15 min atrás</small>
                                        </div>
                                        <div class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fas fa-sync text-warning me-2"></i>
                                                Sistema atualizado
                                            </div>
                                            <small class="text-muted">1 hora atrás</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-center mt-5">
                            <a href="/templates/base" class="btn btn-outline-primary me-3">
                                <i class="fas fa-arrow-left me-2"></i>Voltar ao Template Base
                            </a>
                            <button type="button" class="btn btn-outline-secondary" onclick="toggleNavbar(false)">
                                <i class="fas fa-exchange-alt me-2"></i>Alternar para Navbar Público
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,
      additional_css: `
            <style>
                .card {
                    transition: all 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--pli-shadow-lg);
                }
                .list-group-item {
                    border-left: none;
                    border-right: none;
                }
                .list-group-item:first-child {
                    border-top: none;
                }
                .list-group-item:last-child {
                    border-bottom: none;
                }
            </style>
        `,
    });
  } catch (error) {
    console.error('Erro no template login-demo:', error);
    res.status(500).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro - Login Demo | SIGMA/PLI</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4><i class="fas fa-exclamation-triangle me-2"></i>Erro no Login Demo</h4>
                        <p>Mensagem: ${error.message}</p>
                        <hr>
                        <a href="/templates/base" class="btn btn-primary">← Voltar ao Template Base</a>
                        <a href="/templates/test" class="btn btn-outline-secondary">Testar Template Simples</a>
                    </div>
                </div>
            </body>
            </html>
        `);
  }
});

// Adicionando rotas para servir HTML estático das páginas base.html e example-usage.html
app.get('/templates/base.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'templates', 'base.html'));
});
app.get('/templates/example-usage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'templates', 'example-usage.html'));
});

// =====================================================
// === ROTAS ESPECIAIS E DEMONSTRAÇÃO ===
// =====================================================

// Rota para API de verificação de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema operacional' });
});

// === ROTA DE DOCUMENTAÇÃO DA ESTRUTURA ===
app.get('/routes/docs', (req, res) => {
  res.json({
    message: 'Documentação da estrutura de rotas do sistema PLI',
    structure: {
      api_routes: {
        description: 'Rotas que retornam JSON (APIs)',
        pattern: '/api/*',
        examples: ['/api/auth/login', '/api/usuarios', '/api/pessoa-fisica', '/api/health'],
      },
      page_routes: {
        description: 'Páginas HTML estáticas (sendFile)',
        pattern: '/pages/*',
        examples: ['/pages/login', '/pages/dashboard', '/pages/cadastro-usuario'],
      },
      template_routes: {
        description: 'Templates EJS renderizados dinamicamente (render)',
        pattern: '/templates/*',
        examples: ['/templates/base', '/templates/example', '/templates/login-demo'],
      },
      compatibility_routes: {
        description: 'URLs antigas mantidas para compatibilidade',
        note: 'Redirecionam para as novas estruturas organizadas',
        examples: ['/login.html → arquivo estático', '/template/base → redireciona para /templates/base'],
      },
    },
    rules: [
      'Rotas /api/* SEMPRE retornam JSON',
      'Rotas /pages/* SEMPRE servem HTML estático',
      'Rotas /templates/* SEMPRE renderizam EJS',
      'Nunca misturar JSON e HTML na mesma rota',
    ],
  });
});

// Rota para verificação de saúde em HTML (para browsers)
app.get('/health', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Sistema PLI - Status</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .status { color: green; font-size: 24px; }
            </style>
        </head>
        <body>
            <h1>SIGMA/PLI Sistema</h1>
            <p class="status">✅ Sistema operacional</p>
            <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
            <p><a href="/routes/docs">📋 Ver documentação das rotas (JSON)</a></p>
            <p><a href="/templates/base">🎨 Ver template base</a></p>
        </body>
        </html>
    `);
});

// Rota para API de verificação de saúde do banco de dados
app.get('/api/health/database', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ status: 'ok', message: 'Banco de dados conectado' });
    } else {
      res.status(500).json({ status: 'error', message: 'Falha na conexão com o banco de dados' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: `Erro: ${error.message}` });
  }
});

// === TRATAMENTO DE ERROS E SEGURANÇA FINAL ===

// Middleware para validação de JSON
app.use(validateJSON);

// Middleware para detectar brute force
app.use(detectBruteForce);

// Middleware para rotas não encontradas (404)
app.use(handle404);

// Middleware global de tratamento de erros
app.use(globalErrorHandler);

// Iniciar o servidor
app.listen(PORT, async () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Acesse: http://localhost:${PORT}`);
  // Abrir páginas no Chrome automaticamente
  try {
    exec(`start chrome http://localhost:${PORT}/index.html`);
    exec(`start chrome http://localhost:${PORT}/login.html`);
  } catch (err) {
    logger.warn('Falha ao abrir o browser:', err.message);
  }

  // Testar conexão com o banco de dados
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      logger.info('✅ Conexão com o banco de dados estabelecida!');

      // Inicializar jobs de manutenção de sessões
      try {
        const sessionJobs = require('./src/jobs/sessionJobs');
        sessionJobs.iniciarJobs();
        logger.info('🔄 Jobs de manutenção de sessões iniciados');
      } catch (jobError) {
        logger.warn('⚠️ Aviso: Jobs de sessão não iniciados:', jobError.message);
      }
    } else {
      logger.warn('❌ AVISO: Não foi possível conectar ao banco de dados.');
    }
  } catch (error) {
    logger.error('❌ ERRO ao conectar com o banco de dados', { error: error.message });
  }
});

// Tratamento para encerramento gracioso do servidor
process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM. Encerrando servidor...');

  try {
    const sessionJobs = require('./src/jobs/sessionJobs');
    sessionJobs.pararJobs();
    logger.info('🛑 Jobs de manutenção de sessões finalizados');
  } catch (error) {
    logger.warn('Erro ao finalizar jobs:', error.message);
  }

  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recebido SIGINT. Encerrando servidor...');

  try {
    const sessionJobs = require('./src/jobs/sessionJobs');
    sessionJobs.pararJobs();
    logger.info('🛑 Jobs de manutenção de sessões finalizados');
  } catch (error) {
    logger.warn('Erro ao finalizar jobs:', error.message);
  }

  process.exit(0);
});
