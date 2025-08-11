# Configuração de Domínio www.sigma-pli - SIGMA-PLI

## 🎯 OBJETIVO: Configurar acesso via www.sigma-pli.com (ou similar)

### **OPÇÃO 1: DOMÍNIO GRATUITO - No-IP (5 minutos)**

#### Passos Simples:

1. **Acesse:** https://www.noip.com/sign-up
2. **Crie conta gratuita**
3. **Configure hostname:**
   ```
   Hostname: sigma-pli
   Domain: ddns.net (ou escolha outro)
   IP Address: 54.237.45.153
   ```
4. **Resultado:** `http://sigma-pli.ddns.net`

#### Alternativa DuckDNS:

1. **Acesse:** https://www.duckdns.org
2. **Login com Google**
3. **Configure:** `sigma-pli.duckdns.org`
4. **IP:** `54.237.45.153`

---

### **OPÇÃO 2: DOMÍNIO PRÓPRIO PROFISSIONAL**

#### Sugestões de Domínios Disponíveis:

- `sigma-pli.com`
- `sigma-pli.com.br`
- `sigmapli.com`
- `sigma-pli.org`
- `sigma-sistemas.com`

#### Onde Registrar:

- **Registro.br** (para .com.br) - R$ 40/ano
- **GoDaddy** (para .com) - $12/ano
- **Namecheap** (para .com) - $10/ano
- **Hostinger** (para .com) - $8/ano

---

### **OPÇÃO 3: SUBDOMÍNIO EMPRESARIAL**

Se você já tem um domínio da empresa:

```
app.sua-empresa.com.br → 54.237.45.153
sigma.sua-empresa.com.br → 54.237.45.153
pli.sua-empresa.com.br → 54.237.45.153
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **1. Configuração DNS (Após ter o domínio)**

```
Tipo: A
Nome: @ (para sigma-pli.com)
Nome: www (para www.sigma-pli.com)
Valor: 54.237.45.153
TTL: 300
```

### **2. Configuração Nginx no Servidor**

```nginx
server {
    listen 80;
    server_name sigma-pli.com www.sigma-pli.com;

    # Redirecionar para www
    if ($host = sigma-pli.com) {
        return 301 http://www.sigma-pli.com$request_uri;
    }

    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL Gratuito (Let's Encrypt)**

```bash
sudo certbot --nginx -d sigma-pli.com -d www.sigma-pli.com
```

---

## 🚀 AÇÃO IMEDIATA RECOMENDADA

### **OPÇÃO MAIS RÁPIDA - No-IP:**

1. **Acesse agora:** https://www.noip.com/sign-up
2. **Registre-se gratuitamente**
3. **Configure:**
   - Hostname: `sigma-pli` ou `www-sigma-pli`
   - Domain: `ddns.net`
   - IP: `54.237.45.153`

4. **Resultado em 5 minutos:**
   - `http://sigma-pli.ddns.net`
   - `http://www-sigma-pli.ddns.net`

### **POSTERIORMENTE:**

- Registrar domínio próprio
- Migrar para `www.sigma-pli.com`
- Configurar SSL (https)

---

## 📊 COMPARAÇÃO DE OPÇÕES

| Opção               | Tempo    | Custo    | URL Resultado         | SSL      |
| ------------------- | -------- | -------- | --------------------- | -------- |
| **No-IP**           | 5 min    | Grátis   | sigma-pli.ddns.net    | Opcional |
| **DuckDNS**         | 3 min    | Grátis   | sigma-pli.duckdns.org | Opcional |
| **Domínio .com**    | 1 dia    | $10/ano  | www.sigma-pli.com     | Incluído |
| **Domínio .com.br** | 2-3 dias | R$40/ano | www.sigma-pli.com.br  | Incluído |

---

## 🎯 RECOMENDAÇÃO FINAL

**Para AGORA:** Use No-IP → `sigma-pli.ddns.net`
**Para FUTURO:** Registre `sigma-pli.com` → `www.sigma-pli.com`

**Qual opção você prefere começar?**
