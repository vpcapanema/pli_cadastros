# 🌐 GUIA FINAL: DO NO-IP AO SIGMA-PLI FUNCIONANDO

## 📋 RESUMO EXECUTIVO

Este é o guia completo para configurar seu domínio personalizado para o Sistema SIGMA-PLI, transformando `54.237.45.173:8888` em algo como `sigma-pli.ddns.net`.

## 🎯 OBJETIVO FINAL

**Transformar isto:** `http://54.237.45.173:8888`  
**Nisto:** `http://sigma-pli.ddns.net` ou `http://sigma-pli.hopto.org`

---

## ⚡ PROCESSO RÁPIDO (5 PASSOS)

### PASSO 1: Criar conta No-IP (2 minutos)

1. **Acesse:** https://www.noip.com/sign-up
2. **Preencha:**
   - Email: `seu-email@gmail.com`
   - Username: `sigma-pli-admin`
   - Password: `(senha forte)`
3. **Confirme** o email recebido

### PASSO 2: Criar hostname (3 minutos)

1. **Faça login** em https://my.noip.com
2. **Clique em:** "Create Hostname"
3. **Preencha EXATAMENTE:**
   ```
   Hostname: sigma-pli
   Domain: ddns.net (ou hopto.org)
   Record Type: A
   IP Address: 54.237.45.173
   Wildcard: No
   Dynamic DNS: Yes
   ```
4. **Clique:** "Create Hostname"

### PASSO 3: Configurar servidor (1 minuto)

Execute no PowerShell como Administrador:

```powershell
cd C:\Users\vinic\pli_cadastros\scripts
.\configure-hostname-nginx.ps1
```

### PASSO 4: Aguardar propagação (5-15 minutos)

O DNS pode demorar para propagar mundialmente.

### PASSO 5: Testar acesso

Acesse seu novo domínio:

- `http://sigma-pli.ddns.net`
- `http://sigma-pli.ddns.net/api/health`

---

## 🔧 CONFIGURAÇÃO DETALHADA NO-IP

### 🌐 Criando o Hostname

**Campos obrigatórios:**

| Campo           | Valor           | Descrição                         |
| --------------- | --------------- | --------------------------------- |
| **Hostname**    | `sigma-pli`     | Nome do seu subdomínio            |
| **Domain**      | `ddns.net`      | Domínio gratuito (recomendado)    |
| **Record Type** | `A`             | Tipo de registro DNS              |
| **IP Address**  | `54.237.45.173` | IP do seu servidor AWS            |
| **Wildcard**    | `No`            | Não habilitar wildcard            |
| **Dynamic DNS** | `Yes`           | Permitir atualizações automáticas |

**Resultado:** `sigma-pli.ddns.net`

### 🎨 Alternativas de Domínio

Você pode escolher diferentes terminações:

| Terminação   | Exemplo               | Característica       |
| ------------ | --------------------- | -------------------- |
| `.ddns.net`  | `sigma-pli.ddns.net`  | ✅ Mais profissional |
| `.hopto.org` | `sigma-pli.hopto.org` | ✅ Fácil de lembrar  |
| `.myftp.org` | `sigma-pli.myftp.org` | ⚠️ Pode confundir    |
| `.zapto.org` | `sigma-pli.zapto.org` | ⚠️ Nome estranho     |

**Recomendação:** Use `.ddns.net` para aparência mais profissional.

---

## 🖥️ CONFIGURAÇÃO DO SERVIDOR

### Após criar o hostname, execute:

**No Windows (PowerShell):**

```powershell
cd C:\Users\vinic\pli_cadastros\scripts
.\configure-hostname-nginx.ps1
```

**No Linux/Mac (Bash):**

```bash
cd /caminho/para/pli_cadastros/scripts
chmod +x configure-hostname-nginx.sh
./configure-hostname-nginx.sh
```

### O que o script faz:

1. **Configura o Nginx** para responder ao novo domínio
2. **Atualiza CORS** para aceitar o novo hostname
3. **Reinicia os serviços** para aplicar mudanças
4. **Testa a conectividade** automaticamente

---

## 🔍 VERIFICAÇÃO E TESTE

