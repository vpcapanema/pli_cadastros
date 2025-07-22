# 📋 Sistema de Gerenciamento de Cadastros PLI

Sistema web modular para gerenciamento de cadastros de Pessoa Física, Pessoa Jurídica e Usuários, desenvolvido para o Programa de Legalização de Imóveis (PLI).

## 🎯 Visão Geral

Esta aplicação oferece uma solução completa e segura para o gerenciamento de cadastros, com interface moderna, responsiva e funcionalidades avançadas de segurança e usabilidade.

### ✨ Características Principais

- **Interface Moderna**: Design responsivo baseado em Bootstrap 5
- **Segurança Avançada**: Autenticação JWT, criptografia e controle de sessão
- **Modularidade**: Código organizado em componentes reutilizáveis
- **Performance**: Sistema de cache, lazy loading e otimizações
- **Open Source**: 100% baseado em tecnologias abertas

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Bootstrap 5** - Framework CSS responsivo
- **Font Awesome 6** - Ícones
- **DataTables** - Tabelas avançadas
- **Chart.js** - Gráficos e dashboards
- **SweetAlert2** - Alertas elegantes
- **jQuery** - Manipulação DOM

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Cors** - Controle de origem cruzada

### Infraestrutura
- **AWS RDS** - Banco de dados hospedado
- **Nginx** - Servidor web
- **PM2** - Gerenciador de processos
- **Docker** - Containerização
- **SSL/TLS** - Certificados de segurança

## 📁 Estrutura do Projeto

```
pli_cadastros/
├── 📁 src/                        # Todo o código backend
│   ├── 📁 config/                 # Configurações
│   ├── 📁 controllers/            # Controladores
│   ├── 📁 middleware/             # Middlewares
│   ├── 📁 models/                 # Modelos de dados
│   ├── 📁 routes/                 # Rotas da API
│   └── 📁 services/               # Serviços de negócio
├── 📁 public/                     # Arquivos estáticos
│   ├── 📁 css/                    # Estilos CSS
│   ├── 📁 js/                     # JavaScript do cliente
│   └── 📁 images/                 # Imagens
├── 📁 views/                      # Templates HTML
│   └── 📁 components/             # Componentes HTML
├── 📁 database/                   # Documentação do BD
├── 📁 scripts/                    # Scripts de utilidade
│   └── 📁 utils/                  # Scripts utilitários
├── 📁 docs/                       # Documentação
├── .env                           # Variáveis de ambiente
├── server.js                      # Ponto de entrada
└── package.json                   # Dependências
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/vpcapanema/pli_cadastros.git
cd pli_cadastros
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configuração do Banco de Dados
```bash
# Editar arquivo .env com suas configurações
# Executar migrations para criar tabelas
npm run migrate

# Inserir dados iniciais
npm run seed
```

### 4. Iniciar o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📱 Funcionalidades

- 🔐 **Autenticação e Segurança**: Login, recuperação de senha, controle de sessão
- 👤 **Gestão de Usuários**: CRUD completo, níveis de permissão, histórico
- 🧑 **Pessoa Física**: Cadastro completo com validação CPF, busca avançada
- 🏢 **Pessoa Jurídica**: Cadastro com validação CNPJ, gestão de sócios
- 📊 **Dashboard e Relatórios**: Visão geral em tempo real, gráficos interativos

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Deploy

### Docker
```bash
# Build da imagem
docker build -t pli-cadastros .

# Executar container
docker run -p 8080:8080 pli-cadastros
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](docs/LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para o Programa de Legalização de Imóveis (PLI)**