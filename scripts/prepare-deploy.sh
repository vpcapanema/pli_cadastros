#!/bin/bash

# SIGMA-PLI | Preparação para Deploy AWS
# =====================================

echo "🚀 Preparando aplicação para deploy na AWS..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está funcionando
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado!"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ NPM $(npm --version) encontrado"

# Instalar dependências de produção
echo "📦 Instalando dependências de produção..."
npm install --production

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
    mkdir logs
    echo "✅ Diretório de logs criado"
fi

# Testar conexão com banco de dados
echo "🔍 Testando conexão com banco de dados..."
if node test_connection.js; then
    echo "✅ Conexão com banco de dados OK"
else
    echo "⚠️  Aviso: Problema na conexão com banco de dados"
fi

# Verificar arquivo .env
if [ -f "config/.env" ]; then
    echo "✅ Arquivo .env encontrado"
else
    echo "❌ Arquivo config/.env não encontrado!"
    echo "Copie config/.env.example para config/.env e configure as variáveis"
    exit 1
fi

# Criar arquivo de deploy
echo "📝 Criando pacote para deploy..."
zip -r pli-cadastros-deploy.zip . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x "logs/*" \
    -x "*.log" \
    -x "__pycache__/*" \
    -x ".venv/*" \
    -x "deploy/*" \
    -x "*.zip"

echo "✅ Pacote criado: pli-cadastros-deploy.zip"

# Exibir instruções
echo ""
echo "🎉 Preparação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Transfira o arquivo pli-cadastros-deploy.zip para sua EC2"
echo "2. Ou use git clone no servidor EC2"
echo "3. Siga as instruções nos arquivos deploy/"
echo ""
echo "📁 Arquivos de deploy criados em:"
echo "   - deploy/01-preparacao-local.md"
echo "   - deploy/02-criacao-ec2.md"
echo "   - deploy/03-configuracao-servidor.md"
echo "   - deploy/04-deploy-aplicacao.md"
echo "   - deploy/05-nginx-dominio.md"
echo "   - deploy/06-monitoramento-manutencao.md"
echo "   - deploy/RESUMO-EXECUTIVO.md"
