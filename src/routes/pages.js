// src/routes/pages.js - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
const express = require('express');
const path = require('path');
const router = express.Router();

// Caminho para os arquivos HTML (nova estrutura)
const viewsPath = path.join(__dirname, '../../views');

// Rota para a página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'index.html'));
});

// Rota para index.html
router.get('/index.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'index.html'));
});

// Rota para login
router.get('/login.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'login.html'));
});

// Rota para dashboard
router.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'dashboard.html'));
});

// Rota para upload
router.get('/upload.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'upload.html'));
});

// Rota para pessoa física
router.get('/pessoa-fisica.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'pessoa-fisica.html'));
});

// Rota para pessoa jurídica
router.get('/pessoa-juridica.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'pessoa-juridica.html'));
});

// Rota para usuários
router.get('/usuarios.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'usuarios.html'));
});

// Rota para recuperar senha
router.get('/recuperar-senha.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'recuperar-senha.html'));
});

// Rota para demo completa
router.get('/demo_completa.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'demo_completa.html'));
});

// Rota para teste visual interativo
router.get('/teste_visual_interativo.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'teste_visual_interativo.html'));
});

// Rota para servir CSS e outros assets
router.get('/sistema_aplicacao_cores_pli.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/css/sistema_aplicacao_cores_pli.css'));
});

module.exports = router;