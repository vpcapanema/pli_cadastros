// Script para consultar as tabelas e colunas do esquema public
const { pool } = require('../src/config/database');

async function listTablesInPublic() {
  try {
    console.log('\n=== TABELAS NO ESQUEMA "public" ===');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (result.rows.length === 0) {
      console.log('Nenhuma tabela encontrada no esquema public.');
    } else {
      result.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Erro ao consultar tabelas no esquema public:', error);
    return [];
  }
}

async function describeTable(table) {
  try {
    console.log(`\n=== DETALHES DA TABELA "public.${table}" ===`);
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    
    console.log('Colunas:');
    result.rows.forEach(col => {
      const dataType = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})` 
        : col.data_type;
      
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
      
      console.log(`- ${col.column_name}: ${dataType} ${nullable} ${defaultVal}`);
    });
  } catch (error) {
    console.error(`Erro ao descrever tabela public.${table}:`, error);
  }
}

async function main() {
  try {
    console.log('Conectando ao banco de dados...');
    const tables = await listTablesInPublic();
    
    for (const table of tables) {
      await describeTable(table);
    }
    
    // Se não houver tabelas, vamos verificar se o banco está vazio ou se há problemas de conexão
    if (tables.length === 0) {
      console.log('\nVerificando conexão com o banco de dados...');
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log(`Conexão OK. Hora atual no servidor: ${testResult.rows[0].current_time}`);
      
      console.log('\nVerificando se existem tabelas em qualquer esquema...');
      const allTablesResult = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        LIMIT 5
      `);
      
      if (allTablesResult.rows.length === 0) {
        console.log('O banco de dados parece estar vazio. Nenhuma tabela encontrada em nenhum esquema.');
      } else {
        console.log('Algumas tabelas encontradas em outros esquemas:');
        allTablesResult.rows.forEach(row => {
          console.log(`- ${row.table_schema}.${row.table_name}`);
        });
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