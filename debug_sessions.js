/**
 * Script para debugar sessões ativas
 */

require('dotenv').config({ path: './config/.env' });
const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

// Configurar conexão usando DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function debugSessions() {
    let pool;
    try {
        console.log('� Conectando ao banco de dados...');
        
        // Configurar conexão usando DATABASE_URL
        pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        console.log('�🔍 Verificando sessões ativas...\n');
        
        // Buscar sessões ativas
        const sessionsResult = await pool.query(`
            SELECT sc.session_id, sc.usuario_id, sc.status_sessao, 
                   sc.data_login, sc.data_expiracao, sc.data_ultimo_acesso,
                   us.username, us.email
            FROM usuarios.sessao_controle sc
            JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
            WHERE sc.status_sessao = 'ATIVA'
            ORDER BY sc.data_login DESC
        `);
        
        console.log(`📊 Encontradas ${sessionsResult.rows.length} sessões ativas:`);
        
        if (sessionsResult.rows.length === 0) {
            console.log('❌ Nenhuma sessão ativa encontrada!');
            
            // Buscar últimas sessões expiradas
            const expiredResult = await pool.query(`
                SELECT session_id, usuario_id, status_sessao, data_login, data_expiracao
                FROM usuarios.sessao_controle
                ORDER BY data_login DESC
                LIMIT 5
            `);
            
            console.log('\n📋 Últimas 5 sessões (qualquer status):');
            expiredResult.rows.forEach(session => {
                console.log(`- ${session.session_id} | ${session.status_sessao} | ${session.data_login}`);
            });
            
        } else {
            sessionsResult.rows.forEach(session => {
                console.log(`✅ Sessão: ${session.session_id}`);
                console.log(`   Usuário: ${session.username} (${session.email})`);
                console.log(`   Login: ${session.data_login}`);
                console.log(`   Expira: ${session.data_expiracao}`);
                console.log(`   Último acesso: ${session.data_ultimo_acesso}`);
                console.log('');
            });
            
            // Verificar janelas ativas
            console.log('🪟 Verificando janelas ativas...\n');
            
            const windowsResult = await pool.query(`
                SELECT sessao_id, window_id, url, status, data_abertura, data_ultimo_acesso
                FROM usuarios.sessao_janelas
                WHERE status = 'ATIVA'
                ORDER BY data_abertura DESC
            `);
            
            console.log(`📊 Encontradas ${windowsResult.rows.length} janelas ativas:`);
            windowsResult.rows.forEach(window => {
                console.log(`🪟 Janela: ${window.window_id}`);
                console.log(`   Sessão: ${window.sessao_id}`);
                console.log(`   URL: ${window.url}`);
                console.log(`   Abertura: ${window.data_abertura}`);
                console.log(`   Último acesso: ${window.data_ultimo_acesso}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao debugar sessões:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (pool) {
            await pool.end();
        }
    }
}

debugSessions();
