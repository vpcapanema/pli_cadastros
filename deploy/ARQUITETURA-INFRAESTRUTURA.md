# 🏗️ ARQUITETURA DE INFRAESTRUTURA - SIGMA-PLI

## 📋 Visão Geral da Infraestrutura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INFRAESTRUTURA AWS                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   USUÁRIOS      │    │   DESENVOLVEDORES│    │  ADMINISTRADORES │              │
│  │                 │    │                 │    │                 │              │
│  │ • Cadastro      │    │ • Deploy        │    │ • Monitoramento │              │
│  │ • Consulta      │    │ • Update        │    │ • Backup        │              │
│  │ • Relatórios    │    │ • Rollback      │    │ • Análise       │              │
│  └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘              │
│            │                      │                      │                      │
│            │                      │                      │                      │
│  ┌─────────▼──────────────────────▼──────────────────────▼───────┐              │
│  │                     INTERNET/CLOUDFLARE                       │              │
│  │                                                                │              │
│  │ • SSL/TLS Termination                                          │              │
│  │ • CDN Global                                                   │              │
│  │ • DDoS Protection                                              │              │
│  │ • WAF (Web Application Firewall)                              │              │
│  │ • Cache Inteligente                                            │              │
│  └─────────────────────────┬──────────────────────────────────────┘              │
│                            │                                                     │
│  ┌─────────────────────────▼──────────────────────────────────────┐              │
│  │                  LOAD BALANCER (ALB)                           │              │
│  │                                                                │              │
│  │ • Application Load Balancer                                    │              │
│  │ • Health Checks                                                │              │
│  │ • SSL Certificate Management                                   │              │
│  │ • Auto Scaling Trigger                                         │              │
│  └─────────────────────────┬──────────────────────────────────────┘              │
│                            │                                                     │
│  ┌─────────────────────────▼──────────────────────────────────────┐              │
│  │                    EC2 AUTO SCALING                            │              │
│  │                                                                │              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │              │
│  │  │    EC2-1     │  │    EC2-2     │  │    EC2-N     │          │              │
│  │  │              │  │              │  │              │          │              │
│  │  │ t3.small     │  │ t3.small     │  │ t3.medium    │          │              │
│  │  │ Node.js 20   │  │ Node.js 20   │  │ Node.js 20   │          │              │
│  │  │ PM2          │  │ PM2          │  │ PM2          │          │              │
│  │  │ Nginx        │  │ Nginx        │  │ Nginx        │          │              │
│  │  │ CloudWatch   │  │ CloudWatch   │  │ CloudWatch   │          │              │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │              │
│  └─────────┼──────────────────┼──────────────────┼─────────────────┘              │
│            │                  │                  │                                │
│  ┌─────────▼──────────────────▼──────────────────▼─────────────────┐              │
│  │                     DATABASE CLUSTER                            │              │
│  │                                                                │              │
│  │  ┌──────────────┐          ┌──────────────┐                    │              │
│  │  │ RDS PRIMARY  │◄────────►│ RDS STANDBY  │                    │              │
│  │  │              │          │              │                    │              │
│  │  │ PostgreSQL   │          │ PostgreSQL   │                    │              │
│  │  │ 15.x         │          │ 15.x         │                    │              │
│  │  │ Multi-AZ     │          │ Multi-AZ     │                    │              │
│  │  │ Encrypted    │          │ Encrypted    │                    │              │
│  │  └──────────────┘          └──────────────┘                    │              │
│  │                                                                │              │
│  │  ┌──────────────┐                                              │              │
│  │  │ READ REPLICA │                                              │              │
│  │  │              │                                              │              │
│  │  │ PostgreSQL   │  (Para relatórios e consultas pesadas)      │              │
│  │  │ 15.x         │                                              │              │
│  │  └──────────────┘                                              │              │
│  └────────────────────────────────────────────────────────────────┘              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐              │
│  │                     STORAGE & BACKUP                           │              │
│  │                                                                │              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │              │
│  │  │   S3 MAIN    │  │ S3 BACKUP    │  │   S3 LOGS    │          │              │
│  │  │              │  │              │  │              │          │              │
│  │  │ • Uploads    │  │ • DB Backups │  │ • App Logs   │          │              │
│  │  │ • Documents  │  │ • Code Backup│  │ • Access Logs│          │              │
│  │  │ • Static     │  │ • Config     │  │ • Error Logs │          │              │
│  │  │ • Versioning │  │ • Lifecycle  │  │ • Audit Logs │          │              │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │              │
│  └─────────────────────────────────────────────────────────────────┘              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐              │
│  │                   MONITORING & SECURITY                        │              │
│  │                                                                │              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │              │
│  │  │ CLOUDWATCH   │  │   AWS WAF    │  │   SECRETS    │          │              │
│  │  │              │  │              │  │   MANAGER    │          │              │
│  │  │ • Metrics    │  │ • IP Filter  │  │              │          │              │
│  │  │ • Alarms     │  │ • Rate Limit │  │ • DB Creds   │          │              │
│  │  │ • Dashboards │  │ • SQL Inject │  │ • API Keys   │          │              │
│  │  │ • Logs       │  │ • XSS Filter │  │ • JWT Secret │          │              │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │              │
│  └─────────────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Características da Arquitetura

