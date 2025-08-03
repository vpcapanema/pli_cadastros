# PLI Design System - Arquitetura CSS Modular

## 🎯 Visão Geral

Este sistema CSS foi modularizado seguindo as melhores práticas da indústria, incluindo **ITCSS (Inverted Triangle CSS)**, **BEM (Block Element Modifier)**, **SMACSS** e **CSS Guidelines** do Harry Roberts.

## 📁 Estrutura de Diretórios

```
static/css/
├── 00-settings/          # Variáveis CSS e configurações
│   ├── _root.css         # Design tokens (cores, espaçamentos, tipografia)
│   └── _breakpoints.css  # Media queries e responsividade
│
├── 02-generic/           # Reset/normalize (Bootstrap já fornece)
│
├── 03-elements/          # Elementos HTML básicos
│
├── 04-layout/            # Estrutura da página
│   ├── _base.css         # Layout fundamental e containers
│   ├── _header.css       # Navegação fixa
│   └── _footer.css       # Rodapé fixo
│
├── 05-components/        # Componentes reutilizáveis
│   ├── _buttons.css      # Sistema unificado de botões
│   ├── _cards.css        # Sistema unificado de cards
│   └── ...               # Outros componentes
│
├── 06-pages/             # Estilos específicos por página
│   ├── _login.css        # Específico das páginas de login
│   ├── _dashboard.css    # Específico do dashboard
│   └── ...               # Outras páginas
│
├── 07-utilities/         # Classes utilitárias
│   └── _utilities.css    # Spacing, text, display, etc.
│
├── body/                 # Estrutura anterior (manter compatibilidade)
│
└── main.css              # Arquivo principal que importa tudo
```

## 🏗️ Metodologia ITCSS

A organização segue o **Triângulo Invertido CSS**:

1. **Settings** → Variáveis e configurações globais
2. **Tools** → Mixins e funções (futuro Sass)
3. **Generic** → Reset/normalize
4. **Elements** → Elementos HTML básicos
5. **Layout** → Estrutura da página
6. **Components** → Componentes reutilizáveis
7. **Pages** → Estilos específicos por página
8. **Utilities** → Classes utilitárias

## 🎨 Design System - Variáveis CSS

### Cores PLI
```css
/* Cores institucionais */
--pli-azul-escuro: #0f203e;
--pli-azul-medio: #244b72;
--pli-verde-principal: #5cb65c;
--pli-verde-claro: #bfe5b2;
--pli-verde-escuro: #0e3600;

/* Gradientes */
--pli-gradient-main: linear-gradient(135deg, #0e3600 0%, #449244 33.36%, #bfe5b2 50%, #244b72 66.68%, #0f203e 83.34%, #171e31 100%);
```

### Espaçamentos
```css
--pli-spacing-xs: 0.25rem;    /* 4px */
--pli-spacing-sm: 0.5rem;     /* 8px */
--pli-spacing-md: 1rem;       /* 16px */
--pli-spacing-lg: 1.5rem;     /* 24px */
--pli-spacing-xl: 2rem;       /* 32px */
--pli-spacing-2xl: 2.5rem;    /* 40px */
--pli-spacing-3xl: 3rem;      /* 48px */
```

### Tipografia
```css
--pli-font-family: 'Montserrat', sans-serif;
--pli-font-size-xs: 0.7rem;
--pli-font-size-sm: 0.9rem;
--pli-font-size-base: 1rem;
--pli-font-weight-normal: 400;
--pli-font-weight-semibold: 600;
```

## 🧩 Sistema de Componentes BEM

### Nomenclatura
```css
/* BLOCO */
.c-card { }                    /* Componente */
.l-header { }                  /* Layout */
.u-text-center { }             /* Utility */

/* ELEMENTO */
.c-card__header { }            /* Parte do componente */
.c-card__body { }
.c-card__footer { }

/* MODIFICADOR */
.c-card--primary { }           /* Variação do componente */
.c-card--large { }
.c-card--dashboard { }
```

### Botões
```html
<!-- Botão primário -->
<button class="c-btn c-btn--primary">Salvar</button>

<!-- Botão secundário grande -->
<button class="c-btn c-btn--secondary c-btn--large">Cancelar</button>

<!-- Compatibilidade Bootstrap -->
<button class="btn btn-primary">Funciona igual</button>
```

### Cards
```html
<!-- Card básico -->
<div class="c-card">
  <div class="c-card__header">
    <h3 class="c-card__title">Título</h3>
  </div>
  <div class="c-card__body">Conteúdo</div>
</div>

<!-- Card de estatística -->
<div class="c-card c-card--stat">
  <i class="c-card__icon fas fa-users"></i>
  <span class="c-card__number">1,234</span>
  <span class="c-card__label">Usuários</span>
</div>
```

