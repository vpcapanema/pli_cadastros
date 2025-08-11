/**
 * Sistema de Monitoramento de Logs de Segurança - SIGMA-PLI
 * Monitora logs de segurança em tempo real e gera alertas
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

class SecurityLogMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.logPath = options.logPath || path.join(__dirname, '../../logs/security.log');
    this.auditLogPath = options.auditLogPath || path.join(__dirname, '../../logs/audit.log');
    this.errorLogPath = options.errorLogPath || path.join(__dirname, '../../logs/pli.log');

    this.watchers = new Map();
    this.alertThresholds = {
      bruteForce: 5,
      sqlInjection: 3,
      xssAttempts: 3,
      errorRate: 10,
      timeWindow: 300000, // 5 minutos
    };

    this.eventCounts = new Map();
    this.lastAlerts = new Map();

    this.isMonitoring = false;

    console.log('🔍 Security Log Monitor inicializado');
    console.log(`📂 Log de Segurança: ${this.logPath}`);
    console.log(`📂 Log de Auditoria: ${this.auditLogPath}`);
    console.log(`📂 Log de Erros: ${this.errorLogPath}`);
  }

  /**
   * Inicia o monitoramento de logs
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoramento já está ativo');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Iniciando monitoramento de logs...');

    // Monitorar logs de segurança
    this.watchLogFile(this.logPath, 'security');

    // Monitorar logs de auditoria
    this.watchLogFile(this.auditLogPath, 'audit');

    // Monitorar logs de erro
    this.watchLogFile(this.errorLogPath, 'error');

    // Limpeza periódica de contadores
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // A cada minuto

    console.log('✅ Monitoramento ativo!');
    this.emit('monitoring_started');
  }

  /**
   * Para o monitoramento de logs
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ Monitoramento não está ativo');
      return;
    }

    this.isMonitoring = false;

    // Parar watchers
    for (const [file, watcher] of this.watchers) {
      watcher.close();
      console.log(`📁 Parou monitoramento: ${file}`);
    }
    this.watchers.clear();

    // Limpar intervalos
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    console.log('🛑 Monitoramento parado');
    this.emit('monitoring_stopped');
  }

  /**
   * Monitora um arquivo de log específico
   */
  watchLogFile(filePath, logType) {
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`📁 Criando arquivo de log: ${filePath}`);

      // Criar diretório se não existir
      const logDir = path.dirname(filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Criar arquivo vazio
      fs.writeFileSync(filePath, '');
    }

    try {
      const watcher = fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          this.processLogUpdate(filePath, logType, prev.size, curr.size);
        }
      });

      this.watchers.set(filePath, watcher);
      console.log(`👀 Monitorando: ${filePath} (${logType})`);
    } catch (error) {
      console.error(`❌ Erro ao monitorar ${filePath}:`, error.message);
    }
  }

  /**
   * Processa atualizações no arquivo de log
   */
  async processLogUpdate(filePath, logType, prevSize, currentSize) {
    try {
      const newContent = await this.readNewLogContent(filePath, prevSize, currentSize);
      const lines = newContent.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        await this.processLogLine(line, logType);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar log ${filePath}:`, error.message);
    }
  }

  /**
   * Lê apenas o conteúdo novo do arquivo de log
   */
  readNewLogContent(filePath, prevSize, currentSize) {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath, {
        start: prevSize,
        end: currentSize - 1,
      });

      let content = '';

      stream.on('data', (chunk) => {
        content += chunk.toString();
      });

      stream.on('end', () => {
        resolve(content);
      });

      stream.on('error', reject);
    });
  }

  /**
   * Processa uma linha individual do log
   */
  async processLogLine(line, logType) {
    try {
      const logEntry = this.parseLogLine(line);
      if (!logEntry) return;

      // Processar diferentes tipos de eventos
      switch (logType) {
        case 'security':
          await this.processSecurityEvent(logEntry);
          break;
        case 'audit':
          await this.processAuditEvent(logEntry);
          break;
        case 'error':
          await this.processErrorEvent(logEntry);
          break;
      }

      this.emit('log_processed', { logType, entry: logEntry });
    } catch (error) {
      console.error(`❌ Erro ao processar linha do log:`, error.message);
    }
  }

  /**
   * Parse de linha de log JSON
   */
  parseLogLine(line) {
    try {
      return JSON.parse(line);
    } catch (error) {
      // Tentar parse de log de formato texto
      const textMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)/);
      if (textMatch) {
        return {
          timestamp: textMatch[1],
          level: textMatch[2],
          message: textMatch[3],
        };
      }
      return null;
    }
  }

  /**
   * Processa eventos de segurança
   */
  async processSecurityEvent(logEntry) {
    const { type, event, severity, ip, message } = logEntry;

    // Contar eventos por tipo
    this.incrementEventCount(event || type, ip);

    switch (event || type) {
      case 'ATTACK':
      case 'SQL_INJECTION':
        await this.handleSQLInjectionAttempt(logEntry);
        break;

      case 'XSS':
        await this.handleXSSAttempt(logEntry);
        break;

      case 'BRUTE_FORCE':
        await this.handleBruteForceAttempt(logEntry);
        break;

      case 'UNAUTHORIZED':
        await this.handleUnauthorizedAccess(logEntry);
        break;

      case 'AUTH':
        await this.handleAuthEvent(logEntry);
        break;
    }

    // Exibir evento em tempo real
    this.displaySecurityEvent(logEntry);
  }

  /**
   * Processa eventos de auditoria
   */
  async processAuditEvent(logEntry) {
    const { type, operation, userId, ip } = logEntry;

    if (type === 'CRUD' && operation) {
      console.log(`📝 [AUDITORIA] ${operation} por usuário ${userId || 'anônimo'} (${ip})`);
    }

    this.emit('audit_event', logEntry);
  }

  /**
   * Processa eventos de erro
   */
  async processErrorEvent(logEntry) {
    const { level, message } = logEntry;

    if (level === 'error') {
      this.incrementEventCount('ERROR');

      // Verificar se há muitos erros
      if (this.getEventCount('ERROR') >= this.alertThresholds.errorRate) {
        await this.sendAlert('HIGH_ERROR_RATE', {
          count: this.getEventCount('ERROR'),
          threshold: this.alertThresholds.errorRate,
          message: 'Taxa de erros muito alta detectada',
        });
      }
    }

    this.emit('error_event', logEntry);
  }

  /**
   * Manipula tentativas de SQL Injection
   */
  async handleSQLInjectionAttempt(logEntry) {
    const { ip, attackType } = logEntry;

    console.log(`🚨 [SQL INJECTION] Tentativa detectada de ${ip}`);

    if (this.getEventCount('SQL_INJECTION', ip) >= this.alertThresholds.sqlInjection) {
      await this.sendAlert('SQL_INJECTION_MULTIPLE', {
        ip,
        count: this.getEventCount('SQL_INJECTION', ip),
        details: logEntry,
      });
    }
  }

  /**
   * Manipula tentativas de XSS
   */
  async handleXSSAttempt(logEntry) {
    const { ip } = logEntry;

    console.log(`🚨 [XSS] Tentativa detectada de ${ip}`);

    if (this.getEventCount('XSS', ip) >= this.alertThresholds.xssAttempts) {
      await this.sendAlert('XSS_MULTIPLE', {
        ip,
        count: this.getEventCount('XSS', ip),
        details: logEntry,
      });
    }
  }

  /**
   * Manipula tentativas de brute force
   */
  async handleBruteForceAttempt(logEntry) {
    const { ip } = logEntry;

    console.log(`🚨 [BRUTE FORCE] Tentativa detectada de ${ip}`);

    if (this.getEventCount('BRUTE_FORCE', ip) >= this.alertThresholds.bruteForce) {
      await this.sendAlert('BRUTE_FORCE_CRITICAL', {
        ip,
        count: this.getEventCount('BRUTE_FORCE', ip),
        details: logEntry,
      });
    }
  }

  /**
   * Manipula acessos não autorizados
   */
  async handleUnauthorizedAccess(logEntry) {
    const { ip, reason } = logEntry;

    console.log(`⚠️ [ACESSO NEGADO] ${reason} de ${ip}`);

    this.emit('unauthorized_access', logEntry);
  }

  /**
   * Manipula eventos de autenticação
   */
  async handleAuthEvent(logEntry) {
    const { success, email, ip } = logEntry;

    if (!success) {
      console.log(`❌ [LOGIN FALHOU] ${email} de ${ip}`);
      this.incrementEventCount('FAILED_LOGIN', ip);
    } else {
      console.log(`✅ [LOGIN SUCESSO] ${email} de ${ip}`);
    }
  }

  /**
   * Exibe evento de segurança formatado
   */
  displaySecurityEvent(logEntry) {
    const { timestamp, level, event, ip, message } = logEntry;
    const time = new Date(timestamp).toLocaleTimeString('pt-BR');

    let emoji = '🔍';
    switch (level) {
      case 'error':
        emoji = '🚨';
        break;
      case 'warn':
        emoji = '⚠️';
        break;
      case 'info':
        emoji = 'ℹ️';
        break;
    }

    console.log(`${emoji} [${time}] ${event || 'EVENTO'} - IP: ${ip || 'N/A'} - ${message}`);
  }

  /**
   * Incrementa contador de eventos
   */
  incrementEventCount(eventType, ip = 'global') {
    const key = `${eventType}_${ip}`;
    const now = Date.now();

    if (!this.eventCounts.has(key)) {
      this.eventCounts.set(key, []);
    }

    this.eventCounts.get(key).push(now);
  }

  /**
   * Obtém contagem de eventos na janela de tempo
   */
  getEventCount(eventType, ip = 'global') {
    const key = `${eventType}_${ip}`;
    const events = this.eventCounts.get(key) || [];
    const cutoff = Date.now() - this.alertThresholds.timeWindow;

    return events.filter((timestamp) => timestamp > cutoff).length;
  }

  /**
   * Limpa eventos antigos dos contadores
   */
  cleanupOldEvents() {
    const cutoff = Date.now() - this.alertThresholds.timeWindow;

    for (const [key, events] of this.eventCounts) {
      const recentEvents = events.filter((timestamp) => timestamp > cutoff);
      if (recentEvents.length === 0) {
        this.eventCounts.delete(key);
      } else {
        this.eventCounts.set(key, recentEvents);
      }
    }
  }

  /**
   * Envia alerta de segurança
   */
  async sendAlert(alertType, details) {
    const alertKey = `${alertType}_${details.ip || 'global'}`;
    const now = Date.now();

    // Evitar spam de alertas
    if (this.lastAlerts.has(alertKey)) {
      const lastAlert = this.lastAlerts.get(alertKey);
      if (now - lastAlert < 300000) {
        // 5 minutos
        return;
      }
    }

    this.lastAlerts.set(alertKey, now);

    const alert = {
      type: alertType,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(alertType),
      details,
      message: this.generateAlertMessage(alertType, details),
    };

    console.log(`🚨 ALERTA DE SEGURANÇA: ${alert.message}`);

    // Salvar alerta em arquivo
    await this.saveAlert(alert);

    this.emit('security_alert', alert);

    return alert;
  }

  /**
   * Determina severidade do alerta
   */
  getAlertSeverity(alertType) {
    const severityMap = {
      SQL_INJECTION_MULTIPLE: 'CRITICAL',
      XSS_MULTIPLE: 'HIGH',
      BRUTE_FORCE_CRITICAL: 'CRITICAL',
      HIGH_ERROR_RATE: 'HIGH',
    };

    return severityMap[alertType] || 'MEDIUM';
  }

  /**
   * Gera mensagem de alerta
   */
  generateAlertMessage(alertType, details) {
    const messages = {
      SQL_INJECTION_MULTIPLE: `Múltiplas tentativas de SQL Injection do IP ${details.ip} (${details.count} tentativas)`,
      XSS_MULTIPLE: `Múltiplas tentativas de XSS do IP ${details.ip} (${details.count} tentativas)`,
      BRUTE_FORCE_CRITICAL: `Ataque de força bruta crítico do IP ${details.ip} (${details.count} tentativas)`,
      HIGH_ERROR_RATE: `Taxa de erros muito alta: ${details.count}/${details.threshold}`,
    };

    return messages[alertType] || `Alerta de segurança: ${alertType}`;
  }

  /**
   * Salva alerta em arquivo
   */
  async saveAlert(alert) {
    try {
      const alertsDir = path.join(__dirname, '../../logs');
      const alertsFile = path.join(alertsDir, 'security-alerts.log');

      if (!fs.existsSync(alertsDir)) {
        fs.mkdirSync(alertsDir, { recursive: true });
      }

      const alertLine = JSON.stringify(alert) + '\n';
      fs.appendFileSync(alertsFile, alertLine);
    } catch (error) {
      console.error('❌ Erro ao salvar alerta:', error.message);
    }
  }

  /**
   * Obtém estatísticas de monitoramento
   */
  getStatistics() {
    const stats = {
      isMonitoring: this.isMonitoring,
      monitoredFiles: Array.from(this.watchers.keys()),
      activeEvents: {},
      totalEvents: 0,
      alertsCount: this.lastAlerts.size,
    };

    // Contar eventos ativos
    for (const [key, events] of this.eventCounts) {
      const [eventType] = key.split('_');
      stats.activeEvents[eventType] = (stats.activeEvents[eventType] || 0) + events.length;
      stats.totalEvents += events.length;
    }

    return stats;
  }

  /**
   * Lê logs recentes
   */
  async getRecentLogs(logType = 'security', lines = 50) {
    const logPath = this.getLogPath(logType);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const rl = createInterface({
        input: createReadStream(logPath),
        crlfDelay: Infinity,
      });

      const logLines = [];

      rl.on('line', (line) => {
        if (line.trim()) {
          logLines.push(this.parseLogLine(line));
        }
      });

      rl.on('close', () => {
        resolve(logLines.slice(-lines));
      });

      rl.on('error', reject);
    });
  }

  /**
   * Obtém caminho do log por tipo
   */
  getLogPath(logType) {
    switch (logType) {
      case 'security':
        return this.logPath;
      case 'audit':
        return this.auditLogPath;
      case 'error':
        return this.errorLogPath;
      default:
        return this.logPath;
    }
  }
}

// Função para iniciar monitoramento
function startSecurityMonitoring(options = {}) {
  const monitor = new SecurityLogMonitor(options);

  // Configurar handlers de eventos
  monitor.on('security_alert', (alert) => {
    console.log(`🚨 ALERTA: ${alert.message}`);
  });

  monitor.on('monitoring_started', () => {
    console.log('✅ Monitoramento de segurança iniciado');
  });

  monitor.on('monitoring_stopped', () => {
    console.log('🛑 Monitoramento de segurança parado');
  });

  // Iniciar monitoramento
  monitor.startMonitoring();

  // Tratamento de encerramento gracioso
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando monitoramento...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  return monitor;
}

module.exports = {
  SecurityLogMonitor,
  startSecurityMonitoring,
};

// Se executado diretamente
if (require.main === module) {
  console.log('🔍 Iniciando Monitoramento de Logs de Segurança SIGMA-PLI');
  console.log('=======================================================');

  const monitor = startSecurityMonitoring();

  // Exibir estatísticas a cada 30 segundos
  setInterval(() => {
    const stats = monitor.getStatistics();
    console.log('\n📊 Estatísticas de Monitoramento:');
    console.log(`   Arquivos monitorados: ${stats.monitoredFiles.length}`);
    console.log(`   Eventos ativos: ${stats.totalEvents}`);
    console.log(`   Alertas enviados: ${stats.alertsCount}`);
    console.log(`   Status: ${stats.isMonitoring ? '🟢 ATIVO' : '🔴 INATIVO'}`);
  }, 30000);
}
