# Guia de Refatoração CSS - PLI Cadastros

## Visão Geral da Refatoração

Este documento descreve a refatoração do sistema CSS do PLI Cadastros para uma arquitetura mais organizada, seguindo as metodologias ITCSS (Inverted Triangle CSS) e BEM (Block Element Modifier). O objetivo foi eliminar duplicações, centralizar variáveis e melhorar a manutenibilidade.

## Problemas Identificados e Solucionados

1. **Duplicação de código:** Os arquivos `_forms-page.css` e `_tables-page.css` continham código quase idêntico aos componentes originais, apenas com prefixos de classe diferentes.

2. **Falta de padronização:** Diferentes padrões de nomenclatura eram usados em diferentes partes do código.

3. **Mistura de responsabilidades:** Estilos de componentes e páginas estavam misturados.

## Estrutura ITCSS Implementada

A estrutura de arquivos segue a metodologia ITCSS, que organiza o CSS em camadas de especificidade crescente:

1. **Settings (00-settings):** Variáveis e configurações.
2. **Generic (01-generic):** Resets e normalizações.
3. **Elements (02-elements):** Estilos para elementos HTML básicos.
4. **Objects (03-objects):** Classes estruturais sem estilo visual.
5. **Layout (04-layout):** Estrutura da página (header, footer, etc).
6. **Components (05-components):** Componentes reutilizáveis.
7. **Pages (06-pages):** Estilos específicos para páginas.
8. **Utilities (07-utilities):** Classes utilitárias.

## Metodologia BEM Implementada

Para componentes, usamos a metodologia BEM:

- **Block (Bloco):** Componente autônomo (ex: `.c-form`)
- **Element (Elemento):** Parte de um bloco (ex: `.c-form__input`)
- **Modifier (Modificador):** Variação de um bloco ou elemento (ex: `.c-form--large`)

## Prefixos Adotados

- **Componentes:** `c-` (ex: `.c-button`, `.c-table`)
- **Layout:** `l-` (ex: `.l-header`, `.l-footer`)
- **Páginas:** `p-` (ex: `.p-dashboard`, `.p-login`)
- **Utilitários:** `u-` (ex: `.u-text-center`, `.u-margin-top`)

## Arquivos Refatorados

### Componentes Centralizados

- `05-components/_forms.css`: Componentes de formulário reutilizáveis
- `05-components/_tables.css`: Componentes de tabela reutilizáveis

### Nova Abordagem para Páginas

- `06-pages/_pages-comum.css`: Modificações específicas de página para componentes

### Arquivos Substituídos/Removidos

- `06-pages/_forms-page.css`: Substituído por `_pages-comum.css` + prefixos adequados
- `06-pages/_tables-page.css`: Substituído por `_pages-comum.css` + prefixos adequados

## Como Usar o Sistema CSS

### Para componentes:

```html
<div class="c-form-container">
  <div class="c-form-section">
    <h2 class="c-form-section-title">Título do Formulário</h2>
    <!-- Conteúdo do formulário -->
  </div>
</div>
```

### Para páginas específicas:

```html
<!-- Adicione a classe de página no elemento pai -->
<div class="p-login">
  <div class="c-form-container">
    <!-- O componente terá modificações específicas da página p-login -->
  </div>
</div>
```

## Próximos Passos

1. Atualizar as classes HTML em todas as páginas para usar os novos prefixos
2. Remover os arquivos CSS obsoletos após a migração completa
3. Criar arquivos específicos de página para cada HTML
4. Documentar as classes disponíveis em um guia de estilo

## Manutenção Futura

- Sempre adicionar novas variáveis no arquivo `_root.css`
- Manter componentes reutilizáveis na pasta 05-components
- Usar o prefixo adequado para cada tipo de estilo
- Seguir a metodologia BEM para nomenclatura de classes
