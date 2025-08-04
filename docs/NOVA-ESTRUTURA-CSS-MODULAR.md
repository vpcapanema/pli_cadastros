# Nova Estrutura de CSS - PLI Cadastros

## Reorganização Modular

A arquitetura CSS do sistema PLI Cadastros foi reorganizada para uma estrutura mais modular e coerente, onde:

## Estrutura de Diretórios

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
│   ├── _forms.css         # NOVO: Componentes de formulários
│   ├── _tables.css        # NOVO: Componentes de tabelas
│   └── _login-glass.css   # Efeitos visuais especiais
└── 06-pages/
    ├── _index-page.css    # Estilos específicos da página inicial
    ├── _dashboard-page.css # NOVO: Estilos específicos da página de dashboard
    ├── _login-page.css    # Estilos específicos da página de login
    └── ...                # Outras páginas específicas
```

## Principais Melhorias

1. **Separação Modular Correta**:
   - Componentes reutilizáveis agora estão na pasta `05-components`
   - Estilos específicos de páginas estão na pasta `06-pages`
   - Não há mais mistura entre componentes e páginas

2. **Novos Componentes Reutilizáveis**:
   - `_forms.css`: Sistema de formulários modular e consistente
   - `_tables.css`: Sistema de tabelas reutilizável

3. **CSS Otimizado para Páginas**:
   - `_index-page.css`: Apenas estilos específicos da página inicial
   - `_dashboard-page.css`: Apenas estilos específicos do dashboard
   - `_login-page.css`: Apenas estilos específicos do login

4. **Uso de Variáveis CSS**:
   - Todo o sistema usa variáveis CSS para manter consistência
   - Estilos específicos de componentes seguem os tokens definidos em `_root.css`

## Como Usar os Novos Componentes

### Componente de Tabela

```html
<div class="c-table-container">
  <div class="c-table-header">
    <h3 class="c-table-title">Título da Tabela</h3>
    <div class="c-table-actions">
      <button class="pli-button pli-button--primary">Adicionar</button>
    </div>
  </div>
  <div class="c-table-responsive">
    <table class="c-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Exemplo</td>
          <td><span class="status-indicator success"></span> Ativo</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Componente de Formulário

```html
<div class="c-form-container">
  <div class="c-form-section">
    <h3 class="c-form-section-title">Informações Pessoais</h3>
    <div class="c-form-group">
      <label class="c-form-label">Nome</label>
      <input type="text" class="c-form-control">
    </div>
    <div class="c-form-group">
      <label class="c-form-label">Email</label>
      <input type="email" class="c-form-control is-valid">
      <div class="c-form-feedback valid">Email válido</div>
    </div>
  </div>
  <div class="c-form-actions">
    <button class="pli-button pli-button--secondary">Cancelar</button>
    <button class="pli-button pli-button--primary">Salvar</button>
  </div>
</div>
```

## Benefícios da Nova Estrutura

1. **Maior Modularidade**: Componentes e páginas claramente separados
2. **Facilidade de Manutenção**: Cada componente em seu arquivo específico
3. **Consistência Visual**: Uso de variáveis CSS em todo o sistema
4. **Reusabilidade**: Componentes genéricos podem ser usados em qualquer página
5. **Melhor Performance**: Arquivos específicos e focados, sem duplicação de código

## Próximos Passos

1. Migrar os estilos de página existentes em `_page-dimensions.css` para seus respectivos arquivos específicos
2. Substituir elementos HTML que usam as antigas classes de tabela/formulário para usar os novos componentes
3. Documentar os novos componentes com exemplos adicionais
