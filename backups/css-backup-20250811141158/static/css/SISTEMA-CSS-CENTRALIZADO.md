# Sistema CSS Centralizado para PLI Cadastros

## Objetivo

Este documento explica a estrutura centralizada do CSS da aplicação PLI Cadastros, focando principalmente em como elementos globais como o footer e a navbar são controlados através de um sistema único de variáveis.

## Conceito Principal

Em vez de definir estilos específicos em vários lugares, usamos um sistema de "controle central" através de variáveis CSS. Isso permite:

1. Alterar a aparência de todo o sistema modificando apenas um arquivo
2. Manter consistência visual em toda a aplicação
3. Simplificar a manutenção e atualizações

## Como Funciona

### 1. Arquivo Central de Variáveis

O arquivo `00-settings/_root.css` contém todas as variáveis de controle do sistema, incluindo seções específicas para elementos globais:

```css
/* ELEMENTOS GLOBAIS - CONFIGURAÇÕES CENTRAIS */

/* NAVBAR - Configurações centralizadas */
--pli-navbar-bg-color: var(--pli-gradient-main);
--pli-navbar-text-color: var(--pli-branco);
--pli-navbar-link-hover-color: var(--pli-azul-claro);
--pli-navbar-link-active-color: var(--pli-verde-claro);
--pli-navbar-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

/* FOOTER - Configurações centralizadas */
--pli-footer-bg: var(--pli-gradient-main);
--pli-footer-text-color: var(--pli-branco);
--pli-footer-link-color: var(--pli-branco);
--pli-footer-link-hover-color: var(--pli-verde-claro);
--pli-footer-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
```

### 2. Arquivos de Implementação

Os arquivos específicos de componentes (`_footer.css`, `_header.css`, etc.) utilizam as variáveis centralizadas:

```css
.l-footer,
.pli-footer {
  background: var(--pli-footer-bg);
  color: var(--pli-footer-text-color);
  display: flex;
  align-items: center;
  box-shadow: var(--pli-footer-shadow);
}
```

## Como Alterar Elementos Globais

### Alterar Cores do Footer

Para mudar as cores do footer em TODA a aplicação, basta modificar as variáveis no arquivo `00-settings/_root.css`:

```css
--pli-footer-bg: var(--pli-gradient-secondary); /* Muda para outro gradiente */
--pli-footer-text-color: var(--pli-preto); /* Muda a cor do texto para preto */
```

### Alterar Cores da Navbar

Similarmente, para alterar a navbar:

```css
--pli-navbar-bg-color: var(--pli-azul-escuro); /* Muda o fundo para azul escuro sólido */
--pli-navbar-text-color: var(--pli-branco); /* Mantém o texto branco */
```

## Benefícios

- **Controle Centralizado**: Todas as alterações feitas no arquivo `_root.css` refletem automaticamente em toda a aplicação
- **Consistência**: Evita estilos conflitantes ou inconsistentes
- **Facilidade de Manutenção**: Não é necessário editar múltiplos arquivos para fazer alterações globais
- **Temas**: Facilita a criação de temas ou variações do sistema

## Melhores Práticas

1. **Sempre use variáveis** em vez de valores diretamente nos componentes
2. **Organize as variáveis** em seções claras no arquivo `_root.css`
3. **Documente alterações** importantes no sistema de variáveis
4. **Não duplique definições** em outros lugares do código

---

Este sistema foi projetado para facilitar a manutenção e garantir consistência visual em toda a aplicação PLI Cadastros.
