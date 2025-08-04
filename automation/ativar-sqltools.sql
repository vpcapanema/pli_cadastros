-- SQLTools: Conexão com PLI Database
-- Este arquivo ativa automaticamente a extensão SQLTools

-- Teste de conexão
SELECT 'Conexão ativa!' as status;

-- Verificar versão do PostgreSQL
SELECT version() as postgres_version;

-- Listar tabelas do banco
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
