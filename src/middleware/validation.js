/**
 * Middleware de Validação e Sanitização - SIGMA-PLI
 * Implementa validação robusta e sanitização de dados de entrada
 */

const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Middleware para verificar resultados de validação
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Dados inválidos fornecidos',
      erros: errors.array().map((error) => ({
        campo: error.path || error.param,
        valor: error.value,
        mensagem: error.msg,
      })),
    });
  }
  next();
};

// Sanitização XSS personalizada
const sanitizeXSS = (value) => {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {}, // Não permitir nenhuma tag HTML
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }
  return value;
};

// Middleware de sanitização para todos os campos
const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        req.body[key] = sanitizeXSS(req.body[key]);
      }
    }
  }

  // Sanitizar query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        req.query[key] = sanitizeXSS(req.query[key]);
      }
    }
  }

  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (req.params.hasOwnProperty(key)) {
        req.params[key] = sanitizeXSS(req.params[key]);
      }
    }
  }

  next();
};

// Validações específicas para diferentes campos

// Validação de email
const validateEmail = () => [
  body('email')
    .isEmail()
    .withMessage('Email deve ter formato válido')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email muito longo'),
];

// Validação de senha
const validatePassword = () => [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter: minúscula, maiúscula, número e caractere especial'),
];

// Validação de nome
const validateName = (fieldName = 'nome') => [
  body(fieldName)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`${fieldName} deve ter entre 2 e 100 caracteres`)
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage(`${fieldName} deve conter apenas letras e espaços`),
];

// Validação de telefone
const validatePhone = () => [
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (11) 99999-9999'),
];

// Validação de CPF
const validateCPF = () => [
  body('cpf')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00')
    .custom((value) => {
      // Validação básica de CPF
      const cpf = value.replace(/[^\d]/g, '');
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        throw new Error('CPF inválido');
      }
      return true;
    }),
];

// Validação de CNPJ
const validateCNPJ = () => [
  body('cnpj')
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ deve estar no formato 00.000.000/0000-00'),
];

// Validação de ID
const validateId = (paramName = 'id') => [
  param(paramName).isUUID().withMessage('ID deve ser um UUID válido'),
];

// Validação de paginação
const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página deve ser um número entre 1 e 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
];

// Validação para login
const validateLogin = () => [
  body('email').isEmail().withMessage('Email deve ter formato válido').normalizeEmail(),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Senha é obrigatória')
    .isLength({ max: 128 })
    .withMessage('Senha muito longa'),
];

// Validação para cadastro de usuário
const validateUserRegistration = () => [
  ...validateEmail(),
  ...validatePassword(),
  ...validateName('nome_completo'),
  body('tipo_usuario')
    .isIn(['ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR'])
    .withMessage('Tipo de usuário inválido'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username deve ter entre 3 e 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username deve conter apenas letras, números e underscore'),
];

// Middleware de validação SQL Injection
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bEXEC\b|\bEXECUTE\b|\bsp_\w+)/i,
  ];

  const checkForSQLInjection = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (
    checkForSQLInjection(req.body) ||
    checkForSQLInjection(req.query) ||
    checkForSQLInjection(req.params)
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Entrada suspeita detectada',
      codigo: 'SUSPICIOUS_INPUT',
    });
  }

  next();
};

module.exports = {
  checkValidationResult,
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateCPF,
  validateCNPJ,
  validateId,
  validatePagination,
  validateLogin,
  validateUserRegistration,
  preventSQLInjection,
};
