// src/routes/pages.js - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
const express = require('express');
const path = require('path');
const router = express.Router();

// Caminho para os arquivos HTML (nova estrutura)
const viewsPath = path.join(__dirname, '../../views');

// Rota para a página inicial: redirecionamento inteligente via JS
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Redirecionando...</title>
  <script>
    // Redireciona para dashboard se autenticado, senão para login
    (function() {
      var token = sessionStorage.getItem('pli_auth_token');
      if (token && token.length > 10) {
        window.location.replace('/dashboard.html');
      } else {
        window.location.replace('/login.html');
      }
    })();
  </script>
</head>
<body>
  <noscript>Ative o JavaScript para continuar.</noscript>
</body>
</html>`);
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

// Rota para cadastro de usuário
router.get('/cadastro-usuario.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'cadastro-usuario.html'));
});

// Rota para cadastro de usuário (sem extensão)
router.get('/cadastro-usuario', (req, res) => {
    res.sendFile(path.join(viewsPath, 'cadastro-usuario.html'));
});

// Rota para demo completa
router.get('/demo_completa.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'demo_completa.html'));
});

// Rota para teste visual interativo
router.get('/teste_visual_interativo.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'teste_visual_interativo.html'));
});



module.exports = router;