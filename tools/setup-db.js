/**
 * Script para criar as tabelas no banco de dados
 */

const { query, testConnection } = require('../src/config/database');

async function createTables() {
  console.log('🔍 Testando conexão com o banco de dados...');

  try {
    const isConnected = await testConnection();

    if (!isConnected) {
      console.log('❌ ERRO: Não foi possível conectar ao banco de dados.');
      console.log('🔧 Verifique as configurações no arquivo .env');
      process.exit(1);
    }

    console.log('✅ SUCESSO: Conexão com o banco de dados estabelecida!');
    console.log('📊 Criando esquemas e tabelas...');

    // Criar esquemas
    await query(`CREATE SCHEMA IF NOT EXISTS cadastro`);
    await query(`CREATE SCHEMA IF NOT EXISTS usuarios`);

    // Criar tabela de usuários
    await query(`
            CREATE TABLE IF NOT EXISTS usuarios.usuario_sistema (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(100) NOT NULL,
                perfil VARCHAR(20) NOT NULL DEFAULT 'usuario',
                ativo BOOLEAN NOT NULL DEFAULT TRUE,
                data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
                data_atualizacao TIMESTAMP
            )
        `);

    // Criar tabela de pessoa física
    await query(`
            CREATE TABLE IF NOT EXISTS cadastro.pessoa_fisica (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                cpf VARCHAR(14) NOT NULL UNIQUE,
                data_nascimento DATE,
                email VARCHAR(100),
                telefone VARCHAR(20),
                endereco VARCHAR(200),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                cep VARCHAR(10),
                ativo BOOLEAN NOT NULL DEFAULT TRUE,
                data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
                data_atualizacao TIMESTAMP
            )
        `);

    // Criar tabela de pessoa jurídica
    await query(`
            CREATE TABLE IF NOT EXISTS cadastro.pessoa_juridica (
                id SERIAL PRIMARY KEY,
                razao_social VARCHAR(200) NOT NULL,
                nome_fantasia VARCHAR(100),
                cnpj VARCHAR(18) NOT NULL UNIQUE,
                inscricao_estadual VARCHAR(20),
                inscricao_municipal VARCHAR(20),
                email VARCHAR(100),
                telefone VARCHAR(20),
                endereco VARCHAR(200),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                cep VARCHAR(10),
                ativo BOOLEAN NOT NULL DEFAULT TRUE,
                data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
                data_atualizacao TIMESTAMP
            )
        `);

    // Criar tabela de sócios/representantes
    await query(`
            CREATE TABLE IF NOT EXISTS cadastro.socio_representante (
                id SERIAL PRIMARY KEY,
                pessoa_juridica_id INTEGER NOT NULL REFERENCES cadastro.pessoa_juridica(id) ON DELETE CASCADE,
                nome VARCHAR(100) NOT NULL,
                cpf VARCHAR(14) NOT NULL,
                cargo VARCHAR(100),
                email VARCHAR(100),
                telefone VARCHAR(20),
                data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
                data_atualizacao TIMESTAMP
            )
        `);

    console.log('✅ SUCESSO: Esquemas e tabelas criados com sucesso!');

    // Inserir usuário admin se não existir
    const adminCheck = await query(
      `SELECT id FROM usuarios.usuario_sistema WHERE email = 'admin@pli.com.br'`
    );

    if (adminCheck.rows.length === 0) {
      // Senha: admin123
      await query(`
                INSERT INTO usuarios.usuario_sistema (nome, email, senha, perfil)
                VALUES ('Administrador', 'admin@pli.com.br', '$2b$12$1mE9/dILOIf4mCFIwXZ7S.eGGFTpbpTG9eZ4j.9hZ7.NKU9Dg4Tpe', 'admin')
            `);
      console.log('✅ Usuário administrador criado com sucesso!');
    } else {
      console.log('ℹ️ Usuário administrador já existe.');
    }

    console.log('📊 O sistema está pronto para uso.');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO ao criar tabelas:', error.message);
    process.exit(1);
  }
}

// Executar criação de tabelas
createTables();
