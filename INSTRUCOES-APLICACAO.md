# 📋 INSTRUÇÕES DA APLICAÇÃO PLI CADASTROS

## 🖥️ **CONFIGURAÇÃO DO TERMINAL**
**IMPORTANTE**: Esta aplicação utiliza **BASH** como terminal padrão.
- Windows: Use Git Bash, WSL ou configure o VS Code para usar bash.exe
- Linux/Mac: Terminal nativo

---

## 🚀 **EXECUÇÃO DA APLICAÇÃO**

### **Porta da Aplicação**
```bash
PORT: 8888
URL: http://localhost:8888
```

### **Comandos Principais**
```bash
# Iniciar aplicação
npm start

# Modo desenvolvimento (com nodemon)
npm run dev

# Verificar status completo
bash diagnostico-completo.sh
```

### **⚠️ SEMPRE ANTES DE REINICIAR**
```bash
# 1. Matar todos os processos Node.js
pkill -f node
# ou no Windows:
taskkill /f /im node.exe

# 2. Verificar se a porta está livre
netstat -ano | grep :8888
# ou no Windows:
netstat -ano | findstr :8888

# 3. Iniciar novamente
npm start
```

---

## 🏗️ **ARQUITETURA MODULAR DA APLICAÇÃO**

### **📁 FRONTEND (Modularização)**

#### **🎨 CSS (Sistema Modular ITCSS)**
```
static/css/
├── main.css                    # ⭐ Arquivo principal (importa tudo)
├── 00-settings/               # Variáveis e configurações
│   ├── _root.css             # Cores PLI, fontes, dimensões
│   └── _breakpoints.css      # Media queries
├── 01-generic/               # Reset e correções
│   └── _reset-fixes.css      # Reset global e fixes
├── 04-layout/               # Estrutura da página
│   ├── _base.css           # Layout base
│   ├── _header.css         # Navbar
│   └── _footer.css         # Footer
├── 05-components/          # Componentes reutilizáveis
│   ├── _buttons.css        # Botões PLI
│   └── _cards.css          # Cards
├── 06-pages/              # Estilos específicos por página
│   ├── _index-page.css    # Página inicial
│   ├── _login-page.css    # Login
│   ├── _dashboard-page.css # Dashboard
│   └── _usuarios-page.css  # Usuários
└── 07-utilities/          # Classes utilitárias
    └── _utilities.css     # Helpers e utilitários
```

#### **⚙️ JavaScript (Sistema de Loaders)**
```
static/js/
├── 📁 pages/                     # Scripts específicos por página
│   ├── index-statistics.js      # Estatísticas da home
│   ├── login.js                 # Lógica de login
│   ├── dashboard.js             # Dashboard
│   ├── pessoa-fisica.js         # Cadastro PF
│   ├── pessoa-juridica.js       # Cadastro PJ
│   └── usuarios.js              # Gerenciamento usuários
├── 📁 services/                 # Serviços e APIs
│   ├── api.js                   # Cliente HTTP
│   ├── auth.js                  # Autenticação
│   └── utils.js                 # Utilitários
├── 📁 components/               # Componentes reutilizáveis
│   ├── passwordToggle.js        # Mostrar/ocultar senha
│   ├── form-validator.js        # Validação de formulários
│   ├── loading.js               # Loading states
│   └── notification.js          # Notificações
├── 📁 config/                   # Configurações
│   └── security.js              # Configurações de segurança
├── navbar-loader.js             # ⭐ Carrega navbar modular
├── footer-loader.js             # ⭐ Carrega footer modular
├── core-scripts-loader.js       # ⭐ Carrega scripts externos
└── datatable-script-loader.js   # ⭐ Carrega DataTables
```

#### **📄 HTML (Componentes Modulares)**
```
views/
├── 📁 components/               # Componentes reutilizáveis
│   ├── navbar.html             # Barra de navegação
│   ├── footer.html             # Rodapé
│   └── modal-templates.html    # Modais
├── index.html                  # ⭐ Página inicial
├── login.html                  # Login
├── dashboard.html              # Dashboard
├── pessoa-fisica.html          # Cadastro Pessoa Física
├── pessoa-juridica.html        # Cadastro Pessoa Jurídica
├── usuarios.html               # Gerenciamento Usuários
├── meus-dados.html            # Perfil do usuário
└── recuperar-senha.html       # Recuperação de senha
```

**Padrão de Inclusão HTML:**
```html
<!-- CSS (HEAD) -->
<link href="CDN_BOOTSTRAP" rel="stylesheet">
<link href="CDN_FONTAWESOME" rel="stylesheet">
<link href="CDN_FONTS" rel="stylesheet">
<link rel="stylesheet" href="/static/css/main.css">

<!-- JavaScript (BODY final) -->
<script src="/static/js/navbar-loader.js"></script>
<script src="/static/js/pages/[pagina-especifica].js"></script>
<script src="/static/js/footer-loader.js"></script>
```

---

### **🔧 BACKEND (Arquitetura MVC Modular)**

