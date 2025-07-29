const express = require('express');
const router = express.Router();
// Importar função de query para acessar o banco de dados
const { query } = require('../config/database');

/**
 * @route GET /api/estatisticas
 * @desc Retorna estatísticas gerais do sistema
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        // Consultas reais ao banco de dados

        // Para compatibilidade com ambos os formatos de frontend
        const totalPF = await getTotalPessoasFisicas();
        const totalPJ = await getTotalPessoasJuridicas();
        const totalUsuarios = await getTotalUsuarios();
        const totalSolicitacoes = await getTotalSolicitacoes();
        const usuariosPorTipo = await getUsuariosPorTipo();
        
        const estatisticas = {
            totalCadastros: totalPF + totalPJ,
            totalUsuarios: totalUsuarios,
            totalPessoasFisicas: totalPF,
            totalPessoasJuridicas: totalPJ,
            totalSolicitacoes: totalSolicitacoes,
            totalPF, // compatibilidade
            totalPJ, // compatibilidade
            usuariosPorTipo, // novos dados por tipo de usuário
            ultimaAtualizacao: new Date().toISOString()
        };

        res.json(estatisticas);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível carregar as estatísticas'
        });
    }
});

/**
 * @route GET /api/estatisticas/ultimos-cadastros
 * @desc Retorna os últimos cadastros realizados
 * @access Public
 */
router.get('/ultimos-cadastros', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const ultimosCadastros = await getUltimosCadastros(limit);
        res.json(ultimosCadastros);
    } catch (error) {
        console.error('Erro ao buscar últimos cadastros:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível carregar os últimos cadastros'
        });
    }
});

// Funções auxiliares para consultar dados
async function getTotalCadastros() {
    // Contar cadastros em ambos os esquemas cadastro.pessoa_fisica e cadastro.pessoa_juridica
    const sql = `
        SELECT (
            (SELECT COUNT(*) FROM cadastro.pessoa_fisica) +
            (SELECT COUNT(*) FROM cadastro.pessoa_juridica)
        ) AS total`;
    const res = await query(sql);
    return parseInt(res.rows[0].total, 10);
}

async function getTotalUsuarios() {
    // Contar usuários ativos no esquema usuarios.usuario_sistema
    const sql = `SELECT COUNT(*) AS total FROM usuarios.usuario_sistema WHERE ativo = true`;
    const res = await query(sql);
    return parseInt(res.rows[0].total, 10);
}

async function getTotalPessoasFisicas() {
    // Contar pessoas físicas ativas no esquema cadastro.pessoa_fisica
    const sql = `SELECT COUNT(*) AS total FROM cadastro.pessoa_fisica WHERE ativo = true`;
    const res = await query(sql);
    return parseInt(res.rows[0].total, 10);
}

async function getTotalPessoasJuridicas() {
    // Contar pessoas jurídicas ativas no esquema cadastro.pessoa_juridica
    const sql = `SELECT COUNT(*) AS total FROM cadastro.pessoa_juridica WHERE ativo = true`;
    const res = await query(sql);
    return parseInt(res.rows[0].total, 10);
}

async function getTotalSolicitacoes() {
    // Por enquanto, retornar 0 até a tabela ser criada
    // TODO: Implementar quando a tabela solicitacoes.solicitacao_cadastro for criada
    return 0;
}

async function getUltimosCadastros(limit = 10) {
    try {
        const sql = `
            SELECT 
                'Pessoa Física' as tipo,
                nome_completo as nome,
                cpf as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM cadastro.pessoa_fisica
            WHERE data_criacao IS NOT NULL
            
            UNION ALL
            
            SELECT 
                'Pessoa Jurídica' as tipo,
                razao_social as nome,
                cnpj as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM cadastro.pessoa_juridica
            WHERE data_criacao IS NOT NULL
            
            UNION ALL
            
            SELECT 
                'Usuário Sistema' as tipo,
                username as nome,
                COALESCE(email, 'N/A') as documento,
                data_criacao,
                CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status
            FROM usuarios.usuario_sistema
            WHERE data_criacao IS NOT NULL
            
            ORDER BY data_criacao DESC
            LIMIT $1
        `;
        
        const res = await query(sql, [limit]);
        return res.rows.map(row => ({
            nome: row.nome,
            tipo: row.tipo,
            documento: row.documento,
            dataCadastro: row.data_criacao,
            status: row.status
        }));
    } catch (error) {
        console.error('Erro ao buscar últimos cadastros:', error);
        return [];
    }
}

async function getUsuariosPorTipo() {
    try {
        // Contar usuários por tipo baseado em algum critério ou campo específico
        // Como não há campo específico de tipo, vamos usar uma abordagem baseada em perfil
        const sql = `
            SELECT 
                COUNT(*) FILTER (WHERE ativo = true) as usuarios_ativos,
                COUNT(*) FILTER (WHERE ativo = false) as usuarios_inativos,
                COUNT(*) as total_usuarios
            FROM usuarios.usuario_sistema
        `;
        const res = await query(sql);
        const row = res.rows[0];
        
        return {
            usuariosAtivos: parseInt(row.usuarios_ativos, 10),
            usuariosInativos: parseInt(row.usuarios_inativos, 10),
            totalUsuarios: parseInt(row.total_usuarios, 10)
        };
    } catch (error) {
        console.error('Erro ao buscar usuários por tipo:', error);
        return {
            usuariosAtivos: 0,
            usuariosInativos: 0,
            totalUsuarios: 0
        };
    }
}

module.exports = router;
