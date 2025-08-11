/**
 * Middleware de Tratamento Global de Erros - SIGMA-PLI
 * Gerencia erros de forma consistente e segura
 */

const { logSecurityEvent, securityLogger } = require('./audit');

// Middleware de tratamento de erros 404
const handle404 = (req, res, next) => {
  const error = new Error(`Recurso não encontrado: ${req.originalUrl}`);
  error.status = 404;
  error.type = 'NOT_FOUND';
  next(error);
};

// Middleware de tratamento global de erros
const globalErrorHandler = (error, req, res, next) => {
  // Definir status padrão
  const status = error.status || error.statusCode || 500;
  const type = error.type || 'INTERNAL_ERROR';

  // Log do erro
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    status,
    type,
    url: req.originalUrl,
    method: req.method,
    sessionHash: req.audit?.sessionHash,
    userId: req.user?.id || null,
    timestamp: new Date().toISOString(),
  };

  // Determinar nível de log baseado no status
  if (status >= 500) {
    securityLogger.error('Erro interno do servidor', errorDetails);
    logSecurityEvent(
      'SERVER_ERROR',
      'high',
      error.message,
      {
        stack: error.stack,
        status,
        type,
      },
      req
    );
  } else if (status >= 400) {
    securityLogger.warn('Erro de cliente', errorDetails);
    if (status === 401 || status === 403) {
      logSecurityEvent(
        'ACCESS_DENIED',
        'medium',
        error.message,
        {
          status,
          type,
        },
        req
      );
    }
  }

  // Preparar resposta de erro
  let errorResponse = {
    sucesso: false,
    erro: true,
    codigo: type,
    timestamp: new Date().toISOString(),
  };

  // Personalizar mensagem baseada no status
  switch (status) {
    case 400:
      errorResponse.mensagem = 'Requisição inválida';
      break;
    case 401:
      errorResponse.mensagem = 'Acesso não autorizado';
      break;
    case 403:
      errorResponse.mensagem = 'Acesso negado';
      break;
    case 404:
      errorResponse.mensagem = 'Recurso não encontrado';
      break;
    case 429:
      errorResponse.mensagem = 'Muitas tentativas. Tente novamente mais tarde';
      break;
    case 500:
      errorResponse.mensagem = 'Erro interno do servidor';
      break;
    default:
      errorResponse.mensagem = error.message || 'Erro desconhecido';
  }

  // Em ambiente de desenvolvimento, incluir mais detalhes
  if (process.env.NODE_ENV === 'development') {
    errorResponse.detalhes = {
      mensagem: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
    };
  }

  // Adicionar headers de segurança específicos para erros
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  });

  res.status(status).json(errorResponse);
};

// Middleware para capturar erros assíncronos não tratados
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware de validação de JSON
const validateJSON = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    logSecurityEvent(
      'INVALID_JSON',
      'low',
      'JSON mal formado recebido',
      {
        error: error.message,
        body: req.body,
      },
      req
    );

    return res.status(400).json({
      sucesso: false,
      erro: true,
      codigo: 'INVALID_JSON',
      mensagem: 'Formato JSON inválido',
      timestamp: new Date().toISOString(),
    });
  }
  next(error);
};

// Middleware para timeouts de requisição
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      logSecurityEvent(
        'REQUEST_TIMEOUT',
        'medium',
        'Timeout de requisição',
        {
          timeout,
          url: req.originalUrl,
          method: req.method,
        },
        req
      );

      if (!res.headersSent) {
        res.status(408).json({
          sucesso: false,
          erro: true,
          codigo: 'REQUEST_TIMEOUT',
          mensagem: 'Tempo limite da requisição excedido',
          timestamp: new Date().toISOString(),
        });
      }
    });
    next();
  };
};

// Middleware para detectar tentativas de brute force
const detectBruteForce = (req, res, next) => {
  const ip = req.audit?.clientIp;
  const now = Date.now();

  // Implementação básica de detecção de brute force
  // Em produção, usar Redis ou banco de dados para persistir
  if (!global.bruteForceAttempts) {
    global.bruteForceAttempts = new Map();
  }

  const attempts = global.bruteForceAttempts.get(ip) || { count: 0, lastAttempt: now };

  // Reset contador se passou mais de 15 minutos
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }

  // Verificar se é uma rota de autenticação com falha
  if (req.path.includes('/auth/') && res.statusCode >= 400) {
    attempts.count++;
    attempts.lastAttempt = now;
    global.bruteForceAttempts.set(ip, attempts);

    // Se muitas tentativas, log como tentativa de brute force
    if (attempts.count >= 5) {
      logSecurityEvent(
        'BRUTE_FORCE',
        'high',
        'Possível ataque de força bruta detectado',
        {
          ip,
          attempts: attempts.count,
          path: req.path,
        },
        req
      );
    }
  }

  next();
};

// Cleanup de recursos não utilizados
const cleanup = () => {
  // Limpar tentativas de brute force antigas
  if (global.bruteForceAttempts) {
    const now = Date.now();
    const cutoff = 24 * 60 * 60 * 1000; // 24 horas

    for (const [ip, data] of global.bruteForceAttempts.entries()) {
      if (now - data.lastAttempt > cutoff) {
        global.bruteForceAttempts.delete(ip);
      }
    }
  }
};

// Executar cleanup a cada hora
setInterval(cleanup, 60 * 60 * 1000);

module.exports = {
  handle404,
  globalErrorHandler,
  asyncErrorHandler,
  validateJSON,
  requestTimeout,
  detectBruteForce,
};
