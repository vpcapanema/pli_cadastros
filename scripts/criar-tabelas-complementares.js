/**
 * Script de Criação - Tabelas Complementares
 * Sistema SIGMA-PLI | Complemento para o Módulo Administrador
 */

const { Pool } = require('pg');
const path = require('path');

// Configurar NODE_ENV para development temporariamente
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

// Carregar configurações
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

async function criarTabelasComplementares() {
    console.log('🏗️  CRIANDO TABELAS COMPLEMENTARES PARA O MÓDULO ADMIN\n');

    try {
        // 1. Criar tabela de logs de auditoria
        console.log('📋 1. Criando tabela LOGS_AUDITORIA...');
        
        await query(`
            CREATE TABLE IF NOT EXISTS usuarios.logs_auditoria (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                usuario_id UUID NOT NULL REFERENCES usuarios.usuario_sistema(id),
                acao VARCHAR(100) NOT NULL,
                tabela_afetada VARCHAR(100),
                registro_id UUID,
                dados_anteriores JSONB,
                dados_novos JSONB,
                ip_address INET,
                user_agent TEXT,
                observacoes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Criar índices para performance
        await query(`
            CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_id 
            ON usuarios.logs_auditoria(usuario_id)
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao 
            ON usuarios.logs_auditoria(acao)
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at 
            ON usuarios.logs_auditoria(created_at DESC)
        `);

        console.log('   ✅ Tabela logs_auditoria criada com sucesso!');

        // 2. Criar tabela de notificações do sistema
        console.log('📋 2. Criando tabela NOTIFICACOES_SISTEMA...');
        
        await query(`
            CREATE TABLE IF NOT EXISTS usuarios.notificacoes_sistema (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                usuario_id UUID REFERENCES usuarios.usuario_sistema(id),
                tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('INFO', 'AVISO', 'SUCESSO', 'ERRO', 'APROVACAO', 'REJEICAO')),
                titulo VARCHAR(200) NOT NULL,
                mensagem TEXT NOT NULL,
                dados_extras JSONB DEFAULT '{}',
                lida BOOLEAN DEFAULT FALSE,
                email_enviado BOOLEAN DEFAULT FALSE,
                data_email_enviado TIMESTAMP WITH TIME ZONE,
                priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                read_at TIMESTAMP WITH TIME ZONE
            )
        `);

        // Índices para notificações
        await query(`
            CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id 
            ON usuarios.notificacoes_sistema(usuario_id)
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_notificacoes_lida 
            ON usuarios.notificacoes_sistema(lida, created_at DESC)
        `);

        console.log('   ✅ Tabela notificacoes_sistema criada com sucesso!');

        // 3. Criar tabela de configurações do sistema
        console.log('📋 3. Criando tabela CONFIGURACOES_SISTEMA...');
        
        await query(`
            CREATE TABLE IF NOT EXISTS usuarios.configuracoes_sistema (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                chave VARCHAR(100) UNIQUE NOT NULL,
                valor TEXT NOT NULL,
                descricao TEXT,
                tipo VARCHAR(20) DEFAULT 'STRING' CHECK (tipo IN ('STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'DATE')),
                categoria VARCHAR(50) DEFAULT 'GERAL',
                editavel BOOLEAN DEFAULT TRUE,
                sensivel BOOLEAN DEFAULT FALSE,
                validacao_regex VARCHAR(500),
                valor_padrao TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_by_id UUID REFERENCES usuarios.usuario_sistema(id)
            )
        `);

        // Índice para configurações
        await query(`
            CREATE INDEX IF NOT EXISTS idx_configuracoes_chave 
            ON usuarios.configuracoes_sistema(chave)
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria 
            ON usuarios.configuracoes_sistema(categoria)
        `);

        console.log('   ✅ Tabela configuracoes_sistema criada com sucesso!');

        // 4. Inserir configurações padrão
        console.log('📋 4. Inserindo configurações padrão...');
        
        const configuracoesDefault = [
            ['sistema.nome', 'SIGMA-PLI', 'Nome do sistema', 'STRING', 'INTERFACE'],
            ['sistema.versao', '1.0.0', 'Versão atual do sistema', 'STRING', 'SISTEMA'],
            ['email.remetente_padrao', 'SIGMA-PLI <pli.semil.sp@gmail.com>', 'Email remetente padrão', 'STRING', 'EMAIL'],
            ['session.timeout_minutos', '1440', 'Timeout de sessão em minutos (24h)', 'INTEGER', 'SEGURANCA'],
            ['backup.retencao_dias', '30', 'Dias para manter backups', 'INTEGER', 'BACKUP'],
            ['auditoria.logs_retencao_dias', '90', 'Dias para manter logs de auditoria', 'INTEGER', 'AUDITORIA'],
            ['notificacao.email_habilitado', 'true', 'Habilitar envio de emails', 'BOOLEAN', 'EMAIL'],
            ['dashboard.refresh_interval', '30', 'Intervalo de refresh do dashboard (segundos)', 'INTEGER', 'INTERFACE']
        ];

        for (const [chave, valor, descricao, tipo, categoria] of configuracoesDefault) {
            await query(`
                INSERT INTO usuarios.configuracoes_sistema (chave, valor, descricao, tipo, categoria)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (chave) DO NOTHING
            `, [chave, valor, descricao, tipo, categoria]);
        }

        console.log('   ✅ Configurações padrão inseridas!');

        // 5. Criar trigger para atualizar updated_at
        console.log('📋 5. Criando triggers...');
        
        await query(`
            CREATE OR REPLACE FUNCTION usuarios.update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

        await query(`
            DROP TRIGGER IF EXISTS update_configuracoes_sistema_updated_at 
            ON usuarios.configuracoes_sistema
        `);
        
        await query(`
            CREATE TRIGGER update_configuracoes_sistema_updated_at 
            BEFORE UPDATE ON usuarios.configuracoes_sistema 
            FOR EACH ROW EXECUTE FUNCTION usuarios.update_updated_at_column()
        `);

        console.log('   ✅ Triggers criados!');

        // 6. Verificar a criação
        console.log('\n📊 6. Verificando tabelas criadas...');
        
        const tabelas = ['logs_auditoria', 'notificacoes_sistema', 'configuracoes_sistema'];
        
        for (const tabela of tabelas) {
            const resultado = await query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'usuarios' 
                AND table_name = $1
            `, [tabela]);
            
            const existe = resultado.rows[0].count > 0;
            console.log(`   ${tabela}: ${existe ? '✅ Criada' : '❌ Erro'}`);
        }

        // 7. Inserir alguns logs de teste
        console.log('\n📋 7. Inserindo dados de teste...');
        
        // Buscar ID de um usuário para os logs de teste
        const usuario = await query(`
            SELECT id, username 
            FROM usuarios.usuario_sistema 
            LIMIT 1
        `);

        if (usuario.rows.length > 0) {
            const userId = usuario.rows[0].id;
            const username = usuario.rows[0].username;

            // Log de auditoria de teste
            await query(`
                INSERT INTO usuarios.logs_auditoria 
                (usuario_id, acao, tabela_afetada, dados_novos, observacoes)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                userId,
                'CRIACAO_TABELAS_ADMIN',
                'logs_auditoria, notificacoes_sistema, configuracoes_sistema',
                JSON.stringify({ 
                    tabelas_criadas: ['logs_auditoria', 'notificacoes_sistema', 'configuracoes_sistema'],
                    timestamp: new Date().toISOString()
                }),
                'Criação automática das tabelas complementares do módulo administrador'
            ]);

            // Notificação de teste
            await query(`
                INSERT INTO usuarios.notificacoes_sistema 
                (usuario_id, tipo, titulo, mensagem, dados_extras)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                userId,
                'SUCESSO',
                'Módulo Administrador Configurado',
                'As tabelas complementares do módulo administrador foram criadas com sucesso. O sistema está pronto para uso.',
                JSON.stringify({
                    modulo: 'admin',
                    versao: '1.0.0',
                    tabelas_criadas: 3
                })
            ]);

            console.log(`   ✅ Dados de teste inseridos para usuário: ${username}`);
        }

        console.log('\n🎉 TODAS AS TABELAS COMPLEMENTARES FORAM CRIADAS COM SUCESSO!');
        console.log('\n📋 Resumo:');
        console.log('   ✅ logs_auditoria - Para rastrear ações administrativas');
        console.log('   ✅ notificacoes_sistema - Para notificações internas');
        console.log('   ✅ configuracoes_sistema - Para configurações globais');
        console.log('   ✅ Índices criados para performance');
        console.log('   ✅ Triggers para atualização automática');
        console.log('   ✅ Dados de teste inseridos');

    } catch (error) {
        console.error('❌ ERRO NA CRIAÇÃO:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar criação
if (require.main === module) {
    criarTabelasComplementares().then(() => {
        process.env.NODE_ENV = originalNodeEnv;
        pool.end();
        console.log('\n🔌 Conexões fechadas. Criação finalizada.');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Erro fatal:', error);
        process.env.NODE_ENV = originalNodeEnv;
        pool.end();
        process.exit(1);
    });
}

module.exports = { criarTabelasComplementares };
