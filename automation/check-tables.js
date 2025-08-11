const { query, pool } = require('./src/config/database');

(async () => {
  try {
    console.log('Verificando estrutura das tabelas...\n');

    // Verificar pessoa_fisica
    const pf = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema='cadastro' AND table_name='pessoa_fisica' 
      ORDER BY ordinal_position
    `);
    console.log('Tabela pessoa_fisica:');
    console.table(pf.rows);

    // Verificar pessoa_juridica
    const pj = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema='cadastro' AND table_name='pessoa_juridica' 
      ORDER BY ordinal_position
    `);
    console.log('\nTabela pessoa_juridica:');
    console.table(pj.rows);

    // Verificar usuario_sistema
    const us = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema='usuarios' AND table_name='usuario_sistema' 
      ORDER BY ordinal_position
    `);
    console.log('\nTabela usuario_sistema:');
    console.table(us.rows);
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await pool.end();
  }
})();
