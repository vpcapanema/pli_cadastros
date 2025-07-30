console.log('Iniciando debug...');

require('dotenv').config({ path: './config/.env' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
console.log('NODE_ENV:', process.env.NODE_ENV);

const { Pool } = require('pg');

async function testConnection() {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        const result = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Conexão bem-sucedida!', result.rows[0]);
        
        await pool.end();
    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);
    }
}

testConnection();
