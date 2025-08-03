/**
 * Servidor Express para o SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Conectado ao banco de dados PostgreSQL
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, 'config/.env') });

// Importar configurações de segurança
const {
  rateLimitConfigs,
  helmetConfig,
  corsConfig,
  xssClean,
  hppProtection,
  compressionMiddleware,
  removeXPoweredBy,
  additionalSecurity
} = require('./src/config/security');

// Importar conexão com banco de dados
const { testConnection } = require('./src/config/database');

// Importar middlewares de auditoria e validação
const { 
  auditMiddleware, 
  finalizeAudit, 
  detectSQLInjection, 
  detectXSS 
} = require('./src/middleware/audit');

// Importar middlewares de validação e sanitização
const { 
  sanitizeInput, 
  preventSQLInjection 
} = require('./src/middleware/validation');

// Importar middlewares de tratamento de erro
const { 
  handle404, 
  globalErrorHandler, 
  validateJSON, 
  requestTimeout, 
  detectBruteForce 
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
app.use([
  '/api/auth/recuperar-senha',
  '/api/auth/redefinir-senha',
  '/api/usuarios',
  '/api/admin'
], rateLimitConfigs.sensitive);

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


// Rota para a página inicial: serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rota explícita para login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Rota explícita para admin-login.html
app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// Rota explícita para login-variants.html (demonstração)
app.get('/login-variants.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-variants.html'));
});

// Rota explícita para dashboard.html
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Rotas para servir os componentes footer.html e navbar.html diretamente
app.get('/components/footer.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'components', 'footer.html'));
});

app.get('/components/navbar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'components', 'navbar.html'));
});

// Rota para API de verificação de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sistema operacional' });
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

// Rotas adicionais para páginas (acesso direto)
app.get('/cadastro-usuario.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastro-usuario.html'));
});

app.get('/cadastro-usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastro-usuario.html'));
});

app.get('/pessoa-fisica.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pessoa-fisica.html'));
});

app.get('/pessoa-juridica.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pessoa-juridica.html'));
});

app.get('/usuarios.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'usuarios.html'));
});

app.get('/recuperar-senha.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'recuperar-senha.html'));
});

app.get('/email-verificado.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'email-verificado.html'));
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