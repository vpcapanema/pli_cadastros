/**
 * Admin Controller - SIGMA-PLI
 * Responsável pelo gerenciamento administrativo do sistema
 */

const { query } = require('../config/database');

/**
 * GET /admin/dashboard
 * Dashboard principal com métricas gerais do sistema
 */
const getDashboardMetrics = async (req, res) => {
  try {
    console.log('🔍 Admin Dashboard - Buscando métricas do sistema...');

    // Consultas paralelas para melhor performance
    const [totalUsuarios, usuariosAtivos, sessesAtivas, loginHoje] = await Promise.all([
      // Total de usuários cadastrados
      query('SELECT COUNT(*) as total FROM usuarios.usuario_sistema'),

      // Usuários ativos
      query('SELECT COUNT(*) as total FROM usuarios.usuario_sistema WHERE ativo = true'),

      // Sessões ativas (últimas 24h)
      query(`SELECT COUNT(DISTINCT sessao_id) as total 
             FROM usuarios.sessao_controle 
             WHERE data_inicio >= NOW() - INTERVAL '24 hours' 
             AND data_fim IS NULL`),

      // Logins hoje
      query(`SELECT COUNT(*) as total 
             FROM usuarios.sessao_controle 
             WHERE DATE(data_inicio) = CURRENT_DATE`),
    ]);

    // Atividade recente
    const atividadeRecente = await query(`
      SELECT 
        DATE(data_inicio) as data,
        COUNT(*) as logins
      FROM usuarios.sessao_controle 
      WHERE data_inicio >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(data_inicio)
      ORDER BY data DESC
    `);

    // Usuários por tipo
    const usuariosPorTipo = await query(`
      SELECT 
        tipo_usuario,
        COUNT(*) as quantidade
      FROM usuarios.usuario_sistema 
      WHERE ativo = true
      GROUP BY tipo_usuario
      ORDER BY quantidade DESC
    `);

    const metricas = {
      resumo: {
        totalUsuarios: parseInt(totalUsuarios.rows[0].total),
        usuariosAtivos: parseInt(usuariosAtivos.rows[0].total),
        sessesAtivas: parseInt(sessesAtivas.rows[0].total),
        loginHoje: parseInt(loginHoje.rows[0].total),
      },
      atividade: atividadeRecente.rows,
      distribuicao: usuariosPorTipo.rows,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Admin Dashboard - Métricas obtidas com sucesso');

    res.json({
      success: true,
      data: metricas,
      message: 'Métricas do dashboard obtidas com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao obter métricas do sistema',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /admin/dashboard/estatisticas
 * Estatísticas detalhadas do sistema
 */
const getEstatisticasDetalhadas = async (req, res) => {
  try {
    console.log('🔍 Admin - Buscando estatísticas detalhadas...');

    // Estatísticas de sessões
    const estatisticasSessoes = await query(`
      SELECT 
        COUNT(*) as total_sessoes,
        AVG(EXTRACT(EPOCH FROM (COALESCE(data_fim, NOW()) - data_inicio))/60) as duracao_media_minutos,
        COUNT(CASE WHEN data_fim IS NULL THEN 1 END) as sessoes_ativas
      FROM usuarios.sessao_controle
      WHERE data_inicio >= NOW() - INTERVAL '30 days'
    `);

    res.json({
      success: true,
      data: {
        sessoes: estatisticasSessoes.rows[0],
        timestamp: new Date().toISOString(),
      },
      message: 'Estatísticas detalhadas obtidas com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas detalhadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao obter estatísticas detalhadas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /admin/usuarios
 * Listar usuários com filtros e paginação
 */
const getUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo_usuario, ativo, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    let params = [];
    let paramCount = 0;

    if (tipo_usuario) {
      paramCount++;
      whereClause += ` AND tipo_usuario = $${paramCount}`;
      params.push(tipo_usuario);
    }

    if (ativo !== undefined) {
      paramCount++;
      whereClause += ` AND ativo = $${paramCount}`;
      params.push(ativo === 'true');
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (nome ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const usuarios = await query(
      `
      SELECT 
        id, nome, email, tipo_usuario, nivel_acesso, ativo, 
        data_criacao, ultimo_login
      FROM usuarios.usuario_sistema 
      WHERE ${whereClause}
      ORDER BY data_criacao DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `,
      [...params, limit, offset]
    );

    const total = await query(
      `
      SELECT COUNT(*) as total 
      FROM usuarios.usuario_sistema 
      WHERE ${whereClause}
    `,
      params
    );

    res.json({
      success: true,
      data: {
        usuarios: usuarios.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.rows[0].total),
          pages: Math.ceil(total.rows[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao listar usuários',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /admin/usuarios/:id
 * Obter detalhes de um usuário específico
 */
const getUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await query(
      `
      SELECT * FROM usuarios.usuario_sistema WHERE id = $1
    `,
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: usuario.rows[0],
    });
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao obter usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Placeholder functions para outras rotas
const alterarStatusUsuario = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const alterarAtivoUsuario = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const alterarRoleUsuario = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const excluirUsuario = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getTabelas = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getDadosTabela = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getLogs = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getLog = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getAuditoria = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getNotificacoes = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const criarNotificacao = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const atualizarNotificacao = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const excluirNotificacao = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getConfiguracoes = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const atualizarConfiguracoes = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getRelatorioUsuarios = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getRelatorioAtividade = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getRelatorioPerformance = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getSaudeSistema = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getMetricasTempoReal = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const iniciarBackup = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const getStatusBackup = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

const executarLimpeza = (req, res) => {
  res.status(501).json({ success: false, message: 'Funcionalidade em desenvolvimento' });
};

module.exports = {
  getDashboardMetrics,
  getEstatisticasDetalhadas,
  getUsuarios,
  getUsuario,
  alterarStatusUsuario,
  alterarAtivoUsuario,
  alterarRoleUsuario,
  excluirUsuario,
  getTabelas,
  getDadosTabela,
  getLogs,
  getLog,
  getAuditoria,
  getNotificacoes,
  criarNotificacao,
  atualizarNotificacao,
  excluirNotificacao,
  getConfiguracoes,
  atualizarConfiguracoes,
  getRelatorioUsuarios,
  getRelatorioAtividade,
  getRelatorioPerformance,
  getSaudeSistema,
  getMetricasTempoReal,
  iniciarBackup,
  getStatusBackup,
  executarLimpeza,
};
