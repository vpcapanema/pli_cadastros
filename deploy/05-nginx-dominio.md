# FASE 5: CONFIGURAÇÃO NGINX E DOMÍNIO

## 5.1 Configurar Nginx como Reverse Proxy
```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/pli-cadastros
```

### Conteúdo da configuração:
```nginx
server {
    listen 80;
    server_name SEU_IP_PUBLICO_EC2 seu-dominio.com;

    # Logs
    access_log /var/log/nginx/pli-cadastros.access.log;
    error_log /var/log/nginx/pli-cadastros.error.log;

    # Proxy para aplicação Node.js
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Arquivos estáticos (opcional - melhor performance)
    location /static/ {
        alias /home/ubuntu/pli_cadastros/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 5.2 Ativar Configuração
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/pli-cadastros /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

## 5.3 Configurar Domínio (Opcional)

### Usando Route 53 (AWS):
1. Acesse **Route 53** no Console AWS
2. **Create hosted zone** para seu domínio
3. **Create record**:
   - Type: A
   - Name: @ (ou www)
   - Value: IP_PUBLICO_DA_EC2
   - TTL: 300

### Usando Cloudflare (Gratuito):
1. Acesse cloudflare.com
2. Adicione seu domínio
3. Configure DNS:
   - Type: A
   - Name: @
   - IPv4: IP_PUBLICO_DA_EC2
   - Proxy: Orange (ativado)

## 5.4 Configurar SSL/HTTPS com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua seu-dominio.com)
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Verificar renovação automática
sudo systemctl status certbot.timer
```

## 5.5 Testar Aplicação
```bash
# Testar localmente
curl http://localhost:3000/api/health

# Testar através do Nginx
curl http://SEU_IP_PUBLICO_EC2/api/health

# Se configurou domínio:
curl https://seu-dominio.com/api/health
```
