// Script para consultar as tabelas e colunas do banco postgres
const { pool } = require('../src/config/database');

async function listSchemas() {
  try {
    console.log('Consultando esquemas do banco de dados...');
    const result = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    
    console.log('\n=== ESQUEMAS ENCONTRADOS ===');
    if (result.rows.length === 0) {
      console.log('Nenhum esquema personalizado encontrado.');
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.schema_name}`);
      });
    }
    
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
    
    if (result.rows.length === 0) {
      console.log(`Nenhuma tabela encontrada no esquema ${schema}.`);
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
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
  } catch (error) {
    console.error(`Erro ao descrever tabela ${schema}.${table}:`, error);
  }
}

async function main() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Verificar conexão
    const testResult = await pool.query('SELECT current_database() as db_name');
    console.log(`Conectado ao banco de dados: ${testResult.rows[0].db_name}`);
    
    const schemas = await listSchemas();
    
    // Se não encontrar os esquemas cadastro e usuarios, vamos verificar se eles existem
    const expectedSchemas = ['cadastro', 'usuarios'];
    const missingSchemas = expectedSchemas.filter(s => !schemas.includes(s));
    
    if (missingSchemas.length > 0) {
      console.log(`\nOs esquemas esperados ${missingSchemas.join(', ')} não foram encontrados.`);
      console.log('Verificando se as tabelas existem no esquema public...');
      
      const publicTables = await listTablesInSchema('public');
      
      // Verificar se existem tabelas com prefixos que indicam os esquemas
      const cadastroTables = publicTables.filter(t => t.startsWith('pessoa_') || t.startsWith('cadastro_'));
      const usuariosTables = publicTables.filter(t => t.startsWith('usuario_') || t.startsWith('usuarios_'));
      
      if (cadastroTables.length > 0) {
        console.log('\nTabelas relacionadas a cadastro encontradas no esquema public:');
        cadastroTables.forEach(t => console.log(`- ${t}`));
      }
      
      if (usuariosTables.length > 0) {
        console.log('\nTabelas relacionadas a usuários encontradas no esquema public:');
        usuariosTables.forEach(t => console.log(`- ${t}`));
      }
    }
    
    // Processar todos os esquemas encontrados
    for (const schema of schemas) {
      const tables = await listTablesInSchema(schema);
      
      for (const table of tables) {
        await describeTable(schema, table);
      }
    }
    
    // Verificar tabelas no esquema public de qualquer forma
    if (!schemas.includes('public')) {
      const publicTables = await listTablesInSchema('public');
      
      for (const table of publicTables) {
        await describeTable('public', table);
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