### 🔧 **Camada de Aplicação**

- **EC2 Auto Scaling**: 1-5 instâncias conforme demanda
- **Load Balancer**: Distribuição inteligente de carga
- **Node.js 20**: Runtime otimizado e atualizado
- **PM2**: Gerenciamento de processos com cluster
- **Nginx**: Reverse proxy com cache e compressão

### 🗄️ **Camada de Dados**

- **RDS PostgreSQL Multi-AZ**: Alta disponibilidade
- **Read Replica**: Performance para consultas pesadas
- **Backup Automatizado**: Snapshots diários
- **Encryption at Rest**: Dados criptografados

### 🛡️ **Segurança**

- **CloudFlare**: Proteção DDoS e WAF
- **AWS WAF**: Filtros de segurança avançados
- **Secrets Manager**: Gerenciamento seguro de credenciais
- **VPC**: Rede privada isolada
- **Security Groups**: Firewall granular

### 📊 **Monitoramento**

- **CloudWatch**: Métricas e alertas
- **Application Insights**: Performance da aplicação
- **Log Aggregation**: Centralização de logs
- **Health Checks**: Verificação contínua de saúde

---

## 💰 **Análise de Custos (Mensal)**

### 🟢 **Configuração Inicial (Free Tier)**

```
EC2 t3.micro x1:           $0.00  (750h gratuitas)
RDS PostgreSQL:           $15.00  (já existente)
Load Balancer:            $16.20  (sempre cobrado)
CloudWatch:                $3.00  (logs básicos)
S3:                        $2.00  (poucos dados)
Data Transfer:             $0.00  (1GB gratuito)
─────────────────────────────────
TOTAL:                    $36.20/mês
```

### 🟡 **Configuração Desenvolvimento**

```
EC2 t3.small x1:          $15.00
RDS PostgreSQL:           $15.00
Load Balancer:            $16.20
CloudWatch:                $5.00
S3:                        $5.00
Data Transfer:            $10.00
Backup:                    $3.00
─────────────────────────────────
TOTAL:                    $69.20/mês
```

### 🔴 **Configuração Produção**

```
EC2 t3.medium x2:         $60.00
EC2 Auto Scaling:         $40.00  (picos)
RDS Multi-AZ:             $45.00
Read Replica:             $22.50
Load Balancer:            $16.20
CloudWatch Pro:           $15.00
S3 + Backup:              $20.00
Data Transfer:            $25.00
Security:                 $10.00
─────────────────────────────────
TOTAL:                   $253.70/mês
```

---

## 🚀 **Estratégia de Deploy**

### **Fase 1: MVP (Free Tier)**

```
┌─────────────────────────────────────────┐
│              CONFIGURAÇÃO MÍNIMA         │
├─────────────────────────────────────────┤
│                                         │
│  Internet                               │
│      │                                  │
│  ┌───▼────┐                             │
│  │   ALB  │                             │
│  └───┬────┘                             │
│      │                                  │
│  ┌───▼────┐    ┌──────────┐             │
│  │  EC2   │────│   RDS    │             │
│  │t3.micro│    │PostgreSQL│             │
│  └────────┘    └──────────┘             │
│                                         │
│  • Node.js + PM2                        │
│  • Nginx                                │
│  • SSL via Let's Encrypt                │
│  • Backup diário                        │
│  • Monitoramento básico                 │
└─────────────────────────────────────────┘
```

### **Fase 2: Crescimento**

