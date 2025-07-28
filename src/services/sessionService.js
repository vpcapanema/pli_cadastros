/**
 * Serviço de Controle de Sessões - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Gerencia sessões ativas, login/logout e auditoria
 */

const crypto = require('crypto');
const { query } = require('../config/database');

const SessionService = {
    /**
     * Registra uma nova sessão no login
     * @param {string} userId - ID do usuário
     * @param {string} token - Token JWT
     * @param {Object} req - Objeto request do Express
     * @returns {Object} Dados da sessão criada
     */
    async criarSessao(userId, token, req) {
        try {
            // Gera hash do token (para identificação sem exposição)
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            
            // Gera ID único da sessão
            const sessionId = crypto.randomUUID();
            
            // Extrai informações do request
            const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
            const userAgent = req.headers['user-agent'] || '';
            
            // Parse básico do user agent
            const deviceInfo = this.parseUserAgent(userAgent);
            
            // Data de expiração (24 horas)
            const dataExpiracao = new Date(Date.now() + (24 * 60 * 60 * 1000));
            
            const result = await query(`
                INSERT INTO usuarios.sessao_controle (
                    usuario_id, token_jwt_hash, session_id, data_login, 
                    data_ultimo_acesso, data_expiracao, endereco_ip, 
                    user_agent, dispositivo_info, status_sessao
                ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4, $5, $6, $7, 'ATIVA')
                RETURNING id, session_id, data_login
            `, [userId, tokenHash, sessionId, dataExpiracao, ip, userAgent, JSON.stringify(deviceInfo)]);
            
            console.log(`[SESSION] Nova sessão criada: ${sessionId} para usuário ${userId}`);
            
            return result.rows[0];
        } catch (error) {
            console.error('[SESSION] Erro ao criar sessão:', error);
            throw error;
        }
    },

    /**
     * Atualiza último acesso da sessão
     * @param {string} tokenHash - Hash do token JWT
     */
    async atualizarUltimoAcesso(tokenHash) {
        try {
            await query(`
                UPDATE usuarios.sessao_controle 
                SET data_ultimo_acesso = CURRENT_TIMESTAMP,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE token_jwt_hash = $1 
                AND status_sessao = 'ATIVA'
                AND data_expiracao > CURRENT_TIMESTAMP
            `, [tokenHash]);
        } catch (error) {
            console.error('[SESSION] Erro ao atualizar último acesso:', error);
        }
    },

    /**
     * Registra logout da sessão
     * @param {string} tokenHash - Hash do token JWT
     * @param {string} motivo - Motivo do logout
     */
    async registrarLogout(tokenHash, motivo = 'LOGOUT_MANUAL') {
        try {
            const result = await query(`
                UPDATE usuarios.sessao_controle 
                SET status_sessao = 'LOGOUT',
                    data_logout = CURRENT_TIMESTAMP,
                    motivo_encerramento = $2,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE token_jwt_hash = $1 
                AND status_sessao = 'ATIVA'
                RETURNING session_id
            `, [tokenHash, motivo]);
            
            if (result.rows.length > 0) {
                console.log(`[SESSION] Logout registrado: ${result.rows[0].session_id} - Motivo: ${motivo}`);
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('[SESSION] Erro ao registrar logout:', error);
            throw error;
        }
    },

    /**
     * Verifica se uma sessão é válida
     * @param {string} tokenHash - Hash do token JWT
     * @returns {Object|null} Dados da sessão se válida
     */
    async verificarSessao(tokenHash) {
        try {
            const result = await query(`
                SELECT sc.*, us.username, us.tipo_usuario, us.ativo as usuario_ativo
                FROM usuarios.sessao_controle sc
                JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
                WHERE sc.token_jwt_hash = $1 
                AND sc.status_sessao = 'ATIVA'
                AND sc.data_expiracao > CURRENT_TIMESTAMP
                AND us.ativo = true
            `, [tokenHash]);
            
            if (result.rows.length > 0) {
                // Atualiza último acesso
                await this.atualizarUltimoAcesso(tokenHash);
                return result.rows[0];
            }
            
            return null;
        } catch (error) {
            console.error('[SESSION] Erro ao verificar sessão:', error);
            return null;
        }
    },

    /**
     * Invalida todas as sessões de um usuário
     * @param {string} userId - ID do usuário
     * @param {string} motivo - Motivo da invalidação
     */
    async invalidarSessoesUsuario(userId, motivo = 'ADMIN_FORCED') {
        try {
            const result = await query(`
                UPDATE usuarios.sessao_controle 
                SET status_sessao = 'INVALIDADA',
                    data_logout = CURRENT_TIMESTAMP,
                    motivo_encerramento = $2,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE usuario_id = $1 
                AND status_sessao = 'ATIVA'
                RETURNING session_id
            `, [userId, motivo]);
            
            console.log(`[SESSION] ${result.rows.length} sessões invalidadas para usuário ${userId}`);
            
            return result.rows.length;
        } catch (error) {
            console.error('[SESSION] Erro ao invalidar sessões:', error);
            throw error;
        }
    },

    /**
     * Lista sessões ativas de um usuário
     * @param {string} userId - ID do usuário
     * @returns {Array} Lista de sessões ativas
     */
    async listarSessoesUsuario(userId) {
        try {
            const result = await query(`
                SELECT 
                    session_id,
                    data_login,
                    data_ultimo_acesso,
                    endereco_ip,
                    dispositivo_info,
                    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - data_ultimo_acesso))/60 as minutos_inativo
                FROM usuarios.sessao_controle 
                WHERE usuario_id = $1 
                AND status_sessao = 'ATIVA'
                AND data_expiracao > CURRENT_TIMESTAMP
                ORDER BY data_ultimo_acesso DESC
            `, [userId]);
            
            return result.rows;
        } catch (error) {
            console.error('[SESSION] Erro ao listar sessões:', error);
            return [];
        }
    },

    /**
     * Limpa sessões expiradas automaticamente
     */
    async limparSessoesExpiradas() {
        try {
            const result = await query(`
                UPDATE usuarios.sessao_controle 
                SET status_sessao = 'EXPIRADA',
                    motivo_encerramento = 'EXPIRACAO',
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE status_sessao = 'ATIVA'
                AND data_expiracao <= CURRENT_TIMESTAMP
                RETURNING session_id
            `);
            
            if (result.rows.length > 0) {
                console.log(`[SESSION] ${result.rows.length} sessões expiradas marcadas como EXPIRADA`);
            }
            
            return result.rows.length;
        } catch (error) {
            console.error('[SESSION] Erro ao limpar sessões expiradas:', error);
            return 0;
        }
    },

    /**
     * Parse básico do User Agent
     * @param {string} userAgent - String do user agent
     * @returns {Object} Informações do dispositivo
     */
    parseUserAgent(userAgent) {
        const info = {
            browser: 'Unknown',
            version: 'Unknown',
            os: 'Unknown',
            device: 'Desktop'
        };

        try {
            // Browser detection
            if (userAgent.includes('Chrome')) {
                info.browser = 'Chrome';
                const match = userAgent.match(/Chrome\/(\d+)/);
                if (match) info.version = match[1];
            } else if (userAgent.includes('Firefox')) {
                info.browser = 'Firefox';
                const match = userAgent.match(/Firefox\/(\d+)/);
                if (match) info.version = match[1];
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                info.browser = 'Safari';
            } else if (userAgent.includes('Edge')) {
                info.browser = 'Edge';
            }

            // OS detection
            if (userAgent.includes('Windows')) {
                info.os = 'Windows';
            } else if (userAgent.includes('Mac OS')) {
                info.os = 'macOS';
            } else if (userAgent.includes('Linux')) {
                info.os = 'Linux';
            } else if (userAgent.includes('Android')) {
                info.os = 'Android';
                info.device = 'Mobile';
            } else if (userAgent.includes('iOS')) {
                info.os = 'iOS';
                info.device = 'Mobile';
            }

            // Mobile detection
            if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
                info.device = 'Mobile';
            } else if (userAgent.includes('Tablet')) {
                info.device = 'Tablet';
            }

        } catch (error) {
            console.error('[SESSION] Erro ao parsear user agent:', error);
        }

        return info;
    },

    /**
     * Gera hash do token para armazenamento
     * @param {string} token - Token JWT
     * @returns {string} Hash SHA-256
     */
    gerarHashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    },

    /**
     * Estatísticas de sessões
     * @param {number} dias - Número de dias para análise
     * @returns {Object} Estatísticas
     */
    async obterEstatisticas(dias = 30) {
        try {
            const result = await query(`
                SELECT 
                    COUNT(*) as total_sessoes,
                    COUNT(DISTINCT usuario_id) as usuarios_unicos,
                    COUNT(CASE WHEN status_sessao = 'ATIVA' THEN 1 END) as sessoes_ativas,
                    COUNT(CASE WHEN data_login >= CURRENT_DATE THEN 1 END) as logins_hoje,
                    AVG(EXTRACT(EPOCH FROM (COALESCE(data_logout, data_expiracao) - data_login))/60) as duracao_media_minutos
                FROM usuarios.sessao_controle 
                WHERE data_login >= CURRENT_DATE - INTERVAL '1 day' * $1
            `, [dias]);
            
            return result.rows[0];
        } catch (error) {
            console.error('[SESSION] Erro ao obter estatísticas:', error);
            return {};
        }
    }
};

module.exports = SessionService;
