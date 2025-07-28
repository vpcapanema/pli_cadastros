/**
 * Job de Limpeza de Sessões - SIGMA-PLI
 * Executa tarefas de manutenção de sessões automaticamente
 */

const cron = require('node-cron');
const SessionService = require('../services/sessionService');
const { query } = require('../config/database');

/**
 * Job para limpar sessões expiradas
 * Executa a cada 30 minutos
 */
const limpezaSessoesExpiradas = cron.schedule('*/30 * * * *', async () => {
    try {
        console.log('[CRON] Iniciando limpeza de sessões expiradas...');
        
        const sessoes_limpas = await SessionService.limparSessoesExpiradas();
        
        if (sessoes_limpas > 0) {
            console.log(`[CRON] ${sessoes_limpas} sessão(ões) expirada(s) marcada(s) como EXPIRADA`);
        } else {
            console.log('[CRON] Nenhuma sessão expirada encontrada');
        }
        
    } catch (error) {
        console.error('[CRON] Erro na limpeza de sessões expiradas:', error);
    }
}, {
    scheduled: false // Não inicia automaticamente
});

/**
 * Job para remover registros antigos de sessão
 * Executa diariamente às 02:00
 */
const limpezaRegistrosAntigos = cron.schedule('0 2 * * *', async () => {
    try {
        console.log('[CRON] Iniciando limpeza de registros antigos de sessão...');
        
        // Remove registros de sessão com mais de 90 dias
        const resultado = await query(`
            DELETE FROM usuarios.sessao_controle 
            WHERE data_criacao < CURRENT_DATE - INTERVAL '90 days'
            AND status_sessao IN ('LOGOUT', 'EXPIRADA', 'INVALIDADA')
        `);
        
        const registros_removidos = resultado.rowCount || 0;
        
        if (registros_removidos > 0) {
            console.log(`[CRON] ${registros_removidos} registro(s) antigo(s) de sessão removido(s)`);
        } else {
            console.log('[CRON] Nenhum registro antigo de sessão para remover');
        }
        
    } catch (error) {
        console.error('[CRON] Erro na limpeza de registros antigos:', error);
    }
}, {
    scheduled: false // Não inicia automaticamente
});

/**
 * Job para invalidar sessões inativas
 * Executa a cada 15 minutos
 */
const invalidarSessoesInativas = cron.schedule('*/15 * * * *', async () => {
    try {
        console.log('[CRON] Verificando sessões inativas...');
        
        // Invalidar sessões que não têm acesso há mais de 2 horas
        const resultado = await query(`
            UPDATE usuarios.sessao_controle 
            SET status_sessao = 'INATIVA',
                motivo_encerramento = 'INATIVIDADE',
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE status_sessao = 'ATIVA'
            AND data_ultimo_acesso < CURRENT_TIMESTAMP - INTERVAL '2 hours'
            AND data_expiracao > CURRENT_TIMESTAMP
        `);
        
        const sessoes_inativadas = resultado.rowCount || 0;
        
        if (sessoes_inativadas > 0) {
            console.log(`[CRON] ${sessoes_inativadas} sessão(ões) marcada(s) como INATIVA por inatividade`);
        }
        
    } catch (error) {
        console.error('[CRON] Erro ao invalidar sessões inativas:', error);
    }
}, {
    scheduled: false // Não inicia automaticamente
});

/**
 * Job para gerar estatísticas diárias
 * Executa diariamente às 23:59
 */
