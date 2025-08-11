# 📋 Guia de Estrutura para Páginas HTML - SIGATA

## 🎯 Objetivo

Este documento serve como template/orientação para criar novas páginas HTML no sistema SIGATA, mantendo a consistência visual e estrutural com as páginas existentes (`index.html` e `login.html`).

---

## 📂 Arquivos Base de Referência

- **Página Principal**: `index.html` - Layout de dashboard/landing page
- **Página de Login**: `login.html` - Layout de formulário centrado
- **CSS Principal**: `sistema_aplicacao_cores_pli.css` - Sistema de cores PLI

---

## 🏗️ Estrutura Base HTML

### 1. DOCTYPE e Head Padrão

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[NOME_DA_PAGINA] - SIGATA</title>

    <!-- Bootstrap 5.1.3 -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />

    <!-- Font Awesome 6.0.0 -->
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      rel="stylesheet"
    />

    <!-- Google Fonts - Montserrat -->
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <!-- CSS PLI Obrigatório -->
    <link rel="stylesheet" href="sistema_aplicacao_cores_pli.css" />
  </head>
</html>
```

### 2. Navegação Padrão

```html
<nav class="navbar navbar-expand-lg pli-navbar">
  <div class="container">
    <a class="navbar-brand pli-navbar-brand" href="index.html">
      <i class="fas fa-file-alt"></i>
      SIGATA
    </a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link [active se for a página atual]" href="index.html">
            <i class="fas fa-home"></i>
            Início
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="login.html">
            <i class="fas fa-sign-in-alt"></i>
            Login
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="dashboard.html">
            <i class="fas fa-tachometer-alt"></i>
            Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="upload.html">
            <i class="fas fa-upload"></i>
            Upload
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="documents.html">
            <i class="fas fa-folder"></i>
            Documentos
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="reports.html">
            <i class="fas fa-chart-line"></i>
            Relatórios
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="analytics.html">
            <i class="fas fa-chart-bar"></i>
            Analytics
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### 3. Footer Padrão

```html
<footer class="pli-footer py-4 mt-5">
  <div class="container text-center">
    <div>SIGATA © 2025 - Sistema Integrado de Gestão de Atas</div>
    <div>Desenvolvido e implementado por VPC-GEOSER</div>
    <div>19/07/2025</div>
  </div>
</footer>
```

### 4. Scripts Padrão

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  // Scripts específicos da página aqui
</script>
```

---

## 🎨 Classes CSS PLI Obrigatórias

### Cores Principais

```css
/* SEMPRE usar variáveis PLI - NUNCA cores diretas */
color: var(--pli-azul-escuro); /* Texto principal */
color: var(--pli-azul-medio); /* Texto secundário */
color: var(--pli-verde-principal); /* Destaques/links */
background: var(--pli-gradient-main); /* Apenas headers/footers */
```

### Classes de Layout

```css
.pli-navbar          /* Navegação principal */
.pli-navbar-brand    /* Logo/marca na navbar */
.pli-footer          /* Footer institucional */
.pli-card-login      /* Card de login centralizado */
.pli-input           /* Inputs de formulário */
.hero-section        /* Seção principal da página */
.hero-card           /* Card principal da hero section */
.feature-card        /* Cards de funcionalidades */
.about-system-card   /* Card informativo sobre sistema */
.stats-grid          /* Grid de estatísticas */
.stat-card           /* Card individual de estatística */
```

---

## 📐 Padrões de Dimensionamento

### Container e Grid

```html
<!-- Container principal (responsivo) -->
<div class="container">
  <div class="row">
    <div class="col-lg-6 col-md-8 col-sm-12">
      <!-- Conteúdo -->
    </div>
  </div>
</div>
```

### Espaçamentos Padrão

```html
<!-- Margens verticais -->
class="my-5"
<!-- Margem vertical grande -->
class="my-4"
<!-- Margem vertical média -->
class="py-4"
<!-- Padding vertical -->
class="mb-4"
<!-- Margem bottom -->
class="mt-5"
<!-- Margem top -->

<!-- Gaps e espaços -->
class="gap-3"
<!-- Gap entre elementos flex -->
class="d-flex gap-3"
<!-- Flex com gap -->
```

### Breakpoints Responsivos

```html
<!-- Colunas responsivas -->
col-12
<!-- Mobile (xs) -->
col-sm-10
<!-- Small (≥576px) -->
col-md-8
<!-- Medium (≥768px) -->
col-lg-6
<!-- Large (≥992px) -->
col-xl-4
<!-- Extra Large (≥1200px) -->
```

---

## 🖼️ Estruturas de Layout

### 1. Página Tipo Dashboard (como index.html)

```html
<body>
  <!-- Navegação -->
  <nav class="navbar">...</nav>

  <!-- Hero Section -->
  <div class="hero-section">
    <div class="container">
      <div class="hero-card">
        <!-- Conteúdo principal -->
      </div>
    </div>
  </div>

  <!-- Conteúdo Principal -->
  <div class="container my-5">
    <div class="row">
      <!-- Cards de funcionalidades -->
    </div>
  </div>

  <!-- Footer -->
  <footer class="pli-footer">...</footer>
