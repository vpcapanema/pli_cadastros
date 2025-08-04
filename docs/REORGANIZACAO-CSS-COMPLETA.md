# Reorganização do CSS - PLI Cadastros

## Arquitetura Atualizada

A arquitetura CSS do projeto PLI Cadastros foi completamente reorganizada para melhorar a modularidade, facilitar a manutenção e garantir uma estrutura mais coerente.

## Principais Mudanças

### 1. Separação Clara entre Componentes e Páginas

- **Componentes** (05-components): Elementos reutilizáveis independentes de páginas específicas
  - Buttons, Cards, Forms, Tables, etc.
  
- **Páginas** (06-pages): Estilos específicos para cada página do sistema
  - Dashboard, Index, Login, Forms, Tables, etc.

### 2. Novos Arquivos Criados

**Componentes:**
- `_forms.css`: Sistema unificado de formulários reutilizáveis
- `_tables.css`: Sistema unificado de tabelas reutilizáveis

**Páginas:**
- `_dashboard-page.css`: Estilos específicos da página de dashboard
- `_forms-page.css`: Estilos específicos para páginas que contêm formulários
- `_tables-page.css`: Estilos específicos para páginas que contêm tabelas

### 3. Arquivo Removido

- `_page-dimensions.css`: Este arquivo misturava componentes com páginas e foi completamente eliminado, com seus estilos distribuídos para os arquivos apropriados.

## Nova Estrutura de Arquivos CSS

```
static/css/
├── 00-settings/
│   ├── _root.css          # Variáveis globais (cores, tipografia, etc.)
│   └── _breakpoints.css   # Configurações de breakpoints
├── 01-generic/
│   └── _reset-fixes.css   # Resets e fixes globais
├── 04-layout/
│   ├── _base.css          # Layout base geral
│   ├── _header.css        # Estilos e layout específicos do cabeçalho
│   ├── _footer.css        # Estilos e layout específicos do rodapé
│   └── _responsive.css    # Ajustes responsivos para layout
├── 05-components/
│   ├── _buttons.css       # Componentes de botões
│   ├── _cards.css         # Componentes de cards
│   ├── _forms.css         # Componentes de formulários
│   ├── _tables.css        # Componentes de tabelas
│   └── _login-glass.css   # Efeitos visuais especiais
└── 06-pages/
    ├── _dashboard-page.css # Estilos específicos da página de dashboard
    ├── _forms-page.css     # Estilos específicos de páginas com formulários
    ├── _index-page.css     # Estilos específicos da página inicial
    ├── _login-page.css     # Estilos específicos da página de login
    ├── _tables-page.css    # Estilos específicos de páginas com tabelas
    └── ...                 # Outras páginas específicas
```

## Convenção de Nomenclatura

### Classes de Componentes

Componentes reutilizáveis usam o prefixo `c-`:

```css
.c-table { ... }
.c-form-control { ... }
.c-button { ... }
```

### Classes de Páginas

Estilos específicos de página usam o prefixo `page-`:

```css
.page-dashboard .metric-card { ... }
.page-login .login-container { ... }
```

## Benefícios da Nova Estrutura

1. **Melhor Organização**: Separação clara entre componentes reutilizáveis e estilos específicos de páginas
2. **Facilidade de Manutenção**: Cada componente ou página tem seu próprio arquivo
3. **Redução de Duplicação**: Componentes compartilhados entre páginas são definidos uma única vez
4. **Fluxo de Trabalho Melhorado**: Desenvolvedores podem trabalhar em componentes ou páginas específicas sem conflitos

## Como Usar

### Usando Componentes

Para usar um componente em qualquer página:

```html
<!-- Tabela -->
<div class="c-table-container">
  <table class="c-table">...</table>
</div>

<!-- Formulário -->
<form class="c-form-container">
  <div class="c-form-group">...</div>
</form>
```

### Estilos Específicos de Página

Para aplicar estilos específicos de uma página, adicione a classe adequada ao elemento body:

```html
<body class="page-dashboard">
  <!-- Conteúdo específico do dashboard -->
</body>
```

## Próximos Passos

1. Atualizar os templates HTML para usar as novas classes de componentes
2. Garantir que cada página use a classe correta (`page-*`) no elemento body
3. Continuar refinando a separação entre componentes e páginas conforme o sistema evolui
