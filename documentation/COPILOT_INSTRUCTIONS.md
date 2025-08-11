# 🤖 Instruções para o GitHub Copilot - SIGMA-PLI

## 📋 Sobre o Projeto

Este ### Banco de Dados (PostgreSQL)

#### Configuração e Credenciais

- **Arquivo de configuração**: `config/.env`
- **Modo de autenticação**: **REQUIRED** (autenticação obrigatória)
- **Variáveis obrigatórias**:
  ```bash
  DB_HOST=localhost          # ou IP/hostname do servidor
  DB_PORT=5432              # porta padrão PostgreSQL
  DB_NAME=sigma_pli         # nome do banco de dados
  DB_USER=postgres          # usuário do banco (OBRIGATÓRIO)
  DB_PASSWORD=your_password # senha do banco (OBRIGATÓRIO)
  DB_SSL=false              # SSL habilitado (true/false)
  DB_AUTH_MODE=required     # modo de autenticação (required)
  ```
- **String de conexão**: Construída automaticamente pelo `src/config/database.js`
- **Pool de conexões**: Configurado para otimizar performance
- **Segurança**: Autenticação obrigatória para todas as conexões

#### Convenções

- Tabelas em **snake_case** (ex: `usuario_perfil`)
- Colunas com **tipos específicos** e **constraints**
- **Índices** em colunas de busca frequente
- **Foreign keys** para integridade referencial

#### Principais Tabelas

- `usuarios` - Usuários do sistema
- `pessoas_fisicas` - Cadastros de PF
- `pessoas_juridicas` - Cadastros de PJ
- `sessao_controle` - Controle de sessões
- `audit_log` - Log de auditoria

#### Comandos de Banco (Bash)

````bash
# Conectar ao PostgreSQL
psql -h localhost -p 5432 -U postgres -d sigma_pli

# Backup do banco
pg_dump -h localhost -U postgres sigma_pli > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U postgres -d sigma_pli < backup_20250803.sql

# Executar migrations
node scripts/run-migrations.js

# Verificar status da conexão
node scripts/test-db-connection.js
```I | Módulo de Gerenciamento de Cadastros**, um sistema web modular para gerenciamento de cadastros de Pessoa Física, Pessoa Jurídica e Usuários. A aplicação é desenvolvida em Node.js com Express.js, PostgreSQL e interface web moderna.

## 🏗️ Arquitetura da Aplicação

### Backend (Node.js + Express.js)
````

src/
├── config/ # Configurações (database, security, etc.)
├── controllers/ # Controladores da aplicação
├── middleware/ # Middlewares de autenticação, validação, etc.
├── models/ # Modelos de dados
├── routes/ # Rotas da API
├── services/ # Serviços de negócio
├── utils/ # Utilitários e helpers
├── jobs/ # Jobs e tarefas agendadas
└── monitoring/ # Monitoramento e logs

```

### Frontend
```

views/ # Páginas HTML
static/
├── css/ # Estilos CSS customizados
├── js/ # JavaScript do frontend
│ ├── components/ # Componentes reutilizáveis
│ ├── pages/ # Scripts específicos por página
│ └── utils/ # Utilitários do frontend
└── assets/ # Imagens, fontes, etc.

```

