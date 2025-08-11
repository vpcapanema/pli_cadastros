# 🚀 DEPLOY COMPLETO - PLI CADASTROS NA AWS

## 📋 VISÃO GERAL

Este guia vai te ajudar a fazer o deploy completo da aplicação PLI Cadastros na AWS usando recursos gratuitos (Free Tier).

**Recursos que vamos criar:**

- ✅ EC2 t2.micro (Free Tier) - Servidor da aplicação
- ✅ RDS PostgreSQL (Free Tier) - Banco de dados
- ✅ Security Groups - Firewall
- ✅ Elastic IP - IP fixo
- ✅ Route 53 - DNS (opcional)

**Custo estimado:** $0-5/mês (dentro do Free Tier)

---

## 🎯 PASSO 1: PREPARAÇÃO LOCAL

### 1.1 Verificar Estrutura do Projeto

```bash
cd C:\Users\vinic\pli_cadastros
dir
```

### 1.2 Configurar AWS CLI (se não tiver)

```bash
# Instalar AWS CLI
# Download: https://aws.amazon.com/cli/

# Configurar credenciais
aws configure
# AWS Access Key ID: [sua-chave]
# AWS Secret Access Key: [sua-chave-secreta]
# Default region name: us-east-1
# Default output format: json

# Testar
aws sts get-caller-identity
```

### 1.3 Preparar Arquivos de Deploy

```bash
# Verificar se os scripts existem
dir scripts\deploy-*.ps1
dir scripts\deploy-*.sh
```

---

## 🖥️ PASSO 2: CRIAR INSTÂNCIA EC2

### 2.1 Acessar Console AWS

1. Acesse: https://console.aws.amazon.com/
2. Vá para **EC2**
3. Região: **us-east-1** (N. Virginia)

### 2.2 Lançar Nova Instância

1. **Launch Instance**
2. **Name:** `pli-cadastros-server`

### 2.3 Configurações da Instância

```
AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
Instance Type: t2.micro (1 vCPU, 1 GB RAM) - Free Tier
```

### 2.4 Criar Key Pair

1. **Create new key pair**
2. **Name:** `pli-cadastros-key`
3. **Type:** RSA
4. **Format:** .pem
5. **Download** → Salvar em `C:\Users\vinic\pli_cadastros\pli-cadastros-key.pem`

### 2.5 Security Group

**Nome:** `pli-cadastros-sg`

**Regras de Entrada:**

```
SSH (22)     - My IP        - SSH access
HTTP (80)    - 0.0.0.0/0    - Web access
HTTPS (443)  - 0.0.0.0/0    - Secure web access
Custom (3000) - 0.0.0.0/0   - Node.js app
```

### 2.6 Armazenamento

```
Volume Type: gp3
Size: 20 GB
Encrypt: Yes
```

### 2.7 Lançar

1. **Launch Instance**
2. Aguardar status **Running**
3. **Anotar o Public IPv4 address**

---

## 🗄️ PASSO 3: CRIAR BANCO RDS

### 3.1 Acessar RDS

1. Console AWS → **RDS**
2. **Create database**

### 3.2 Configurações do Banco

```
Engine: PostgreSQL
Version: 15.4
Template: Free tier

DB Instance Identifier: pli-cadastros-db
Master Username: pli_admin
Master Password: [senha-forte-123]

DB Instance Class: db.t3.micro (Free tier)
Storage: 20 GB gp3
```

### 3.3 Conectividade

```
VPC: Default VPC
Subnet Group: default
Public Access: Yes
VPC Security Group: Create new
Security Group Name: pli-db-sg
```

### 3.4 Configurações Adicionais

```
Initial Database Name: pli_db
Port: 5432
Backup Retention: 7 days
```

### 3.5 Criar Banco

1. **Create database**
2. Aguardar status **Available**
3. **Anotar o Endpoint**

---

## 🔧 PASSO 4: CONFIGURAR SERVIDOR

### 4.1 Conectar via SSH

```bash
# No PowerShell/CMD
cd C:\Users\vinic\pli_cadastros
ssh -i pli-cadastros-key.pem ubuntu@[SEU-IP-EC2]
```

### 4.2 Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 4.3 Instalar Node.js

```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

### 4.4 Instalar PostgreSQL Client

```bash
sudo apt install postgresql-client -y
```

### 4.5 Instalar PM2

```bash
sudo npm install -g pm2
```

### 4.6 Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 📦 PASSO 5: DEPLOY DA APLICAÇÃO

### 5.1 Clonar Repositório

```bash
cd /home/ubuntu
git clone https://github.com/vpcapanema/pli_cadastros.git
cd pli_cadastros
```

### 5.2 Instalar Dependências

```bash
npm install --production
```

### 5.3 Configurar Variáveis de Ambiente

```bash
cp config/.env.production .env
nano .env
```

**Configurar .env:**

```env
# Database
DB_HOST=[SEU-RDS-ENDPOINT]
DB_PORT=5432
DB_NAME=pli_db
DB_USER=pli_admin
DB_PASSWORD=[SUA-SENHA-RDS]

