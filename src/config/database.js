// src/config/database.js
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../config/.env') });

// Configuração do pool de conexões PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pli_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  // Configuração SSL segura para produção
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Temporariamente desabilitado para desenvolvimento
  } : {
    rejectUnauthorized: false // Para desenvolvimento
  },
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite inativo
  connectionTimeoutMillis: 2000, // tempo limite conexão
};

// Criar pool de conexões usando string de conexão se disponível
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Configuração SSL segura para produção
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false // Temporariamente desabilitado
    } : {
      rejectUnauthorized: false // Para desenvolvimento
    },
    max: dbConfig.max,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
  });
  console.log('Usando DATABASE_URL para conexão ao PostgreSQL');
} else {
  pool = new Pool(dbConfig);
}

// Event listeners para monitoramento
pool.on('connect', async (client) => {
  try {
    // Define o search_path para o schema 'cadastro' por padrão
    await client.query("SET search_path TO cadastro,public");
    console.log('Nova conexão estabelecida com PostgreSQL (search_path: cadastro,public)');
  } catch (err) {
    console.error('Erro ao definir search_path:', err.message);
  }
});

pool.on('error', (err) => {
  console.error('Erro inesperado no client PostgreSQL:', err);
  process.exit(-1);
});

// Função para testar conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Conexão com PostgreSQL testada com sucesso:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('Erro ao conectar com PostgreSQL:', err.message);
    return false;
  }
};

// Função para executar queries com tratamento de erro
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Erro na query:', err.message);
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
  console.log('Pool de conexões PostgreSQL fechado');
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};