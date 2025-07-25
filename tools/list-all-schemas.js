// Script para listar todos os esquemas do banco de dados
const { pool } = require('../src/config/database');

async function listAllSchemas() {
  try {
    console.log('Consultando todos os esquemas do banco de dados...');
    const result = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema'
      ORDER BY schema_name
    `);
    
    console.log('\n=== TODOS OS ESQUEMAS ENCONTRADOS ===');
    result.rows.forEach(row => {
      console.log(`- ${row.schema_name}`);
    });
    
    return result.rows.map(row => row.schema_name);
  } catch (error) {
    console.error('Erro ao consultar esquemas:', error);
    return [];
  }
}

async function listAllTables() {
  try {
    console.log('\n=== TODAS AS TABELAS NO BANCO DE DADOS ===');
    const result = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT LIKE 'pg_%' 
        AND table_schema != 'information_schema'
      ORDER BY table_schema, table_name
    `);
    
    result.rows.forEach(row => {
      console.log(`- ${row.table_schema}.${row.table_name}`);
    });
  } catch (error) {
    console.error('Erro ao consultar tabelas:', error);
  }
}

async function main() {
  try {
    await listAllSchemas();
    await listAllTables();
    
    console.log('\nConsulta concluída com sucesso!');
  } catch (error) {
    console.error('Erro na execução:', error);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

main();