### ✅ Como saber se funcionou:

1. **Teste básico:**

   ```
   http://seu-hostname.ddns.net/api/health
   ```

   Deve retornar: `{"status":"healthy","timestamp":"..."}`

2. **Teste completo:**

   ```
   http://seu-hostname.ddns.net
   ```

   Deve abrir a página de login do SIGMA-PLI

3. **Teste de redirecionamento:**
   ```
   http://seu-hostname.ddns.net/dashboard.html
   ```
   Deve abrir o dashboard

### 🚨 Problemas comuns:

| Problema                  | Solução                                           |
| ------------------------- | ------------------------------------------------- |
| **"Site não encontrado"** | Aguarde 15 min (propagação DNS)                   |
| **"Conexão recusada"**    | Verifique se aplicação está rodando: `pm2 status` |
| **"502 Bad Gateway"**     | Reinicie aplicação: `pm2 restart pli`             |
| **"Acesso negado"**       | Verifique firewall AWS (porta 80)                 |

---

## 🔒 CONFIGURAÇÃO HTTPS (OPCIONAL)

Para adicionar SSL/HTTPS ao seu domínio:

### 1. Conectar ao servidor:

```bash
ssh -i pli-ec2-key.pem ubuntu@54.237.45.173
```

### 2. Instalar Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Obter certificado SSL:

```bash
sudo certbot --nginx -d seu-hostname.ddns.net
```

### 4. Teste automático de renovação:

```bash
sudo certbot renew --dry-run
```

**Resultado:** Acesso via `https://seu-hostname.ddns.net`

---

## 📊 MONITORAMENTO

### Logs importantes:

```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/sigma-pli-*_access.log
sudo tail -f /var/log/nginx/sigma-pli-*_error.log

# Logs da aplicação
pm2 logs pli

# Status dos serviços
sudo systemctl status nginx
pm2 status
```

### Health checks:

| Endpoint          | Resposta Esperada      |
| ----------------- | ---------------------- |
| `/api/health`     | `{"status":"healthy"}` |
| `/api/status`     | Status dos serviços    |
| `/dashboard.html` | Página de dashboard    |

---

## 🎯 RESULTADO FINAL

### ✅ O que você terá:

1. **Domínio personalizado:** `sigma-pli.ddns.net`
2. **Acesso limpo:** Sem portas na URL
3. **Redirecionamento automático:** `IP:8888` → `dominio.net`
4. **Headers de segurança:** Configurados automaticamente
5. **Logs organizados:** Por hostname
6. **Cache otimizado:** Para arquivos estáticos

### 🌐 URLs de acesso:

- **Principal:** `http://sigma-pli.ddns.net`
- **Dashboard:** `http://sigma-pli.ddns.net/dashboard.html`
- **API:** `http://sigma-pli.ddns.net/api/`
- **Health:** `http://sigma-pli.ddns.net/api/health`

---

## 🆘 SUPORTE

### Em caso de problemas:

1. **Verifique logs:** `pm2 logs pli`
2. **Teste conexão:** `curl http://seu-hostname.ddns.net/api/health`
3. **Reinicie serviços:** `pm2 restart pli && sudo systemctl reload nginx`
4. **Aguarde propagação:** DNS pode demorar até 24h

### Comandos úteis:

```bash
# Status geral
pm2 status && sudo systemctl status nginx

# Reiniciar tudo
pm2 restart pli && sudo systemctl reload nginx

# Testar configuração Nginx
sudo nginx -t

# Ver IPs configurados
dig seu-hostname.ddns.net
```

---

## 🎊 CONCLUSÃO

Após seguir este guia, você terá transformado com sucesso:

**De:** `http://54.237.45.173:8888` (difícil de lembrar)  
**Para:** `http://sigma-pli.ddns.net` (profissional e memorável)

**Próximos passos recomendados:**

1. ✅ Configurar HTTPS (SSL)
2. ✅ Configurar backup automático
3. ✅ Monitorar logs regularmente
4. ✅ Renovar conta No-IP a cada 30 dias (plano gratuito)

**Seu Sistema SIGMA-PLI agora tem um domínio profissional e está pronto para produção!** 🚀
