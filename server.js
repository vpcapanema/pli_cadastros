// server.js - PLI Cadastros Centralizado
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, 'config/.env') });

// Importar configurações
const getCorsConfig = require('./src/config/cors');
const { pool, testConnection } = require('./src/config/database');

// Importar middlewares
const { verifyToken } = require('./src/middleware/auth');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 8888;

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por windowMs
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});
app.use('/api/', limiter);

// Middlewares básicos
app.use(cors(getCorsConfig()));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Middleware para adicionar pool de conexão às requisições
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API PLI Cadastros funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API (serão adicionadas conforme desenvolvimento)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/usuarios', verifyToken, require('./src/routes/usuarios'));
app.use('/api/pessoa-fisica', verifyToken, require('./src/routes/pessoaFisica'));
app.use('/api/pessoa-juridica', verifyToken, require('./src/routes/pessoaJuridica'));
app.use('/api/documents', require('./src/routes/documents'));
app.use('/api/estatisticas', require('./src/routes/estatisticas'));

// Rotas para servir páginas HTML
app.use('/', require('./src/routes/pages'));

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe nesta API`
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    console.log('Conexão com banco de dados estabelecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor PLI Cadastros rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API test: http://localhost:${PORT}/api/test`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais de terminação
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  pool.end(() => {
    console.log('Pool de conexões fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  pool.end(() => {
    console.log('Pool de conexões fechado');
    process.exit(0);
  });
});

// Iniciar servidor
startServer();

module.exports = app;