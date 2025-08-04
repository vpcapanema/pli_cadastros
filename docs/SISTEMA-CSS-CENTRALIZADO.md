# Sistema CSS Centralizado - PLI Cadastros

Este documento descreve a estrutura e o funcionamento do sistema centralizado de CSS do projeto PLI Cadastros.

## Visão Geral

O sistema CSS foi refatorado para seguir a metodologia ITCSS (Inverted Triangle CSS) com um sistema centralizado de variáveis para maior consistência e facilidade de manutenção.

## Estrutura de Diretórios

```
/static/css/
├── 00-settings/
│   ├── _root.css        # Todas as variáveis CSS centralizadas
│   └── _breakpoints.css # Configurações de breakpoints
├── 01-generic/
│   └── _reset-fixes.css # Resets e fixes globais
├── 04-layout/
│   ├── _base.css        # Estilos de layout base
│   ├── _header.css      # Estilos para o cabeçalho
│   ├── _footer.css      # Estilos para o rodapé
│   └── _responsive.css  # Configurações responsivas
├── 05-components/
│   ├── _buttons.css     # Estilos para botões
│   ├── _cards.css       # Estilos para cards
│   └── _login-glass.css # Efeitos visuais de vidro
├── 06-pages/            # Estilos específicos por página
└── 07-utilities/        # Classes utilitárias
```

## Sistema de Variáveis Centralizadas

Todas as variáveis CSS estão definidas em `/static/css/00-settings/_root.css` e organizadas por categoria:

### Cores

```css
/* CORES PLI EXTRAÍDAS */
--pli-azul-escuro: #0f203e;
--pli-azul-medio: #244b72;
--pli-azul-claro: #e3eefd;
--pli-verde-principal: #5cb65c;
/* ...mais cores... */
```

### Elementos Globais

Os elementos compartilhados como a navbar e o footer têm suas próprias seções de variáveis:

```css
/* NAVBAR - Configurações centralizadas */
--pli-navbar-bg-color: var(--pli-gradient-main);
--pli-navbar-text-color: var(--pli-branco);
--pli-navbar-link-hover-color: var(--pli-azul-claro);
/* ...mais configurações de navbar... */

/* FOOTER - Configurações centralizadas */
--pli-footer-bg: var(--pli-gradient-main);
--pli-footer-text-color: var(--pli-branco);
--pli-footer-link-color: var(--pli-branco);
/* ...mais configurações de footer... */
```

### Efeitos Visuais

Efeitos reutilizáveis também estão padronizados:

```css
/* EFEITOS DE VIDRO - Configurações centralizadas */
--pli-glass-bg-color: rgba(255, 255, 255, 0.2);
--pli-glass-border-color: rgba(255, 255, 255, 0.3);
--pli-glass-blur: 10px;
/* ...mais configurações de efeitos... */
```

## Como Usar as Variáveis

Para manter o sistema consistente, sempre use as variáveis CSS ao invés de valores diretos. Exemplos:

```css
/* ❌ Não faça isso */
.my-element {
  background-color: #0f203e;
  color: white;
  border: 1px solid #dee2e6;
}

/* ✅ Faça isso */
.my-element {
  background-color: var(--pli-azul-escuro);
  color: var(--pli-branco);
  border: var(--pli-border-width) solid var(--pli-border-color);
}
```

## Modificar Elementos Globais

Para modificar elementos como navbar e footer, altere apenas suas variáveis em `_root.css`:

```css
/* Para mudar a cor de fundo do footer */
:root {
  --pli-footer-bg: var(--pli-azul-escuro); /* Ao invés de var(--pli-gradient-main) */
}
```

## Responsividade

O sistema implementa um conjunto de media queries em `_root.css` que ajustam automaticamente o valor das variáveis para diferentes tamanhos de tela.

## Boas Práticas

1. **Nunca use valores diretos** - Sempre use variáveis
2. **Adicione novas variáveis quando necessário** - Se precisar de uma nova cor ou medida, adicione ao `_root.css`
3. **Agrupe variáveis relacionadas** - Mantenha variáveis relacionadas em seções específicas
4. **Use nomes semânticos** - Nome da variável deve descrever seu propósito, não seu valor
5. **Documente alterações** - Atualize este documento ao fazer mudanças significativas