</body>
```

### 2. Página Tipo Formulário (como login.html)

```html
<body class="d-flex flex-column min-vh-100">
  <!-- Navegação -->
  <nav class="navbar">...</nav>

  <!-- Área Central -->
  <div
    class="flex-grow-1 d-flex align-items-center justify-content-center py-5"
    style="background: linear-gradient(135deg, rgba(191, 229, 178, 0.1) 0%, rgba(92, 182, 92, 0.1) 25%, rgba(36, 75, 114, 0.1) 50%, rgba(15, 32, 62, 0.1) 75%, rgba(23, 30, 49, 0.1) 100%);"
  >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div class="pli-card-login">
            <!-- Formulário -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="pli-footer py-3 mt-auto">...</footer>
</body>
```

---

## 🎨 Padrões de Estilo

### Botões

```html
<!-- Botão primário PLI -->
<button class="btn btn-primary">
  <i class="fas fa-icon"></i>
  Texto
</button>

<!-- Botão animado (para página inicial) -->
<button class="btn btn-animated">
  <i class="fas fa-icon"></i>
  Texto
</button>
```

### Cards

```html
<!-- Card de funcionalidade -->
<div class="feature-card">
  <div class="feature-icon">
    <i class="fas fa-icon"></i>
  </div>
  <h3>Título</h3>
  <p>Descrição</p>
  <a href="#" class="btn btn-primary">Ação</a>
</div>

<!-- Card informativo -->
<div class="about-system-card">
  <h4>
    <i class="fas fa-info-circle icon"></i>
    Título
  </h4>
  <p>Conteúdo...</p>
</div>
```

### Formulários

```html
<form>
  <div class="mb-3">
    <label for="campo" class="form-label small fw-semibold" style="color: var(--pli-azul-escuro);">
      <i class="fas fa-icon me-1"></i>
      Label
    </label>
    <input
      type="text"
      class="form-control pli-input"
      id="campo"
      name="campo"
      required
      placeholder="Placeholder"
      style="font-size: 0.9rem; padding: 10px 14px;"
    />
  </div>

  <button type="submit" class="btn btn-primary w-100">
    <i class="fas fa-icon me-2"></i>
    Enviar
  </button>
</form>
```

---

## ⚠️ Regras Importantes

### 🚫 NÃO Fazer

```css
/* NUNCA usar cores diretas */
color: #28a745;
background: blue;

/* NUNCA usar fontes diferentes */
font-family: Arial;

/* NUNCA quebrar o padrão de navegação */
<!-- Não remover itens da navbar -->
```

### ✅ SEMPRE Fazer

```css
/* SEMPRE usar variáveis PLI */
color: var(--pli-azul-escuro);
background: var(--pli-verde-principal);

/* SEMPRE usar classes do sistema */
class="pli-navbar pli-footer pli-input"

/* SEMPRE manter estrutura responsiva */
<div class="container">
    <div class="row">
        <div class="col-lg-6">
```

---

## 📱 Responsividade

### Breakpoints Bootstrap 5

- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Mobile grande)
- **md**: ≥ 768px (Tablet)
- **lg**: ≥ 992px (Desktop)
- **xl**: ≥ 1200px (Desktop grande)

### Classes Responsivas Comuns

```html
<!-- Visibilidade -->
class="d-none d-lg-block"
<!-- Oculto mobile, visível desktop -->
class="d-block d-lg-none"
<!-- Visível mobile, oculto desktop -->

<!-- Texto -->
class="text-center text-lg-start"
<!-- Centro mobile, esquerda desktop -->

<!-- Colunas -->
class="col-12 col-lg-6"
<!-- Full mobile, metade desktop -->
```

---

## 🔧 JavaScript Padrões

### Estrutura Base

```javascript
// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
  // Código de inicialização
});

// Funções utilitárias
function showAlert(message, type = 'success') {
  // Implementação de alertas
}

function validateForm(formElement) {
  // Validação de formulários
}

// Event listeners
document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();
  // Lógica do formulário
});
```

---

## 📋 Checklist para Nova Página

- [ ] DOCTYPE e meta tags corretos
- [ ] Links CDN (Bootstrap, Font Awesome, Google Fonts)
- [ ] Link para `sistema_aplicacao_cores_pli.css`
- [ ] Navegação padrão com item ativo marcado
- [ ] Estrutura responsiva (container > row > col)
- [ ] Classes PLI aplicadas
- [ ] Footer padrão
- [ ] Scripts Bootstrap incluídos
- [ ] Validação de responsividade testada
- [ ] Cores usando variáveis CSS PLI
- [ ] Ícones Font Awesome aplicados

---

## 🎯 Exemplos de Uso

### Nova Página de Relatórios

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <!-- Head padrão -->
  <body>
    <!-- Navbar com "reports.html" marcado como active -->

    <div class="container my-5">
      <div class="row">
        <div class="col-12">
          <div class="about-system-card">
            <h4>
              <i class="fas fa-chart-line icon"></i>
              Relatórios do Sistema
            </h4>
            <!-- Conteúdo -->
          </div>
        </div>
      </div>
    </div>

    <!-- Footer padrão -->
  </body>
</html>
```

### Nova Página de Configurações

```html
<!-- Estrutura tipo formulário centralizado -->
<body class="d-flex flex-column min-vh-100">
  <!-- Navbar -->

  <div class="flex-grow-1 d-flex align-items-center justify-content-center py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="pli-card-login">
            <!-- Reutilizar estilo -->
            <!-- Formulário de configurações -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
</body>
```

---

_Desenvolvido para SIGATA - Sistema Integrado de Gestão de Atas_
_VPC-GEOSER - 19/07/2025_
