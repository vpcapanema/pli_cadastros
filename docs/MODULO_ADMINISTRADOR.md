# Módulo Administrador - SIGMA-PLI

## 📋 Visão Geral

O **Módulo Administrador** é uma interface completa para gerenciamento administrativo do sistema SIGMA-PLI, oferecendo controle granular sobre usuários, sistema e dados.

## 🔐 Controle de Acesso

### Hierarquia de Permissões

| **ROLE** | **Dashboard** | **Usuários** | **Tabelas** | **Auditoria** | **Backup** | **Export** | **Config** | **Notificações** |
|----------|---------------|--------------|-------------|---------------|------------|------------|------------|------------------|
| **ADMIN** | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total |
| **GESTOR** | ❌ | ✅ Aprovações | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Limitado |
| **ANALISTA** | ✅ Visualizar | ❌ | ✅ Visualizar | ✅ Visualizar | ❌ | ✅ Dados | ❌ | ❌ |

### Funcionalidades por Role

#### 🔴 **ADMIN (Acesso Total)**
- **Dashboard Completo**: Todas as métricas e estatísticas
- **Gerenciamento de Usuários**: Criar, editar, aprovar, rejeitar, ativar/desativar, alterar roles
- **Visualização de Tabelas**: Acesso completo a todas as tabelas do sistema
- **Auditoria**: Logs completos, sessões ativas, invalidar sessões
- **Backup & Restore**: Criar, restaurar e gerenciar backups
- **Exportação**: Todos os formatos (XLSX, CSV, TXT, PDF)
- **Configurações**: Configurações gerais do sistema
- **Notificações**: Gerenciar todas as notificações

#### 🟡 **GESTOR (Aprovações)**
- **Usuários**: Apenas aprovar/rejeitar usuários com status `AGUARDANDO_APROVACAO`
- **Notificações**: Receber e gerenciar notificações de aprovação

#### 🔵 **ANALISTA (Consultas)**
- **Dashboard**: Visualizar métricas gerais (sem dados sensíveis)
- **Tabelas**: Visualizar dados das tabelas (somente leitura)
- **Auditoria**: Consultar logs de auditoria
- **Exportação**: Exportar dados para análise

## 🏗️ Arquitetura do Módulo

### Backend Components

```
src/controllers/adminController.js     - Lógica principal do admin
src/routes/admin.js                   - Rotas do módulo admin  
src/services/notificationService.js   - Serviço de notificações
src/middleware/auth.js                - Controle de acesso
```

### Frontend Components

```
views/admin.html                      - Interface principal
static/js/pages/admin.js              - JavaScript do módulo
css/sistema_aplicacao_cores_pli.css   - Estilos customizados
```

## 🚀 Funcionalidades Implementadas

### 1. **Dashboard Administrativo**

#### Métricas Principais
- **Total de Usuários**: Contador geral de usuários cadastrados
- **Usuários Aprovados**: Usuários com status `APROVADO`
- **Aguardando Aprovação**: Usuários com status `AGUARDANDO_APROVACAO`
- **Sessões Ativas**: Número de sessões ativas no momento

#### Gráficos
- **Distribuição por Status**: Gráfico de pizza mostrando a distribuição de usuários por status
- **Distribuição por Role**: Gráfico de pizza mostrando a distribuição de usuários por role
- **Cadastros por Mês**: Gráfico de linha dos últimos 12 meses
- **Logins por Dia**: Gráfico de barras dos últimos 30 dias

#### Tabela de Usuários Recentes
- Lista dos últimos usuários cadastrados
- Informações básicas e status atual

### 2. **Gerenciamento de Usuários**

#### Funcionalidades de Busca e Filtro
- **Pesquisa Textual**: Por username, email, nome completo
- **Filtro por Status**: Todos, Aguardando, Aprovado, Rejeitado, Suspenso
- **Filtro por Role**: Todas as roles disponíveis
- **Paginação**: 20 usuários por página

#### Ações Disponíveis
- **👁️ Visualizar**: Detalhes completos do usuário + histórico de sessões
- **✏️ Editar**: Alterar dados do usuário (apenas ADMIN)
- **✅ Aprovar**: Alterar status para `APROVADO` (ADMIN/GESTOR)
- **❌ Rejeitar**: Alterar status para `REJEITADO` (ADMIN/GESTOR)
- **🔄 Ativar/Desativar**: Controlar acesso ao sistema (apenas ADMIN)

#### Notificações Automáticas
- **Email Profissional**: Enviado automaticamente em mudanças de status/ativo
- **Templates Personalizados**: Design responsivo e profissional
- **Múltiplos Idiomas**: Suporte para personalização

### 3. **Sistema de Notificações**

#### Tipos de Notificação
- **Aprovação de Conta**: Email de boas-vindas com instruções
- **Rejeição de Conta**: Email explicativo com próximos passos
- **Suspensão Temporária**: Notificação de suspensão com contatos
- **Ativação/Desativação**: Confirmação de mudança de status

