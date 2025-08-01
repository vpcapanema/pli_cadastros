# 🚀 Scripts de Deploy - SIGMA-PLI

Este diretório contém scripts automatizados para deploy e gerenciamento da aplicação SIGMA-PLI na AWS EC2.

## 📁 Arquivos

| Arquivo | Plataforma | Descrição |
|---------|------------|-----------|
| `deploy-manager.sh` | Linux/macOS/WSL | Script principal de gerenciamento |
| `deploy-manager.ps1` | Windows PowerShell | Script principal para Windows |
| `deploy-update.sh` | Servidor Ubuntu | Script executado no servidor EC2 |

## ⚡ Início Rápido

### 1. Configuração (uma vez)

**Linux/macOS/WSL:**
```bash
# Editar configurações
nano scripts/deploy-manager.sh
# Definir EC2_HOST e KEY_FILE

# Dar permissões
chmod +x scripts/deploy-manager.sh
```

**Windows PowerShell:**
```powershell
# Editar configurações
notepad scripts/deploy-manager.ps1
# Definir $EC2_HOST e $KEY_FILE
```

### 2. Primeiro Deploy
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh first-deploy

# Windows PowerShell
.\scripts\deploy-manager.ps1 first-deploy
```

### 3. Atualizações
```bash
# Linux/macOS/WSL
./scripts/deploy-manager.sh update

# Windows PowerShell
.\scripts\deploy-manager.ps1 update
```

## 📋 Comandos Disponíveis

```bash
help         # Mostrar ajuda
test         # Testar conexão SSH
first-deploy # Primeira instalação completa
update       # Atualizar aplicação
status       # Ver status da aplicação
logs         # Ver logs da aplicação
backup       # Criar backup manual
rollback     # Voltar para versão anterior
```

## 🔧 Configuração Detalhada

### Variáveis Obrigatórias

**deploy-manager.sh (Linux/macOS/WSL):**
```bash
EC2_HOST="seu-ip-publico-ec2"
KEY_FILE="caminho/para/sua/chave.pem"
```

**deploy-manager.ps1 (Windows):**
```powershell
$EC2_HOST = "seu-ip-publico-ec2"
$KEY_FILE = "C:\caminho\para\sua\chave.pem"
```

### Exemplo de Configuração

```bash
# Linux/macOS/WSL
EC2_HOST="52.23.45.67"
KEY_FILE="~/.ssh/pli-cadastros-key.pem"

# Windows PowerShell
$EC2_HOST = "52.23.45.67"
$KEY_FILE = "C:\Users\SeuUsuario\.ssh\pli-cadastros-key.pem"
```

## 🛡️ Pré-requisitos

### No seu computador:
- **SSH Client** (incluído no Windows 10+, macOS, Linux)
- **Git** configurado
- **Permissões** na chave SSH (400)

### Na AWS:
- **EC2 Instance** criada e rodando
- **Security Group** permitindo SSH (porta 22)
- **Chave SSH** associada à instância

## 🎯 Fluxo de Trabalho

### Desenvolvimento Local
1. Fazer mudanças no código
2. Testar localmente
3. Executar `./deploy-manager.sh update`
4. Script automaticamente:
   - Faz commit e push (opcional)
   - Cria backup da versão atual
   - Atualiza código no servidor
   - Reinicia aplicação
   - Verifica saúde da aplicação

### Em Caso de Problemas
1. `./deploy-manager.sh logs` - Ver logs
2. `./deploy-manager.sh rollback` - Voltar versão anterior
3. `./deploy-manager.sh status` - Verificar status

## ⚠️ Importante

### Primeira Execução
- Configure as variáveis `EC2_HOST` e `KEY_FILE`
- Teste a conexão com `./deploy-manager.sh test`
- Use `first-deploy` apenas na primeira vez

### Segurança
- Mantenha sua chave SSH segura (permissions 400)
- Nunca inclua a chave SSH no Git
- Configure Security Groups da EC2 corretamente

### Backup
- Backups automáticos antes de cada update
- Backups ficam em `/home/ubuntu/backups/`
- Rollback disponível a qualquer momento

## 📞 Troubleshooting

### Erro de Conexão SSH
```bash
# Verificar permissões
chmod 400 ~/.ssh/sua-chave.pem

# Testar conexão manual
ssh -i ~/.ssh/sua-chave.pem ubuntu@seu-ip-ec2
```

### Erro de Permissão
```bash
# Linux/macOS/WSL - dar permissões aos scripts
chmod +x scripts/deploy-manager.sh
chmod +x scripts/deploy-update.sh
```

### Aplicação Não Inicia
```bash
# Ver logs detalhados
./scripts/deploy-manager.sh logs

# Ou conectar manualmente e verificar
ssh -i sua-chave.pem ubuntu@seu-ip-ec2
cd /home/ubuntu/pli_cadastros
pm2 logs
```

## 📚 Documentação Completa

Para documentação detalhada, consulte:
- `../deploy/07-deploy-automatizado.md` - Guia completo
- `../deploy/RESUMO-EXECUTIVO.md` - Visão geral executiva
- `../deploy/04-deploy-aplicacao.md` - Deploy manual (alternativo)

---

**✨ Com estes scripts, deploy e atualizações se tornam simples e seguros!**
