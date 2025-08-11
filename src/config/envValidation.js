// Validação centralizada de variáveis de ambiente
require('dotenv').config();

const REQUIRED_BASE = ['EMAIL_FROM', 'EMAIL_ADMIN', 'JWT_SECRET'];

function hasSmtpBasic() {
  return ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].every((k) => process.env[k]);
}
function hasSendgrid() {
  return !!process.env.SENDGRID_API_KEY;
}
function hasOAuth2() {
  return ['OAUTH2_CLIENT_ID', 'OAUTH2_CLIENT_SECRET', 'OAUTH2_REFRESH_TOKEN', 'SMTP_USER'].every(
    (k) => process.env[k]
  );
}
function validateEmailProvider() {
  if (hasSmtpBasic() || hasSendgrid() || hasOAuth2()) return [];
  return [
    'Config provedor email ausente: defina SMTP_* completo, ou SENDGRID_API_KEY, ou OAUTH2_* + SMTP_USER',
  ];
}
function validateDatabase() {
  if (process.env.DATABASE_URL) return [];
  return ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter((k) => !process.env[k]);
}
function validateNumeric(vars) {
  return vars
    .filter((v) => process.env[v] && isNaN(Number(process.env[v])))
    .map((v) => `Variável ${v} deve ser numérica`);
}
function validateEnv(options = {}) {
  const strict =
    options.strict !== undefined ? options.strict : process.env.NODE_ENV === 'production';
  const missingBase = REQUIRED_BASE.filter((k) => !process.env[k]);
  const missingDb = validateDatabase();
  const emailIssues = validateEmailProvider();
  const numericIssues = validateNumeric(['PORT', 'SMTP_PORT', 'DB_PORT']);
  const problems = [];
  if (missingBase.length)
    problems.push(`Variáveis obrigatórias ausentes: ${missingBase.join(', ')}`);
  if (missingDb.length) problems.push(`Variáveis de banco ausentes: ${missingDb.join(', ')}`);
  if (emailIssues.length) problems.push(...emailIssues);
  if (numericIssues.length) problems.push(...numericIssues);
  if (problems.length) {
    console.error('\n========== VALIDAÇÃO DE AMBIENTE ==========');
    problems.forEach((p) => console.error('❌', p));
    console.error('==========================================\n');
    if (strict) {
      console.error('Ambiente inválido (modo estrito). Abortando.');
      process.exit(1);
    } else {
      console.warn('Ambiente com pendências (modo não estrito).');
    }
  } else {
    console.log('✅ Variáveis de ambiente validadas.');
  }
  return { ok: problems.length === 0, problems };
}
module.exports = { validateEnv };
