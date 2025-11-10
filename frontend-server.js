/**
 * Servidor Frontend separado para SIGMA-PLI
 * Serve apenas arquivos estáticos (HTML, CSS, JS) na porta 8001
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 8001;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'views')));

// Middleware CORS para permitir requisições do backend
app.use(cors({
  origin: [`http://localhost:${process.env.PORT || 8000}`, `http://127.0.0.1:${process.env.PORT || 8000}`],
  credentials: true
}));

// Rota para servir o index.html como página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rota catch-all para SPA (Single Page Application) - redireciona para index.html
app.get('*', (req, res) => {
  // Se for uma requisição para API, não redirecionar
  if (req.path.startsWith('/api/') || req.path.startsWith('/static/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Iniciar servidor frontend
app.listen(FRONTEND_PORT, () => {
  console.log(`🚀 Frontend Server rodando na porta ${FRONTEND_PORT}`);
  console.log(`📱 Acesse: http://localhost:${FRONTEND_PORT}`);
  console.log(`🔗 Backend API: http://localhost:${process.env.PORT || 8000}`);
});

module.exports = app;