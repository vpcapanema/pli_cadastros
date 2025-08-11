/**
 * Script de Análise - Esquema Usuarios
 * Sistema SIGMA-PLI | Análise completa das tabelas
 */

const { Pool } = require('pg');
const path = require('path');

// Configurar NODE_ENV para development temporariamente para evitar erro SSL
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

// Carregar configurações
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function analisarEsquemaUsuarios() {
  console.log('🔍 ANÁLISE COMPLETA DO ESQUEMA USUARIOS\n');

  try {
    // 1. Listar todas as tabelas do esquema usuarios
    console.log('📋 1. TABELAS NO ESQUEMA USUARIOS:');
    console.log('='.repeat(60));

    const tabelas = await query(`
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'usuarios'
            ORDER BY table_name
        `);

    if (tabelas.rows.length === 0) {
      console.log('   ❌ Nenhuma tabela encontrada no esquema "usuarios"');

      // Verificar se existe outro esquema
      console.log('\n🔍 Verificando esquemas disponíveis...');
      const esquemas = await query(`
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                ORDER BY schema_name
            `);

      console.log('   Esquemas encontrados:');
      esquemas.rows.forEach((schema) => {
        console.log(`   - ${schema.schema_name}`);
      });

      return;
    }

    tabelas.rows.forEach((tabela, index) => {
      console.log(`   ${index + 1}. ${tabela.table_name} (${tabela.table_type})`);
    });

    // 2. Analisar estrutura de cada tabela
    console.log('\n📊 2. ESTRUTURA DAS TABELAS:');
    console.log('='.repeat(60));

    for (const tabela of tabelas.rows) {
      console.log(`\n🗂️  TABELA: ${tabela.table_name.toUpperCase()}`);
      console.log('-'.repeat(40));

      // Colunas da tabela
      const colunas = await query(
        `
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    column_default,
                    is_nullable,
                    ordinal_position
                FROM information_schema.columns 
                WHERE table_schema = 'usuarios' 
                AND table_name = $1
                ORDER BY ordinal_position
            `,
        [tabela.table_name]
      );

      console.log('   COLUNAS:');
      colunas.rows.forEach((col) => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : '';

        console.log(
          `     • ${col.column_name}: ${col.data_type}${length} ${nullable} ${defaultVal}`
        );
      });

      // Chaves primárias
      const pks = await query(
        `
                SELECT 
                    kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'usuarios'
                AND tc.table_name = $1
                AND tc.constraint_type = 'PRIMARY KEY'
                ORDER BY kcu.ordinal_position
            `,
        [tabela.table_name]
      );

      if (pks.rows.length > 0) {
        console.log(`   PRIMARY KEY: ${pks.rows.map((pk) => pk.column_name).join(', ')}`);
      }

      // Chaves estrangeiras
      const fks = await query(
        `
                SELECT 
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu 
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_schema = 'usuarios'
                AND tc.table_name = $1
                AND tc.constraint_type = 'FOREIGN KEY'
            `,
        [tabela.table_name]
      );

      if (fks.rows.length > 0) {
        console.log('   FOREIGN KEYS:');
        fks.rows.forEach((fk) => {
          console.log(
            `     • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`
          );
        });
      }

      // Contar registros
      try {
        const count = await query(`SELECT COUNT(*) as total FROM usuarios.${tabela.table_name}`);
        console.log(`   REGISTROS: ${count.rows[0].total}`);
      } catch (error) {
        console.log(`   REGISTROS: Erro ao contar (${error.message})`);
      }
    }

    // 3. Verificar necessidade de tabelas de auditoria/logs
    console.log('\n🔍 3. ANÁLISE PARA AUDITORIA E LOGS:');
    console.log('='.repeat(60));

    const tabelasExistentes = tabelas.rows.map((t) => t.table_name);

    const tabelasNecessarias = [
      {
        nome: 'logs_auditoria',
        descricao: 'Logs de ações administrativas',
        colunas: [
          'id',
          'usuario_id',
          'acao',
          'tabela_afetada',
          'registro_id',
          'dados_anteriores',
          'dados_novos',
          'ip_address',
          'user_agent',
          'created_at',
        ],
        existe: tabelasExistentes.includes('logs_auditoria'),
      },
      {
        nome: 'sessao_controle',
        descricao: 'Controle de sessões de usuários',
        colunas: [
          'id',
          'usuario_id',
          'session_token',
          'data_login',
          'data_logout',
          'ip_address',
          'user_agent',
          'ativo',
        ],
        existe: tabelasExistentes.includes('sessao_controle'),
      },
      {
        nome: 'notificacoes_sistema',
        descricao: 'Notificações do sistema',
        colunas: ['id', 'usuario_id', 'tipo', 'titulo', 'mensagem', 'lida', 'created_at'],
        existe: tabelasExistentes.includes('notificacoes_sistema'),
      },
      {
        nome: 'configuracoes_sistema',
        descricao: 'Configurações gerais do sistema',
        colunas: ['id', 'chave', 'valor', 'descricao', 'tipo', 'updated_at'],
        existe: tabelasExistentes.includes('configuracoes_sistema'),
      },
    ];

    tabelasNecessarias.forEach((tabela) => {
      const status = tabela.existe ? '✅ EXISTE' : '❌ PRECISA CRIAR';
      console.log(`   ${tabela.nome}: ${status}`);
      console.log(`     └── ${tabela.descricao}`);

      if (!tabela.existe) {
        console.log(`     └── Colunas sugeridas: ${tabela.colunas.join(', ')}`);
      }
    });

    // 4. Dados de exemplo das tabelas principais
    console.log('\n📊 4. DADOS DE EXEMPLO (PRIMEIROS 3 REGISTROS):');
    console.log('='.repeat(60));

    for (const tabela of tabelas.rows) {
      try {
        const dados = await query(`SELECT * FROM usuarios.${tabela.table_name} LIMIT 3`);

        console.log(`\n📄 ${tabela.table_name.toUpperCase()}:`);

        if (dados.rows.length === 0) {
          console.log('   (Tabela vazia)');
        } else {
          dados.rows.forEach((row, index) => {
            console.log(`   Registro ${index + 1}:`);
            Object.keys(row).forEach((key) => {
              const value = row[key];
              const displayValue =
                value === null
                  ? 'NULL'
                  : typeof value === 'string' && value.length > 50
                    ? value.substring(0, 50) + '...'
                    : value;
              console.log(`     ${key}: ${displayValue}`);
            });
            console.log('     ' + '-'.repeat(30));
          });
        }
      } catch (error) {
        console.log(`   ❌ Erro ao ler dados: ${error.message}`);
      }
    }

    console.log('\n✅ ANÁLISE COMPLETA FINALIZADA!');
  } catch (error) {
    console.error('❌ ERRO NA ANÁLISE:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar análise
if (require.main === module) {
  analisarEsquemaUsuarios()
    .then(() => {
      process.env.NODE_ENV = originalNodeEnv;
      pool.end();
      console.log('\n🔌 Conexões fechadas. Análise finalizada.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.env.NODE_ENV = originalNodeEnv;
      pool.end();
      process.exit(1);
    });
}

module.exports = { analisarEsquemaUsuarios };