```
src/
├── 📁 config/                  # Configurações
│   ├── database.js            # Conexão PostgreSQL
│   ├── security.js            # Middlewares de segurança
│   └── email.js               # Configuração de email
├── 📁 controllers/            # Controladores (Lógica de negócio)
│   ├── authController.js      # Autenticação
│   ├── pessoaFisicaController.js # Pessoa Física
│   ├── pessoaJuridicaController.js # Pessoa Jurídica
│   ├── usuarioController.js   # Usuários
│   └── estatisticasController.js # Estatísticas
├── 📁 middleware/             # Middlewares customizados
│   ├── auth.js               # Verificação de autenticação
│   ├── audit.js              # Auditoria
│   ├── validation.js         # Validação de dados
│   └── errorHandler.js       # Tratamento de erros
├── 📁 models/                # Modelos de dados
│   ├── User.js              # Modelo de usuário
│   ├── PessoaFisica.js      # Modelo pessoa física
│   └── PessoaJuridica.js    # Modelo pessoa jurídica
├── 📁 routes/               # Rotas da API
│   ├── auth.js             # Rotas de autenticação
│   ├── pessoaFisica.js     # Rotas pessoa física
│   ├── pessoaJuridica.js   # Rotas pessoa jurídica
│   ├── usuarios.js         # Rotas usuários
│   └── pages.js            # Rotas de páginas
├── 📁 services/            # Serviços de negócio
│   ├── emailService.js     # Envio de emails
│   ├── authService.js      # Serviços de autenticação
│   └── validationService.js # Validações complexas
├── 📁 jobs/               # Jobs e tarefas agendadas
│   └── sessionCleanup.js  # Limpeza de sessões
├── 📁 monitoring/         # Monitoramento e logs
│   └── logger.js         # Sistema de logs
└── 📁 utils/             # Utilitários
    ├── helpers.js        # Funções auxiliares
    └── constants.js      # Constantes da aplicação
```

**Arquivo Principal:**
```
server.js                    # ⭐ Servidor Express principal
```

---

## 🗄️ **BANCO DE DADOS**

### **Esquemas PostgreSQL:**
```sql
-- Esquemas principais
cadastro              # Pessoas físicas e jurídicas
usuarios             # Usuários do sistema
public               # Tabelas auxiliares
```

### **Principais Tabelas:**
```sql
-- cadastro.pessoa_fisica (39 campos)
-- cadastro.pessoa_juridica (29 campos)
-- usuarios.usuario_sistema (33 campos)
-- usuarios.sessao_controle (controle de sessões)
```

---

## 🛠️ **FERRAMENTAS E UTILITÁRIOS**

```
tools/
├── setup-db.js           # Configuração inicial do banco
├── setup-sendgrid.js     # Configuração de email
├── setup-sessions.js     # Configuração de sessões
└── test-email.js         # Teste de envio de email
```

```
scripts/
├── update-footer.js      # Atualizar componente footer
├── update-navbar.js      # Atualizar componente navbar
└── update-buttons.js     # Atualizar componente botões
```

---

## 🔐 **SEGURANÇA**

### **Middlewares Ativos:**
- ✅ **Helmet** - Headers de segurança
- ✅ **CORS** - Controle de origem cruzada
- ✅ **Rate Limiting** - Limite de requisições
- ✅ **XSS Protection** - Proteção contra XSS
- ✅ **SQL Injection Prevention** - Proteção contra SQL Injection
- ✅ **CSRF Protection** - Proteção contra CSRF
- ✅ **Session Management** - Gerenciamento seguro de sessões

### **Autenticação:**
- JWT Tokens
- Sessões inteligentes
- Controle de acesso por níveis
- Auditoria completa

---

## 📊 **MONITORAMENTO**

### **Logs:**
```bash
# Verificar logs em tempo real
tail -f logs/application.log

# Logs de erro
tail -f logs/error.log
```

### **Diagnóstico:**
```bash
# Diagnóstico completo
bash diagnostico-completo.sh

# Verificar tabelas do banco
node check-tables.js
```

---

## 🚀 **DEPLOY**

### **Produção:**
```bash
# Variáveis de ambiente
NODE_ENV=production
PORT=8888

# Iniciar com PM2
pm2 start ecosystem.config.js

# Monitorar
pm2 status
pm2 logs
```

### **Arquivos de Configuração:**
```
config/
├── .env.production      # Variáveis de produção
└── ecosystem.config.js  # Configuração PM2
```

---

## 📝 **COMANDOS ÚTEIS**

### **Desenvolvimento:**
```bash
# Instalar dependências
npm install

# Atualizar componentes
npm run update-all

# Testar email
npm run test-email
```

### **Manutenção:**
```bash
# Limpar cache do npm
npm cache clean --force

# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update
```

---

## ⚠️ **TROUBLESHOOTING**

### **Problemas Comuns:**

1. **Porta em uso:**
   ```bash
   pkill -f node
   npm start
   ```

2. **CSS não carrega:**
   ```bash
   # Limpar cache do navegador: Ctrl+F5
   # Verificar no DevTools se main.css carrega
   ```

3. **Banco não conecta:**
   ```bash
   # Verificar variáveis de ambiente
   # Testar conexão: node check-tables.js
   ```

4. **Sessão expira:**
   ```bash
   # Verificar logs de sessão
   # Limpar localStorage do navegador
   ```

---

## 📞 **SUPORTE**

- **Logs da aplicação**: `logs/`
- **Diagnóstico**: `bash diagnostico-completo.sh`
- **Documentação**: `docs/`
- **Deploy**: `deploy/`

---

**📅 Última atualização**: 03/08/2025  
**🔖 Versão**: 1.0.0  
**👨‍💻 Desenvolvido por**: PLI Team
