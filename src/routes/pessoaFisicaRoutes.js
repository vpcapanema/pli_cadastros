/**
 * Rotas para API de Pessoas Físicas - SIGMA-PLI
 * Endpoints para operações CRUD de pessoas físicas
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticação para todas as rotas
router.use(requireAuth);

// GET /api/pessoa-fisica - Listar pessoas físicas
router.get('/', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, cidade, estado, page = 1, limit = 50 } = req.query;

    let sql = `
      SELECT 
        id, 
        nome_completo, 
        cpf, 
        email_principal, 
        telefone_principal,
        endereco_cidade,
        endereco_estado,
        data_cadastro
      FROM cadastro.pessoa_fisica 
      WHERE ativo = true
    `;

    const params = [];
    let paramIndex = 1;

    // Filtros dinâmicos
    if (nome) {
      sql += ` AND nome_completo ILIKE $${paramIndex}`;
      params.push(`%${nome}%`);
      paramIndex++;
    }

    if (cpf) {
      sql += ` AND cpf LIKE $${paramIndex}`;
      params.push(`%${cpf}%`);
      paramIndex++;
    }

    if (email) {
      sql += ` AND email_principal ILIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }

    if (telefone) {
      sql += ` AND telefone_principal LIKE $${paramIndex}`;
      params.push(`%${telefone}%`);
      paramIndex++;
    }

    if (cidade) {
      sql += ` AND endereco_cidade ILIKE $${paramIndex}`;
      params.push(`%${cidade}%`);
      paramIndex++;
    }

    if (estado) {
      sql += ` AND endereco_estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    sql += ` ORDER BY nome_completo`;

    // Paginação
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    console.log('[API] Executando consulta pessoas físicas:', sql);
    console.log('[API] Parâmetros:', params);

    const result = await query(sql, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pessoas físicas:', error);
    res.status(500).json({
      sucesso: false,
      error: 'Erro ao buscar pessoas físicas',
      detalhes: error.message,
    });
  }
});

// GET /api/pessoa-fisica/:id - Buscar pessoa física por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT * FROM cadastro.pessoa_fisica 
      WHERE id = $1 AND ativo = true
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        error: 'Pessoa física não encontrada',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      error: 'Erro ao buscar pessoa física',
      detalhes: error.message,
    });
  }
});

// POST /api/pessoa-fisica - Criar nova pessoa física
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      sexo,
      estado_civil,
      nacionalidade,
      naturalidade,
      email_principal,
      email_secundario,
      telefone_principal,
      telefone_secundario,
      endereco_cep,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      profissao,
      escolaridade,
      observacoes,
    } = req.body;

    console.log('[API] Criando nova pessoa física:', nome_completo);

    const sql = `
      INSERT INTO cadastro.pessoa_fisica (
        nome_completo, cpf, rg, data_nascimento, sexo, estado_civil,
        nacionalidade, naturalidade, email_principal, email_secundario,
        telefone_principal, telefone_secundario, endereco_cep,
        endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado,
        profissao, escolaridade, observacoes, data_cadastro, ativo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP, true
      ) RETURNING id, nome_completo, data_cadastro
    `;

    const result = await query(sql, [
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      sexo,
      estado_civil,
      nacionalidade,
      naturalidade,
      email_principal,
      email_secundario,
      telefone_principal,
      telefone_secundario,
      endereco_cep,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      profissao,
      escolaridade,
      observacoes,
    ]);

    console.log('[API] Pessoa física criada com sucesso:', result.rows[0]);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Pessoa física cadastrada com sucesso',
      dados: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao cadastrar pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      error: 'Erro ao cadastrar pessoa física',
      detalhes: error.message,
    });
  }
});

// PUT /api/pessoa-fisica/:id - Atualizar pessoa física
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      sexo,
      estado_civil,
      nacionalidade,
      naturalidade,
      email_principal,
      email_secundario,
      telefone_principal,
      telefone_secundario,
      endereco_cep,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      profissao,
      escolaridade,
      observacoes,
    } = req.body;

    console.log(`[API] Atualizando pessoa física ID: ${id}`);
    console.log('[API] Dados recebidos:', { nome_completo, cpf, email_principal });

    const sql = `
      UPDATE cadastro.pessoa_fisica SET
        nome_completo = $2,
        cpf = $3,
        rg = $4,
        data_nascimento = $5,
        sexo = $6,
        estado_civil = $7,
        nacionalidade = $8,
        naturalidade = $9,
        email_principal = $10,
        email_secundario = $11,
        telefone_principal = $12,
        telefone_secundario = $13,
        endereco_cep = $14,
        endereco_logradouro = $15,
        endereco_numero = $16,
        endereco_complemento = $17,
        endereco_bairro = $18,
        endereco_cidade = $19,
        endereco_estado = $20,
        profissao = $21,
        escolaridade = $22,
        observacoes = $23,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $1 AND ativo = true
      RETURNING id, nome_completo, data_atualizacao
    `;

    const result = await query(sql, [
      id,
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      sexo,
      estado_civil,
      nacionalidade,
      naturalidade,
      email_principal,
      email_secundario,
      telefone_principal,
      telefone_secundario,
      endereco_cep,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      profissao,
      escolaridade,
      observacoes,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        error: 'Pessoa física não encontrada',
      });
    }

    console.log(`[API] Pessoa física atualizada com sucesso: ${result.rows[0].nome_completo}`);

    res.json({
      sucesso: true,
      mensagem: 'Pessoa física atualizada com sucesso',
      dados: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      error: 'Erro ao atualizar pessoa física',
      detalhes: error.message,
    });
  }
});

// DELETE /api/pessoa-fisica/:id - Excluir pessoa física (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[API] Excluindo pessoa física ID: ${id}`);

    const sql = `
      UPDATE cadastro.pessoa_fisica 
      SET ativo = false, data_exclusao = CURRENT_TIMESTAMP 
      WHERE id = $1 AND ativo = true
      RETURNING id, nome_completo
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        error: 'Pessoa física não encontrada',
      });
    }

    console.log(`[API] Pessoa física excluída: ${result.rows[0].nome_completo}`);

    res.json({
      sucesso: true,
      mensagem: 'Pessoa física removida com sucesso',
      dados: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao remover pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      error: 'Erro ao remover pessoa física',
      detalhes: error.message,
    });
  }
});

module.exports = router;
