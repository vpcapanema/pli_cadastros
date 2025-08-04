# Sistema CSS - PLI Cadastros 

## Visão Geral

A arquitetura CSS do sistema PLI Cadastros foi reorganizada para seguir uma estrutura mais clara e modular, onde:

1. **Variáveis Centralizadas** (_root.css) contêm apenas definições básicas como cores, gradientes, tipografia, etc.
2. **Componentes Específicos** (_header.css, _footer.css) contêm suas próprias definições de tamanho e posicionamento
3. **Templates Base** (base.html) fornecem a estrutura básica com navbar e footer
4. **CSS Específicos por Página** definem o estilo único de cada página

## Estrutura de Arquivos

```
static/css/
├── 00-settings/
│   ├── _root.css           # Variáveis globais (cores, tipografia, etc.)
│   └── _breakpoints.css    # Configurações de breakpoints
├── 01-generic/
│   └── _reset-fixes.css    # Resets e fixes globais
├── 04-layout/
│   ├── _base.css           # Layout base geral
│   ├── _header.css         # Estilos específicos do cabeçalho
│   ├── _footer.css         # Estilos específicos do rodapé
│   └── _responsive.css     # Ajustes responsivos
├── 05-components/
│   ├── _buttons.css        # Componentes de botões
│   ├── _cards.css          # Componentes de cards
│   └── _login-glass.css    # Efeitos visuais especiais
└── 06-pages/
    └── _page-dimensions.css # Estilos específicos por página
```

## Princípios de Organização

### 1. Variáveis Globais em _root.css

O arquivo `_root.css` contém apenas:
- Cores básicas e semânticas
- Gradientes
- Tipografia e tamanhos de fonte
- Variáveis de borda e raio
- Cores de componentes (como navbar e footer)
- Definições responsivas globais

**Exemplo:**
```css
:root {
  /* CORES PLI EXTRAÍDAS */
  --pli-azul-escuro: #0f203e;
  --pli-verde-principal: #5cb65c;
  
  /* NAVBAR - Cores */
  --pli-navbar-bg-color: var(--pli-gradient-main);
  --pli-navbar-text-color: var(--pli-branco);
}
```

### 2. Variáveis Específicas de Componentes

Cada componente (header, footer) define suas próprias variáveis de dimensão:

**_header.css:**
```css
:root {
  --pli-header-height: 70px;
  --pli-header-height-mobile: 60px;
  --pli-navbar-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}
```

**_footer.css:**
```css
:root {
  --pli-footer-height: 80px;
  --pli-footer-height-mobile: 90px;
  --pli-footer-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
```

### 3. Estrutura HTML Base (base.html)

O arquivo `base.html` contém:
- Estrutura básica com header e footer
- Elementos navbar (público e restrito)
- Container para conteúdo dinâmico injetado por cada página

### 4. CSS Específicos por Página

Cada página possui suas próprias definições CSS que consumem as variáveis globais:

```css
.page-login {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--pli-body-bg-color) 0%, var(--pli-body-bg-color-secondary) 100%);
}
```

## Como Usar

### Para Modificar Cores e Estilos Globais

Edite o arquivo `_root.css` para alterar:
- Cores principais do sistema
- Fonte principal ou tamanhos de fonte
- Cores específicas de componentes como navbar e footer

### Para Modificar Layout de Componentes

- Para ajustar o header: edite `_header.css`
- Para ajustar o footer: edite `_footer.css`
- Para ajustar elementos específicos: edite os respectivos arquivos de componente

### Para Criar Novas Páginas

1. Crie seu arquivo HTML que estende base.html
2. Adicione seu CSS específico em `06-pages/` seguindo o padrão existente
3. Use as variáveis globais de `_root.css` para manter consistência visual

## Boas Práticas

1. **Sempre use variáveis CSS** em vez de valores hardcoded
2. **Mantenha dimensões e posicionamento** nos arquivos de componente
3. **Mantenha cores e tipografia** em `_root.css`
4. **Siga a nomenclatura BEM** para classes CSS (Block__Element--Modifier)
5. **Use classes semânticas** que descrevem o propósito do elemento

## Fluxo de Trabalho Recomendado

1. Identifique o tipo de mudança (cor global, layout específico, página específica)
2. Navegue para o arquivo CSS correto com base na mudança
3. Faça alterações usando variáveis existentes quando possível
4. Adicione novas variáveis em `_root.css` apenas quando forem globais
5. Adicione variáveis específicas de componente em seus respectivos arquivos
