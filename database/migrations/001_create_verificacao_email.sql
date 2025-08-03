-- Script para criar tabela de verificação de email
-- SIGMA-PLI | Módulo de Gerenciamento de Cadastros

-- Criar tabela verificacao_email se não existir
CREATE TABLE IF NOT EXISTS usuarios.verificacao_email (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    data_verificacao TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios.usuario_sistema(id) ON DELETE CASCADE
);

-- Criar índice para busca eficiente por token
CREATE INDEX IF NOT EXISTS idx_verificacao_email_token ON usuarios.verificacao_email(token);

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_verificacao_email_usuario_id ON usuarios.verificacao_email(usuario_id);

-- Comentários
COMMENT ON TABLE usuarios.verificacao_email IS 'Tabela para controle de verificação de email dos usuários';
COMMENT ON COLUMN usuarios.verificacao_email.usuario_id IS 'ID do usuário que precisa verificar o email';
COMMENT ON COLUMN usuarios.verificacao_email.token IS 'Token único para verificação do email';
COMMENT ON COLUMN usuarios.verificacao_email.criado_em IS 'Data/hora de criação do token';
COMMENT ON COLUMN usuarios.verificacao_email.expira_em IS 'Data/hora de expiração do token';
COMMENT ON COLUMN usuarios.verificacao_email.usado IS 'Indica se o token já foi usado';
COMMENT ON COLUMN usuarios.verificacao_email.data_verificacao IS 'Data/hora em que o email foi verificado';
