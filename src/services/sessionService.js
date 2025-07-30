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
    },

    /**
     * Registra uma nova janela/aba
     * @param {string} userId - ID do usuário  
     * @param {string} sessionId - ID da sessão
     * @param {string} windowId - ID da janela
     * @param {string} url - URL da janela
     * @param {string} ip - IP do cliente
     * @param {number} timestamp - Timestamp de abertura
     * @returns {Object} Informações da janela registrada
     */
    async registrarJanela(userId, sessionId, windowId, url, ip, timestamp) {
        try {
            // Verificar quantas janelas já existem para esta sessão
            const countResult = await query(`
                SELECT COUNT(*) as total 
                FROM usuarios.sessao_janelas 
                WHERE sessao_id = $1 AND status = 'ATIVA'
            `, [sessionId]);
            
            const totalWindows = parseInt(countResult.rows[0].total) + 1;
            const isMainWindow = totalWindows === 1;
            
            // Registrar nova janela
            await query(`
                INSERT INTO usuarios.sessao_janelas (
                    sessao_id, window_id, url, 
                    data_abertura
                ) VALUES ($1, $2, $3, to_timestamp($4::bigint / 1000))
            `, [sessionId, windowId, url, timestamp]);
            
            // Atualizar última atividade da sessão
            await query(`
                UPDATE usuarios.sessao_controle 
                SET data_ultimo_acesso = CURRENT_TIMESTAMP,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE session_id = $1
            `, [sessionId]);
            
            // Buscar dados atualizados da sessão
            const sessionData = await this.obterInformacoesSessao(sessionId);
            
            console.log(`[SESSION] Janela ${windowId} registrada - Total: ${totalWindows}, Main: ${isMainWindow}`);
            
            return {
                isMainWindow,
                totalWindows,
                sessionData
            };
            
        } catch (error) {
            console.error('[SESSION] Erro ao registrar janela:', error);
            throw error;
        }
    },

    /**
     * Remove registro de janela/aba
     * @param {string} userId - ID do usuário
     * @param {string} sessionId - ID da sessão  
     * @param {string} windowId - ID da janela
     * @param {number} timestamp - Timestamp de fechamento
     * @returns {Object} Informações sobre o fechamento
     */
    async desregistrarJanela(userId, sessionId, windowId, timestamp) {
        try {
            // Marcar janela como inativa
            await query(`
                UPDATE usuarios.sessao_janelas 
                SET status = 'INATIVA',
                    data_fechamento = to_timestamp($3::bigint / 1000)
                WHERE sessao_id = $1 AND window_id = $2
            `, [sessionId, windowId, timestamp]);
            
            // Verificar quantas janelas ainda estão ativas
            const countResult = await query(`
                SELECT COUNT(*) as total 
                FROM usuarios.sessao_janelas 
                WHERE sessao_id = $1 AND status = 'ATIVA'
            `, [sessionId]);
            
            const remainingWindows = parseInt(countResult.rows[0].total);
            const isLastWindow = remainingWindows === 0;
            
            console.log(`[SESSION] Janela ${windowId} desregistrada - Restantes: ${remainingWindows}`);
            
            return {
                isLastWindow,
                remainingWindows
            };
            
        } catch (error) {
            console.error('[SESSION] Erro ao desregistrar janela:', error);
            throw error;
        }
    },

    /**
     * Renova uma sessão existente
     * @param {string} sessionId - ID da sessão
     * @param {string} windowId - ID da janela que solicitou
     * @param {string} reason - Motivo da renovação
     * @param {number} lastActivity - Última atividade do usuário
     * @param {string} ip - IP do cliente
     * @returns {Object} Dados da sessão renovada
     */
    async renovarSessao(sessionId, windowId, reason, lastActivity, ip) {
        try {
            // Nova data de expiração (15 minutos a partir de agora)
            const novaExpiracao = new Date(Date.now() + (15 * 60 * 1000));
            
            // Atualizar sessão
            const result = await query(`
                UPDATE usuarios.sessao_controle 
                SET data_expiracao = $2,
                    data_ultimo_acesso = CURRENT_TIMESTAMP,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE session_id = $1 AND status_sessao = 'ATIVA'
                RETURNING *
            `, [sessionId, novaExpiracao]);
            
            if (result.rows.length === 0) {
                throw new Error('Sessão não encontrada ou inválida');
            }
            
            // Registrar evento de renovação
            await query(`
                INSERT INTO usuarios.sessao_eventos (
                    sessao_id, window_id, tipo_evento, dados_evento 
                ) VALUES ($1, $2, 'RENEWAL', $3)
            `, [sessionId, windowId, JSON.stringify({ reason, lastActivity })]);
            
            // Buscar dados completos da sessão
            const sessionData = await this.obterInformacoesSessao(sessionId);
            
            console.log(`[SESSION] Sessão ${sessionId} renovada - Motivo: ${reason}`);
            
            return {
                sessionData,
                renovadaEm: new Date(),
                proximaRenovacao: new Date(novaExpiracao.getTime() - (5 * 60 * 1000)) // 5 min antes de expirar
            };
            
        } catch (error) {
            console.error('[SESSION] Erro ao renovar sessão:', error);
            throw error;
        }
    },

    /**
     * Atualiza atividade de uma janela específica
     * @param {string} sessionId - ID da sessão
     * @param {string} windowId - ID da janela
     * @param {boolean} isActive - Se o usuário está ativo
     * @param {number} lastActivity - Timestamp da última atividade
     * @param {number} timestamp - Timestamp atual
     */
    async atualizarAtividade(sessionId, windowId, isActive, lastActivity, timestamp) {
        try {
            // Atualizar atividade da janela
            await query(`
                UPDATE usuarios.sessao_janelas 
                SET data_ultimo_acesso = to_timestamp($3::bigint / 1000)
                WHERE sessao_id = $1 AND window_id = $2 AND status = 'ATIVA'
            `, [sessionId, windowId, lastActivity]);
            
            // Atualizar última atividade da sessão se usuário está ativo
            if (isActive) {
                await query(`
                    UPDATE usuarios.sessao_controle 
                    SET data_ultimo_acesso = CURRENT_TIMESTAMP,
                        data_atualizacao = CURRENT_TIMESTAMP
                    WHERE session_id = $1
                `, [sessionId]);
            }
            
        } catch (error) {
            console.error('[SESSION] Erro ao atualizar atividade:', error);
            throw error;
        }
    },

    /**
     * Obtém informações completas de uma sessão
     * @param {string} sessionId - ID da sessão
     * @returns {Object} Informações da sessão
     */
    async obterInformacoesSessao(sessionId) {
        try {
            const result = await query(`
                SELECT sc.*,
                       us.username, 
                       COALESCE(pf.nome_completo, us.username) as nome,
                       us.email, 
                       us.tipo_usuario,
                       (SELECT COUNT(*) FROM usuarios.sessao_janelas 
                        WHERE sessao_id = sc.session_id AND status = 'ATIVA') as janelas_ativas
                FROM usuarios.sessao_controle sc
                JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
                LEFT JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id
                WHERE sc.session_id = $1
            `, [sessionId]);
            
            if (result.rows.length === 0) {
                throw new Error('Sessão não encontrada');
            }
            
            return result.rows[0];
            
        } catch (error) {
            console.error('[SESSION] Erro ao obter informações da sessão:', error);
            throw error;
        }
    },

    /**
     * Lista janelas ativas de uma sessão
     * @param {string} sessionId - ID da sessão
     * @returns {Array} Lista de janelas ativas
     */
    async listarJanelasAtivas(sessionId) {
        try {
            const result = await query(`
                SELECT window_id, url, data_abertura, 
                       data_ultimo_acesso
                FROM usuarios.sessao_janelas 
                WHERE sessao_id = $1 AND status = 'ATIVA'
                ORDER BY data_abertura ASC
            `, [sessionId]);
            
            return result.rows;
            
        } catch (error) {
            console.error('[SESSION] Erro ao listar janelas ativas:', error);
            return [];
        }
    },

    /**
     * Verifica e marca logout se necessário (última janela fechada)
     * @param {string} sessionId - ID da sessão
     */
    async verificarEMarcarLogoutSeNecessario(sessionId) {
        try {
            // Verificar se ainda há janelas ativas
            const countResult = await query(`
                SELECT COUNT(*) as total 
                FROM usuarios.sessao_janelas 
                WHERE sessao_id = $1 AND status = 'ATIVA'
            `, [sessionId]);
            
            const janelasAtivas = parseInt(countResult.rows[0].total);
            
            if (janelasAtivas === 0) {
                console.log(`[SESSION] Todas as janelas fechadas - realizando logout automático da sessão ${sessionId}`);
                
                // Buscar hash do token para registrar logout
                const sessionResult = await query(`
                    SELECT token_jwt_hash 
                    FROM usuarios.sessao_controle 
                    WHERE session_id = $1
                `, [sessionId]);
                
                if (sessionResult.rows.length > 0) {
                    await this.registrarLogout(
                        sessionResult.rows[0].token_jwt_hash,
                        'ALL_WINDOWS_CLOSED'
                    );
                }
            }
            
        } catch (error) {
            console.error('[SESSION] Erro ao verificar necessidade de logout:', error);
        }
    },

    /**
     * Força expiração de uma sessão específica
     * @param {string} sessionId - ID da sessão
     * @param {string} reason - Motivo da expiração forçada
     */
    async forcarExpiracaoSessao(sessionId, reason) {
        try {
            await query(`
                UPDATE usuarios.sessao_controle 
                SET status_sessao = 'INVALIDADA',
                    data_logout = CURRENT_TIMESTAMP,
                    motivo_encerramento = $2,
                    data_atualizacao = CURRENT_TIMESTAMP
                WHERE session_id = $1
            `, [sessionId, reason]);
            
            // Marcar todas as janelas como inativas
            await query(`
                UPDATE usuarios.sessao_janelas 
                SET status = 'INATIVA',
                    data_fechamento = CURRENT_TIMESTAMP
                WHERE sessao_id = $1 AND status = 'ATIVA'
            `, [sessionId]);
            
            console.log(`[SESSION] Sessão ${sessionId} expirada forçadamente - Motivo: ${reason}`);
            
        } catch (error) {
            console.error('[SESSION] Erro ao forçar expiração:', error);
            throw error;
        }
    },

    /**
     * Gera hash SHA256 do token
     * @param {string} token - Token JWT
     * @returns {string} Hash do token
     */
    gerarHashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};

module.exports = SessionService;
