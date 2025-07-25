# 🔒 Permissões de Acesso - SIGMA-PLI | Módulo de Gerenciamento de Cadastros

Este documento descreve as permissões de acesso e os níveis de usuário no SIGMA-PLI | Módulo de Gerenciamento de Cadastros.

## 👥 Tipos de Usuário

O sistema possui os seguintes tipos de usuário:

| Tipo | Descrição | Permissões |
|------|-----------|------------|
| **ADMIN** | Administrador do sistema | Acesso total a todas as funcionalidades |
| **GESTOR** | Gestor de área | Acesso à maioria das funcionalidades, incluindo aprovação de usuários |
| **ANALISTA** | Analista de processos | Acesso a funcionalidades específicas de análise |
| **OPERADOR** | Operador do sistema | Acesso a funcionalidades operacionais básicas |
| **VISUALIZADOR** | Visualizador | Acesso somente leitura a dados e relatórios |

### Múltiplos Tipos por Usuário

Uma mesma pessoa (identificada pelo CPF) pode ter até cinco usuários diferentes no sistema, um para cada tipo de usuário. Isso permite que uma pessoa tenha diferentes níveis de acesso dependendo do contexto de uso.

Por exemplo:
- Um funcionário pode ter acesso como ANALISTA para suas atividades diárias
- O mesmo funcionário pode ter um segundo acesso como GESTOR para atividades gerenciais

Cada combinação de CPF + tipo de usuário terá credenciais distintas e poderá ter diferentes níveis de acesso.

## 🔐 Níveis de Acesso

Além do tipo de usuário, o sistema utiliza níveis de acesso numéricos (1 a 5) para controle mais granular:

| Nível | Descrição |
|-------|-----------|
| **1** | Acesso básico (visualização) |
| **2** | Acesso intermediário (visualização + algumas operações) |
| **3** | Acesso avançado (maioria das operações) |
| **4** | Acesso de gestor (quase todas as operações) |
| **5** | Acesso administrativo (todas as operações) |

## 📋 Processo de Aprovação de Usuários

1. **Solicitação**: Usuário preenche o formulário de cadastro
2. **Notificação**: Administradores e gestores são notificados por email
3. **Análise**: Administrador ou gestor analisa a solicitação
4. **Aprovação/Rejeição**: Administrador ou gestor aprova ou rejeita a solicitação
5. **Definição de Nível**: Durante a aprovação, é definido o nível de acesso do usuário
6. **Notificação ao Usuário**: Usuário é notificado por email sobre o resultado

## 🚪 Áreas Restritas

As seguintes áreas do sistema são restritas a administradores e gestores:

- `/admin/solicitacoes-cadastro.html` - Gerenciamento de solicitações de cadastro
- `/admin/usuarios.html` - Gerenciamento de usuários

## 🔄 Fluxo de Autenticação

1. Usuário faz login e recebe um token JWT
2. Token é armazenado no localStorage e em cookie HTTP-only
3. Requisições à API incluem o token no header Authorization
4. Middleware verifica o token e as permissões do usuário
5. Acesso é concedido ou negado com base nas permissões

## ⚙️ Implementação Técnica

- Middleware `authMiddleware.js` para proteção de rotas da API
- Middleware `pageAuthMiddleware.js` para proteção de páginas HTML
- Verificação de autenticação no lado do cliente usando JavaScript
- Redirecionamento para página de acesso negado quando necessário