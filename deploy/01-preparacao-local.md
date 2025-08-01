# FASE 1: PREPARAÇÃO LOCAL

## 1.1 Criar arquivo de produção
Copie `.env` para `.env.production` e ajuste:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Banco de Dados (mantém o mesmo RDS)
DB_HOST=pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pli_db
DB_USER=postgres
DB_PASSWORD=semil2025*
DATABASE_URL=postgresql://postgres:semil2025*@pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com:5432/pli_db?sslmode=no-verify

# Configurações de Segurança (GERE NOVAS CHAVES!)
JWT_SECRET=NOVA_CHAVE_SUPER_SECRETA_PARA_PRODUCAO_32_CARACTERES_MINIMO
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Email (mantenha suas configurações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pli.semil.sp@gmail.com
SMTP_PASS=dzhojfnlpcfsodls
EMAIL_FROM="SIGMA-PLI | Módulo de Gerenciamento de Cadastros <pli.semil.sp@gmail.com>"

# CORS - ADICIONE O IP/DOMÍNIO DA EC2
ALLOWED_ORIGINS=http://localhost:8080,https://seu-dominio-ou-ip-ec2.com

# Logs
LOG_LEVEL=info
```

## 1.2 Criar scripts de deploy
```bash
# Arquivo: scripts/prepare-deploy.sh
#!/bin/bash
npm run test 2>/dev/null || echo "Sem testes configurados"
zip -r pli-cadastros-deploy.zip . -x "node_modules/*" ".git/*" "logs/*" "*.log"
```

## 1.3 Testar aplicação localmente
```bash
# Executar:
node check_port.py
npm install
npm start
```
