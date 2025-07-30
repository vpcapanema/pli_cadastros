-- Extensões do Sistema de Controle de Sessões - SIGMA-PLI
-- Tabelas adicionais para controle inteligente de janelas e eventos

-- Tabela para controle de janelas/abas por sessão
CREATE TABLE IF NOT EXISTS usuarios.sessao_janelas (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    window_id VARCHAR(255) NOT NULL,
    url TEXT,
    endereco_ip INET,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP WITH TIME ZONE,
    ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ativa BOOLEAN DEFAULT true,
    is_main_window BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Chaves estrangeiras
    CONSTRAINT fk_sessao_janelas_session 
        FOREIGN KEY (session_id) 
        REFERENCES usuarios.sessao_controle(session_id) 
        ON DELETE CASCADE,
    
    -- Índices para performance
    CONSTRAINT uk_session_window UNIQUE (session_id, window_id)
);

-- Tabela para log de eventos de sessão
CREATE TABLE IF NOT EXISTS usuarios.sessao_eventos (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    window_id VARCHAR(255),
    evento_tipo VARCHAR(50) NOT NULL, -- RENEWAL, ACTIVITY, LOGOUT, etc.
    evento_dados JSONB,
    endereco_ip INET,
    data_evento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave estrangeira
    CONSTRAINT fk_sessao_eventos_session 
        FOREIGN KEY (session_id) 
        REFERENCES usuarios.sessao_controle(session_id) 
        ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_sessao_janelas_session_id ON usuarios.sessao_janelas(session_id);
CREATE INDEX IF NOT EXISTS idx_sessao_janelas_ativa ON usuarios.sessao_janelas(ativa);
CREATE INDEX IF NOT EXISTS idx_sessao_janelas_ultima_atividade ON usuarios.sessao_janelas(ultima_atividade);

CREATE INDEX IF NOT EXISTS idx_sessao_eventos_session_id ON usuarios.sessao_eventos(session_id);
CREATE INDEX IF NOT EXISTS idx_sessao_eventos_tipo ON usuarios.sessao_eventos(evento_tipo);
CREATE INDEX IF NOT EXISTS idx_sessao_eventos_data ON usuarios.sessao_eventos(data_evento);

-- Comentários das tabelas
COMMENT ON TABLE usuarios.sessao_janelas IS 'Controle de janelas/abas ativas por sessão para logout automático';
COMMENT ON TABLE usuarios.sessao_eventos IS 'Log de eventos relacionados às sessões para auditoria';

-- Comentários das colunas - sessao_janelas
COMMENT ON COLUMN usuarios.sessao_janelas.session_id IS 'ID da sessão pai';
COMMENT ON COLUMN usuarios.sessao_janelas.window_id IS 'ID único da janela/aba';
COMMENT ON COLUMN usuarios.sessao_janelas.url IS 'URL da página na janela';
COMMENT ON COLUMN usuarios.sessao_janelas.ativa IS 'Se a janela ainda está aberta';
COMMENT ON COLUMN usuarios.sessao_janelas.is_main_window IS 'Se é a janela principal (primeira aberta)';
COMMENT ON COLUMN usuarios.sessao_janelas.is_active IS 'Se o usuário está ativo nesta janela';
COMMENT ON COLUMN usuarios.sessao_janelas.ultima_atividade IS 'Timestamp da última atividade detectada';

-- Comentários das colunas - sessao_eventos  
COMMENT ON COLUMN usuarios.sessao_eventos.evento_tipo IS 'Tipo do evento: RENEWAL, ACTIVITY, LOGOUT, HEARTBEAT, etc.';
COMMENT ON COLUMN usuarios.sessao_eventos.evento_dados IS 'Dados adicionais do evento em formato JSON';
COMMENT ON COLUMN usuarios.sessao_eventos.window_id IS 'ID da janela que gerou o evento (opcional)';

-- Function para limpeza automática de eventos antigos (manter apenas 30 dias)
CREATE OR REPLACE FUNCTION usuarios.limpar_eventos_antigos()
RETURNS INTEGER AS $$
DECLARE
    eventos_removidos INTEGER;
BEGIN
    DELETE FROM usuarios.sessao_eventos 
    WHERE data_evento < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS eventos_removidos = ROW_COUNT;
    
    RETURN eventos_removidos;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente a última atividade da sessão
CREATE OR REPLACE FUNCTION usuarios.atualizar_atividade_sessao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar última atividade da sessão principal quando uma janela tem atividade
    IF NEW.is_active = true AND NEW.ultima_atividade > OLD.ultima_atividade THEN
        UPDATE usuarios.sessao_controle 
        SET data_ultimo_acesso = NEW.ultima_atividade,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE session_id = NEW.session_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela de janelas
DROP TRIGGER IF EXISTS trigger_atualizar_atividade_sessao ON usuarios.sessao_janelas;
CREATE TRIGGER trigger_atualizar_atividade_sessao
    AFTER UPDATE ON usuarios.sessao_janelas
    FOR EACH ROW
    EXECUTE FUNCTION usuarios.atualizar_atividade_sessao();

-- View para estatísticas de janelas por sessão
CREATE OR REPLACE VIEW usuarios.v_estatisticas_janelas AS
SELECT 
    sc.session_id,
    sc.usuario_id,
    us.username,
    sc.data_login,
    sc.status_sessao,
    COUNT(sj.id) as total_janelas,
    COUNT(CASE WHEN sj.ativa = true THEN 1 END) as janelas_ativas,
    COUNT(CASE WHEN sj.is_active = true THEN 1 END) as janelas_com_atividade,
    MAX(sj.ultima_atividade) as ultima_atividade_janelas,
    MIN(sj.data_abertura) as primeira_janela_aberta,
    MAX(sj.data_abertura) as ultima_janela_aberta
FROM usuarios.sessao_controle sc
LEFT JOIN usuarios.sessao_janelas sj ON sc.session_id = sj.session_id
LEFT JOIN usuarios.usuario_sistema us ON sc.usuario_id = us.id
WHERE sc.status_sessao = 'ATIVA'
GROUP BY sc.session_id, sc.usuario_id, us.username, sc.data_login, sc.status_sessao
ORDER BY sc.data_login DESC;

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON usuarios.sessao_janelas TO aplicacao_pli;
GRANT SELECT, INSERT, UPDATE, DELETE ON usuarios.sessao_eventos TO aplicacao_pli;
GRANT USAGE ON SEQUENCE usuarios.sessao_janelas_id_seq TO aplicacao_pli;
GRANT USAGE ON SEQUENCE usuarios.sessao_eventos_id_seq TO aplicacao_pli;
GRANT SELECT ON usuarios.v_estatisticas_janelas TO aplicacao_pli;

-- Comentário da view
COMMENT ON VIEW usuarios.v_estatisticas_janelas IS 'Estatísticas consolidadas de janelas por sessão ativa';

-- Exemplo de consulta para monitoramento
/*
-- Consultar sessões com múltiplas janelas ativas
SELECT * FROM usuarios.v_estatisticas_janelas 
WHERE janelas_ativas > 1 
ORDER BY janelas_ativas DESC;

-- Consultar eventos de renovação nas últimas 24h
SELECT se.*, sc.usuario_id, us.username
FROM usuarios.sessao_eventos se
JOIN usuarios.sessao_controle sc ON se.session_id = sc.session_id
JOIN usuarios.usuario_sistema us ON sc.usuario_id = us.id
WHERE se.evento_tipo = 'RENEWAL'
AND se.data_evento >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY se.data_evento DESC;
*/
