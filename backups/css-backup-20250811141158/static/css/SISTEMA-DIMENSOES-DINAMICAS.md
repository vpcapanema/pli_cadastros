# 📐 Sistema de Dimensões Dinâmicas - PLI CSS

## 🎯 **Objetivo**

Implementar dimensões específicas por página mantendo a consistência do design system, permitindo que cada página tenha suas próprias especificações de tamanho enquanto utiliza componentes reutilizáveis.

## 🏗️ **Arquitetura Implementada**

### **Classes de Página**

Cada página HTML agora possui uma classe específica no `<body>`:

```html
<!-- Página Inicial -->
<body class="page-index">
  <!-- Dashboard -->
  <body class="page-dashboard">
    <!-- Login -->
    <body class="page-login">
      <!-- Formulários -->
      <body class="page-forms">
        <!-- Tabelas -->
        <body class="page-tables">
          <!-- Páginas Genéricas -->
          <body class="page-generic"></body>
        </body>
      </body>
    </body>
  </body>
</body>
```

### **Sistema de Hierarquia CSS**

```
06-pages/_page-dimensions.css
├── .page-index (Página inicial)
├── .page-dashboard (Painel administrativo)
├── .page-login (Autenticação)
├── .page-forms (Formulários)
├── .page-tables (Listagens)
└── Responsive adjustments por página
```

## 🎨 **Exemplos de Uso**

### **1. Página Index - Dimensões Específicas**

```css
.page-index .stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--pli-spacing-lg);
}

.page-index .stat-card {
  padding: var(--pli-spacing-xl);
  border: var(--pli-border-width-thick) solid var(--pli-azul-escuro);
}
```

### **2. Dashboard - Cards Métricas**

```css
.page-dashboard .dashboard-metric-card {
  height: 180px; /* Altura específica para dashboard */
  background: var(--pli-branco);
  transition: var(--pli-transition-base);
}

.page-dashboard .dashboard-metric-card:hover {
  transform: translateY(-2px);
}
```

### **3. Login - Layout Centralizado**

```css
.page-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-login .pli-login-card-custom {
  max-width: 500px; /* Largura específica do login */
  min-height: 280px;
}
```

### **4. Formulários - Seções Organizadas**

```css
.page-forms .form-section {
  margin-bottom: var(--pli-spacing-xl);
  padding-bottom: var(--pli-spacing-lg);
  border-bottom: 1px solid #f1f3f4;
}

.page-forms .form-actions {
  display: flex;
  gap: var(--pli-spacing-md);
  justify-content: flex-end;
}
```

## 📱 **Sistema Responsivo por Página**

### **Breakpoints Específicos**

```css
@media (max-width: 768px) {
  .page-index .stats-grid {
    grid-template-columns: 1fr; /* Mobile: 1 coluna */
  }

  .page-dashboard .dashboard-metric-card {
    height: 150px; /* Altura menor no mobile */
  }

  .page-forms .form-actions {
    flex-direction: column; /* Botões empilhados */
  }
}

@media (max-width: 576px) {
  .page-index .stat-card {
    padding: var(--pli-spacing-lg); /* Menos padding */
  }

  .page-dashboard .dashboard-metric-card {
    height: 130px; /* Ainda menor */
  }
}
```

## 🔧 **Como Usar**

### **1. Para Páginas Existentes**

As páginas já foram atualizadas automaticamente pelo script de migração. Verifique se a classe está correta:

```html
<!-- Verificar se o body possui a classe -->
<body class="page-dashboard"></body>
```

### **2. Para Novas Páginas**

Adicione a classe apropriada no `<body>`:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/static/css/main.css" />
  </head>
  <body class="page-forms">
    <!-- Classe específica -->
    <!-- Conteúdo da página -->
  </body>
</html>
```

### **3. Para Dimensões Customizadas**

Adicione estilos específicos no arquivo `_page-dimensions.css`:

```css
.page-minha-pagina .meu-componente {
  width: 100%;
  max-width: 600px;
  margin: var(--pli-spacing-lg) auto;
}
```

## 📝 **Variáveis Disponíveis**

### **Espaçamentos**

```css
var(--pli-spacing-xs)    /* 4px */
var(--pli-spacing-sm)    /* 8px */
var(--pli-spacing-md)    /* 16px */
var(--pli-spacing-lg)    /* 24px */
var(--pli-spacing-xl)    /* 32px */
var(--pli-spacing-2xl)   /* 48px */
var(--pli-spacing-3xl)   /* 64px */
var(--pli-spacing-4xl)   /* 80px */
```

### **Bordas e Raios**

```css
var(--pli-border-radius-sm)  /* 4px */
var(--pli-border-radius-md)  /* 8px */
var(--pli-border-radius-lg)  /* 12px */
var(--pli-border-radius-xl)  /* 16px */
```

### **Sombras**

```css
var(--pli-shadow-sm)   /* Sombra sutil */
var(--pli-shadow-md)   /* Sombra média */
var(--pli-shadow-lg)   /* Sombra destacada */
```

## 🎯 **Benefícios**

### **✅ Vantagens**

- ✨ **Flexibilidade**: Cada página pode ter dimensões específicas
- 🔄 **Reutilização**: Componentes base mantidos
- 📱 **Responsivo**: Ajustes específicos por página e dispositivo
- 🎨 **Consistência**: Usa design tokens centralizados
- 🚀 **Performance**: CSS organizado e otimizado

### **✅ Exemplos Práticos**

#### **Index**: Stats em grid 2x2 → Mobile 1 coluna

#### **Dashboard**: Cards métricas altura fixa → Altura adaptativa

#### **Login**: Container centralizado → Largura máxima 500px

#### **Forms**: Seções organizadas → Botões flexíveis

#### **Tables**: Headers fixos → Responsive horizontal scroll

## 🔄 **Migração Realizada**

### **Arquivos Atualizados**

- ✅ **76 arquivos HTML** migrados automaticamente
- ✅ **CSS antigo** substituído por `main.css`
- ✅ **Classes de página** adicionadas automaticamente
- ✅ **Backups criados** (`.backup`) para segurança

### **Verificação**

```bash
# Verificar se CSS foi trocado
grep -r "main.css" views/

# Verificar classes de página
grep -r "page-" views/ | head -5

# Comparar antes/depois
diff views/index.html views/index.html.backup
```

## 🚀 **Próximos Passos**

### **1. Teste das Páginas**

```bash
# Iniciar servidor
npm start

# Testar páginas principais:
# http://localhost:3000/
# http://localhost:3000/dashboard
# http://localhost:3000/login
```

### **2. Ajustes Finos**

- Verificar se todas as dimensões estão corretas
- Ajustar responsividade conforme necessário
- Otimizar componentes específicos

### **3. Limpeza**

```bash
# Após confirmar funcionamento, remover backups
find . -name "*.backup" -delete
```

## 📚 **Estrutura Final**

```
static/css/
├── main.css (importa todos os módulos)
├── 00-settings/
│   ├── _root.css (variáveis design system)
│   └── _breakpoints.css (pontos de quebra)
├── 04-layout/
│   ├── _header.css (navegação)
│   └── _footer.css (rodapé)
├── 05-components/
│   ├── _buttons.css (botões unificados)
│   └── _cards.css (cards unificados)
├── 06-pages/
│   └── _page-dimensions.css (🎯 DIMENSÕES DINÂMICAS)
└── 07-utilities/
    └── _utilities.css (classes utilitárias)
```

---

_Sistema implementado seguindo metodologias ITCSS + BEM + SMACSS para máxima escalabilidade e manutenibilidade._