# App
NODE_ENV=production
PORT=3000
JWT_SECRET=[gerar-chave-aleatoria]

# Email (configurar depois)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[seu-email]
SMTP_PASS=[sua-senha-app]
```

### 5.4 Testar Conexão com Banco

```bash
node tools/test-db.js
```

### 5.5 Executar Migrations

```bash
npm run migrate
npm run seed
```

### 5.6 Iniciar com PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 PASSO 6: CONFIGURAR NGINX

### 6.1 Criar Configuração

```bash
sudo nano /etc/nginx/sites-available/pli-cadastros
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name [SEU-IP-EC2];

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/pli-cadastros /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 PASSO 7: CONFIGURAR SECURITY GROUPS

### 7.1 Security Group da EC2

No console AWS → EC2 → Security Groups → `pli-cadastros-sg`:

```
Inbound Rules:
SSH (22)     - My IP
HTTP (80)    - 0.0.0.0/0
HTTPS (443)  - 0.0.0.0/0
Custom (3000) - 0.0.0.0/0
```

### 7.2 Security Group do RDS

No console AWS → RDS → Security Groups → `pli-db-sg`:

```
Inbound Rules:
PostgreSQL (5432) - pli-cadastros-sg (Security Group da EC2)
```

---

## ✅ PASSO 8: TESTAR APLICAÇÃO

### 8.1 Verificar Status

```bash
# No servidor
pm2 status
sudo systemctl status nginx
```

### 8.2 Testar no Browser

```
http://[SEU-IP-EC2]
```

### 8.3 Verificar Logs

```bash
pm2 logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🚀 PASSO 9: AUTOMATIZAR DEPLOY

### 9.1 Configurar Script Local

Editar `scripts\deploy-manager.ps1`:

```powershell
$EC2_HOST = "[SEU-IP-EC2]"
$KEY_FILE = "C:\Users\vinic\pli_cadastros\pli-cadastros-key.pem"
```

### 9.2 Testar Deploy Automatizado

```bash
# No Windows
.\scripts\deploy-manager.ps1 test
.\scripts\deploy-manager.ps1 status
```

---

## 📊 PASSO 10: MONITORAMENTO

### 10.1 Configurar CloudWatch (Opcional)

```bash
# Instalar CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### 10.2 Logs Básicos

```bash
# Ver logs da aplicação
pm2 logs --lines 50

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver uso de recursos
htop
free -h
df -h
```

---

## 🎯 RESULTADO FINAL

Após completar todos os passos, você terá:

✅ **Aplicação rodando em:** `http://[SEU-IP-EC2]`
✅ **Banco PostgreSQL configurado**
✅ **Deploy automatizado**
✅ **Monitoramento básico**
✅ **Backup automático do RDS**

---

## 🔧 COMANDOS ÚTEIS

### Gerenciar Aplicação

```bash
# Restart aplicação
pm2 restart all

# Ver status
pm2 status

# Ver logs
pm2 logs

# Parar aplicação
pm2 stop all
```

### Gerenciar Nginx

```bash
# Restart Nginx
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Testar configuração
sudo nginx -t
```

### Backup Manual

```bash
# Backup banco
pg_dump -h [RDS-ENDPOINT] -U pli_admin -d pli_db > backup_$(date +%Y%m%d).sql

# Backup aplicação
tar -czf app_backup_$(date +%Y%m%d).tar.gz /home/ubuntu/pli_cadastros
```

---

## 🆘 TROUBLESHOOTING

### Problema: Não consegue conectar SSH

```bash
# Verificar Security Group
# Verificar se IP está correto
# Verificar permissões da chave:
chmod 400 pli-cadastros-key.pem
```

### Problema: Aplicação não carrega

```bash
# Verificar se está rodando
pm2 status

# Verificar logs
pm2 logs

# Restart
pm2 restart all
```

### Problema: Erro de banco

```bash
# Testar conexão
psql -h [RDS-ENDPOINT] -U pli_admin -d pli_db

# Verificar Security Groups do RDS
```

---

## 📞 PRÓXIMOS PASSOS

1. **Domínio personalizado** (Route 53)
2. **SSL/HTTPS** (Let's Encrypt)
3. **Backup automatizado**
4. **Monitoramento avançado**
5. **CDN** (CloudFront)

**Custo total estimado:** $0-15/mês (Free Tier + domínio)

---

**🎉 Parabéns! Sua aplicação PLI Cadastros está rodando na AWS!**
