/**
 * Teste específico para verificar a conexão dos últimos cadastros
 */

const { query } = require('./src/config/database');

async function testUltimosCadastros() {
    console.log('🧪 Testando conexão da tabela "Últimos Cadastros"...\n');

    try {
        // Teste da consulta completa de últimos cadastros
        console.log('📊 Executando consulta de últimos cadastros...');
        
        const sql = `
            SELECT 
                'Pessoa Física' as tipo,
                nome_completo as nome,
                cpf as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM cadastro.pessoa_fisica
            WHERE data_criacao IS NOT NULL
            
            UNION ALL
            
            SELECT 
                'Pessoa Jurídica' as tipo,
                razao_social as nome,
                cnpj as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM cadastro.pessoa_juridica
            WHERE data_criacao IS NOT NULL
            
            UNION ALL
            
            SELECT 
                'Usuário Sistema' as tipo,
                username as nome,
                COALESCE(email, 'N/A') as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM usuarios.usuario_sistema
            WHERE data_criacao IS NOT NULL
            
            ORDER BY data_criacao DESC
            LIMIT 10
        `;
        
        const result = await query(sql);
        
        console.log(`✅ Consulta executada com sucesso!`);
        console.log(`📋 Encontrados ${result.rows.length} cadastros:`);
        console.log('');
        
        result.rows.forEach((cadastro, index) => {
            const dataFormatada = new Date(cadastro.data_criacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            console.log(`${index + 1}. ${cadastro.tipo}`);
            console.log(`   Nome: ${cadastro.nome}`);
            console.log(`   Documento: ${cadastro.documento}`);
            console.log(`   Data: ${dataFormatada}`);
            console.log(`   Status: ${cadastro.status}`);
            console.log('');
        });

        // Teste da API endpoint
        console.log('🔗 Testando endpoint da API...');
        
        const fetch = require('node-fetch');
        try {
            const response = await fetch('http://localhost:8888/api/estatisticas/ultimos-cadastros');
            
            if (response.ok) {
                const apiData = await response.json();
                console.log(`✅ API funcionando! Retornou ${apiData.length} registros`);
            } else {
                console.log(`❌ API retornou erro: ${response.status} ${response.statusText}`);
            }
        } catch (apiError) {
            console.log(`⚠️  Servidor não está rodando ou API não acessível: ${apiError.message}`);
        }

        console.log('\n🎉 Teste de últimos cadastros concluído!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar o teste
testUltimosCadastros().then(() => {
    console.log('\n✨ Teste finalizado.');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro crítico:', error);
    process.exit(1);
});
