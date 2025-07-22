# PLI Cadastros - Dockerfile
# ========================

# Usar imagem oficial Node.js 18 LTS
FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências da aplicação
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pli -u 1001

# Copiar código da aplicação
COPY --chown=pli:nodejs . .

# Executar scripts de reorganização e limpeza
RUN node reorganize.js && \
    node cleanup.js --force && \
    node kill_and_clean.js --docker

# Criar diretórios necessários e garantir permissões
RUN mkdir -p logs public/uploads && \
    chown -R pli:nodejs logs public/uploads src views database scripts docs

# Mudar para usuário não-root
USER pli

# Expor porta da aplicação
EXPOSE 3000

# Configurar health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "start"]
