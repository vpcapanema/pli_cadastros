# 📋 PROPOSTA COMPLETA - SISTEMA DE GERENCIAMENTO DE CADASTROS PLI

## 🎯 **VISÃO GERAL**
Sistema web modular para gerenciamento de cadastros (Pessoa Física, Pessoa Jurídica e Usuários) com autenticação, interface responsiva e integração com PostgreSQL/AWS RDS.

---

## 🏗️ **ESTRUTURA DE DIRETÓRIOS MODULARIZADA**

```
modulo_cadastro/
├── 📁 backend/                          # API Backend (Node.js + Express)
│   ├── 📁 src/
│   │   ├── 📁 config/                   # Configurações
│   │   │   ├── database.js              # Config PostgreSQL
│   │   │   ├── auth.js                  # Config JWT/Auth
│   │   │   ├── cors.js                  # Config CORS
│   │   │   └── env.js                   # Variáveis ambiente
│   │   ├── 📁 controllers/              # Controladores (Lógica de negócio)
│   │   │   ├── authController.js        # Login/Logout/Recuperação senha
│   │   │   ├── pessoaFisicaController.js # CRUD Pessoa Física
│   │   │   ├── pessoaJuridicaController.js # CRUD Pessoa Jurídica
│   │   │   └── usuarioController.js     # CRUD Usuários sistema
│   │   ├── 📁 middleware/               # Middlewares
│   │   │   ├── auth.js                  # Validação JWT
│   │   │   ├── validation.js            # Validação dados
│   │   │   ├── errorHandler.js          # Tratamento erros
│   │   │   └── rateLimit.js             # Rate limiting
│   │   ├── 📁 models/                   # Modelos de dados
│   │   │   ├── PessoaFisica.js         # Model Pessoa Física
│   │   │   ├── PessoaJuridica.js       # Model Pessoa Jurídica
│   │   │   ├── Usuario.js               # Model Usuário
│   │   │   └── BaseModel.js             # Model base comum
│   │   ├── 📁 routes/                   # Definição de rotas
│   │   │   ├── auth.js                  # /api/auth/*
│   │   │   ├── pessoaFisica.js         # /api/pessoa-fisica/*
│   │   │   ├── pessoaJuridica.js       # /api/pessoa-juridica/*
│   │   │   ├── usuario.js               # /api/usuario/*
│   │   │   └── index.js                 # Router principal
│   │   ├── 📁 services/                 # Serviços de negócio
│   │   │   ├── authService.js           # Lógica autenticação
│   │   │   ├── emailService.js          # Envio emails
│   │   │   ├── validationService.js     # Validações CPF/CNPJ
│   │   │   └── databaseService.js       # Operações DB específicas
│   │   ├── 📁 utils/                    # Utilitários
│   │   │   ├── logger.js                # Sistema de logs
│   │   │   ├── helpers.js               # Funções auxiliares
│   │   │   ├── constants.js             # Constantes do sistema
│   │   │   └── formatters.js            # Formatação dados
│   │   └── app.js                       # Configuração Express principal
│   ├── 📁 tests/                        # Testes automatizados
│   │   ├── 📁 unit/                     # Testes unitários
│   │   ├── 📁 integration/              # Testes integração
│   │   └── 📁 fixtures/                 # Dados de teste
│   ├── package.json                     # Dependências Node.js
│   ├── .env.example                     # Exemplo variáveis ambiente
│   └── server.js                        # Entrada da aplicação
│
├── 📁 frontend/                          # Interface Web (HTML/CSS/JS)
│   ├── 📁 public/                       # Arquivos estáticos
│   │   ├── 📁 css/                      # Estilos CSS
│   │   │   ├── pli-theme.css           # Tema PLI principal
│   │   │   ├── components.css           # Estilos componentes
│   │   │   ├── forms.css               # Estilos formulários
│   │   │   ├── tables.css              # Estilos tabelas
│   │   │   └── responsive.css          # Responsividade
│   │   ├── 📁 js/                       # JavaScript modular
│   │   │   ├── 📁 components/           # Componentes JS
│   │   │   │   ├── form-validator.js    # Validação formulários
│   │   │   │   ├── table-manager.js     # Gerenciamento tabelas
│   │   │   │   ├── modal-manager.js     # Controle modais
│   │   │   │   ├── notification.js      # Sistema notificações
│   │   │   │   └── loading.js          # Indicadores carregamento
│   │   │   ├── 📁 services/             # Serviços frontend
│   │   │   │   ├── api.js              # Cliente API
│   │   │   │   ├── auth.js             # Autenticação frontend
│   │   │   │   ├── storage.js          # LocalStorage/SessionStorage
│   │   │   │   └── utils.js            # Utilitários frontend
│   │   │   ├── 📁 pages/                # Scripts específicos páginas
│   │   │   │   ├── login.js            # Lógica página login
│   │   │   │   ├── dashboard.js        # Lógica dashboard
│   │   │   │   ├── pessoa-fisica.js    # Lógica cadastro PF
│   │   │   │   ├── pessoa-juridica.js  # Lógica cadastro PJ
│   │   │   │   └── usuario.js          # Lógica usuários
│   │   │   └── app.js                  # Configuração principal frontend
│   │   ├── 📁 images/                   # Imagens e ícones
│   │   └── 📁 fonts/                    # Fontes customizadas
│   ├── 📁 views/                        # Páginas HTML
│   │   ├── index.html                   # Página inicial
│   │   ├── login.html                   # Login
│   │   ├── dashboard.html               # Dashboard principal
│   │   ├── pessoa-fisica.html           # Cadastro Pessoa Física
│   │   ├── pessoa-juridica.html         # Cadastro Pessoa Jurídica
│   │   ├── usuarios.html                # Gerenciamento usuários
│   │   ├── recuperar-senha.html         # Recuperação senha
│   │   └── 📁 components/               # Componentes HTML reutilizáveis
│   │       ├── navbar.html              # Barra navegação
│   │       ├── footer.html              # Rodapé
│   │       └── modal-templates.html     # Templates modais
│   └── favicon.ico                      # Ícone do site
│
├── 📁 database/                          # Configuração banco dados
│   ├── 📁 migrations/                   # Migrações SQL
│   │   ├── 001_create_schemas.sql       # Criação schemas
│   │   ├── 002_create_tables.sql        # Criação tabelas
│   │   ├── 003_create_indexes.sql       # Índices performance
│   │   └── 004_insert_defaults.sql      # Dados padrão
│   ├── 📁 seeds/                        # Dados iniciais
│   │   ├── admin_user.sql              # Usuário admin
│   │   └── sample_data.sql             # Dados exemplo
│   ├── 📁 docs/                         # Documentação DB
│   │   ├── ANALISE_ESTRUTURA_DATABASE.md # (existente)
│   │   ├── tabelas_base_definicao.md    # (existente)
│   │   └── MAPEAMENTO_TABELAS_SIGATA.md # (existente)
│   └── backup.sql                       # Backup estrutura
│
├── 📁 docs/                             # Documentação projeto
│   ├── API.md                          # Documentação API
│   ├── INSTALACAO.md                   # Guia instalação
│   ├── DEPLOYMENT.md                   # Guia implantação
│   └── IDENTIDADE_VISUAL_PLI/          # (existente)
│
├── 📁 scripts/                          # Scripts automação
│   ├── start.sh                        # Script inicialização
│   ├── deploy.sh                       # Script deploy
│   ├── backup.sh                       # Script backup
│   └── setup-dev.sh                    # Setup desenvolvimento
│
├── 📁 config/                           # Configurações gerais
│   ├── nginx.conf                      # Configuração Nginx
│   ├── pm2.json                        # Configuração PM2
│   └── docker-compose.yml              # Docker (opcional)
│
├── .gitignore                          # Arquivos ignorados Git
├── README.md                           # Documentação principal
└── package.json                       # Configuração projeto geral
```

