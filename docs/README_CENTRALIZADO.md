# SIGMA-PLI | Módulo de Gerenciamento de Cadastros - Sistema Centralizado

Sistema completo de gerenciamento de cadastros PLI com arquitetura centralizada, pronto para deploy em AWS.

## 🏗️ Estrutura do Projeto (Centralizada)

```
pli_cadastros/
├── server.js                      # Servidor principal
├── package.json                   # Dependências centralizadas
├── .env                          # Configurações de ambiente
├── .gitignore                    # Arquivos ignorados
├── 
├── src/                          # Backend (API)
│   ├── config/                   # Configurações
│   │   ├── auth.js              # Configurações de autenticação
│   │   ├── cors.js              # Configurações CORS
│   │   └── database.js          # Configurações do banco
│   ├── middleware/               # Middlewares
│   │   └── auth.js              # Middleware de autenticação
│   ├── routes/                   # Rotas da API
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── pages.js             # Rotas das páginas
│   │   ├── usuarios.js          # Rotas de usuários
│   │   ├── pessoaFisica.js      # Rotas pessoa física
│   │   ├── pessoaJuridica.js    # Rotas pessoa jurídica
│   │   └── documents.js         # Rotas de documentos
│   └── services/                 # Serviços
│       └── authService.js       # Serviços de autenticação
│
├── frontend/                     # Frontend (Interface)
│   └── views/                   # Páginas HTML
│       ├── index.html           # Página inicial
│       ├── login.html           # Página de login
│       ├── dashboard.html       # Dashboard principal
│       ├── pessoa-fisica.html   # Cadastro pessoa física
│       ├── pessoa-juridica.html # Cadastro pessoa jurídica
│       ├── usuarios.html        # Gestão de usuários
│       ├── upload.html          # Upload de documentos
│       └── components/          # Componentes reutilizáveis
│           ├── navbar.html      # Barra de navegação
│           ├── footer.html      # Rodapé
│           └── modal-templates.html # Templates de modais
│
├── public/                       # Arquivos estáticos servidos
│   ├── css/                     # Estilos CSS
│   │   └── sistema_aplicacao_cores_pli.css
│   ├── js/                      # Scripts JavaScript
│   └── images/                  # Imagens
│
├── database/                     # Documentação do banco
│   ├── ANALISE_ESTRUTURA_DATABASE.md
│   ├── MAPEAMENTO_TABELAS_SIGATA.md
│   └── tabelas_base_definicao.md
│
└── docs/                        # Documentação
    ├── CONTRIBUTING.md
    ├── LICENSE
    └── PROPOSTA_ESTRUTURA_APLICACAO.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL (local ou AWS RDS)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/vpcapanema/pli_cadastros.git
cd pli_cadastros

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute o servidor
npm start

# Para desenvolvimento (com auto-reload)
npm run dev
```

### Scripts Disponíveis
```bash
npm start          # Inicia o servidor em produção
npm run dev        # Inicia em modo desenvolvimento
npm test           # Executa os testes
npm run migrate    # Executa migrações do banco
npm run seed       # Popula dados iniciais
npm run build      # Build para produção
npm run deploy     # Deploy para AWS
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Usuários
- `GET /api/usuarios` - Lista usuários
- `POST /api/usuarios` - Cria usuário
- `PUT /api/usuarios/:id` - Atualiza usuário
- `DELETE /api/usuarios/:id` - Remove usuário

### Pessoa Física
- `GET /api/pessoa-fisica` - Lista pessoas físicas
- `POST /api/pessoa-fisica` - Cria pessoa física
- `PUT /api/pessoa-fisica/:id` - Atualiza pessoa física
- `DELETE /api/pessoa-fisica/:id` - Remove pessoa física

### Pessoa Jurídica
- `GET /api/pessoa-juridica` - Lista pessoas jurídicas
- `POST /api/pessoa-juridica` - Cria pessoa jurídica
- `PUT /api/pessoa-juridica/:id` - Atualiza pessoa jurídica
- `DELETE /api/pessoa-juridica/:id` - Remove pessoa jurídica

### Documentos
- `POST /api/documents/upload` - Upload de documentos
- `GET /api/documents/:id` - Download de documento

### Páginas Web
- `GET /` - Página inicial
- `GET /login.html` - Página de login
- `GET /dashboard.html` - Dashboard
- `GET /pessoa-fisica.html` - Cadastro pessoa física
- `GET /pessoa-juridica.html` - Cadastro pessoa jurídica
- `GET /usuarios.html` - Gestão de usuários
- `GET /upload.html` - Upload de documentos

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=seu-host-rds.amazonaws.com
DB_PORT=5432
DB_NAME=pli_cadastros
DB_USER=postgres
DB_PASSWORD=sua_senha

# Segurança
JWT_SECRET=sua_chave_jwt_super_secreta
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# AWS (para deploy)
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
```

## 🚀 Deploy AWS (Free Tier)

### Opção 1: EC2 + RDS
```bash
# 1. Criar instância EC2 t2.micro
# 2. Configurar RDS PostgreSQL db.t3.micro
# 3. Deploy da aplicação
npm run deploy
```

### Opção 2: Elastic Beanstalk
```bash
# 1. Instalar EB CLI
# 2. Inicializar projeto
eb init
eb create pli-cadastros-env
eb deploy
```

### Opção 3: Docker + ECS
```bash
# Build da imagem
npm run docker:build

# Deploy no ECS
npm run docker:deploy
```

## 📊 Monitoramento

- **Health Check**: `GET /health`
- **API Test**: `GET /api/test`
- **Logs**: Pasta `logs/` (winston)
- **Métricas**: Dashboard interno

## 🔒 Segurança

- CORS configurado
- Helmet para headers de segurança
- Rate limiting
- Validação de dados (Joi)
- Hash de senhas (bcrypt)
- JWT para autenticação
- Sanitização de inputs

## 📝 Desenvolvimento

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas auxiliares
```

### Testes
```bash
npm test              # Executa todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Coverage report
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/vpcapanema/pli_cadastros/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/vpcapanema/pli_cadastros/wiki)
- **Email**: suporte@pli.gov.br

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**SIGMA-PLI | Módulo de Gerenciamento de Cadastros** - Sistema de Gerenciamento de Cadastros Centralizado
Versão 1.0.0 - Estrutura Centralizada ✅
