// backend/src/routes/pages.js
const express = require('express');
const path = require('path');
const router = express.Router();

// Caminho para os arquivos HTML
const frontendHtmlPath = path.join(__dirname, '../../../frontend_html');

// Rota para a página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'index.html'));
});

// Rota para index.html
router.get('/index.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'index.html'));
});

// Rota para login
router.get('/login.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'login.html'));
});

// Rota para dashboard
router.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'dashboard.html'));
});

// Rota para documentos
router.get('/documents.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'documents.html'));
});

// Rota para relatórios
router.get('/reports.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'reports.html'));
});

// Rota para analytics
router.get('/analytics.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'analytics.html'));
});

// Rota para upload
router.get('/upload.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'upload.html'));
});

// Rota para demo completa
router.get('/demo_completa.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'demo_completa.html'));
});

// Rota para teste visual interativo
router.get('/teste_visual_interativo.html', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'teste_visual_interativo.html'));
});

// Rota para servir CSS e outros assets
router.get('/sistema_aplicacao_cores_pli.css', (req, res) => {
    res.sendFile(path.join(frontendHtmlPath, 'sistema_aplicacao_cores_pli.css'));
});

module.exports = router;
