# FASE 3: CONFIGURAÇÃO DO SERVIDOR

## 3.1 Conectar via SSH (Windows)

### Usando PowerShell:

```powershell
# Navegar até onde está a chave .pem
cd C:\caminho\para\sua\chave

# Ajustar permissões da chave
icacls pli-cadastros-key.pem /inheritance:r /grant:r $env:USERNAME:R

# Conectar ao servidor
ssh -i pli-cadastros-key.pem ubuntu@SEU_IP_PUBLICO_EC2
```

### Usando WSL/Git Bash:

```bash
chmod 400 pli-cadastros-key.pem
ssh -i pli-cadastros-key.pem ubuntu@SEU_IP_PUBLICO_EC2
```

## 3.2 Atualizar Sistema

```bash
# Atualizar lista de pacotes
sudo apt update

# Atualizar pacotes instalados
sudo apt upgrade -y

# Instalar utilitários essenciais
sudo apt install -y curl wget git unzip htop nano
```

## 3.3 Instalar Node.js

```bash
# Instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # deve mostrar v18.x.x
npm --version   # deve mostrar npm version
```

## 3.4 Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

## 3.5 Configurar Firewall Ubuntu

```bash
# Configurar UFW (Ubuntu Firewall)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

# Verificar status
sudo ufw status
```

## 3.6 Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```
