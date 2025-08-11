/**
 * Script de Setup da Tabela de Controle de Sessões - SIGMA-PLI
 * Executa a criação da tabela e configurações de sessão
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar configurações do ambiente
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

async function setupSessionTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pli_cadastros',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();

    console.log('✅ Conexão estabelecida com sucesso!');

    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '../database/sessao_controle_table.sql');

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Executando script SQL...');

    // Executar o script SQL
    await client.query(sqlScript);

    console.log('✅ Script SQL executado com sucesso!');

    // Verificar se a tabela foi criada
    const checkTable = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'usuarios' 
            AND table_name = 'sessao_controle'
            ORDER BY ordinal_position
        `);

    if (checkTable.rows.length > 0) {
      console.log('📋 Estrutura da tabela criada:');
      checkTable.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Verificar views criadas
    const checkViews = await client.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'usuarios' 
            AND table_name LIKE 'vw_%'
        `);

    if (checkViews.rows.length > 0) {
      console.log('👁️  Views criadas:');
      checkViews.rows.forEach((view) => {
        console.log(`  - ${view.table_name}`);
      });
    }

    // Verificar funções criadas
    const checkFunctions = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'usuarios' 
            AND routine_name LIKE 'fn_%'
        `);

    if (checkFunctions.rows.length > 0) {
      console.log('⚙️  Funções criadas:');
      checkFunctions.rows.forEach((func) => {
        console.log(`  - ${func.routine_name}`);
      });
    }

    // Testar inserção de dados de exemplo (opcional)
    const testData = process.argv.includes('--test-data');

    if (testData) {
      console.log('🧪 Inserindo dados de teste...');

      // Buscar um usuário existente para teste
      const userTest = await client.query(`
                SELECT id FROM usuarios.usuario_sistema 
                WHERE ativo = true 
                LIMIT 1
            `);

      if (userTest.rows.length > 0) {
        const userId = userTest.rows[0].id;

        // Inserir sessão de teste
        await client.query(
          `
                    INSERT INTO usuarios.sessao_controle (
                        usuario_id, token_jwt_hash, session_id, data_login, 
                        data_ultimo_acesso, data_expiracao, endereco_ip, 
                        user_agent, dispositivo_info, status_sessao
                    ) VALUES (
                        $1, 'test_hash_' || gen_random_uuid()::text, gen_random_uuid(), 
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
                        CURRENT_TIMESTAMP + INTERVAL '24 hours', '127.0.0.1',
                        'Test User Agent', '{"browser":"Test","os":"Test","device":"Test"}', 'ATIVA'
                    )
                `,
          [userId]
        );

        console.log('✅ Dados de teste inseridos com sucesso!');
      }
    }

    console.log('\n🎉 Setup da tabela de controle de sessões concluído!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Reiniciar o servidor Node.js');
    console.log('2. Testar login para verificar criação de sessões');
    console.log('3. Acessar /api/sessions/info para ver sessão atual');
    console.log('4. Verificar logs de sessão no painel admin');
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    console.error('\n🔍 Detalhes do erro:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco de dados encerrada.');
  }
}

// Verificar argumentos da linha de comando
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');

if (showHelp) {
  console.log(`
📚 Script de Setup da Tabela de Controle de Sessões

Uso: node setup-sessions.js [opções]

Opções:
  --test-data    Insere dados de teste após criar a tabela
  --help, -h     Mostra esta mensagem de ajuda

Exemplos:
  node setup-sessions.js                  # Setup básico
  node setup-sessions.js --test-data      # Setup com dados de teste

⚠️  Certifique-se de que:
- O arquivo .env está configurado corretamente
- O banco de dados está em execução
- Você tem permissões para criar tabelas, views e funções
    `);
  process.exit(0);
}

// Executar o setup
setupSessionTable().catch((error) => {
  console.error('❌ Falha fatal:', error);
  process.exit(1);
});
