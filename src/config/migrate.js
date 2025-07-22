const { pool, query } = require('./database');

(async () => {
  try {
    console.log('🔄 Iniciando migrations...');

    // Criar schemas
    await query('CREATE SCHEMA IF NOT EXISTS cadastro');
    await query('CREATE SCHEMA IF NOT EXISTS usuarios');

    // Tabela pessoas físicas
    await query(`
      CREATE TABLE IF NOT EXISTS cadastro.pessoa_fisica (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela pessoas jurídicas
    await query(`
      CREATE TABLE IF NOT EXISTS cadastro.pessoa_juridica (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de usuários do sistema
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios.usuario_sistema (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Migrations aplicadas com sucesso');
  } catch (err) {
    console.error('❌ Erro ao executar migrations:', err);
  } finally {
    await pool.end();
    console.log('🔒 Pool de conexões fechado após migrations');
  }
})();
