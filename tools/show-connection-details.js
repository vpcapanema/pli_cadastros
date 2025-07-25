// Script para mostrar os detalhes da conexão com o banco de dados
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

console.log('=== DETALHES DA CONEXÃO COM O BANCO DE DADOS ===');
console.log('\nVariáveis de ambiente:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Configuração do pool de conexões PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pli_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  ssl: { rejectUnauthorized: false },
};

console.log('\nConfiguração efetiva:');
console.log('host:', dbConfig.host);
console.log('port:', dbConfig.port);
console.log('database:', dbConfig.database);
console.log('user:', dbConfig.user);
console.log('ssl:', dbConfig.ssl);

// Criar pool de conexões
let pool;
if (process.env.DATABASE_URL) {
  console.log('\nUsando DATABASE_URL para conexão');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  console.log('\nUsando configuração individual para conexão');
  pool = new Pool(dbConfig);
}

async function testConnection() {
  try {
    console.log('\nTestando conexão...');
    const client = await pool.connect();
    console.log('Conexão estabelecida com sucesso!');
    
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log('Banco de dados conectado:', dbResult.rows[0].db_name);
    
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    
    console.log('\nEsquemas disponíveis:');
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.schema_name}`);
    });
    
    // Tentar listar tabelas nos esquemas cadastro e usuarios
    console.log('\nVerificando tabelas no esquema cadastro:');
    try {
      const cadastroResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'cadastro'
        ORDER BY table_name
      `);
      
      if (cadastroResult.rows.length === 0) {
        console.log('Nenhuma tabela encontrada no esquema cadastro.');
      } else {
        cadastroResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    } catch (err) {
      console.error('Erro ao consultar tabelas no esquema cadastro:', err.message);
    }
    
    console.log('\nVerificando tabelas no esquema usuarios:');
    try {
      const usuariosResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'usuarios'
        ORDER BY table_name
      `);
      
      if (usuariosResult.rows.length === 0) {
        console.log('Nenhuma tabela encontrada no esquema usuarios.');
      } else {
        usuariosResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    } catch (err) {
      console.error('Erro ao consultar tabelas no esquema usuarios:', err.message);
    }
    
    client.release();
  } catch (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada.');
  }
}

testConnection();