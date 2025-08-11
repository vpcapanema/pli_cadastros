/**
 * Script Alternativo de Setup - Usando configuração do sistema atual
 */

const { query } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupSessionTableAlternativo() {
  try {
    console.log('🔌 Testando conexão com banco de dados...');

    // Teste de conexão usando a configuração existente
    const testResult = await query('SELECT NOW() as current_time');
    console.log('✅ Conexão estabelecida:', testResult.rows[0].current_time);

    console.log('📄 Executando comandos SQL individuais...');

    // 1. Criar tabela principal
    console.log('1/6 Criando tabela sessao_controle...');
    await query(`
            CREATE TABLE IF NOT EXISTS usuarios.sessao_controle (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                usuario_id UUID NOT NULL,
                token_jwt_hash VARCHAR(64) NOT NULL,
                session_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
                data_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                data_ultimo_acesso TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                data_logout TIMESTAMP WITH TIME ZONE,
                data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
                endereco_ip INET,
                user_agent TEXT,
                dispositivo_info JSONB DEFAULT '{}',
                localizacao_info JSONB DEFAULT '{}',
                status_sessao VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
                motivo_encerramento VARCHAR(50),
                data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_sessao_usuario 
                    FOREIGN KEY (usuario_id) 
                    REFERENCES usuarios.usuario_sistema(id) 
                    ON DELETE CASCADE,
                    
                CONSTRAINT chk_status_sessao 
                    CHECK (status_sessao IN ('ATIVA', 'LOGOUT', 'EXPIRADA', 'INVALIDADA', 'INATIVA'))
            )
        `);

    // 2. Criar índices
    console.log('2/6 Criando índices...');
    await query(`
            CREATE INDEX IF NOT EXISTS idx_sessao_usuario_id 
            ON usuarios.sessao_controle(usuario_id)
        `);

    await query(`
            CREATE INDEX IF NOT EXISTS idx_sessao_token_hash 
            ON usuarios.sessao_controle(token_jwt_hash)
        `);

    await query(`
            CREATE INDEX IF NOT EXISTS idx_sessao_status_ativa 
            ON usuarios.sessao_controle(status_sessao, data_expiracao) 
            WHERE status_sessao = 'ATIVA'
        `);

    await query(`
            CREATE INDEX IF NOT EXISTS idx_sessao_data_login 
            ON usuarios.sessao_controle(data_login DESC)
        `);

    // 3. Criar trigger para atualização automática
    console.log('3/6 Criando trigger...');
    await query(`
            CREATE OR REPLACE FUNCTION usuarios.fn_atualizar_sessao_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.data_atualizacao = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `);

    await query(`
            DROP TRIGGER IF EXISTS tg_atualizar_sessao_timestamp ON usuarios.sessao_controle
        `);

    await query(`
            CREATE TRIGGER tg_atualizar_sessao_timestamp
                BEFORE UPDATE ON usuarios.sessao_controle
                FOR EACH ROW
                EXECUTE FUNCTION usuarios.fn_atualizar_sessao_timestamp()
        `);

    // 4. Criar view de sessões ativas
    console.log('4/6 Criando view de sessões ativas...');
    await query(`
            CREATE OR REPLACE VIEW usuarios.vw_sessoes_ativas AS
            SELECT 
                sc.id,
                sc.session_id,
                sc.usuario_id,
                us.username,
                us.tipo_usuario,
                sc.data_login,
                sc.data_ultimo_acesso,
                sc.endereco_ip,
                sc.dispositivo_info,
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - sc.data_ultimo_acesso))/60 as minutos_inativo
            FROM usuarios.sessao_controle sc
            JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
            WHERE sc.status_sessao = 'ATIVA'
            AND sc.data_expiracao > CURRENT_TIMESTAMP
            ORDER BY sc.data_ultimo_acesso DESC
        `);

    // 5. Criar view de estatísticas
    console.log('5/6 Criando view de estatísticas...');
    await query(`
            CREATE OR REPLACE VIEW usuarios.vw_estatisticas_sessao AS
            SELECT 
                DATE(data_login) as data_referencia,
                COUNT(*) as total_logins,
                COUNT(DISTINCT usuario_id) as usuarios_unicos,
                COUNT(CASE WHEN status_sessao = 'ATIVA' THEN 1 END) as sessoes_ativas,
                AVG(EXTRACT(EPOCH FROM (COALESCE(data_logout, data_expiracao) - data_login))/60)::INTEGER as duracao_media_minutos
            FROM usuarios.sessao_controle 
            WHERE data_login >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(data_login)
            ORDER BY data_referencia DESC
        `);

    // 6. Criar função de limpeza
    console.log('6/6 Criando função de limpeza...');
    await query(`
            CREATE OR REPLACE FUNCTION usuarios.fn_limpar_sessoes_antigas(dias_retencao INTEGER DEFAULT 90)
            RETURNS INTEGER AS $$
            DECLARE
                registros_removidos INTEGER;
            BEGIN
                DELETE FROM usuarios.sessao_controle 
                WHERE data_criacao < CURRENT_DATE - (dias_retencao || ' days')::INTERVAL
                AND status_sessao IN ('LOGOUT', 'EXPIRADA', 'INVALIDADA');
                
                GET DIAGNOSTICS registros_removidos = ROW_COUNT;
                
                RETURN registros_removidos;
            END;
            $$ LANGUAGE plpgsql
        `);

    console.log('✅ Estrutura criada com sucesso!');

    // Verificar se a tabela foi criada
    const checkTable = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'usuarios' 
            AND table_name = 'sessao_controle'
            ORDER BY ordinal_position
        `);

    console.log('📋 Colunas da tabela criada:');
    checkTable.rows.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Inserir dados de teste se solicitado
    if (process.argv.includes('--test-data')) {
      console.log('🧪 Inserindo dados de teste...');

      const userTest = await query(`
                SELECT id FROM usuarios.usuario_sistema 
                WHERE ativo = true 
                LIMIT 1
            `);

      if (userTest.rows.length > 0) {
        const userId = userTest.rows[0].id;

        await query(
          `
                    INSERT INTO usuarios.sessao_controle (
                        usuario_id, token_jwt_hash, session_id, data_login, 
                        data_ultimo_acesso, data_expiracao, endereco_ip, 
                        user_agent, dispositivo_info, status_sessao
                    ) VALUES (
                        $1, 'test_hash_' || gen_random_uuid()::text, gen_random_uuid(), 
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
                        CURRENT_TIMESTAMP + INTERVAL '24 hours', '127.0.0.1',
                        'Mozilla/5.0 (Test Browser)', 
                        '{"browser":"Test","version":"1.0","os":"Test","device":"Desktop"}', 
                        'ATIVA'
                    )
                `,
          [userId]
        );

        console.log('✅ Dados de teste inseridos!');
      }
    }

    console.log('\n🎉 Setup da tabela de controle de sessões concluído!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Integrar jobs no server.js');
    console.log('2. Testar login para verificar criação de sessões');
    console.log('3. Verificar rotas /api/sessions/*');
  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    console.error('\n🔍 Detalhes:', error);
    throw error;
  }
}

// Executar
setupSessionTableAlternativo()
  .then(() => {
    console.log('✅ Setup concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha no setup:', error);
    process.exit(1);
  });
