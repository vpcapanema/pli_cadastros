require('dotenv').config();
const { query, closePool } = require('./src/config/database');

(async () => {
  try {
    console.log('🔍 Listando tabelas nos schemas cadastro e usuarios');
    const res = await query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('cadastro','usuarios');");
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Erro ao listar tabelas:', err);
  } finally {
    await closePool();
  }
})();
