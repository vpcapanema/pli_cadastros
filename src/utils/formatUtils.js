/**
 * Utilitários para formatação de dados antes de inserção no banco
 */

/**
 * Formata CPF removendo caracteres não numéricos
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado (apenas números)
 */
const formatCPF = (cpf) => {
  if (!cpf) return cpf;
  return String(cpf).replace(/[^\d]/g, '');
};

/**
 * Formata CNPJ removendo caracteres não numéricos
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} CNPJ formatado (apenas números)
 */
const formatCNPJ = (cnpj) => {
  if (!cnpj) return cnpj;
  return String(cnpj).replace(/[^\d]/g, '');
};

/**
 * Formata telefone removendo caracteres não numéricos
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} Telefone formatado (apenas números)
 */
const formatPhone = (phone) => {
  if (!phone) return phone;
  return String(phone).replace(/[^\d]/g, '');
};

/**
 * Formata CEP removendo caracteres não numéricos
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado (apenas números)
 */
const formatCEP = (cep) => {
  if (!cep) return cep;
  return String(cep).replace(/[^\d]/g, '');
};

/**
 * Formata texto para caixa alta
 * @param {string} text - Texto a ser formatado
 * @returns {string} Texto em caixa alta
 */
const toUpperCase = (text) => {
  if (!text) return text;
  return String(text).toUpperCase();
};

/**
 * Formata texto para caixa baixa
 * @param {string} text - Texto a ser formatado
 * @returns {string} Texto em caixa baixa
 */
const toLowerCase = (text) => {
  if (!text) return text;
  return String(text).toLowerCase();
};

/**
 * Formata texto para título (primeira letra de cada palavra maiúscula)
 * @param {string} text - Texto a ser formatado
 * @returns {string} Texto formatado como título
 */
const toTitleCase = (text) => {
  if (!text) return text;
  return String(text)
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata email (caixa baixa)
 * @param {string} email - Email a ser formatado
 * @returns {string} Email formatado (caixa baixa)
 */
const formatEmail = (email) => {
  if (!email) return email;
  return String(email).toLowerCase().trim();
};

/**
 * Aplica formatação a um objeto de dados
 * @param {Object} data - Objeto com dados a serem formatados
 * @param {Object} formatRules - Regras de formatação (campo: função de formatação)
 * @returns {Object} Objeto com dados formatados
 */
const formatData = (data, formatRules) => {
  if (!data || typeof data !== 'object') return data;

  const formattedData = { ...data };

  Object.entries(formatRules).forEach(([field, formatFn]) => {
    if (formattedData[field] !== undefined) {
      formattedData[field] = formatFn(formattedData[field]);
    }
  });

  return formattedData;
};

module.exports = {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  toUpperCase,
  toLowerCase,
  toTitleCase,
  formatEmail,
  formatData,
};
