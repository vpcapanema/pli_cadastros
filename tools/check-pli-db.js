// Script para verificar as tabelas no banco de dados pli_db
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuração para conectar ao banco pli_db
const connectionConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: 'pli_db', // Conectar ao banco pli_db
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  ssl: { rejectUnauthorized: false },
};

async function checkDatabase() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('Conectando ao banco de dados pli_db...');
    const client = await pool.connect();
    
    // Verificar o banco de dados atual
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`Banco de dados conectado: ${dbResult.rows[0].db_name}`);
    
    // Listar esquemas
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    
    console.log('\n=== ESQUEMAS DISPONÍVEIS ===');
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.schema_name}`);
    });
    
    // Para cada esquema, listar as tabelas
    for (const schema of schemaResult.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n=== TABELAS NO ESQUEMA "${schemaName}" ===`);
      
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
        ORDER BY table_name
      `, [schemaName]);
      
      if (tablesResult.rows.length === 0) {
        console.log(`Nenhuma tabela encontrada no esquema ${schemaName}.`);
      } else {
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      }
    }
    
    // Verificar especificamente os esquemas cadastro e usuarios
    const targetSchemas = ['cadastro', 'usuarios'];
    for (const targetSchema of targetSchemas) {
      console.log(`\n=== VERIFICANDO TABELAS NO ESQUEMA "${targetSchema}" ===`);
      
      try {
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1
          ORDER BY table_name
        `, [targetSchema]);
        
        if (tablesResult.rows.length === 0) {
          console.log(`Nenhuma tabela encontrada no esquema ${targetSchema}.`);
        } else {
          tablesResult.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
          });
          
          // Para cada tabela, mostrar suas colunas
          for (const table of tablesResult.rows) {
            const tableName = table.table_name;
            console.log(`\n=== COLUNAS DA TABELA "${targetSchema}.${tableName}" ===`);
            
            const columnsResult = await client.query(`
              SELECT 
                column_name, 
                data_type, 
                character_maximum_length,
                column_default,
                is_nullable
              FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2
              ORDER BY ordinal_position
            `, [targetSchema, tableName]);
            
            columnsResult.rows.forEach(col => {
              const dataType = col.character_maximum_length 
                ? `${col.data_type}(${col.character_maximum_length})` 
                : col.data_type;
              
              const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
              const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
              
              console.log(`- ${col.column_name}: ${dataType} ${nullable} ${defaultVal}`);
            });
          }
        }
      } catch (err) {
        console.error(`Erro ao consultar tabelas no esquema ${targetSchema}:`, err.message);
      }
    }
    
    client.release();
  } catch (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada.');
  }
}

checkDatabase();