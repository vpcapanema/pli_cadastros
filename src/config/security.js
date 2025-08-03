/**
 * Configurações de Segurança - SIGMA-PLI
 * Implementa todas as melhores práticas de segurança OWASP
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

// Rate Limiting Configurations
const rateLimitConfigs = {
  // Rate limit geral para todas as APIs
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
      sucesso: false,
      mensagem: 'Muitas requisições. Tente novamente em 15 minutos.',
      codigo: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limit específico para login (mais restritivo)
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
      sucesso: false,
      mensagem: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      codigo: 'LOGIN_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // não conta requests bem-sucedidos
  }),

  // Rate limit para APIs sensíveis
  sensitive: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 requests por IP
    message: {
      sucesso: false,
      mensagem: 'Limite de requisições excedido para esta operação.',
      codigo: 'SENSITIVE_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
};

// Helmet Configuration (Security Headers)
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://stackpath.bootstrapcdn.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://stackpath.bootstrapcdn.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://stackpath.bootstrapcdn.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Para compatibilidade
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  }
});

// CORS Configuration
const corsConfig = {
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:8888',
      'http://localhost:3000',
      'http://54.237.45.153',
      'https://pli-sistema.com', // substitua pelo seu domínio
    ];

    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueou origem não autorizada: ${origin}`);
      callback(new Error('Não permitido pelo CORS - Origem não autorizada'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true,
  maxAge: 3600, // Cache preflight por 1 hora
  optionsSuccessStatus: 200
};

// Middleware de limpeza XSS
const xssClean = xss();

// Middleware de proteção contra HTTP Parameter Pollution
const hppProtection = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'] // parâmetros permitidos duplicados
});

// Middleware de compressão
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // apenas para responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Middleware para remover header X-Powered-By
const removeXPoweredBy = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
};

// Middleware de segurança adicional
const additionalSecurity = (req, res, next) => {
  // Headers de segurança adicionais
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

module.exports = {
  rateLimitConfigs,
  helmetConfig,
  corsConfig,
  xssClean,
  hppProtection,
  compressionMiddleware,
  removeXPoweredBy,
  additionalSecurity
};
