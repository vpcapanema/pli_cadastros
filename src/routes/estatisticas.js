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
      usuariosPorTipo: {
        distribuicao: usuariosPorTipo.distribuicao,
        totalGeral: usuariosPorTipo.totalGeral,
        tipos: usuariosPorTipo.tipos,
        labels: usuariosPorTipo.labels,
        valores: usuariosPorTipo.valores,
        cores: usuariosPorTipo.cores,
      },
      ultimaAtualizacao: new Date().toISOString(),
    };

    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas',
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
      message: 'Não foi possível carregar os últimos cadastros',
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
    return res.rows.map((row) => ({
      nome: row.nome,
      tipo: row.tipo,
      documento: row.documento,
      dataCadastro: row.data_criacao,
      status: row.status,
    }));
  } catch (error) {
    console.error('Erro ao buscar últimos cadastros:', error);
    return [];
  }
}

async function getUsuariosPorTipo() {
  try {
    // Tipos possíveis no sistema
    const tiposPossiveis = ['ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR'];

    const sql = `
            SELECT 
                tipo_usuario,
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE ativo = true) as ativos,
                COUNT(*) FILTER (WHERE ativo = false) as inativos
            FROM usuarios.usuario_sistema
            GROUP BY tipo_usuario
            ORDER BY tipo_usuario
        `;
    const res = await query(sql);

    // Transformar o resultado em um formato mais útil para gráficos
    const distribuicao = {};
    let totalGeral = 0;

    // Inicializar todos os tipos com zero
    tiposPossiveis.forEach((tipo) => {
      distribuicao[tipo] = {
        total: 0,
        ativos: 0,
        inativos: 0,
        percentual: '0.0',
      };
    });

    // Preencher com os dados reais
    res.rows.forEach((row) => {
      if (tiposPossiveis.includes(row.tipo_usuario)) {
        distribuicao[row.tipo_usuario] = {
          total: parseInt(row.total, 10),
          ativos: parseInt(row.ativos, 10),
          inativos: parseInt(row.inativos, 10),
        };
        totalGeral += parseInt(row.total, 10);
      }
    });

    // Calcular percentuais
    Object.keys(distribuicao).forEach((tipo) => {
      distribuicao[tipo].percentual =
        totalGeral > 0 ? ((distribuicao[tipo].total / totalGeral) * 100).toFixed(1) : '0.0';
    });

    // Criar arrays para gráficos
    const labels = tiposPossiveis.map((tipo) => {
      const labelMap = {
        ADMIN: 'Administrador',
        GESTOR: 'Gestor',
        ANALISTA: 'Analista',
        OPERADOR: 'Operador',
        VISUALIZADOR: 'Visualizador',
      };
      return labelMap[tipo] || tipo;
    });

    const valores = tiposPossiveis.map((tipo) => distribuicao[tipo].total);
    const cores = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#17a2b8']; // Cores distintivas

    // Forçar o retorno completo com todos os 5 tipos
    return {
      distribuicao: {
        ADMIN: distribuicao['ADMIN'] || { total: 0, ativos: 0, inativos: 0, percentual: '0.0' },
        GESTOR: distribuicao['GESTOR'] || { total: 0, ativos: 0, inativos: 0, percentual: '0.0' },
        ANALISTA: distribuicao['ANALISTA'] || {
          total: 0,
          ativos: 0,
          inativos: 0,
          percentual: '0.0',
        },
        OPERADOR: distribuicao['OPERADOR'] || {
          total: 0,
          ativos: 0,
          inativos: 0,
          percentual: '0.0',
        },
        VISUALIZADOR: distribuicao['VISUALIZADOR'] || {
          total: 0,
          ativos: 0,
          inativos: 0,
          percentual: '0.0',
        },
      },
      totalGeral,
      tipos: ['ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR'],
      labels: ['Administrador', 'Gestor', 'Analista', 'Operador', 'Visualizador'],
      valores: [
        distribuicao['ADMIN']?.total || 0,
        distribuicao['GESTOR']?.total || 0,
        distribuicao['ANALISTA']?.total || 0,
        distribuicao['OPERADOR']?.total || 0,
        distribuicao['VISUALIZADOR']?.total || 0,
      ],
      cores: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#17a2b8'],
    };
  } catch (error) {
    console.error('Erro ao buscar usuários por tipo:', error);
    // Log mais detalhado em arquivo para debug
    const fs = require('fs');
    fs.writeFileSync(
      'error-usuarios-por-tipo.txt',
      `Erro: ${error.message}\nStack: ${error.stack}`
    );
    return {
      distribuicao: {},
      totalGeral: 0,
      tipos: [],
      labels: [],
      valores: [],
      cores: [],
    };
  }
}

module.exports = router;
