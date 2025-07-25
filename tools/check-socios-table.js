// Script para verificar se existe tabela de sócios/representantes
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

async function checkSociosTable() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('Conectando ao banco de dados pli_db...');
    const client = await pool.connect();
    
    // Procurar tabelas que podem estar relacionadas a sócios
    console.log('\nProcurando tabelas relacionadas a sócios/representantes:');
    const result = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%socio%' OR table_name LIKE '%representante%'
      ORDER BY table_schema, table_name
    `);
    
    if (result.rows.length === 0) {
      console.log('Nenhuma tabela encontrada com nome relacionado a sócios ou representantes.');
      
      // Verificar se existe alguma tabela que pode estar relacionada a pessoas jurídicas
      console.log('\nVerificando tabelas relacionadas a pessoas jurídicas:');
      const pjResult = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%pessoa%' OR table_name LIKE '%juridic%' OR table_name LIKE '%empresa%'
        ORDER BY table_schema, table_name
      `);
      
      pjResult.rows.forEach(row => {
        console.log(`- ${row.table_schema}.${row.table_name}`);
      });
      
      // Verificar se existe alguma tabela com chave estrangeira para pessoa_juridica
      console.log('\nVerificando tabelas com chave estrangeira para pessoa_juridica:');
      const fkResult = await client.query(`
        SELECT
          tc.table_schema,
          tc.table_name,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_schema = 'cadastro'
          AND ccu.table_name = 'pessoa_juridica'
        ORDER BY tc.table_schema, tc.table_name
      `);
      
      if (fkResult.rows.length === 0) {
        console.log('Nenhuma tabela encontrada com chave estrangeira para pessoa_juridica.');
      } else {
        fkResult.rows.forEach(row => {
          console.log(`- ${row.table_schema}.${row.table_name}.${row.column_name} -> ${row.foreign_table_schema}.${row.foreign_table_name}.${row.foreign_column_name}`);
        });
      }
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.table_schema}.${row.table_name}`);
      });
      
      // Para cada tabela encontrada, mostrar suas colunas
      for (const table of result.rows) {
        const schemaName = table.table_schema;
        const tableName = table.table_name;
        
        console.log(`\n=== COLUNAS DA TABELA "${schemaName}.${tableName}" ===`);
        
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
        `, [schemaName, tableName]);
        
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
    
    client.release();
  } catch (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada.');
  }
}

checkSociosTable();