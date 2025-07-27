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
        const estatisticas = {
            totalCadastros: totalPF + totalPJ,
            totalUsuarios: await getTotalUsuarios(),
            totalPessoasFisicas: totalPF,
            totalPessoasJuridicas: totalPJ,
            totalPF, // compatibilidade
            totalPJ, // compatibilidade
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

module.exports = router;
