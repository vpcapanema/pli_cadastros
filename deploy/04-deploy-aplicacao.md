# FASE 4: DEPLOY DA APLICAÇÃO

## 4.1 Métodos de Deploy Disponíveis

### 🚀 Método Automatizado (Recomendado)

O projeto agora inclui scripts automatizados para deploy e atualizações:

**Para Linux/macOS/WSL:**
```bash
# Configurar uma vez (editar variáveis no script)
nano scripts/deploy-manager.sh
# Definir: EC2_HOST e KEY_FILE

# Primeiro deploy
./scripts/deploy-manager.sh first-deploy

# Atualizações futuras
./scripts/deploy-manager.sh update
```

**Para Windows PowerShell:**
```powershell
# Configurar uma vez (editar variáveis no script)
notepad scripts/deploy-manager.ps1
# Definir: $EC2_HOST e $KEY_FILE

# Primeiro deploy
.\scripts\deploy-manager.ps1 first-deploy

# Atualizações futuras
.\scripts\deploy-manager.ps1 update
```

### 📋 Comandos Disponíveis
```bash
./scripts/deploy-manager.sh help                # Ver todos os comandos
./scripts/deploy-manager.sh test                # Testar conexão SSH
./scripts/deploy-manager.sh first-deploy        # Primeira instalação
./scripts/deploy-manager.sh update              # Atualizar aplicação
./scripts/deploy-manager.sh status              # Ver status da app
./scripts/deploy-manager.sh logs                # Ver logs
./scripts/deploy-manager.sh backup              # Criar backup
./scripts/deploy-manager.sh rollback            # Voltar versão anterior
```

---

## 4.2 Deploy Manual (Alternativo)

### Opção A: Usando Git (Recomendado)
```bash
# No servidor EC2
cd ~
git clone https://github.com/vpcapanema/pli_cadastros.git
cd pli_cadastros
```

### Opção B: Usando SCP
```bash
# Compactar aplicação localmente (sem node_modules)
zip -r pli-cadastros.zip . -x "node_modules/*" ".git/*" "logs/*" "*.log" "__pycache__/*"

# Transferir para EC2
scp -i pli-cadastros-key.pem pli-cadastros.zip ubuntu@SEU_IP_PUBLICO_EC2:~/
```
```bash
# Navegar para diretório da aplicação
cd ~/pli_cadastros  # ou ~/pli-cadastros se usou zip

# Instalar dependências
npm install --production

# Criar arquivo .env para produção
nano config/.env
```

## 4.3 Configurar arquivo .env de Produção
```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados (mantém o RDS existente)
DB_HOST=pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pli_db
DB_USER=postgres
DB_PASSWORD=semil2025*
DATABASE_URL=postgresql://postgres:semil2025*@pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com:5432/pli_db?sslmode=no-verify

# Configurações de Segurança (GERE NOVAS CHAVES!)
JWT_SECRET=NOVA_CHAVE_SUPER_SECRETA_PARA_PRODUCAO_MINIMO_32_CARACTERES
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Email (suas configurações atuais)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pli.semil.sp@gmail.com
SMTP_PASS=dzhojfnlpcfsodls
EMAIL_FROM="SIGMA-PLI | Módulo de Gerenciamento de Cadastros <pli.semil.sp@gmail.com>"
EMAIL_ADMIN=pli.semil.sp@gmail.com

# CORS - ATUALIZAR COM IP DA EC2
ALLOWED_ORIGINS=http://SEU_IP_PUBLICO_EC2,http://SEU_IP_PUBLICO_EC2:3000,https://seu-dominio.com

# Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 4.4 Testar Aplicação
```bash
# Testar conexão com banco
node test_connection.js

# Iniciar aplicação em modo de teste
npm start

# Em outro terminal, testar:
curl http://localhost:3000/api/health
```

## 4.5 Configurar PM2 (Produção)
```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

### Conteúdo do ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'pli-cadastros',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs

# Configurar PM2 para iniciar automaticamente
pm2 startup
pm2 save
```
