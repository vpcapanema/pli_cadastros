-- =====================================================
-- TABELA DE CONTROLE DE SESSÕES E LOGIN
-- Sistema SIGMA-PLI | Módulo de Gerenciamento de Cadastros
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios.sessao_controle (
    -- Identificação da sessão
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados do usuário
    usuario_id UUID NOT NULL REFERENCES usuarios.usuario_sistema(id),
    
    -- Informações da sessão
    token_jwt_hash VARCHAR(64) NOT NULL, -- Hash do token JWT para identificação
    session_id VARCHAR(100) UNIQUE NOT NULL, -- ID único da sessão
    
    -- Dados de login
    data_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_logout TIMESTAMP NULL,
    data_expiracao TIMESTAMP NOT NULL,
    
    -- Status da sessão
    status_sessao VARCHAR(20) NOT NULL DEFAULT 'ATIVA' CHECK (status_sessao IN ('ATIVA', 'EXPIRADA', 'INVALIDADA', 'LOGOUT')),
    motivo_encerramento VARCHAR(50) NULL, -- 'LOGOUT_MANUAL', 'EXPIRACAO', 'ADMIN_FORCED', 'SECURITY_BREACH'
    
    -- Informações técnicas
    endereco_ip INET NOT NULL,
    user_agent TEXT NULL,
    dispositivo_info JSONB NULL, -- Informações do dispositivo/navegador
    localizacao_geoip JSONB NULL, -- Dados de geolocalização por IP
    
    -- Controle de segurança
    tentativas_renovacao INTEGER DEFAULT 0,
    flags_seguranca JSONB NULL, -- Alertas de segurança, tentativas suspeitas, etc.
    
    -- Metadados
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    CONSTRAINT chk_data_logout CHECK (data_logout IS NULL OR data_logout >= data_login),
    CONSTRAINT chk_data_expiracao CHECK (data_expiracao > data_login)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice principal para busca por usuário e status
CREATE INDEX IF NOT EXISTS idx_sessao_usuario_status 
ON usuarios.sessao_controle(usuario_id, status_sessao);

-- Índice para busca por token hash
CREATE INDEX IF NOT EXISTS idx_sessao_token_hash 
ON usuarios.sessao_controle(token_jwt_hash);

-- Índice para limpeza de sessões expiradas
CREATE INDEX IF NOT EXISTS idx_sessao_expiracao 
ON usuarios.sessao_controle(data_expiracao) 
WHERE status_sessao = 'ATIVA';

-- Índice para análise temporal
CREATE INDEX IF NOT EXISTS idx_sessao_data_login 
ON usuarios.sessao_controle(data_login);

-- Índice para análise por IP
CREATE INDEX IF NOT EXISTS idx_sessao_ip 
ON usuarios.sessao_controle(endereco_ip);

-- =====================================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION usuarios.update_sessao_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER tr_sessao_update_timestamp
    BEFORE UPDATE ON usuarios.sessao_controle
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.update_sessao_timestamp();

-- =====================================================
-- FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE SESSÕES ANTIGAS
-- =====================================================

CREATE OR REPLACE FUNCTION usuarios.limpar_sessoes_antigas(dias_retencao INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    registros_removidos INTEGER;
BEGIN
    -- Remove sessões antigas baseado na data de logout ou expiração
    DELETE FROM usuarios.sessao_controle 
    WHERE (
        (data_logout IS NOT NULL AND data_logout < CURRENT_TIMESTAMP - INTERVAL '1 day' * dias_retencao)
        OR 
        (data_logout IS NULL AND data_expiracao < CURRENT_TIMESTAMP - INTERVAL '1 day' * dias_retencao)
    );
    
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    
    INSERT INTO usuarios.log_sistema (
        nivel, mensagem, detalhes, data_evento
    ) VALUES (
        'INFO', 
        'Limpeza automática de sessões antigas executada',
        json_build_object(
            'registros_removidos', registros_removidos,
            'dias_retencao', dias_retencao
        ),
        CURRENT_TIMESTAMP
    );
    
    RETURN registros_removidos;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS PARA CONSULTAS COMUNS
-- =====================================================

-- View para sessões ativas por usuário
CREATE OR REPLACE VIEW usuarios.v_sessoes_ativas AS
SELECT 
    sc.id,
    sc.usuario_id,
    us.username,
    us.email_institucional,
    us.tipo_usuario,
    pf.nome_completo,
    sc.session_id,
    sc.data_login,
    sc.data_ultimo_acesso,
    sc.data_expiracao,
    sc.endereco_ip,
    sc.dispositivo_info->>'browser' as navegador,
    sc.dispositivo_info->>'os' as sistema_operacional,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - sc.data_ultimo_acesso))/60 as minutos_inativo,
    CASE 
        WHEN sc.data_expiracao < CURRENT_TIMESTAMP THEN 'EXPIRADA'
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - sc.data_ultimo_acesso))/60 > 30 THEN 'INATIVA'
        ELSE 'ATIVA'
    END as status_real
FROM usuarios.sessao_controle sc
JOIN usuarios.usuario_sistema us ON us.id = sc.usuario_id
LEFT JOIN cadastro.pessoa_fisica pf ON pf.id = us.pessoa_fisica_id
WHERE sc.status_sessao = 'ATIVA'
AND sc.data_expiracao > CURRENT_TIMESTAMP
ORDER BY sc.data_ultimo_acesso DESC;

-- View para estatísticas de login
CREATE OR REPLACE VIEW usuarios.v_estatisticas_login AS
SELECT 
    DATE(sc.data_login) as data,
    COUNT(*) as total_logins,
    COUNT(DISTINCT sc.usuario_id) as usuarios_unicos,
    COUNT(DISTINCT sc.endereco_ip) as ips_unicos,
    AVG(EXTRACT(EPOCH FROM (COALESCE(sc.data_logout, sc.data_expiracao) - sc.data_login))/60) as duracao_media_minutos
FROM usuarios.sessao_controle sc
WHERE sc.data_login >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(sc.data_login)
ORDER BY data DESC;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE usuarios.sessao_controle IS 'Controle completo de sessões e logins do sistema';
COMMENT ON COLUMN usuarios.sessao_controle.token_jwt_hash IS 'Hash SHA-256 do token JWT para identificação sem exposição';
COMMENT ON COLUMN usuarios.sessao_controle.session_id IS 'ID único da sessão gerado no momento do login';
COMMENT ON COLUMN usuarios.sessao_controle.dispositivo_info IS 'JSON com informações do navegador, OS, etc.';
COMMENT ON COLUMN usuarios.sessao_controle.localizacao_geoip IS 'JSON com país, cidade, ISP baseado no IP';
COMMENT ON COLUMN usuarios.sessao_controle.flags_seguranca IS 'JSON com alertas de segurança e anomalias detectadas';
