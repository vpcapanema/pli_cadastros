# Sistema de Responsividade do PLI Cadastros

## Refatoração da Arquitetura CSS - Responsividade Centralizada

Este documento explica as mudanças implementadas para centralizar o sistema de responsividade no projeto PLI Cadastros.

## Estrutura Atual

A responsividade do sistema agora segue uma abordagem centralizada:

### 1. Breakpoints Centralizados (00-settings/_breakpoints.css)

- **Definição de Variáveis**: Todas as variáveis de breakpoints são definidas neste arquivo
- **Media Queries**: Todas as media queries que modificam variáveis globais estão neste arquivo
- **Aplicação das Variáveis**: As variáveis são atualizadas para cada breakpoint, permitindo que outros arquivos usem automaticamente os valores responsivos

### 2. Variáveis Globais (00-settings/_root.css)

- Contém apenas definições de variáveis de design como cores, tipografia, espaçamentos
- Não contém mais media queries ou breakpoints
- Referencia as variáveis definidas em _breakpoints.css

### 3. Layouts Base (04-layout/_base.css)

- Utiliza as variáveis definidas em _breakpoints.css e _root.css
- Não contém mais media queries duplicadas
- Responsivo automaticamente através das variáveis CSS

### 4. Comportamentos Específicos por Dispositivo (04-layout/_responsive.css)

- Classes específicas para diferentes dispositivos
- Usado em conjunto com JavaScript para aplicar classes como `.pli-device-phone`, `.pli-device-tablet`, etc.
- Comportamentos específicos que não podem ser gerenciados apenas com variáveis CSS

## Benefícios da Nova Arquitetura

1. **Centralização**: Todas as definições de breakpoints estão em um único arquivo
2. **Manutenção Simplificada**: Para alterar um breakpoint, basta modificar em um único lugar
3. **Consistência**: Todas as partes do sistema usam as mesmas definições
4. **Escalabilidade**: Facilita a adição de novos breakpoints ou comportamentos responsivos

## Como Usar

### Para Adicionar Estilos Responsivos:

1. **Abordagem Preferencial**: Use variáveis CSS que já são responsivas
   ```css
   .meu-elemento {
     padding: var(--pli-container-padding); /* Já é responsivo */
     margin-bottom: var(--pli-spacing-lg); /* Já adapta para diferentes tamanhos */
   }
   ```

2. **Para Comportamentos Específicos**: Use as classes de dispositivo
   ```css
   .pli-device-phone .meu-elemento {
     /* Estilos específicos para telefones */
   }
   ```

3. **Para Ajustes Manuais**: Adicione media queries no arquivo apropriado
   ```css
   /* Adicione em _breakpoints.css se afetar variáveis globais */
   /* Adicione no arquivo de componente/página se for específico para aquele componente */
   ```

## Ordem de Importação no main.css

```css
/* 00 - SETTINGS */
@import '00-settings/_breakpoints.css'; /* Primeiro, para definir as variáveis */
@import '00-settings/_root.css'; /* Depois, para utilizar essas variáveis */
```

## Considerações Futuras

- Considerar o uso de um sistema de design tokens para organizar ainda melhor as variáveis
- Avaliar a migração para Sass ou PostCSS para melhor organização dos breakpoints
- Documentar as variáveis responsivas em um guia de estilo para desenvolvedores

---

*Documento criado por GitHub Copilot - 4 de agosto de 2025*
