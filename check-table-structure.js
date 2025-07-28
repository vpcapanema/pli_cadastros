/**
 * Script para verificar a estrutura das tabelas e corrigir as consultas
 */

const { query } = require('./src/config/database');

async function checkTableStructure() {
    console.log('🔍 Verificando estrutura das tabelas...\n');

    try {
        // Verificar colunas da tabela pessoa_fisica
        console.log('📋 Estrutura da tabela cadastro.pessoa_fisica:');
        const pfColumns = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'cadastro' AND table_name = 'pessoa_fisica'
            ORDER BY ordinal_position
        `);
        
        pfColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        // Verificar colunas da tabela pessoa_juridica
        console.log('\n📋 Estrutura da tabela cadastro.pessoa_juridica:');
        const pjColumns = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'cadastro' AND table_name = 'pessoa_juridica'
            ORDER BY ordinal_position
        `);
        
        pjColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        // Verificar colunas da tabela usuario_sistema
        console.log('\n📋 Estrutura da tabela usuarios.usuario_sistema:');
        const userColumns = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'usuarios' AND table_name = 'usuario_sistema'
            ORDER BY ordinal_position
        `);
        
        userColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n✅ Estrutura verificada com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao verificar estrutura:', error.message);
    }
}

// Executar verificação
checkTableStructure().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro crítico:', error);
    process.exit(1);
});
