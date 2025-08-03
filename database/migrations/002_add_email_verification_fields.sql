-- Adicionar campos de verificação de email na tabela usuario_sistema
-- SIGMA-PLI | Módulo de Gerenciamento de Cadastros

BEGIN;

-- Adicionar campos para verificação de email diretamente na tabela usuario_sistema
ALTER TABLE usuarios.usuario_sistema 
ADD COLUMN IF NOT EXISTS token_verificacao_email VARCHAR(64),
ADD COLUMN IF NOT EXISTS token_expira_em TIMESTAMP WITH TIME ZONE;

-- Comentários dos novos campos
COMMENT ON COLUMN usuarios.usuario_sistema.token_verificacao_email IS 'Token para verificação do email institucional';
COMMENT ON COLUMN usuarios.usuario_sistema.token_expira_em IS 'Data de expiração do token de verificação';

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_usuario_sistema_token_verificacao 
ON usuarios.usuario_sistema(token_verificacao_email) 
WHERE token_verificacao_email IS NOT NULL;

COMMIT;
