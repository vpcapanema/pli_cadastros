# Configuração de Domínio Personalizado - SIGMA-PLI

## 🌐 OPÇÕES DE ACESSO PERSONALIZADO

### **Opção 1: Domínio Próprio (Recomendado para Produção)**

#### Pré-requisitos:

- Domínio registrado (ex: sigma-pli.com.br)
- Acesso ao painel de DNS do domínio

#### Passos:

1. **Configurar DNS:**

   ```
   Tipo: A
   Nome: @ (ou subdomínio como app)
   Valor: 54.237.45.153
   TTL: 300
   ```

2. **Subdomínios (opcional):**
   ```
   app.sigma-pli.com.br → 54.237.45.153
   sistema.sigma-pli.com.br → 54.237.45.153
   pli.sua-empresa.com.br → 54.237.45.153
   ```

### **Opção 2: Serviços Gratuitos de DNS Dinâmico**

#### No-IP (Gratuito):

1. Criar conta em: https://www.noip.com
2. Criar hostname: `sigma-pli.ddns.net`
3. Apontar para: `54.237.45.153`

#### DuckDNS (Gratuito):

1. Acesse: https://www.duckdns.org
2. Criar: `sigma-pli.duckdns.org`
3. IP: `54.237.45.153`

#### FreeDNS (Gratuito):

1. Site: https://freedns.afraid.org
2. Hostname: `sigma-pli.mooo.com`

### **Opção 3: Nginx Proxy Reverso (Já Configurado)**

Sua aplicação já está configurada com Nginx como proxy reverso.
Apenas precisa configurar o domínio no Nginx.

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **1. Configurar Nginx para Domínio**

```nginx
# /etc/nginx/sites-available/sigma-pli
server {
    listen 80;
    server_name sigma-pli.com.br app.sigma-pli.com.br;

    # Redirecionar HTTP para HTTPS (opcional)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sigma-pli.com.br app.sigma-pli.com.br;

    # Certificado SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/sigma-pli.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sigma-pli.com.br/privkey.pem;

    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### **2. Certificado SSL Gratuito (Let's Encrypt)**

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d sigma-pli.com.br -d app.sigma-pli.com.br

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Atualizar Configurações da Aplicação**

```javascript
// config/.env.production
ALLOWED_ORIGINS=https://sigma-pli.com.br,https://app.sigma-pli.com.br,http://54.237.45.153:8888
CORS_CREDENTIALS=true
FORCE_HTTPS=true
SESSION_COOKIE_SECURE=true
```

---

## 🚀 IMPLEMENTAÇÃO RÁPIDA

### **Opção Mais Rápida: Usar No-IP (5 minutos)**

1. **Criar conta gratuita:**

   ```
   Site: https://www.noip.com/sign-up
   ```

2. **Criar hostname:**

   ```
   Nome: sigma-pli
   Domínio: ddns.net
   IP: 54.237.45.153
   ```

3. **Resultado:**
   ```
   Acesso: http://sigma-pli.ddns.net
   ```

### **Script de Configuração Automática:**

```bash
#!/bin/bash
# Script para configurar domínio no servidor

DOMAIN="sigma-pli.ddns.net"  # Altere aqui
IP="54.237.45.153"

echo "🌐 Configurando domínio: $DOMAIN"

# Criar configuração Nginx
sudo tee /etc/nginx/sites-available/sigma-pli << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/sigma-pli /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Domínio configurado: http://$DOMAIN"
```

---

## 💡 RECOMENDAÇÕES

### **Para Uso Profissional:**

1. **Registrar domínio próprio** (.com.br, .com)
2. **Configurar SSL** (Let's Encrypt gratuito)
3. **Usar subdomínios** organizados
4. **Implementar CDN** (CloudFlare gratuito)

### **Para Testes/Desenvolvimento:**

1. **No-IP ou DuckDNS** (gratuito)
2. **Sem SSL** inicialmente
3. **Configuração simples**

### **Estrutura Sugerida:**

```
https://app.sigma-pli.com.br      → Aplicação principal
https://api.sigma-pli.com.br      → APIs (futuro)
https://admin.sigma-pli.com.br    → Painel admin (futuro)
https://docs.sigma-pli.com.br     → Documentação (futuro)
```

---

## 🔧 PRÓXIMOS PASSOS

1. **Escolher opção** (domínio próprio ou gratuito)
2. **Configurar DNS** apontando para 54.237.45.153
3. **Configurar Nginx** no servidor
4. **Testar acesso** pelo novo domínio
5. **Configurar SSL** (recomendado)
6. **Atualizar aplicação** com novo domínio