---

## 🛠️ **FERRAMENTAS E TECNOLOGIAS (100% OPEN SOURCE)**

### **Backend:**
- **Node.js** (Runtime JavaScript)
- **Express.js** (Framework web)
- **PostgreSQL** (Banco de dados)
- **node-postgres (pg)** (Driver PostgreSQL)
- **JWT** (Autenticação)
- **bcrypt** (Hash senhas)
- **Joi** (Validação dados)
- **Winston** (Sistema logs)
- **Nodemailer** (Envio emails)
- **Jest** (Testes)

### **Frontend:**
- **HTML5/CSS3/JavaScript** (Base)
- **Bootstrap 5** (Framework CSS)
- **Font Awesome** (Ícones)
- **Axios** (Cliente HTTP)
- **SweetAlert2** (Modais/alertas)
- **DataTables** (Tabelas avançadas)

### **Infraestrutura:**
- **Nginx** (Proxy reverso/servidor web)
- **PM2** (Process manager)
- **AWS RDS PostgreSQL** (Banco dados)
- **AWS EC2** (Servidor aplicação)
- **Let's Encrypt** (Certificado SSL)

---

## 📊 **FUNCIONALIDADES PRINCIPAIS**

### **1. Sistema de Autenticação**
- Login/logout seguro
- Recuperação de senha por email
- Controle de sessões (JWT)
- Proteção rotas (middleware)

