const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { mockStats, USE_MOCK } = require('../config/mockData');

/**
 * @route GET /api/estatisticas
 * @desc Retorna estatísticas gerais do sistema
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Tentar buscar do banco real primeiro
    const result = await safeQuery(`
      SELECT
        (SELECT COUNT(*) FROM cadastro.pessoa_fisica WHERE ativo = true) as total_pessoas_fisicas,
        (SELECT COUNT(*) FROM cadastro.pessoa_juridica WHERE ativo = true) as total_pessoas_juridicas,
        (SELECT COUNT(*) FROM usuarios.usuario_sistema WHERE ativo = true) as total_usuarios
    `);

    if (result && result.rows && result.rows.length > 0) {
      // Banco funcionou, buscar dados completos
      const stats = result.rows[0];

      // Buscar usuários por tipo
      const usuariosPorTipoResult = await safeQuery(`
        SELECT
          tipo_usuario,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ativo = true) as ativos,
          COUNT(*) FILTER (WHERE ativo = false) as inativos
        FROM usuarios.usuario_sistema
        GROUP BY tipo_usuario
        ORDER BY tipo_usuario
      `);

      const usuariosPorTipo = usuariosPorTipoResult ? usuariosPorTipoResult.rows : mockStats.usuariosPorTipo;

      res.json({
        success: true,
        data: {
          totalPessoasFisicas: parseInt(stats.total_pessoas_fisicas) || 0,
          totalPessoasJuridicas: parseInt(stats.total_pessoas_juridicas) || 0,
          totalUsuarios: parseInt(stats.total_usuarios) || 0,
          usuariosPorTipo: usuariosPorTipo,
        },
      });
    } else {
      // Usar dados mockados
      console.log('📊 Usando estatísticas mockadas para desenvolvimento');
      res.json({
        success: true,
        data: {
          totalPessoasFisicas: mockStats.totalPessoasFisicas,
          totalPessoasJuridicas: mockStats.totalPessoasJuridicas,
          totalUsuarios: mockStats.totalUsuarios,
          usuariosPorTipo: mockStats.usuariosPorTipo,
        },
        mock: true,
        message: 'Dados mockados - banco não disponível',
      });
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);

    // Fallback para dados mockados em caso de erro
    res.json({
      success: true,
      data: {
        totalPessoasFisicas: mockStats.totalPessoasFisicas,
        totalPessoasJuridicas: mockStats.totalPessoasJuridicas,
        totalUsuarios: mockStats.totalUsuarios,
        usuariosPorTipo: mockStats.usuariosPorTipo,
      },
      mock: true,
      message: 'Dados mockados devido a erro no banco',
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

// Função auxiliar para tentar query do banco, fallback para mock
async function safeQuery(sql, params = []) {
  try {
    if (USE_MOCK) {
      throw new Error('Mock mode enabled');
    }
    return await query(sql, params);
  } catch (error) {
    console.log('🔄 Usando dados mockados devido a erro no banco:', error.message);
    return null; // Indica que deve usar mock
  }
}

module.exports = router;
