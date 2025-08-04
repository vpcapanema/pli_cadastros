# 📄 TEMPLATE BASE HTML - SISTEMA PLI

## 📝 Descrição

O arquivo `base.html` é o template padrão para todas as páginas do sistema SIGMA/PLI. Ele implementa a estrutura completa com header fixo (dois tipos de navbar), body dinâmico e footer fixo.

## 🏗️ Estrutura do Template

### **HEADER - Navbar Duplo**
- **Navbar Público**: Para usuários não logados (páginas de cadastro, login, etc.)
- **Navbar Restrito**: Para usuários logados (dashboard, gestão, etc.)

### **BODY - Conteúdo Dinâmico**
- Container fluido para o conteúdo principal
- Seções opcionais para breadcrumb e alertas
- Área principal para conteúdo específico da página

### **FOOTER - Fixo**
- Informações do sistema
- Links institucionais
- Status do sistema e versão
- Copyright e créditos

## 🔧 Variáveis Template

### **Obrigatórias**
```html
{{page_title}}     <!-- Título da página (ex: "Dashboard") -->
{{main_content}}   <!-- Conteúdo principal da página -->
```

### **Opcionais**
```html
{{body_class}}                    <!-- Classes CSS do body -->
{{additional_css}}                <!-- CSS específico da página -->
{{additional_js}}                 <!-- JavaScript específico -->
{{public_navbar_display}}         <!-- "block" ou "none" -->
{{restricted_navbar_display}}     <!-- "block" ou "none" -->
{{user_name}}                     <!-- Nome do usuário logado -->
{{system_version}}                <!-- Versão do sistema -->
{{breadcrumb_content}}            <!-- Navegação breadcrumb -->
{{alerts_content}}                <!-- Mensagens/alertas -->
```

## 📱 Controle de Navbar

### **Navbar Público** (não logado)
- Links: Início, Cadastros (dropdown), Login
- Usado em: páginas públicas, formulários de cadastro, login

### **Navbar Restrito** (logado)
- Links: Dashboard, Cadastros, Gerencial, Perfil do usuário
- Usado em: área administrativa, gestão de dados

### **Alternância Automática**
```javascript
// Controle via JavaScript
toggleNavbar(isLoggedIn); // true = navbar restrito, false = navbar público
```

## 🎨 Classes CSS PLI

### **Layout**
```css
.l-header          /* Header fixo */
.l-main            /* Área principal */
.l-footer          /* Footer fixo */
```

### **Navbar**
```css
.pli-navbar                    /* Container navbar */
.pli-navbar__brand             /* Logo/marca */
.pli-navbar__link              /* Links de navegação */
.pli-navbar__link--active      /* Link ativo */
.pli-navbar__dropdown          /* Menu dropdown */
.pli-navbar__utilities         /* Área de utilidades */
.pli-navbar__profile           /* Perfil do usuário */
```

### **Footer**
```css
.pli-footer                    /* Container footer */
.pli-footer__content           /* Conteúdo do footer */
.pli-footer__logo              /* Logo do footer */
.pli-footer__text              /* Texto principal */
.pli-footer__links             /* Links do footer */
.pli-footer__copyright         /* Copyright */
.pli-footer__status            /* Status do sistema */
.pli-footer__version           /* Versão do sistema */
```

## 🚀 Exemplos de Uso

### **1. Página de Login (Navbar Público)**
```html
<!-- Substitua as variáveis template -->
{{page_title}} = "Login"
{{body_class}} = "page-login"
{{public_navbar_display}} = "block"
{{restricted_navbar_display}} = "none"
{{additional_css}} = '<link href="/static/css/06-pages/_login-page.css" rel="stylesheet">'
{{main_content}} = <!-- Formulário de login -->
```

### **2. Dashboard (Navbar Restrito)**
```html
{{page_title}} = "Dashboard"
{{body_class}} = "page-dashboard"
{{public_navbar_display}} = "none"
{{restricted_navbar_display}} = "block"
{{user_name}} = "João Silva"
{{main_content}} = <!-- Conteúdo do dashboard -->
```

### **3. Página de Cadastro (Navbar Público)**
```html
{{page_title}} = "Cadastro Pessoa Física"
{{body_class}} = "page-cadastro"
{{public_navbar_display}} = "block"
{{restricted_navbar_display}} = "none"
{{breadcrumb_content}} = <!-- Navegação breadcrumb -->
{{main_content}} = <!-- Formulário de cadastro -->
```

## 🔄 JavaScript Integrado

### **Funções Disponíveis**
```javascript
toggleNavbar(isLoggedIn)         // Alterna entre navbars
updateSystemStatus(status)       // Atualiza status do sistema
```

### **Estados do Sistema**
- `'online'` - Sistema funcionando (verde)
- `'warning'` - Manutenção programada (amarelo)
- `'error'` - Sistema instável (vermelho)

## 📋 Checklist de Implementação

- [ ] Definir título da página
- [ ] Escolher tipo de navbar (público/restrito)
- [ ] Adicionar conteúdo principal
- [ ] Incluir CSS específico (se necessário)
- [ ] Incluir JavaScript específico (se necessário)
- [ ] Definir classe do body (se necessário)
- [ ] Configurar breadcrumb (se necessário)
- [ ] Adicionar alertas/mensagens (se necessário)

## 🎯 Vantagens

✅ **Consistência**: Design unificado em todas as páginas
✅ **Responsividade**: Layout adaptável para todos os dispositivos  
✅ **Acessibilidade**: Estrutura semântica e navegação adequada
✅ **Manutenibilidade**: Alterações centralizadas no template base
✅ **SEO Friendly**: Meta tags e estrutura otimizada
✅ **Performance**: CSS e JS organizados e otimizados

## 📁 Arquivos Relacionados

```
views/templates/
├── base.html              # Template principal
├── example-usage.html     # Exemplo de uso
└── README.md             # Esta documentação

static/css/
├── main.css              # CSS principal (importa todos os módulos)
├── 04-layout/
│   ├── _header.css       # Estilos do header/navbar
│   ├── _footer.css       # Estilos do footer
│   └── _base.css         # Layout base
└── 00-settings/
    └── _root.css         # Variáveis CSS do sistema
```
