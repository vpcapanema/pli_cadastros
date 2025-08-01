# 🚀 INÍCIO RÁPIDO - DEPLOY PLI CADASTROS NA AWS

## ⚡ Deploy em 3 Comandos

### 1️⃣ Preparar Ambiente
```powershell
# Instalar AWS CLI (se não tiver)
# Download: https://aws.amazon.com/cli/

# Configurar credenciais AWS
aws configure
```

### 2️⃣ Executar Deploy Completo
```powershell
cd C:\Users\vinic\pli_cadastros
.\scripts\deploy-complete.ps1 full
```

### 3️⃣ Acessar Aplicação
```
http://[IP-DA-EC2]
```

**Pronto! Sua aplicação está rodando na AWS! 🎉**

---

## 📋 Pré-requisitos

- ✅ Conta AWS (Free Tier disponível)
- ✅ AWS CLI instalado
- ✅ PowerShell/Terminal
- ✅ Conexão com internet

---

## 🎯 Opções de Deploy

### Deploy Completo (Recomendado)
```powershell
.\scripts\deploy-complete.ps1 full
```
**Cria:** EC2 + RDS + Deploy da aplicação

### Deploy por Partes
```powershell
# Apenas instância EC2
.\scripts\deploy-complete.ps1 ec2-only

# Apenas banco RDS
.\scripts\deploy-complete.ps1 rds-only

# Apenas deploy da aplicação
.\scripts\deploy-complete.ps1 deploy-only
```

### Verificar Status
```powershell
.\scripts\deploy-complete.ps1 status
```

---

## 💰 Custos

**Free Tier (12 meses):** $0/mês
**Após Free Tier:** ~$15-25/mês

### Recursos Inclusos no Free Tier:
- ✅ EC2 t2.micro (750 horas/mês)
- ✅ RDS db.t3.micro (750 horas/mês)
- ✅ 20 GB EBS Storage
- ✅ 20 GB RDS Storage
- ✅ 15 GB Data Transfer

---

## 🔧 Gerenciamento Pós-Deploy

### Atualizar Aplicação
```powershell
.\scripts\deploy-manager.ps1 update
```

### Ver Logs
```powershell
.\scripts\deploy-manager.ps1 logs
```

### Conectar via SSH
```powershell
ssh -i pli-cadastros-key.pem ubuntu@[IP-DA-EC2]
```

### Backup
```powershell
.\scripts\deploy-manager.ps1 backup
```

### Rollback
```powershell
.\scripts\deploy-manager.ps1 rollback
```

---

## 📊 Monitoramento

### Status dos Recursos
```powershell
.\scripts\deploy-complete.ps1 status
```

### Logs da Aplicação
```powershell
# Via script local
.\scripts\deploy-manager.ps1 logs

# Via SSH
ssh -i pli-cadastros-key.pem ubuntu@[IP-DA-EC2]
pm2 logs
```

### Métricas do Sistema
```bash
# Conectar via SSH primeiro
htop          # CPU e memória
free -h       # Memória
df -h         # Disco
pm2 status    # Status da aplicação
```

---

## 🌐 Configurações Avançadas

### Domínio Personalizado
1. Registrar domínio no Route 53
2. Criar Hosted Zone
3. Apontar DNS para IP da EC2
4. Configurar SSL com Let's Encrypt

### SSL/HTTPS
```bash
# Conectar via SSH
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Monitoramento CloudWatch
```bash
# Instalar CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

---

## 🆘 Solução de Problemas

### Erro: "AWS CLI não encontrado"
```powershell
# Instalar AWS CLI
# Download: https://aws.amazon.com/cli/
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
aws ec2 describe-instances --instance-ids i-xxxxxxxxx
```

### Erro: "Aplicação não carrega"
```bash
# Conectar via SSH
ssh -i pli-cadastros-key.pem ubuntu@[IP-DA-EC2]

# Verificar status
pm2 status

# Ver logs
pm2 logs

# Restart se necessário
pm2 restart all
```

### Erro: "Banco não conecta"
```bash
# Verificar Security Groups do RDS
# Testar conexão
telnet [RDS-ENDPOINT] 5432
```

---

## 📚 Documentação Completa

- **Deploy Detalhado:** `deploy\DEPLOY-COMPLETO-AWS.md`
- **Guia de Implementação:** `deploy\GUIA-IMPLEMENTACAO.md`
- **Arquitetura:** `deploy\ARQUITETURA-INFRAESTRUTURA.md`

---

## 📞 Suporte

### Arquivos de Log
- `ec2-instance-info.txt` - Informações da EC2
- `rds-database-info.txt` - Informações do RDS
- `logs\pli.log` - Logs da aplicação

### Comandos de Diagnóstico
```powershell
# Status geral
.\scripts\deploy-complete.ps1 status

# Testar conexão SSH
.\scripts\deploy-manager.ps1 test

# Ver configurações
type ec2-instance-info.txt
type rds-database-info.txt
```

---

## 🎉 Resultado Final

Após o deploy completo, você terá:

✅ **Aplicação web rodando:** `http://[IP-DA-EC2]`
✅ **Banco PostgreSQL configurado**
✅ **Sistema de backup automático**
✅ **Deploy automatizado para updates**
✅ **Monitoramento básico**
✅ **Logs centralizados**

**Sua aplicação PLI Cadastros está pronta para uso em produção!**

---

**Desenvolvido com ❤️ para o SIGMA-PLI | Módulo de Gerenciamento de Cadastros**