### Infraestrutura
```

database/ # Migrações e esquemas SQL
scripts/ # Scripts de automação
tools/ # Ferramentas de desenvolvimento
config/ # Configurações Docker/PM2
deploy/ # Documentação de deploy
docs/ # Documentação técnica

````

## 🎯 Diretrizes de Desenvolvimento

### 1. **Padrões de Código**

#### Backend (Node.js)
- Usar **async/await** para operações assíncronas
- Implementar **tratamento de erros** com try/catch
- Seguir padrão **MVC** (Model-View-Controller)
- Usar **JSDoc** para documentação de funções
- Implementar **validação** com express-validator
- Usar **middleware** para funcionalidades transversais

#### Frontend (JavaScript)
- Usar **ES6+** (arrow functions, const/let, template literals)
- Seguir padrão **modular** com arquivos separados por página
- Implementar **feedback visual** com SweetAlert2
- Usar **jQuery** para manipulação DOM quando necessário
- Aplicar **responsive design** com Bootstrap 5

### 2. **Segurança**

#### Autenticação e Autorização
- Sistema de **JWT tokens** para autenticação
- **Bcrypt** para hash de senhas
- **Middleware de autenticação** em rotas protegidas
- **Controle de permissões** baseado em tipo de usuário:
  - `ADMIN` - Acesso total
  - `GESTOR` - Gestão de cadastros
  - `ANALISTA` - Análise de dados
  - `OPERADOR` - Operação básica
  - `VISUALIZADOR` - Apenas visualização

#### Proteções Implementadas
- **Rate limiting** para prevenção de ataques
- **Helmet.js** para headers de segurança
- **XSS protection** e sanitização de dados
- **CORS** configurado adequadamente
- **Input validation** em todas as entradas

### 3. **Banco de Dados (PostgreSQL)**

#### Convenções
- Tabelas em **snake_case** (ex: `usuario_perfil`)
- Colunas com **tipos específicos** e **constraints**
- **Índices** em colunas de busca frequente
- **Foreign keys** para integridade referencial

#### Principais Tabelas
- `usuarios` - Usuários do sistema
- `pessoas_fisicas` - Cadastros de PF
- `pessoas_juridicas` - Cadastros de PJ
- `sessao_controle` - Controle de sessões
- `audit_log` - Log de auditoria

### 4. **Frontend Guidelines**

#### Estrutura de Páginas
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- Meta tags básicas -->
    <!-- Bootstrap 5.1.3 CSS -->
    <!-- Font Awesome 6 -->
    <!-- Estilos customizados PLI -->
</head>
<body>
    <!-- Navbar padrão PLI -->
    <main class="container-fluid">
        <!-- Conteúdo da página -->
    </main>
    <!-- Footer padrão PLI -->

    <!-- jQuery 3.6.0 -->
    <!-- Bootstrap 5.1.3 JS -->
    <!-- Scripts específicos da página -->
</body>
</html>
````

#### JavaScript Modular

```javascript
// Padrão para scripts de página
(function () {
  'use strict';

  // Variáveis e configurações
  const config = {
    apiUrl: '/api',
    pageSize: 10,
  };

  // Funções utilitárias
  const utils = {
    formatDate: (date) => {
      /* ... */
    },
    showAlert: (message, type) => {
      /* ... */
    },
  };

  // Inicialização da página
  document.addEventListener('DOMContentLoaded', function () {
    init();
  });

  function init() {
    setupEventListeners();
    loadInitialData();
  }
})();
```

### 5. **APIs e Endpoints**

#### Padrão de Rotas

```javascript
// Estrutura padrão de controller
const ExampleController = {
  // GET /api/examples
  list: async (req, res) => {
    try {
      // Lógica de listagem
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/examples
  create: async (req, res) => {
    try {
      // Validação
      // Lógica de criação
      res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
```

#### Padrão de Resposta API

```javascript
// Sucesso
{
    "success": true,
    "data": { /* dados */ },
    "message": "Operação realizada com sucesso"
}

// Erro
{
    "success": false,
    "message": "Mensagem de erro",
    "errors": [/* detalhes dos erros */]
}
```

## 🛠️ Ferramentas e Tecnologias

### Terminal e Comandos

- **Terminal padrão**: Bash (VS Code configurado para bash.exe)
- **Comandos devem ser fornecidos em formato Bash**
- **Sistema operacional**: Windows com Git Bash

#### Comandos Bash Essenciais

```bash
# Iniciar aplicação
npm start

# Desenvolvimento com watch
npm run dev

# Instalar dependências
npm install

# Scripts de manutenção
npm run update-all

# Verificar logs
tail -f logs/combined-0.log

# Verificar processos Node
ps aux | grep node

# Parar processos PM2
pm2 stop all
pm2 restart all
pm2 logs

# Git operations
git status
git add .
git commit -m "mensagem"
git push origin master
```

### Dependências Principais

- **express**: Framework web
- **pg**: Cliente PostgreSQL
- **jsonwebtoken**: Autenticação JWT
- **bcrypt**: Hash de senhas
- **helmet**: Segurança
- **express-validator**: Validação
- **winston**: Logging
- **node-cron**: Tarefas agendadas

### Frontend

- **Bootstrap 5.1.3**: Framework CSS
- **jQuery 3.6.0**: Manipulação DOM
- **Font Awesome 6**: Ícones
- **DataTables**: Tabelas avançadas
- **SweetAlert2**: Alertas elegantes
- **Chart.js**: Gráficos

## 📝 Convenções de Nomenclatura

### Arquivos e Diretórios

- **kebab-case** para arquivos: `pessoa-fisica.js`
- **camelCase** para variáveis: `pessoaFisica`
- **PascalCase** para classes: `PessoaFisicaController`

### Banco de Dados

- **snake_case** para tabelas: `pessoa_fisica`
- **snake_case** para colunas: `data_nascimento`

### CSS Classes

- **Bootstrap classes** quando possível
- **PLI prefix** para classes customizadas: `.pli-button`

## 🔍 Debugging e Logging

### Winston Logger

```javascript
const logger = require('../utils/logger');

// Níveis de log
logger.error('Erro crítico', { error: err, context: 'user-registration' });
logger.warn('Aviso importante', { userId: 123 });
logger.info('Informação geral', { action: 'user-login' });
logger.debug('Debug detalhado', { query: sqlQuery });
```

### Logs Disponíveis

- `logs/combined-0.log` - Log geral
- `logs/err-0.log` - Erros
- `logs/audit.log` - Auditoria
- `logs/security.log` - Segurança

## 📱 Responsividade

### Breakpoints Bootstrap

- **xs**: < 576px (mobile)
- **sm**: ≥ 576px (mobile landscape)
- **md**: ≥ 768px (tablet)
- **lg**: ≥ 992px (desktop)
- **xl**: ≥ 1200px (large desktop)

### Layout Grid

```html
<div class="container-fluid">
  <div class="row">
    <div class="col-12 col-md-8 col-lg-9">
      <!-- Conteúdo principal -->
    </div>
    <div class="col-12 col-md-4 col-lg-3">
      <!-- Sidebar -->
    </div>
  </div>
</div>
```

## 🚀 Scripts Disponíveis

### NPM Scripts

```bash
npm start          # Iniciar produção
npm run dev        # Desenvolvimento com nodemon
npm run update-all # Atualizar componentes frontend
npm run test-email # Testar configuração de email
```

### Scripts Utilitários (Bash)

```bash
# Verificar layout da aplicação
./check-layout.sh

# Diagnóstico completo do sistema
./diagnostico-completo.sh

# Migração de arquivos HTML
./migrate-html.sh

# Testar configuração do servidor
./test-layout.sh

# Abrir navegador (Windows)
./abrir-navegador.bat

# Verificar tabelas do banco
node check-tables.js

# Análise de memória
./scripts/analyze-memory-config.sh
```

## 🎨 Identidade Visual PLI

### Cores Principais

```css
:root {
  --pli-primary: #2c5282; /* Azul PLI */
  --pli-secondary: #4a5568; /* Cinza */
  --pli-success: #38a169; /* Verde */
  --pli-warning: #d69e2e; /* Amarelo */
  --pli-danger: #e53e3e; /* Vermelho */
}
```

### Typography

- **Fonte primária**: Montserrat
- **Fonte secundária**: Open Sans
- **Tamanhos**: 14px base, escalas Bootstrap

## � Configuração do Ambiente

### Variáveis de Ambiente (.env)

```bash
# Banco de dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigma_pli
DB_USER=postgres          # OBRIGATÓRIO - usuário para autenticação
DB_PASSWORD=your_password # OBRIGATÓRIO - senha para autenticação
DB_SSL=false
DB_AUTH_MODE=required     # Modo de autenticação obrigatória

# Autenticação JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email (SendGrid/SMTP)
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@sigma-pli.com
EMAIL_FROM_NAME=SIGMA-PLI

# Servidor
PORT=8888
NODE_ENV=production

# Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logs
LOG_LEVEL=info
LOG_FILE=logs/combined.log
```

### Setup Inicial (Bash)

```bash
# 1. Clonar repositório
git clone https://github.com/vpcapanema/pli_cadastros.git
cd pli_cadastros

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp config/.env.example config/.env
# Editar config/.env com suas credenciais

# 4. Configurar banco de dados
# Criar banco: CREATE DATABASE sigma_pli;
# IMPORTANTE: Configurar autenticação required no PostgreSQL
# Executar migrations
node scripts/run-migrations.js

# 5. Testar configuração
npm run test-email
node scripts/test-db-connection.js

# 6. Iniciar aplicação
npm start
# ou para desenvolvimento:
npm run dev
```

## �📋 Checklist para Novas Features

### Antes de Desenvolver

- [ ] Analisar requisitos e casos de uso
- [ ] Verificar impacto em funcionalidades existentes
- [ ] Planejar testes e validações
- [ ] Considerar aspectos de segurança

### Durante o Desenvolvimento

- [ ] Seguir padrões de código estabelecidos
- [ ] Implementar validação de dados
- [ ] Adicionar logs apropriados
- [ ] Testar responsividade
- [ ] Verificar compatibilidade de browsers

### Após Desenvolvimento

- [ ] Testar funcionalidade completa
- [ ] Verificar performance
- [ ] Atualizar documentação
- [ ] Validar segurança
- [ ] Realizar testes de regressão

## 🔒 Considerações de Segurança

### Input Validation

```javascript
// Exemplo de validação com express-validator
const { body, validationResult } = require('express-validator');

const validatePessoaFisica = [
  body('nome').isLength({ min: 2, max: 100 }).trim().escape(),
  body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  body('email').isEmail().normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];
```

### Authentication Middleware

```javascript
// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};
```

---

## 📞 Contato e Suporte

Para dúvidas sobre o projeto:

- Consultar documentação em `/docs/`
- Verificar logs em `/logs/`
- Revisar código-fonte comentado
- Seguir padrões estabelecidos neste documento

**Lembre-se**: Sempre priorizar segurança, performance e experiência do usuário ao desenvolver novas funcionalidades para o SIGMA-PLI.