const estatisticasDiarias = cron.schedule('59 23 * * *', async () => {
    try {
        console.log('[CRON] Gerando estatísticas diárias de sessão...');
        
        const estatisticas = await SessionService.obterEstatisticas(1); // Último dia
        
        // Log das estatísticas para monitoramento
        console.log('[STATS] Estatísticas do dia:', {
            logins_hoje: estatisticas.logins_hoje,
            usuarios_unicos: estatisticas.usuarios_unicos,
            sessoes_ativas: estatisticas.sessoes_ativas,
            duracao_media_minutos: Math.round(estatisticas.duracao_media_minutos || 0)
        });
        
        // Opcionalmente, salvar em tabela de estatísticas históricas
        await query(`
            INSERT INTO usuarios.estatisticas_sessao_diaria (
                data_referencia, total_logins, usuarios_unicos, 
                sessoes_ativas, duracao_media_minutos
            ) VALUES (
                CURRENT_DATE, $1, $2, $3, $4
            ) ON CONFLICT (data_referencia) DO UPDATE SET
                total_logins = EXCLUDED.total_logins,
                usuarios_unicos = EXCLUDED.usuarios_unicos,
                sessoes_ativas = EXCLUDED.sessoes_ativas,
                duracao_media_minutos = EXCLUDED.duracao_media_minutos,
                data_atualizacao = CURRENT_TIMESTAMP
        `, [
            estatisticas.logins_hoje || 0,
            estatisticas.usuarios_unicos || 0,
            estatisticas.sessoes_ativas || 0,
            Math.round(estatisticas.duracao_media_minutos || 0)
        ]).catch(err => {
            // Se a tabela de estatísticas não existir, apenas log
            console.log('[CRON] Tabela de estatísticas não encontrada (opcional)');
        });
        
    } catch (error) {
        console.error('[CRON] Erro ao gerar estatísticas diárias:', error);
    }
}, {
    scheduled: false // Não inicia automaticamente
});

/**
 * Inicia todos os jobs de manutenção de sessões
 */
function iniciarJobs() {
    console.log('[JOBS] Iniciando jobs de manutenção de sessões...');
    
    // Iniciar jobs
    limpezaSessoesExpiradas.start();
    limpezaRegistrosAntigos.start();
    invalidarSessoesInativas.start();
    estatisticasDiarias.start();
    
    console.log('[JOBS] Jobs iniciados:');
    console.log('  ✅ Limpeza sessões expiradas (*/30 * * * *)');
    console.log('  ✅ Limpeza registros antigos (0 2 * * *)');
    console.log('  ✅ Invalidar sessões inativas (*/15 * * * *)');
    console.log('  ✅ Estatísticas diárias (59 23 * * *)');
}

/**
 * Para todos os jobs de manutenção de sessões
 */
function pararJobs() {
    console.log('[JOBS] Parando jobs de manutenção de sessões...');
    
    limpezaSessoesExpiradas.stop();
    limpezaRegistrosAntigos.stop();
    invalidarSessoesInativas.stop();
    estatisticasDiarias.stop();
    
    console.log('[JOBS] Jobs parados.');
}

/**
 * Executa limpeza manual de sessões
 */
async function limpezaManual() {
    try {
        console.log('[MANUAL] Executando limpeza manual de sessões...');
        
        // Limpar sessões expiradas
        const expiradas = await SessionService.limparSessoesExpiradas();
        console.log(`[MANUAL] ${expiradas} sessão(ões) expirada(s) marcada(s)`);
        
        // Invalidar sessões inativas
        const inativas = await query(`
            UPDATE usuarios.sessao_controle 
            SET status_sessao = 'INATIVA',
                motivo_encerramento = 'INATIVIDADE_MANUAL',
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE status_sessao = 'ATIVA'
            AND data_ultimo_acesso < CURRENT_TIMESTAMP - INTERVAL '2 hours'
            RETURNING session_id
        `);
        
        console.log(`[MANUAL] ${inativas.rowCount || 0} sessão(ões) inativa(s) invalidada(s)`);
        
        return {
            sessoes_expiradas: expiradas,
            sessoes_inativas: inativas.rowCount || 0
        };
        
    } catch (error) {
        console.error('[MANUAL] Erro na limpeza manual:', error);
        throw error;
    }
}

module.exports = {
    iniciarJobs,
    pararJobs,
    limpezaManual,
    jobs: {
        limpezaSessoesExpiradas,
        limpezaRegistrosAntigos,
        invalidarSessoesInativas,
        estatisticasDiarias
    }
};