#### Design dos Emails
- **Header Institucional**: Logo e cores do SIGMA-PLI
- **Conteúdo Responsivo**: Funciona em desktop e mobile
- **Call-to-Actions**: Botões e links diretos
- **Footer Informativo**: Dados do sistema e contatos

### 4. **Exportação de Dados**

#### Formatos Suportados
- **📊 XLSX**: Excel com formatação e fórmulas
- **📄 CSV**: Dados estruturados compatíveis
- **📝 TXT**: Texto simples para análise
- **📋 PDF**: Relatórios formatados para impressão

#### Recursos de Exportação
- **Aliases Amigáveis**: Nomes de colunas em português
- **Formatação Automática**: Datas, números e textos
- **Filtros Aplicados**: Exporta apenas dados filtrados
- **Metadados**: Informações sobre exportação

## 🔧 Configuração e Deploy

### 1. **Dependências Necessárias**

```bash
npm install express jsonwebtoken bcryptjs
npm install nodemailer exceljs pdfkit
npm install multer helmet cors
```

### 2. **Variáveis de Ambiente**

```env
# Configurações de Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sistema@empresa.com
SMTP_PASS=senha_app
SMTP_FROM=SIGMA-PLI <sistema@empresa.com>

# Configurações de Segurança
JWT_SECRET=sua_chave_jwt_super_secreta
JWT_EXPIRES_IN=24h

# Configurações do Sistema
SYSTEM_NAME=SIGMA-PLI
ADMIN_EMAIL=admin@empresa.com
```

### 3. **Estrutura de Banco de Dados**

#### Tabela de Logs de Auditoria
```sql
CREATE TABLE logs_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Índices para Performance
```sql
CREATE INDEX idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_auditoria_acao ON logs_auditoria(acao);
CREATE INDEX idx_logs_auditoria_created_at ON logs_auditoria(created_at);
```

## 📱 Interface do Usuário

### Design System

#### Cores Principais
- **Primary**: Gradiente azul (#667eea → #764ba2)
- **Success**: Gradiente verde (#11998e → #38ef7d)
- **Warning**: Gradiente rosa (#f093fb → #f5576c)
- **Info**: Gradiente ciano (#4facfe → #00f2fe)

#### Componentes Reutilizáveis
- **Metric Cards**: Cards com gradientes e ícones
- **Status Badges**: Badges coloridos por status
- **Action Buttons**: Botões com ícones e tooltips
- **Loading States**: Overlays e spinners

### Responsividade
- **Desktop**: Layout completo com sidebar
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer e cards empilhados

## 🔒 Segurança Implementada

### Autenticação e Autorização
- **JWT Tokens**: Verificação em todas as rotas
- **Role-based Access**: Controle granular por função
- **Session Management**: Controle de sessões ativas
- **Token Refresh**: Renovação automática de tokens

### Auditoria Completa
- **Logging Detalhado**: Todas as ações são registradas
- **IP Tracking**: Rastreamento de endereços IP
- **User Agent**: Identificação de dispositivos
- **Data Changes**: Registro de mudanças de dados

### Proteção contra Ataques
- **SQL Injection**: Queries parametrizadas
- **XSS Protection**: Sanitização de inputs
- **CSRF Protection**: Tokens de validação
- **Rate Limiting**: Limite de requisições

## 📊 Métricas e Analytics

### KPIs Monitorados
- **Taxa de Aprovação**: % de usuários aprovados vs rejeitados
- **Tempo de Aprovação**: Tempo médio entre cadastro e aprovação
- **Atividade de Login**: Frequência de logins por usuário
- **Utilização por Role**: Distribuição de acesso por função

### Relatórios Disponíveis
- **Relatório de Usuários**: Listagem completa com filtros
- **Relatório de Atividade**: Logs de auditoria detalhados
- **Relatório de Sessões**: Histórico de acessos
- **Relatório de Performance**: Métricas do sistema

## 🚀 Roadmap Futuro

### Próximas Funcionalidades
1. **Backup Automático**: Agendamento de backups
2. **Notificações Push**: Notificações em tempo real
3. **Dashboard Customizável**: Widgets personalizáveis
4. **API Externa**: Integração com sistemas externos
5. **Relatórios Avançados**: BI e analytics

### Melhorias Planejadas
1. **Performance**: Otimização de queries
2. **UX/UI**: Interface mais intuitiva
3. **Mobile App**: Aplicativo dedicado
4. **Integração SSO**: Single Sign-On
5. **Multi-tenancy**: Suporte a múltiplas organizações

## 📞 Suporte e Manutenção

### Contatos Técnicos
- **Desenvolvedor Principal**: [email]
- **Suporte Técnico**: [email]
- **Documentação**: Este arquivo + código comentado

### Procedimentos de Emergência
1. **Problema de Acesso**: Verificar logs de auditoria
2. **Performance Lenta**: Analisar queries do banco
3. **Erro de Email**: Verificar configurações SMTP
4. **Backup Corrompido**: Procedimento de restore manual

---

**SIGMA-PLI** - Sistema de Gerenciamento de Cadastros  
*Módulo Administrador v1.0.0*  
*Documentação técnica completa*
