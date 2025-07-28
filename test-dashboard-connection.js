/**
 * Teste de Conexão do Dashboard com o Banco de Dados
 * Script para verificar se as consultas estão funcionando corretamente
 */

const express = require('express');
const { query } = require('./src/config/database');

async function testDashboardConnection() {
    console.log('🧪 Testando conexão do Dashboard com o banco de dados...\n');

    try {
        // Teste 1: Verificar conexão básica
        console.log('📊 Teste 1: Verificando conexão básica...');
        const testConnection = await query('SELECT NOW() as current_time');
        console.log('✅ Conexão OK! Hora atual:', testConnection.rows[0].current_time);

        // Teste 2: Verificar existência das tabelas
        console.log('\n📊 Teste 2: Verificando existência das tabelas...');
        
        const tables = [
            'cadastro.pessoa_fisica',
            'cadastro.pessoa_juridica', 
            'usuarios.usuario_sistema'
        ];

        for (const table of tables) {
            try {
                const [schema, tableName] = table.split('.');
                const checkTable = await query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = $1 AND table_name = $2
                    )`, [schema, tableName]);
                
                if (checkTable.rows[0].exists) {
                    console.log(`✅ Tabela ${table} existe`);
                } else {
                    console.log(`❌ Tabela ${table} não encontrada`);
                }
            } catch (error) {
                console.log(`❌ Erro ao verificar ${table}:`, error.message);
            }
        }

        // Teste 3: Contar registros em cada tabela
        console.log('\n📊 Teste 3: Contando registros...');
        
        try {
            const countPF = await query('SELECT COUNT(*) as total FROM cadastro.pessoa_fisica WHERE ativo = true');
            console.log(`👥 Pessoas Físicas ativas: ${countPF.rows[0].total}`);
        } catch (error) {
            console.log('❌ Erro ao contar Pessoas Físicas:', error.message);
        }

        try {
            const countPJ = await query('SELECT COUNT(*) as total FROM cadastro.pessoa_juridica WHERE ativo = true');
            console.log(`🏢 Pessoas Jurídicas ativas: ${countPJ.rows[0].total}`);
        } catch (error) {
            console.log('❌ Erro ao contar Pessoas Jurídicas:', error.message);
        }

        try {
            const countUsers = await query('SELECT COUNT(*) as total FROM usuarios.usuario_sistema WHERE ativo = true');
            console.log(`👤 Usuários ativos: ${countUsers.rows[0].total}`);
        } catch (error) {
            console.log('❌ Erro ao contar Usuários:', error.message);
        }

        // Teste 4: Teste da consulta de últimos cadastros
        console.log('\n📊 Teste 4: Testando consulta de últimos cadastros...');
        
        try {
            const ultimosCadastros = await query(`
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
                LIMIT 5
            `);
            
            console.log(`✅ Consulta de últimos cadastros executada com sucesso!`);
            console.log(`📋 Encontrados ${ultimosCadastros.rows.length} cadastros recentes:`);
            
            ultimosCadastros.rows.forEach((cadastro, index) => {
                console.log(`  ${index + 1}. ${cadastro.tipo}: ${cadastro.nome} (${cadastro.status})`);
            });

        } catch (error) {
            console.log('❌ Erro na consulta de últimos cadastros:', error.message);
        }

        console.log('\n🎉 Teste de conexão do Dashboard concluído!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar o teste
testDashboardConnection().then(() => {
    console.log('\n✨ Teste finalizado. Verifique os resultados acima.');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro crítico durante o teste:', error);
    process.exit(1);
});
