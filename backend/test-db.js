// Script para testar a conexão com o banco de dados
const { testConnection } = require('./src/config/database');

async function testDatabaseConnection() {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    try {
        const isConnected = await testConnection();
        
        if (isConnected) {
            console.log('✅ SUCESSO: Conexão com o banco de dados estabelecida!');
            console.log('📊 O sistema está pronto para uso.');
        } else {
            console.log('❌ ERRO: Não foi possível conectar ao banco de dados.');
            console.log('🔧 Verifique as configurações no arquivo .env');
        }
        
        process.exit(isConnected ? 0 : 1);
    } catch (error) {
        console.error('❌ ERRO ao testar conexão:', error.message);
        process.exit(1);
    }
}

// Executar teste
testDatabaseConnection();
