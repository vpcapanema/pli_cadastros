# SISTEMA DE DEPLOY AUTOMATIZADO - SIGMA-PLI

## 🚀 Visão Geral

O sistema SIGMA-PLI agora inclui scripts automatizados para deploy e atualizações, facilitando o gerenciamento da aplicação na AWS EC2.

## 📋 Funcionalidades

### ✅ Deploy Automatizado
- **Primeiro Deploy**: Instalação completa automática
- **Atualizações**: Deploy incremental com backup automático
- **Rollback**: Volta para versão anterior em caso de problemas
- **Monitoramento**: Verificação de saúde da aplicação

### ✅ Gerenciamento de Código
- **Git Integration**: Commit e push automático das mudanças
- **Backup Automático**: Backup da versão anterior antes de atualizar
- **Verificação de Integridade**: Testes de saúde após deploy

### ✅ Multiplataforma
- **Linux/macOS/WSL**: Script Bash otimizado
- **Windows**: Script PowerShell nativo
- **Compatibilidade**: Funciona em qualquer ambiente

---

## 🛠️ Configuração Inicial

### 1. Configurar Chave SSH
```bash
# Gerar nova chave (se necessário)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/pli-cadastros-key

# Adicionar chave à EC2 (via AWS Console)
# Security Groups: Permitir SSH (porta 22) do seu IP
```

### 2. Configurar Scripts

#### Para Linux/macOS/WSL:
```bash
# Editar configurações
nano scripts/deploy-manager.sh

# Definir variáveis:
EC2_HOST="seu-ip-ec2-aqui"          # IP público da EC2
KEY_FILE="~/.ssh/pli-cadastros-key" # Caminho para chave SSH

# Dar permissões
chmod +x scripts/deploy-manager.sh
chmod +x scripts/deploy-update.sh
```

#### Para Windows PowerShell:
```powershell
# Editar configurações
notepad scripts/deploy-manager.ps1

# Definir variáveis:
$EC2_HOST = "seu-ip-ec2-aqui"              # IP público da EC2
$KEY_FILE = "C:\Users\Seu-Usuario\.ssh\pli-cadastros-key"  # Caminho para chave SSH
```

### 3. Testar Conexão
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh test

# Windows PowerShell
.\scripts\deploy-manager.ps1 test
```

---

## 🚀 Como Usar

### Primeiro Deploy (Instalação Completa)
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh first-deploy

# Windows PowerShell
.\scripts\deploy-manager.ps1 first-deploy
```

**O que acontece:**
1. ✅ Atualiza sistema Ubuntu
2. ✅ Instala Node.js 20, PM2, Nginx
3. ✅ Clona repositório do GitHub
4. ✅ Instala dependências
5. ✅ Configura arquivos de ambiente
6. ✅ Configura PM2 e Nginx
7. ✅ Inicia aplicação
8. ✅ Verifica saúde da aplicação

### Atualizações Rotineiras
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh update

# Windows PowerShell
.\scripts\deploy-manager.ps1 update
```

**O que acontece:**
1. ✅ Detecta mudanças locais
2. ✅ Faz commit e push automático (opcional)
3. ✅ Cria backup da versão atual
4. ✅ Para aplicação temporariamente
5. ✅ Atualiza código via Git
6. ✅ Atualiza dependências
7. ✅ Reinicia aplicação
8. ✅ Verifica saúde da aplicação

---

## 📊 Monitoramento e Manutenção

### Verificar Status
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh status

# Windows PowerShell
.\scripts\deploy-manager.ps1 status
```

### Ver Logs
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh logs

# Windows PowerShell
.\scripts\deploy-manager.ps1 logs
```

### Criar Backup Manual
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh backup

# Windows PowerShell
.\scripts\deploy-manager.ps1 backup
```

### Rollback (Voltar Versão)
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh rollback

# Windows PowerShell
.\scripts\deploy-manager.ps1 rollback
```

---

## 🔧 Comandos Detalhados

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `help` | Mostra ajuda completa | `./deploy-manager.sh help` |
| `test` | Testa conexão SSH | `./deploy-manager.sh test` |
| `first-deploy` | Instalação completa | `./deploy-manager.sh first-deploy` |
| `deploy` | Deploy/update padrão | `./deploy-manager.sh deploy` |
| `update` | Atualização da aplicação | `./deploy-manager.sh update` |
| `status` | Status da aplicação | `./deploy-manager.sh status` |
| `logs` | Logs da aplicação | `./deploy-manager.sh logs` |
| `backup` | Criar backup | `./deploy-manager.sh backup` |
| `rollback` | Voltar versão anterior | `./deploy-manager.sh rollback` |

---

## 🛡️ Recursos de Segurança

### ✅ Backup Automático
- Backup automático antes de cada atualização
- Backups com timestamp para identificação
- Rollback rápido em caso de problemas

### ✅ Verificação de Integridade
- Teste de saúde após cada deploy
- Rollback automático se aplicação não responder
- Logs detalhados de cada operação

### ✅ Configuração Segura
- Arquivo .env protegido (não incluído no Git)
- Chaves SSH com permissões corretas
- HTTPS automático via Certbot

---

## 📁 Estrutura de Arquivos

```
pli_cadastros/
├── scripts/
│   ├── deploy-manager.sh      # Script principal Linux/macOS
│   ├── deploy-manager.ps1     # Script principal Windows
│   └── deploy-update.sh       # Script executado no servidor
├── deploy/
│   ├── 04-deploy-aplicacao.md # Documentação de deploy
│   └── 07-deploy-automatizado.md # Esta documentação
└── config/
    └── .env                   # Configurações (criado no deploy)
```

---

## 🔍 Troubleshooting

### Erro de Conexão SSH
```bash
# Verificar permissões da chave
chmod 400 ~/.ssh/pli-cadastros-key

# Testar conexão manual
ssh -i ~/.ssh/pli-cadastros-key ubuntu@SEU-IP-EC2
```

### Aplicação Não Inicia
```bash
# Ver logs detalhados
./scripts/deploy-manager.sh logs

# Conectar ao servidor e verificar
ssh -i ~/.ssh/pli-cadastros-key ubuntu@SEU-IP-EC2
cd /home/ubuntu/pli_cadastros
pm2 logs --lines 50
```

### Problemas de Dependências
```bash
# Conectar ao servidor
ssh -i ~/.ssh/pli-cadastros-key ubuntu@SEU-IP-EC2
cd /home/ubuntu/pli_cadastros

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install --production

# Reiniciar aplicação
pm2 restart pli-cadastros
```

---

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs: `./scripts/deploy-manager.sh logs`
2. Teste a conexão: `./scripts/deploy-manager.sh test`
3. Consulte a documentação de troubleshooting
4. Use rollback se necessário: `./scripts/deploy-manager.sh rollback`

---

## 🎯 Exemplo de Fluxo Completo

```bash
# 1. Configuração inicial (uma vez)
nano scripts/deploy-manager.sh  # Configurar EC2_HOST e KEY_FILE
./scripts/deploy-manager.sh test  # Testar conexão

# 2. Primeiro deploy
./scripts/deploy-manager.sh first-deploy

# 3. Fazer mudanças no código
# ... editar arquivos ...

# 4. Deploy das mudanças
./scripts/deploy-manager.sh update

# 5. Monitoramento
./scripts/deploy-manager.sh status
./scripts/deploy-manager.sh logs

# 6. Se houver problema
./scripts/deploy-manager.sh rollback
```

**🎉 Pronto! Sua aplicação SIGMA-PLI está automatizada e pronta para produção!**
