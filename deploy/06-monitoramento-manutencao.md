# FASE 6: MONITORAMENTO E MANUTENÇÃO

## 6.1 Configurar Monitoramento com PM2

### Verificar status da aplicação:

```bash
# Status detalhado
pm2 status

# Logs em tempo real
pm2 logs pli-cadastros

# Monitoramento de recursos
pm2 monit

# Reiniciar aplicação
pm2 restart pli-cadastros

# Parar aplicação
pm2 stop pli-cadastros
```

## 6.2 Configurar Logs do Sistema

```bash
# Criar rotação de logs
sudo nano /etc/logrotate.d/pli-cadastros
```

### Conteúdo do arquivo:

```
/home/ubuntu/pli_cadastros/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reload pli-cadastros
    endscript
}
```

## 6.3 Scripts de Backup do Banco

```bash
# Criar script de backup
nano ~/backup-db.sh
```

### Conteúdo do script:

```bash
#!/bin/bash
# Backup do banco PostgreSQL

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_HOST="pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com"
DB_NAME="pli_db"
DB_USER="postgres"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Fazer backup
PGPASSWORD="semil2025*" pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/pli_db_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "pli_db_*.sql" -mtime +7 -delete

echo "Backup realizado: pli_db_$DATE.sql"
```

```bash
# Tornar executável
chmod +x ~/backup-db.sh

# Agendar backup diário (crontab)
crontab -e

# Adicionar linha (backup às 2h da manhã):
0 2 * * * /home/ubuntu/backup-db.sh
```

## 6.4 Alertas e Notificações

### Script de verificação de saúde:

```bash
nano ~/health-check.sh
```

```bash
#!/bin/bash
# Verificação de saúde da aplicação

APP_URL="http://localhost:3000/api/health"
EMAIL="pli.semil.sp@gmail.com"

# Testar aplicação
if ! curl -f $APP_URL > /dev/null 2>&1; then
    echo "ALERTA: Aplicação PLI Cadastros não está respondendo!" | mail -s "ALERTA: PLI Cadastros DOWN" $EMAIL
    pm2 restart pli-cadastros
fi

# Verificar uso de memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "ALERTA: Uso de memória alto: ${MEM_USAGE}%" | mail -s "ALERTA: Memória Alta" $EMAIL
fi
```

```bash
chmod +x ~/health-check.sh

# Executar a cada 5 minutos
crontab -e
# Adicionar:
*/5 * * * * /home/ubuntu/health-check.sh
```

## 6.5 Comandos Úteis de Manutenção

### Verificar recursos do sistema:

```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h

# Logs do sistema
journalctl -u nginx -f
journalctl -f

# Verificar conexões de rede
netstat -tulpn | grep :3000
```

### Atualizar aplicação:

```bash
# Parar aplicação
pm2 stop pli-cadastros

# Fazer backup dos logs
cp -r logs logs.backup.$(date +%Y%m%d)

# Atualizar código (se usando git)
git pull origin master

# Instalar dependências
npm install --production

# Reiniciar aplicação
pm2 start pli-cadastros

# Verificar status
pm2 status
```

## 6.6 Security Checklist

### Configurações de segurança:

```bash
# Atualizar sistema regularmente
sudo apt update && sudo apt upgrade -y

# Configurar fail2ban (proteção SSH)
sudo apt install -y fail2ban

# Verificar portas abertas
sudo ss -tulpn

# Verificar usuários logados
who

# Logs de acesso SSH
sudo tail -f /var/log/auth.log
```
