// Script para listar todas as colunas das tabelas dos esquemas 'usuarios' e 'cadastro'
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuração para conectar ao banco pli_db
const connectionConfig = {
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: 'pli_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
  ssl: { rejectUnauthorized: false },
};

async function analyzeColumns() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('Conectando ao banco de dados pli_db...');
    const client = await pool.connect();
    
    // Listar todas as tabelas dos esquemas 'usuarios' e 'cadastro'
    const schemas = ['usuarios', 'cadastro'];
    
    for (const schema of schemas) {
      console.log(`\n=== TABELAS NO ESQUEMA "${schema}" ===`);
      
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `, [schema]);
      
      if (tablesResult.rows.length === 0) {
        console.log(`Nenhuma tabela encontrada no esquema ${schema}.`);
        continue;
      }
      
      for (const table of tablesResult.rows) {
        const tableName = table.table_name;
        console.log(`\n## TABELA: ${schema}.${tableName}`);
        
        // Obter todas as colunas da tabela
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
        `, [schema, tableName]);
        
        console.log("| Coluna | Tipo | Nulo? | Default | Preenchimento |");
        console.log("|--------|------|-------|---------|--------------|");
        
        columnsResult.rows.forEach(col => {
          const dataType = col.character_maximum_length 
            ? `${col.data_type}(${col.character_maximum_length})` 
            : col.data_type;
          
          const nullable = col.is_nullable === 'YES' ? 'Sim' : 'Não';
          const defaultVal = col.column_default || '';
          
          // Determinar se a coluna é preenchida pelo sistema ou via formulário
          let preenchimento = 'Formulário';
          
          // Colunas tipicamente preenchidas pelo sistema
          if (
            col.column_name === 'id' || 
            col.column_name === 'data_criacao' || 
            col.column_name === 'data_atualizacao' || 
            col.column_name === 'data_exclusao' ||
            col.column_name === 'created_at' ||
            col.column_name === 'updated_at' ||
            col.column_name === 'data_ultimo_login' ||
            col.column_name === 'tentativas_login' ||
            col.column_name === 'bloqueado_ate' ||
            col.column_default?.includes('CURRENT_TIMESTAMP') ||
            col.column_default?.includes('gen_random_uuid()') ||
            col.column_name.includes('_id') && col.column_name !== 'pessoa_fisica_id' && col.column_name !== 'instituicao'
          ) {
            preenchimento = 'Sistema';
          }
          
          // Casos específicos
          if (col.column_name === 'senha_hash' || col.column_name === 'salt') {
            preenchimento = 'Sistema (derivado)';
          }
          
          if (col.column_name === 'ativo' && defaultVal.includes('true')) {
            preenchimento = 'Sistema (default)';
          }
          
          console.log(`| ${col.column_name} | ${dataType} | ${nullable} | ${defaultVal} | ${preenchimento} |`);
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

analyzeColumns();