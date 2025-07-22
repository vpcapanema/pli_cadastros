// backend/src/config/cors.js
require('dotenv').config();

const corsConfig = {
  // Origens permitidas
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL
    ].filter(Boolean); // Remove valores undefined/null

    // Se não há origin (requisições do servidor) ou está na lista, permite
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS bloqueou origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS - Origem não autorizada'));
    }
  },

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers permitidos
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-CSRF-Token'
  ],

  // Headers expostos ao cliente
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],

  // Permitir cookies
  credentials: true,

  // Cache preflight por 1 hora
  maxAge: 3600,

  // Responder OK para OPTIONS
  optionsSuccessStatus: 200,

  // Para desenvolvimento - menos restritivo
  development: {
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
  }
};

// Configuração específica para ambiente
const getCorsConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 CORS configurado para DESENVOLVIMENTO (menos restritivo)');
    return corsConfig.development;
  }
  
  console.log('🔒 CORS configurado para PRODUÇÃO (restritivo)');
  return corsConfig;
};

module.exports = getCorsConfig;
