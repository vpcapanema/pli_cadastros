#!/bin/bash

# PLI Cadastros - Script de Deploy AWS
# ===================================

echo "🚀 Iniciando deploy do PLI Cadastros na AWS..."

# Verificar se está logado na AWS
echo "🔐 Verificando credenciais AWS..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Erro: Não foi possível verificar as credenciais AWS."
    echo "Configure suas credenciais com: aws configure"
    exit 1
fi

echo "✅ Credenciais AWS válidas!"

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "Copie .env.example para .env e configure as variáveis necessárias."
    exit 1
fi

echo "✅ Arquivo .env encontrado!"

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build 2>/dev/null || echo "⚠️  Build personalizado não definido, continuando..."

# Criar arquivo de configuração do Elastic Beanstalk
echo "📝 Criando configuração do Elastic Beanstalk..."
mkdir -p .ebextensions

cat > .ebextensions/nodecommand.config << EOF
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
EOF

cat > .ebextensions/nginx.config << EOF
files:
  "/etc/nginx/conf.d/proxy.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      upstream nodejs {
          server 127.0.0.1:8080;
          keepalive 256;
      }
      
      server {
          listen 80;
          
          if (\$time_iso8601 ~ "^(\d{4})-(\d{2})-(\d{2})T(\d{2})") {
              set \$year \$1;
              set \$month \$2;
              set \$day \$3;
              set \$hour \$4;
          }
          access_log /var/log/nginx/healthd/application.log.\$year-\$month-\$day-\$hour healthd;
          access_log /var/log/nginx/access.log main;
          
          location / {
              proxy_pass http://nodejs;
              proxy_set_header Connection "";
              proxy_http_version 1.1;
              proxy_set_header Host \$host;
              proxy_set_header X-Real-IP \$remote_addr;
              proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto \$scheme;
          }
          
          gzip on;
          gzip_comp_level 4;
          gzip_types text/html text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
      }
EOF

# Criar .dockerignore
echo "🐳 Criando .dockerignore..."
cat > .dockerignore << EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.elasticbeanstalk/*
!.elasticbeanstalk/*.cfg.yml
!.elasticbeanstalk/*.global.yml
EOF

# Verificar se Elastic Beanstalk CLI está instalado
if ! command -v eb &> /dev/null; then
    echo "⚠️  EB CLI não instalado. Instalando..."
    pip install awsebcli --upgrade --user
fi

# Inicializar Elastic Beanstalk se necessário
if [ ! -d .elasticbeanstalk ]; then
    echo "🔧 Inicializando Elastic Beanstalk..."
    eb init pli-cadastros \
        --platform node.js \
        --region sa-east-1 \
        --keyname ec2-keypair
fi

# Verificar se ambiente já existe
echo "🌍 Verificando ambiente..."
if ! eb list | grep -q "pli-cadastros-prod"; then
    echo "🆕 Criando ambiente de produção..."
    eb create pli-cadastros-prod \
        --instance-type t3.micro \
        --platform "Node.js 18 running on 64bit Amazon Linux 2" \
        --region sa-east-1 \
        --cname pli-cadastros
else
    echo "✅ Ambiente já existe!"
fi

# Deploy da aplicação
echo "🚀 Fazendo deploy..."
eb deploy pli-cadastros-prod

# Verificar status
echo "📊 Verificando status do deploy..."
eb status pli-cadastros-prod

# Mostrar URL da aplicação
echo "🌐 Aplicação deployada!"
echo "URL: $(eb status pli-cadastros-prod | grep CNAME | cut -d: -f2 | xargs)"

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no console AWS"
echo "2. Configure o banco RDS se necessário"
echo "3. Configure o domínio personalizado"
echo "4. Configure SSL/HTTPS"
echo ""
echo "Para monitorar: eb logs --all"
echo "Para abrir no browser: eb open"
