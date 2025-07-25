// Script para listar todos os bancos de dados disponíveis no servidor PostgreSQL
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuração para conectar ao banco postgres (banco padrão)
const connectionConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // Conectar ao banco postgres para listar os bancos
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  ssl: { rejectUnauthorized: false },
};

async function listDatabases() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('Conectando ao servidor PostgreSQL...');
    const client = await pool.connect();
    
    console.log('Listando todos os bancos de dados disponíveis:');
    const result = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `);
    
    console.log('\n=== BANCOS DE DADOS DISPONÍVEIS ===');
    result.rows.forEach(row => {
      console.log(`- ${row.datname}`);
    });
    
    client.release();
  } catch (err) {
    console.error('Erro ao listar bancos de dados:', err.message);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada.');
  }
}

listDatabases();