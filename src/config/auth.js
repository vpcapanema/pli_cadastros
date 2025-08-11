// backend/src/config/auth.js
require('dotenv').config();

const authConfig = {
  // Chave secreta para JWT (deve ser definida no .env)
  jwtSecret: process.env.JWT_SECRET || 'pli-secret-key-2025-muito-segura',

  // Configurações do token
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Configurações de senha
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Configurações de sessão
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000, // 24h em ms

  // Configurações de recuperação de senha
  resetPasswordTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY) || 1 * 60 * 60 * 1000, // 1h em ms

  // Configurações de rate limiting
  loginRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },

  // Configurações gerais de rate limiting
  generalRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },

  // Headers de segurança
  securityHeaders: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  },
};

module.exports = authConfig;
