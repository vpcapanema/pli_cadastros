-- =====================================================
-- MIGRAÇÃO: Adicionar Colunas de Validação de Autenticação
-- Sistema SIGMA-PLI | Módulo de Gerenciamento de Cadastros
-- =====================================================

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar coluna 'status' se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'usuarios' 
        AND table_name = 'usuario_sistema' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE usuarios.usuario_sistema 
        ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_APROVACAO';
        
        -- Adicionar constraint para valores válidos
        ALTER TABLE usuarios.usuario_sistema 
        ADD CONSTRAINT ck_usuario_sistema_status 
        CHECK (status IN ('AGUARDANDO_APROVACAO', 'APROVADO', 'REJEITADO', 'SUSPENSO', 'INATIVO'));
        
        RAISE NOTICE 'Coluna "status" adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna "status" já existe';
    END IF;

    -- Adicionar coluna 'email_institucional_verificado' se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'usuarios' 
        AND table_name = 'usuario_sistema' 
        AND column_name = 'email_institucional_verificado'
    ) THEN
        ALTER TABLE usuarios.usuario_sistema 
        ADD COLUMN email_institucional_verificado BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Coluna "email_institucional_verificado" adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna "email_institucional_verificado" já existe';
    END IF;

    -- Verificar se coluna 'ativo' já tem o default correto
    -- Se não tem, vamos alterar o default
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'usuarios' 
        AND table_name = 'usuario_sistema' 
        AND column_name = 'ativo'
        AND column_default IS DISTINCT FROM 'false'
    ) THEN
        ALTER TABLE usuarios.usuario_sistema 
        ALTER COLUMN ativo SET DEFAULT false;
        
        RAISE NOTICE 'Default da coluna "ativo" alterado para false';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já tem o default correto';
    END IF;

END $$;

-- =====================================================
-- COMENTÁRIOS NAS COLUNAS
-- =====================================================

COMMENT ON COLUMN usuarios.usuario_sistema.status IS 'Status de aprovação do usuário: AGUARDANDO_APROVACAO, APROVADO, REJEITADO, SUSPENSO, INATIVO';
COMMENT ON COLUMN usuarios.usuario_sistema.email_institucional_verificado IS 'Indica se o email institucional foi verificado pelo usuário';
COMMENT ON COLUMN usuarios.usuario_sistema.ativo IS 'Indica se o usuário está ativo no sistema (padrão: false - requer ativação manual)';

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para consultas por status + ativo
CREATE INDEX IF NOT EXISTS idx_usuario_sistema_status_ativo 
ON usuarios.usuario_sistema (status, ativo);

-- Índice para consultas por email_verificado + ativo
CREATE INDEX IF NOT EXISTS idx_usuario_sistema_email_verificado_ativo 
ON usuarios.usuario_sistema (email_institucional_verificado, ativo);

-- =====================================================
-- ATUALIZAÇÃO DE REGISTROS EXISTENTES (se necessário)
-- =====================================================

-- Comentário sobre a atualização:
-- Os registros existentes manterão os valores padrão definidos.
-- Se houver necessidade de aprovar usuários existentes, execute:
-- UPDATE usuarios.usuario_sistema 
-- SET status = 'APROVADO', ativo = true, email_institucional_verificado = true 
-- WHERE id = 'id_do_usuario_admin';

RAISE NOTICE '✅ Migração de colunas de validação de autenticação concluída com sucesso!';