```
┌─────────────────────────────────────────┐
│          CONFIGURAÇÃO DESENVOLVIMENTO    │
├─────────────────────────────────────────┤
│                                         │
│  CloudFlare                             │
│      │                                  │
│  ┌───▼────┐                             │
│  │   ALB  │                             │
│  └───┬────┘                             │
│      │                                  │
│  ┌───▼────┐    ┌──────────┐             │
│  │  EC2   │────│   RDS    │             │
│  │t3.small│    │Multi-AZ  │             │
│  └────────┘    └──────────┘             │
│                                         │
│  • Auto Scaling (1-3)                   │
│  • CloudWatch Alarms                    │
│  • S3 para arquivos                     │
│  • Backup automatizado                  │
└─────────────────────────────────────────┘
```

### **Fase 3: Produção**

```
┌─────────────────────────────────────────┐
│            CONFIGURAÇÃO PRODUÇÃO         │
├─────────────────────────────────────────┤
│                                         │
│  CloudFlare + WAF                       │
│      │                                  │
│  ┌───▼────┐                             │
│  │   ALB  │                             │
│  └───┬────┘                             │
│      │                                  │
│  ┌───▼────┐ ┌────────┐  ┌──────────┐    │
│  │  EC2   │ │  EC2   │  │   RDS    │    │
│  │t3.medium│ │t3.medium│  │Multi-AZ  │    │
│  └────────┘ └────────┘  └──────────┘    │
│                              │          │
│                         ┌────▼────┐     │
│                         │  Read   │     │
│                         │ Replica │     │
│                         └─────────┘     │
│                                         │
│  • Auto Scaling (2-5)                   │
│  • Redis Cache                          │
│  • S3 + CloudFront                      │
│  • Secrets Manager                      │
│  • Compliance & Audit                   │
└─────────────────────────────────────────┘
```

---

## 🛠️ **Tecnologias e Serviços**

### **🎯 Frontend**

- **Framework**: Bootstrap 5.1.3
- **JavaScript**: Vanilla JS + jQuery
- **Icons**: Font Awesome
- **Alerts**: SweetAlert2
- **Forms**: Máscaras e validações personalizadas

### **⚙️ Backend**

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Process Manager**: PM2 com cluster
- **Reverse Proxy**: Nginx
- **Session Store**: PostgreSQL + Redis (cache)

### **🗄️ Database**

- **Primary**: PostgreSQL 15.x
- **Architecture**: Multi-AZ para HA
- **Backup**: Automated snapshots
- **Security**: Encryption at rest & transit

### **☁️ Cloud Services**

- **Compute**: EC2 com Auto Scaling
- **Database**: RDS PostgreSQL
- **Load Balancer**: Application Load Balancer
- **Storage**: S3 para arquivos estáticos
- **CDN**: CloudFront + CloudFlare
- **Monitoring**: CloudWatch
- **Security**: WAF + Security Groups

### **🛡️ Security Stack**

- **DDoS Protection**: CloudFlare
- **Web Application Firewall**: AWS WAF
- **SSL/TLS**: Let's Encrypt + AWS Certificate Manager
- **Secrets Management**: AWS Secrets Manager
- **Access Control**: IAM + Security Groups
- **Audit**: CloudTrail

---

## 📈 **Métricas de Performance**

### **🎯 Targets de Performance**

- **Response Time**: < 200ms (95th percentile)
- **Uptime**: 99.9% SLA
- **Throughput**: 1000+ req/min
- **Error Rate**: < 0.1%

### **📊 Monitoramento**

- **Application Metrics**: PM2 + Custom
- **Infrastructure Metrics**: CloudWatch
- **User Experience**: Real User Monitoring
- **Business Metrics**: Custom dashboards

---

## 🔄 **CI/CD Pipeline**

### **🚀 Automated Deployment**

```
Developer Push → GitHub → Auto Deploy → Health Check → Go Live
     ↓              ↓           ↓            ↓          ↓
   Local         Webhook    Deploy Script   Validation  Production
   Testing       Trigger    Execution      & Rollback   Release
```

### **🛡️ Safety Mechanisms**

- **Blue/Green Deployment**: Zero downtime
- **Health Checks**: Automatic validation
- **Rollback**: Instant revert capability
- **Canary Releases**: Gradual feature rollout

Esta infraestrutura foi projetada para crescer com a aplicação, mantendo custos baixos no início e escalando conforme a necessidade, sempre priorizando segurança, performance e confiabilidade! 🚀
