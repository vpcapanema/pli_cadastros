# 🚀 Scripts de Deploy AWS - PLI Cadastros

## 📋 Visão Geral

Esta pasta contém todos os scripts necessários para fazer o deploy completo da aplicação PLI Cadastros na AWS usando recursos gratuitos (Free Tier).

## 📁 Estrutura dos Scripts

```
scripts/
├── 🎯 deploy-complete.ps1        # Script principal - orquestra todo o deploy
├── 🖥️ create-ec2-instance.ps1    # Cria instância EC2 automaticamente
├── 🗄️ create-rds-database.ps1    # Cria banco RDS PostgreSQL
├── 🔧 deploy-manager.ps1         # Gerencia deploy e updates da aplicação
├── ✅ verify-deployment.ps1      # Verifica se deploy foi bem-sucedido
├── 🐧 deploy-aws.sh             # Script para Linux/WSL
└── 📚 README-DEPLOY.md          # Esta documentação
```

## 🚀 Uso Rápido

### Deploy Completo (Recomendado)
```powershell
# Criar EC2 + RDS + Deploy da aplicação
.\scripts\deploy-complete.ps1 full
```

### Deploy por Etapas
```powershell
# 1. Criar apenas EC2
.\scripts\deploy-complete.ps1 ec2-only

# 2. Criar apenas RDS
.\scripts\deploy-complete.ps1 rds-only

# 3. Deploy apenas da aplicação
.\scripts\deploy-complete.ps1 deploy-only
```

### Verificar Deploy
```powershell
# Verificar se tudo está funcionando
.\scripts\verify-deployment.ps1
```

## 📖 Descrição Detalhada dos Scripts

### 🎯 deploy-complete.ps1
**Script principal que orquestra todo o processo**

```powershell
# Opções disponíveis
.\scripts\deploy-complete.ps1 full        # Deploy completo
.\scripts\deploy-complete.ps1 ec2-only    # Apenas EC2
.\scripts\deploy-complete.ps1 rds-only    # Apenas RDS
.\scripts\deploy-complete.ps1 deploy-only # Apenas aplicação
.\scripts\deploy-complete.ps1 status      # Ver status
.\scripts\deploy-complete.ps1 help        # Ajuda
```

**Funcionalidades:**
- ✅ Verifica pré-requisitos
- ✅ Mostra estimativa de custos
- ✅ Cria recursos AWS automaticamente
- ✅ Configura aplicação
- ✅ Mostra resumo final

### 🖥️ create-ec2-instance.ps1
**Cria instância EC2 com todas as configurações necessárias**

```powershell
# Uso básico
.\scripts\create-ec2-instance.ps1

# Com parâmetros personalizados
.\scripts\create-ec2-instance.ps1 -InstanceName "meu-servidor" -InstanceType "t3.small"
```

**O que faz:**
- ✅ Cria key pair SSH
- ✅ Configura Security Groups
- ✅ Lança instância EC2
- ✅ Configura Elastic IP (opcional)
- ✅ Salva informações em arquivo
- ✅ Atualiza scripts de deploy

### 🗄️ create-rds-database.ps1
**Cria banco PostgreSQL no RDS**

```powershell
# Uso básico
.\scripts\create-rds-database.ps1

# Com parâmetros personalizados
.\scripts\create-rds-database.ps1 -DBName "meu_banco" -MasterUsername "admin"
```

**O que faz:**
- ✅ Cria Security Group para RDS
- ✅ Configura subnet group
- ✅ Cria instância RDS PostgreSQL
- ✅ Gera senha segura automaticamente
- ✅ Configura backup automático
- ✅ Atualiza arquivo .env

### 🔧 deploy-manager.ps1
**Gerencia deploy e atualizações da aplicação**

```powershell
.\scripts\deploy-manager.ps1 first-deploy  # Primeira instalação
.\scripts\deploy-manager.ps1 update        # Atualizar aplicação
.\scripts\deploy-manager.ps1 status        # Ver status
.\scripts\deploy-manager.ps1 logs          # Ver logs
.\scripts\deploy-manager.ps1 backup        # Criar backup
.\scripts\deploy-manager.ps1 rollback      # Voltar versão anterior
.\scripts\deploy-manager.ps1 test          # Testar conexão SSH
```

**Funcionalidades:**
- ✅ Deploy via SSH automatizado
- ✅ Gerenciamento de versões
- ✅ Backup e rollback
- ✅ Monitoramento de logs
- ✅ Restart da aplicação

### ✅ verify-deployment.ps1
**Verifica se o deploy foi bem-sucedido**

```powershell
# Verificação automática
.\scripts\verify-deployment.ps1

# Com IPs específicos
.\scripts\verify-deployment.ps1 -EC2_IP "1.2.3.4" -RDS_ENDPOINT "db.amazonaws.com"
```

**Testes realizados:**
- ✅ Conectividade de rede
- ✅ Portas abertas (SSH, HTTP, HTTPS, PostgreSQL)
- ✅ Aplicação web funcionando
- ✅ Status dos recursos AWS
- ✅ Arquivos de configuração
- ✅ Relatório detalhado