## 🎯 Layout System

### Containers e Grid
```html
<!-- Container principal -->
<main class="l-main">
  <div class="l-container">
    <!-- Grid de 3 colunas -->
    <div class="l-grid l-grid--3-col">
      <div class="c-card">Card 1</div>
      <div class="c-card">Card 2</div>
      <div class="c-card">Card 3</div>
    </div>
  </div>
</main>
```

### Header e Footer Fixos
```html
<!-- Header fixo -->
<header class="l-header">
  <nav class="pli-navbar">
    <div class="pli-navbar__container">
      <a href="#" class="pli-navbar__brand">PLI Sistema</a>
      <ul class="pli-navbar__nav">
        <li><a href="#" class="pli-navbar__link">Dashboard</a></li>
        <li><a href="#" class="pli-navbar__link">Relatórios</a></li>
      </ul>
    </div>
  </nav>
</header>

<!-- Footer fixo -->
<footer class="l-footer">
  <div class="pli-footer__container">
    <p class="pli-footer__text">© 2025 PLI - Todos os direitos reservados</p>
  </div>
</footer>
```

## 🛠️ Classes Utilitárias

### Espaçamento
```html
<div class="u-margin-lg u-padding-xl">Elemento com espaçamento</div>
<p class="u-margin-bottom-md">Parágrafo com margem inferior</p>
```

### Texto
```html
<h1 class="u-text-center u-text-bold">Título centralizado e negrito</h1>
<p class="u-text-muted u-text-sm">Texto secundário pequeno</p>
```

### Flexbox
```html
<div class="u-flex u-justify-between u-align-center">
  <span>Esquerda</span>
  <span>Direita</span>
</div>
```

## 📱 Responsividade

O sistema é **mobile-first** com breakpoints:
- **xs**: < 576px (mobile)
- **sm**: 576px - 768px (tablet portrait)
- **md**: 768px - 992px (tablet landscape)
- **lg**: 992px+ (desktop)

### Classes Responsivas
```html
<!-- Esconde em mobile, mostra em desktop -->
<div class="u-hidden-xs u-block-lg">Só aparece no desktop</div>

<!-- Grid responsivo -->
<div class="l-grid l-grid--4-col">4 colunas → 2 → 1 automaticamente</div>
```

## 🔄 Migração e Compatibilidade

### 1. Bootstrap Compatibility
Todas as classes Bootstrap existentes continuam funcionando:
```css
.btn-primary { /* Sobrescrito com cores PLI */ }
.card { /* Melhorado com design system PLI */ }
```

### 2. Classes Existentes
Classes antigas são mantidas em `main.css` durante a transição:
```css
.pli-login-card-custom { /* Funciona como antes */ }
.stat-card { /* Migra gradualmente para .c-card--stat */ }
```

## 🚀 Como Usar

### 1. Importar CSS Principal
```html
<link rel="stylesheet" href="/static/css/main.css">
```

### 2. Estrutura HTML Recomendada
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
  <header class="l-header">...</header>
  <main class="l-main">...</main>
  <footer class="l-footer">...</footer>
</body>
</html>
```

### 3. Criando Novos Componentes
```css
/* Em 05-components/_novo-componente.css */
.c-accordion {
  /* Estrutura base */
}

.c-accordion__item {
  /* Elemento */
}

.c-accordion--compact {
  /* Modificador */
}
```

## 📋 Benefícios

✅ **Manutenibilidade**: Código organizado por responsabilidade
✅ **Reutilização**: Componentes modulares e flexíveis
✅ **Performance**: CSS otimizado e sem duplicações
✅ **Escalabilidade**: Fácil adicionar novos componentes
✅ **Consistência**: Design system unificado
✅ **Compatibilidade**: Funciona com código existente

## 🔧 Desenvolvimento

### Adicionar Novo Componente
1. Criar arquivo em `05-components/_nome.css`
2. Seguir nomenclatura BEM
3. Usar variáveis do design system
4. Importar em `main.css`
5. Documentar exemplos

### Adicionar Nova Página
1. Criar arquivo em `06-pages/_nome.css`
2. Estilos específicos apenas
3. Reutilizar componentes existentes
4. Importar condicionalmente

### Debug e Desenvolvimento
```html
<!-- Adicionar classe para visualizar layout -->
<body class="debug-layout">
```

## 📚 Referências

- [CSS Guidelines - Harry Roberts](https://cssguidelin.es/)
- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [BEM Methodology](http://getbem.com/)
- [SMACSS](http://smacss.com/)
- [CUBE CSS](https://cube.fyi/)

---

**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Autor**: Sistema PLI
