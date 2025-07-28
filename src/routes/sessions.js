/**
 * Rotas de Gerenciamento de Sessões - SIGMA-PLI
 * Endpoints para controle e monitoramento de sessões ativas
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const SessionService = require('../services/sessionService');
const { verificarAutenticacao, verificarAdmin, verificarGestao } = require('../middleware/sessionAuth');

/**
 * GET /api/sessions/minhas - Lista sessões ativas do usuário atual
 */
router.get('/minhas', verificarAutenticacao, async (req, res) => {
    try {
        const sessoes = await SessionService.listarSessoesUsuario(req.user.id);
        
        res.json({
            sucesso: true,
            sessoes: sessoes.map(sessao => ({
                session_id: sessao.session_id,
                data_login: sessao.data_login,
                data_ultimo_acesso: sessao.data_ultimo_acesso,
                endereco_ip: sessao.endereco_ip,
                dispositivo: sessao.dispositivo_info,
                minutos_inativo: Math.round(sessao.minutos_inativo),
                ativa: sessao.minutos_inativo < 30 // Considera ativa se acessou nos últimos 30 min
            }))
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao listar sessões do usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar sessões'
        });
    }
});

/**
 * DELETE /api/sessions/invalidar-outras - Invalida todas as outras sessões do usuário
 */
router.delete('/invalidar-outras', verificarAutenticacao, async (req, res) => {
    try {
        // Obter hash do token atual para não invalidar a sessão atual
        const token = req.headers.authorization?.replace('Bearer ', '');
        const tokenAtualHash = SessionService.gerarHashToken(token);
        
        // Invalidar todas as outras sessões
        const result = await query(`
            UPDATE usuarios.sessao_controle 
            SET status_sessao = 'INVALIDADA',
                data_logout = CURRENT_TIMESTAMP,
                motivo_encerramento = 'USUARIO_INVALIDOU_OUTRAS',
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE usuario_id = $1 
            AND status_sessao = 'ATIVA'
            AND token_jwt_hash != $2
            RETURNING session_id
        `, [req.user.id, tokenAtualHash]);
        
        const sessoes_invalidadas = result.rows.length;
        
        res.json({
            sucesso: true,
            mensagem: `${sessoes_invalidadas} sessão(ões) invalidada(s)`,
            sessoes_invalidadas
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao invalidar outras sessões:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao invalidar sessões'
        });
    }
});

/**
 * POST /api/sessions/limpar-expiradas - Limpa sessões expiradas (apenas ADMIN)
 */
router.post('/limpar-expiradas', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const sessoes_limpas = await SessionService.limparSessoesExpiradas();
        
        res.json({
            sucesso: true,
            mensagem: `${sessoes_limpas} sessão(ões) expirada(s) marcada(s)`,
            sessoes_limpas
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao limpar sessões expiradas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao limpar sessões expiradas'
        });
    }
});

/**
 * GET /api/sessions/estatisticas - Estatísticas de sessões (ADMIN/GESTOR)
 */
router.get('/estatisticas', verificarAutenticacao, verificarGestao, async (req, res) => {
    try {
        const dias = parseInt(req.query.dias) || 30;
        const estatisticas = await SessionService.obterEstatisticas(dias);
        
        res.json({
            sucesso: true,
            periodo_dias: dias,
            estatisticas: {
                total_sessoes: parseInt(estatisticas.total_sessoes) || 0,
                usuarios_unicos: parseInt(estatisticas.usuarios_unicos) || 0,
                sessoes_ativas: parseInt(estatisticas.sessoes_ativas) || 0,
                logins_hoje: parseInt(estatisticas.logins_hoje) || 0,
                duracao_media_minutos: Math.round(parseFloat(estatisticas.duracao_media_minutos) || 0)
            }
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao obter estatísticas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter estatísticas'
        });
    }
});

/**
 * POST /api/sessions/invalidar-usuario/:userId - Invalida todas as sessões de um usuário (ADMIN)
 */
router.post('/invalidar-usuario/:userId', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { motivo } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do usuário é obrigatório'
            });
        }
        
        const motivoFinal = motivo || 'ADMIN_FORCED';
        const sessoes_invalidadas = await SessionService.invalidarSessoesUsuario(userId, motivoFinal);
        
        res.json({
            sucesso: true,
            mensagem: `${sessoes_invalidadas} sessão(ões) invalidada(s) para o usuário`,
            usuario_id: userId,
            sessoes_invalidadas,
            motivo: motivoFinal
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao invalidar sessões do usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao invalidar sessões do usuário'
        });
    }
});

/**
 * GET /api/sessions/ativas - Lista todas as sessões ativas (ADMIN)
 */
router.get('/ativas', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const result = await query(`
            SELECT 
                sc.session_id,
                sc.usuario_id,
                sc.data_login,
                sc.data_ultimo_acesso,
                sc.endereco_ip,
                sc.dispositivo_info,
                us.username,
                us.tipo_usuario,
                pf.nome_completo,
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - sc.data_ultimo_acesso))/60 as minutos_inativo
            FROM usuarios.sessao_controle sc
            JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
            LEFT JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id
            WHERE sc.status_sessao = 'ATIVA'
            AND sc.data_expiracao > CURRENT_TIMESTAMP
            ORDER BY sc.data_ultimo_acesso DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        const total_result = await query(`
            SELECT COUNT(*) as total
            FROM usuarios.sessao_controle 
            WHERE status_sessao = 'ATIVA'
            AND data_expiracao > CURRENT_TIMESTAMP
        `);
        
        const sessoes = result.rows.map(sessao => ({
            session_id: sessao.session_id,
            usuario: {
                id: sessao.usuario_id,
                username: sessao.username,
                nome: sessao.nome_completo || sessao.username,
                tipo_usuario: sessao.tipo_usuario
            },
            data_login: sessao.data_login,
            data_ultimo_acesso: sessao.data_ultimo_acesso,
            endereco_ip: sessao.endereco_ip,
            dispositivo: sessao.dispositivo_info,
            minutos_inativo: Math.round(sessao.minutos_inativo),
            status: sessao.minutos_inativo < 30 ? 'ATIVA' : 'INATIVA'
        }));
        
        res.json({
            sucesso: true,
            sessoes,
            paginacao: {
                total: parseInt(total_result.rows[0].total),
                limit,
                offset,
                tem_mais: (offset + limit) < parseInt(total_result.rows[0].total)
            }
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao listar sessões ativas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar sessões ativas'
        });
    }
});

/**
 * GET /api/sessions/info - Informações da sessão atual
 */
router.get('/info', verificarAutenticacao, async (req, res) => {
    try {
        res.json({
            sucesso: true,
            sessao: {
                id: req.sessao.id,
                session_id: req.sessao.session_id,
                data_login: req.sessao.data_login,
                endereco_ip: req.sessao.endereco_ip,
                dispositivo: req.sessao.dispositivo_info
            },
            usuario: {
                id: req.user.id,
                nome: req.user.nome,
                email: req.user.email,
                username: req.user.username,
                tipo_usuario: req.user.tipo_usuario,
                nivel_acesso: req.user.nivel_acesso
            }
        });
    } catch (error) {
        console.error('[SESSIONS] Erro ao obter informações da sessão:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter informações da sessão'
        });
    }
});

module.exports = router;
