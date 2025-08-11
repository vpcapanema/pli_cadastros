/**
 * Sistema de Auditoria e Logs de Segurança - SIGMA-PLI
 * Registra eventos de segurança e ações críticas do sistema
 */

const winston = require('winston');
const path = require('path');
const crypto = require('crypto');
const requestIp = require('request-ip');

// Configuração do Winston para logs de segurança
const createSecurityLogger = () => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        });
      })
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/security.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true,
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/audit.log'),
        level: 'warn',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true,
      }),
    ],
  });
};

const securityLogger = createSecurityLogger();

// Função para gerar hash de sessão para auditoria
const generateSessionHash = (req) => {
  const sessionData = {
    ip: requestIp.getClientIp(req),
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: Date.now(),
  };
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(sessionData))
    .digest('hex')
    .substring(0, 16);
};

// Middleware de auditoria principal
const auditMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const sessionHash = generateSessionHash(req);
  const clientIp = requestIp.getClientIp(req);
  const userAgent = req.get('User-Agent') || 'unknown';

  // Adicionar informações de auditoria ao request
  req.audit = {
    sessionHash,
    clientIp,
    userAgent,
    startTime,
    method: req.method,
    url: req.url,
    path: req.path,
  };

  // Override do res.json para capturar response status
  const originalJson = res.json;
  res.json = function (body) {
    req.audit.responseStatus = res.statusCode;
    req.audit.duration = Date.now() - startTime;
    return originalJson.call(this, body);
  };

  // Log de acesso básico
  if (req.method !== 'GET' || req.path.includes('/admin') || req.path.includes('/api')) {
    securityLogger.info('Request recebido', {
      type: 'ACCESS',
      sessionHash,
      method: req.method,
      url: req.url,
      ip: clientIp,
      userAgent: userAgent.substring(0, 200),
      userId: req.user?.id || null,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Log de eventos de autenticação
const logAuthEvent = (type, details, req, success = true) => {
  const level = success ? 'info' : 'warn';
  securityLogger[level](`Evento de autenticação: ${type}`, {
    type: 'AUTH',
    event: type,
    success,
    sessionHash: req.audit?.sessionHash,
    ip: req.audit?.clientIp,
    userAgent: req.audit?.userAgent?.substring(0, 200),
    userId: details.userId || null,
    email: details.email || null,
    reason: details.reason || null,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Log de eventos de segurança críticos
const logSecurityEvent = (type, severity, message, details = {}, req = null) => {
  const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';

  securityLogger[level](`Evento de segurança: ${type}`, {
    type: 'SECURITY',
    event: type,
    severity,
    message,
    sessionHash: req?.audit?.sessionHash || null,
    ip: req?.audit?.clientIp || null,
    userAgent: req?.audit?.userAgent?.substring(0, 200) || null,
    userId: req?.user?.id || null,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Log de operações CRUD críticas
const logCRUDOperation = (operation, resource, resourceId, req, success = true, details = {}) => {
  const level = success ? 'info' : 'warn';
  securityLogger[level](`Operação CRUD: ${operation} ${resource}`, {
    type: 'CRUD',
    operation,
    resource,
    resourceId,
    success,
    sessionHash: req.audit?.sessionHash,
    ip: req.audit?.clientIp,
    userId: req.user?.id || null,
    email: req.user?.email || null,
    timestamp: new Date().toISOString(),
    duration: req.audit?.duration || null,
    ...details,
  });
};

// Log de tentativas de acesso não autorizado
const logUnauthorizedAccess = (reason, req, details = {}) => {
  securityLogger.warn('Tentativa de acesso não autorizado', {
    type: 'UNAUTHORIZED',
    reason,
    sessionHash: req.audit?.sessionHash,
    ip: req.audit?.clientIp,
    userAgent: req.audit?.userAgent?.substring(0, 200),
    method: req.method,
    url: req.url,
    userId: req.user?.id || null,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Log de erros de validação
const logValidationError = (errors, req) => {
  securityLogger.warn('Erro de validação', {
    type: 'VALIDATION',
    errors: errors.map((err) => ({
      field: err.path || err.param,
      value: typeof err.value === 'string' ? err.value.substring(0, 100) : err.value,
      message: err.msg,
    })),
    sessionHash: req.audit?.sessionHash,
    ip: req.audit?.clientIp,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
};

// Log de tentativas de ataques
const logAttackAttempt = (attackType, req, details = {}) => {
  securityLogger.error(`Tentativa de ataque detectada: ${attackType}`, {
    type: 'ATTACK',
    attackType,
    sessionHash: req.audit?.sessionHash,
    ip: req.audit?.clientIp,
    userAgent: req.audit?.userAgent?.substring(0, 200),
    method: req.method,
    url: req.url,
    headers: Object.keys(req.headers).reduce((acc, key) => {
      acc[key] =
        typeof req.headers[key] === 'string'
          ? req.headers[key].substring(0, 200)
          : req.headers[key];
      return acc;
    }, {}),
    body: req.body ? JSON.stringify(req.body).substring(0, 500) : null,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Middleware para detectar tentativas de SQL Injection
const detectSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/)/,
    /(\bEXEC\b|\bEXECUTE\b|\bsp_\w+)/i,
    /(\bxp_\w+|\bsp_\w+)/i,
  ];

  const checkForSQLInjection = (obj, objName) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            logAttackAttempt('SQL_INJECTION', req, {
              source: objName,
              field: key,
              value: obj[key].substring(0, 200),
              pattern: pattern.toString(),
            });
            return true;
          }
        }
      }
    }
    return false;
  };

  if (
    checkForSQLInjection(req.body, 'body') ||
    checkForSQLInjection(req.query, 'query') ||
    checkForSQLInjection(req.params, 'params')
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Requisição rejeitada por motivos de segurança',
      codigo: 'SECURITY_VIOLATION',
    });
  }

  next();
};

// Middleware para detectar XSS
const detectXSS = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /expression\(/gi,
  ];

  const checkForXSS = (obj, objName) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(obj[key])) {
            logAttackAttempt('XSS', req, {
              source: objName,
              field: key,
              value: obj[key].substring(0, 200),
              pattern: pattern.toString(),
            });
            return true;
          }
        }
      }
    }
    return false;
  };

  if (
    checkForXSS(req.body, 'body') ||
    checkForXSS(req.query, 'query') ||
    checkForXSS(req.params, 'params')
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Requisição rejeitada por motivos de segurança',
      codigo: 'SECURITY_VIOLATION',
    });
  }

  next();
};

// Middleware de finalização de auditoria
const finalizeAudit = (req, res, next) => {
  res.on('finish', () => {
    if (req.audit) {
      req.audit.responseStatus = res.statusCode;
      req.audit.duration = Date.now() - req.audit.startTime;

      // Log apenas para operações importantes ou erros
      if (
        res.statusCode >= 400 ||
        req.method !== 'GET' ||
        req.path.includes('/admin') ||
        req.path.includes('/api/auth')
      ) {
        const level = res.statusCode >= 400 ? 'warn' : 'info';
        securityLogger[level]('Request finalizado', {
          type: 'RESPONSE',
          ...req.audit,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
  next();
};

module.exports = {
  auditMiddleware,
  finalizeAudit,
  logAuthEvent,
  logSecurityEvent,
  logCRUDOperation,
  logUnauthorizedAccess,
  logValidationError,
  logAttackAttempt,
  detectSQLInjection,
  detectXSS,
  securityLogger,
};