## 🔧 Configuração Inicial

### 1. Pré-requisitos
```powershell
# Instalar AWS CLI
# Download: https://aws.amazon.com/cli/

# Configurar credenciais
aws configure
```

### 2. Verificar Ambiente
```powershell
# Verificar se está no diretório correto
cd C:\Users\vinic\pli_cadastros

# Verificar estrutura
dir package.json
dir server.js
```

### 3. Executar Deploy
```powershell
# Deploy completo
.\scripts\deploy-complete.ps1 full
```

## 📊 Arquivos Gerados

Após o deploy, os seguintes arquivos são criados:

```
📄 ec2-instance-info.txt     # Informações da instância EC2
📄 rds-database-info.txt     # Informações do banco RDS
📄 .env                      # Variáveis de ambiente da aplicação
🔑 pli-cadastros-key.pem     # Chave SSH para conectar na EC2
```

## 🔍 Monitoramento e Manutenção

### Verificar Status
```powershell
# Status geral
.\scripts\deploy-complete.ps1 status

# Status da aplicação
.\scripts\deploy-manager.ps1 status

# Verificação completa
.\scripts\verify-deployment.ps1
```

### Ver Logs
```powershell
# Logs da aplicação
.\scripts\deploy-manager.ps1 logs

# Conectar via SSH para logs detalhados
ssh -i pli-cadastros-key.pem ubuntu@[IP-DA-EC2]
pm2 logs
```

### Atualizar Aplicação
```powershell
# Atualização simples
.\scripts\deploy-manager.ps1 update

# Com backup automático
.\scripts\deploy-manager.ps1 backup
.\scripts\deploy-manager.ps1 update
```

## 🆘 Solução de Problemas

### Erro: "AWS CLI não encontrado"
```powershell
# Instalar AWS CLI
# https://aws.amazon.com/cli/
```

### Erro: "Credenciais inválidas"
```powershell
aws configure
# Inserir Access Key ID e Secret Access Key
```

### Erro: "Instância não responde"
```powershell
# Verificar Security Groups
# Verificar se instância está rodando
.\scripts\deploy-complete.ps1 status
```

### Erro: "Aplicação não carrega"
```powershell
# Verificar logs
.\scripts\deploy-manager.ps1 logs

# Restart aplicação
.\scripts\deploy-manager.ps1 update
```

### Erro: "Banco não conecta"
```powershell
# Verificar Security Groups do RDS
# Testar conectividade
.\scripts\verify-deployment.ps1
```

## 💰 Custos AWS

### Free Tier (12 meses)
- ✅ EC2 t2.micro: 750 horas/mês
- ✅ RDS db.t3.micro: 750 horas/mês
- ✅ 20 GB EBS Storage
- ✅ 20 GB RDS Storage
- ✅ 15 GB Data Transfer

**Custo total: $0/mês**

### Após Free Tier
- 💰 EC2 t2.micro: ~$8/mês
- 💰 RDS db.t3.micro: ~$12/mês
- 💰 Storage: ~$3/mês
- 💰 Data Transfer: ~$2/mês

**Custo total: ~$25/mês**

## 🔒 Segurança

### Security Groups Configurados
```
EC2 Security Group (pli-cadastros-sg):
- SSH (22): Apenas seu IP
- HTTP (80): Público
- HTTPS (443): Público
- Node.js (3000): Público (temporário)

RDS Security Group (pli-db-sg):
- PostgreSQL (5432): Apenas EC2
```

### Chaves e Senhas
- 🔑 Chave SSH salva em: `pli-cadastros-key.pem`
- 🔐 Senha do banco salva em: `rds-database-info.txt`
- ⚠️ **IMPORTANTE:** Guarde estes arquivos em local seguro!

## 🌐 Próximos Passos

Após o deploy bem-sucedido:

1. **Configurar domínio personalizado**
2. **Configurar SSL/HTTPS**
3. **Configurar monitoramento CloudWatch**
4. **Configurar backup automatizado**
5. **Configurar CDN (CloudFront)**

## 📚 Documentação Adicional

- **Guia Completo:** `deploy\DEPLOY-COMPLETO-AWS.md`
- **Início Rápido:** `INICIO-RAPIDO-AWS.md`
- **Arquitetura:** `deploy\ARQUITETURA-INFRAESTRUTURA.md`

## 📞 Suporte

### Logs e Diagnóstico
```powershell
# Verificação completa
.\scripts\verify-deployment.ps1

# Status detalhado
.\scripts\deploy-complete.ps1 status

# Logs da aplicação
.\scripts\deploy-manager.ps1 logs
```

### Arquivos de Informação
- `ec2-instance-info.txt` - Dados da EC2
- `rds-database-info.txt` - Dados do RDS
- `logs\pli.log` - Logs da aplicação

---

**🎉 Com estes scripts, o deploy da aplicação PLI Cadastros na AWS é totalmente automatizado!**

**Desenvolvido com ❤️ para o SIGMA-PLI | Módulo de Gerenciamento de Cadastros**