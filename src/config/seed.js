const { pool, query } = require('./database');

(async () => {
  try {
    console.log('🌱 Iniciando seeders...');

    // Limpar dados existentes
    await query('TRUNCATE TABLE usuarios.usuario_sistema RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE cadastro.pessoa_fisica RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE cadastro.pessoa_juridica RESTART IDENTITY CASCADE');

    // Inserir pessoas físicas de exemplo
    await query(`INSERT INTO cadastro.pessoa_fisica (nome, cpf) VALUES
      ('Maria Silva', '123.456.789-00'),
      ('João Oliveira', '987.654.321-00')
    `);

    // Inserir pessoas jurídicas de exemplo
    await query(`INSERT INTO cadastro.pessoa_juridica (razao_social, cnpj) VALUES
      ('Empresa Exemplo LTDA', '12.345.678/0001-00'),
      ('Tecnologia XYZ SA', '98.765.432/0001-00')
    `);

    // Inserir usuários do sistema de exemplo
    // Senha padrão 'senha123' criptografada ou use bcrypt.hash
    const bcrypt = require('bcrypt');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const pass1 = await bcrypt.hash('senha123', saltRounds);
    const pass2 = await bcrypt.hash('admin123', saltRounds);

    await query(
      `INSERT INTO usuarios.usuario_sistema (username, password) VALUES
      ('user1', $1),
      ('admin', $2)
    `,
      [pass1, pass2]
    );

    console.log('✅ Seeders aplicados com sucesso');
  } catch (err) {
    console.error('❌ Erro ao executar seeders:', err);
  } finally {
    await pool.end();
    console.log('🔒 Pool de conexões fechado após seeders');
  }
})();