### **2. Gerenciamento Cadastros**
- **Pessoa Física:** CRUD completo com validação CPF
- **Pessoa Jurídica:** CRUD completo com validação CNPJ
- **Usuários Sistema:** Controle acesso e permissões

### **3. Interface Responsiva**
- Dashboard com métricas
- Listagem com filtros avançados
- Formulários validados
- Modais para edição
- Notificações em tempo real

### **4. Segurança**
- Hash senhas (bcrypt)
- Rate limiting
- Validação entrada dados
- Sanitização SQL injection
- Headers segurança

---

## 🚀 **INFRAESTRUTURA COMPUTACIONAL NECESSÁRIA**

### **Servidor de Aplicação (AWS EC2):**
- **Instância:** t3.medium (2 vCPUs, 4 GB RAM)
- **Sistema:** Ubuntu 22.04 LTS
- **Armazenamento:** 20 GB SSD
- **Rede:** VPC com security groups configurados

### **Banco de Dados:**
- **AWS RDS PostgreSQL** (já configurado)
- **Instância:** db.t3.micro
- **Armazenamento:** 20 GB
- **Backup:** Automatizado diário

### **Recursos Adicionais:**
- **Domínio:** Para acesso HTTPS
- **Certificado SSL:** Let's Encrypt (gratuito)
- **Load Balancer:** (opcional para alta disponibilidade)

---

## 📈 **ESTIMATIVA DE CUSTOS AWS (MENSAL)**

| Recurso | Especificação | Custo Estimado |
|---------|---------------|----------------|
| EC2 t3.medium | 2 vCPUs, 4GB RAM | ~$30 USD |
| RDS PostgreSQL | db.t3.micro | ~$15 USD |
| Storage | 40 GB total | ~$4 USD |
| Data Transfer | 100 GB | ~$9 USD |
| **TOTAL** | | **~$58 USD/mês** |

---

## 🔄 **PLANO DE IMPLEMENTAÇÃO**

### **FASE 1: PREPARAÇÃO (Semana 1)**
1. ✅ Configuração ambiente desenvolvimento
2. ✅ Setup repositório Git
3. ✅ Criação estrutura diretórios
4. ✅ Configuração banco dados (migrações)

### **FASE 2: BACKEND API (Semana 2-3)**
1. ✅ Configuração Express.js
2. ✅ Implementação autenticação JWT
3. ✅ CRUD Pessoa Física
4. ✅ CRUD Pessoa Jurídica
5. ✅ CRUD Usuários
6. ✅ Middleware segurança
7. ✅ Testes unitários

### **FASE 3: FRONTEND (Semana 4-5)**
1. ✅ Páginas HTML responsivas
2. ✅ Integração identidade visual PLI
3. ✅ JavaScript modular
4. ✅ Validação formulários
5. ✅ Interface listagem/filtros
6. ✅ Sistema notificações

### **FASE 4: INTEGRAÇÃO (Semana 6)**
1. ✅ Conexão frontend-backend
2. ✅ Testes integração
3. ✅ Ajustes performance
4. ✅ Validação segurança

### **FASE 5: DEPLOY (Semana 7)**
1. ✅ Configuração servidor AWS EC2
2. ✅ Setup Nginx
3. ✅ Configuração PM2
4. ✅ Certificado SSL
5. ✅ Deploy aplicação
6. ✅ Testes produção

### **FASE 6: DOCUMENTAÇÃO E ENTREGA (Semana 8)**
1. ✅ Documentação completa
2. ✅ Manual usuário
3. ✅ Treinamento equipe
4. ✅ Suporte pós-implantação

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Aprovação da estrutura proposta**
2. **Início implementação backend**
3. **Configuração ambiente desenvolvimento**
4. **Criação das primeiras APIs**

---

**📞 CONTATO:** Para dúvidas ou sugestões sobre esta proposta.
**📅 DATA:** 16 de julho de 2025
**✍️ VERSÃO:** 1.0
