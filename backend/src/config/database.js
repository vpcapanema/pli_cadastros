// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pli_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite inativo
  connectionTimeoutMillis: 2000, // tempo limite conexão
};

// Criar pool de conexões
const pool = new Pool(dbConfig);

// Event listeners para monitoramento
pool.on('connect', () => {
  console.log('🔗 Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no client PostgreSQL:', err);
  process.exit(-1);
});

// Função para testar conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL testada com sucesso:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err.message);
    return false;
  }
};

// Função para executar queries com tratamento de erro
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executada', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Erro na query:', err.message);
    throw err;
  }
};

// Função para transações
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Função para fechar todas as conexões
const closePool = async () => {
  await pool.end();
  console.log('🔒 Pool de conexões PostgreSQL fechado');
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
