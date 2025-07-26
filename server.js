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

// Importar conexão com banco de dados
const { testConnection } = require('./src/config/database');

// Importar rotas
const estatisticasRoutes = require('./src/routes/estatisticas');
const pessoaFisicaRoutes = require('./src/routes/pessoaFisica');
const pessoaJuridicaRoutes = require('./src/routes/pessoaJuridica');
const usuariosRoutes = require('./src/routes/usuarios');
const authRoutes = require('./src/routes/auth');
const pagesRoutes = require('./src/routes/pages');
const adminRoutes = require('./src/routes/adminRoutes');
const apiPessoasFisicas = require('./src/routes/apiPessoasFisicas');
const apiInstituicoes = require('./src/routes/apiInstituicoes');

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware para CORS
app.use(cors());

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

// Middleware para logar requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body));
    }
    next();
});

// Middleware para cookies (necessário para autenticação baseada em cookies)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Registrar rotas
app.use('/api/estatisticas', estatisticasRoutes);
app.use('/api/pessoas-fisicas', apiPessoasFisicas);
app.use('/api/instituicoes', apiInstituicoes);
app.use('/api/pessoa-fisica', pessoaFisicaRoutes);
app.use('/api/pessoa-juridica', pessoaJuridicaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pages', pagesRoutes);

// Log de rotas registradas
console.log('Rotas registradas:');
console.log('- /api/estatisticas');
console.log('- /api/pessoa-fisica');
console.log('- /api/pessoa-juridica');
console.log('- /api/usuarios');
console.log('- /api/auth');
console.log('- /api/documents');
console.log('- /api/pages');

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

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar o servidor
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    
    // Testar conexão com o banco de dados
    try {
        const isConnected = await testConnection();
        if (isConnected) {
            console.log('✅ Conexão com o banco de dados estabelecida!');
        } else {
            console.log('❌ AVISO: Não foi possível conectar ao banco de dados.');
        }
    } catch (error) {
        console.error('❌ ERRO ao conectar com o banco de dados:', error.message);
    }
});