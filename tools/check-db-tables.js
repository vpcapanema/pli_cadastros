// Script para consultar as tabelas e colunas do banco de dados
const { pool } = require('../src/config/database');

async function listSchemas() {
  try {
    console.log('Consultando esquemas do banco de dados...');
    const result = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('cadastro', 'usuarios')
      ORDER BY schema_name
    `);
    
    console.log('\n=== ESQUEMAS ENCONTRADOS ===');
    result.rows.forEach(row => {
      console.log(`- ${row.schema_name}`);
    });
    
    return result.rows.map(row => row.schema_name);
  } catch (error) {
    console.error('Erro ao consultar esquemas:', error);
    return [];
  }
}

async function listTablesInSchema(schema) {
  try {
    console.log(`\n=== TABELAS NO ESQUEMA "${schema}" ===`);
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
      ORDER BY table_name
    `, [schema]);
    
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error(`Erro ao consultar tabelas no esquema ${schema}:`, error);
    return [];
  }
}

async function describeTable(schema, table) {
  try {
    console.log(`\n=== DETALHES DA TABELA "${schema}.${table}" ===`);
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table]);
    
    console.log('Colunas:');
    result.rows.forEach(col => {
      const dataType = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})` 
        : col.data_type;
      
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
      
      console.log(`- ${col.column_name}: ${dataType} ${nullable} ${defaultVal}`);
    });
    
    // Consultar chaves primárias
    const pkResult = await pool.query(`
      SELECT c.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
      JOIN information_schema.columns AS c 
        ON c.table_schema = tc.constraint_schema
        AND c.table_name = tc.table_name
        AND c.column_name = ccu.column_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
    `, [schema, table]);
    
    if (pkResult.rows.length > 0) {
      console.log('\nChave Primária:');
      pkResult.rows.forEach(row => {
        console.log(`- ${row.column_name}`);
      });
    }
    
    // Consultar chaves estrangeiras
    const fkResult = await pool.query(`
      SELECT
        tc.constraint_name,
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
        AND tc.table_schema = $1
        AND tc.table_name = $2
    `, [schema, table]);
    
    if (fkResult.rows.length > 0) {
      console.log('\nChaves Estrangeiras:');
      fkResult.rows.forEach(row => {
        console.log(`- ${row.column_name} -> ${row.foreign_table_schema}.${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    }
    
    // Consultar índices
    const indexResult = await pool.query(`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relkind = 'r'
        AND n.nspname = $1
        AND t.relname = $2
    `, [schema, table]);
    
    if (indexResult.rows.length > 0) {
      console.log('\nÍndices:');
      const indices = {};
      indexResult.rows.forEach(row => {
        if (!indices[row.index_name]) {
          indices[row.index_name] = [];
        }
        indices[row.index_name].push(row.column_name);
      });
      
      Object.entries(indices).forEach(([indexName, columns]) => {
        console.log(`- ${indexName}: (${columns.join(', ')})`);
      });
    }
    
  } catch (error) {
    console.error(`Erro ao descrever tabela ${schema}.${table}:`, error);
  }
}

async function main() {
  try {
    console.log('Conectando ao banco de dados...');
    const schemas = await listSchemas();
    
    for (const schema of schemas) {
      const tables = await listTablesInSchema(schema);
      
      for (const table of tables) {
        await describeTable(schema, table);
      }
    }
    
    console.log('\nConsulta concluída com sucesso!');
  } catch (error) {
    console.error('Erro na execução:', error);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

main();