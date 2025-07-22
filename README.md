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
│   ├── 📁 config/                 # Configurações do backend
│   ├── 📁 controllers/            # Controladores
│   ├── 📁 middleware/             # Middlewares
│   ├── 📁 models/                 # Modelos de dados
│   ├── 📁 routes/                 # Rotas da API
│   └── 📁 services/               # Serviços de negócio
├── 📁 config/                     # Configurações do projeto
│   ├── .env                       # Variáveis de ambiente
│   ├── .hintrc                    # Configuração do linter
│   ├── docker-compose.yml         # Configuração Docker Compose
│   └── Dockerfile                 # Configuração Docker
├── 📁 public/                     # Arquivos estáticos
│   ├── 📁 css/                    # Estilos CSS
│   ├── 📁 js/                     # JavaScript do cliente
│   └── 📁 images/                 # Imagens
├── 📁 views/                      # Templates HTML
│   ├── 📁 components/             # Componentes HTML
│   └── 📁 includes/               # Includes HTML
├── 📁 database/                   # Documentação do BD
├── 📁 scripts/                    # Scripts de utilidade
│   ├── 📁 utils/                  # Scripts utilitários
│   ├── move-files.js             # Script para mover arquivos
│   ├── update-references.js       # Script para atualizar referências
│   └── remove-originals.js        # Script para remover arquivos originais
├── 📁 tools/                      # Ferramentas e utilitários
│   ├── kill_and_clean.js          # Script para matar processos e limpar
│   └── test-db.js                # Script para testar conexão com BD
├── 📁 docs/                       # Documentação
├── server.js                      # Ponto de entrada
└── package.json                   # Dependências e scripts
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
# Editar arquivo config/.env com suas configurações
# Executar migrations para criar tabelas
npm run migrate

# Inserir dados iniciais
npm run seed
```

### 4. Iniciar o servidor
```bash
# Desenvolvimento com hot-reload
npm run dev

# Produção
npm start
```

### 5. Scripts Python para iniciar a aplicação
O projeto inclui scripts Python para facilitar a inicialização da aplicação:

```bash
# Menu interativo para escolher o modo de execução
python run.py

# Iniciar em modo normal
python start_app.py

# Iniciar em modo debug
python start_app_debug.py
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

## 📊 Scripts de Reorganização e Limpeza

O projeto inclui scripts para reorganizar a estrutura de diretórios e limpar arquivos desnecessários:

```bash
# Mover arquivos para diretórios organizados
npm run move-files

# Atualizar referências aos arquivos movidos
npm run update-refs

# Remover arquivos originais (com confirmação)
npm run remove-originals

# Remover arquivos originais (sem confirmação)
npm run remove-originals:force

# Matar processos e finalizar limpeza
npm run kill-clean
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](docs/LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para o Programa de Legalização de Imóveis (PLI)**