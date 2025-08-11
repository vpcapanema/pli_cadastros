// API RESTful para pessoas físicas
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/pessoa-fisica
router.get('/', async (req, res) => {
  try {
    const sql = `SELECT id, nome_completo, cpf, email_principal, telefone_principal FROM cadastro.pessoa_fisica WHERE ativo = true ORDER BY nome_completo`;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pessoas físicas:', error);
    res.status(500).json({ error: 'Erro ao buscar pessoas físicas' });
  }
});

// GET /api/pessoa-fisica/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT * FROM cadastro.pessoa_fisica WHERE id = $1`;
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa física não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pessoa física:', error);
    res.status(500).json({ error: 'Erro ao buscar pessoa física' });
  }
});

// POST /api/pessoa-fisica
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
      ) RETURNING id, nome_completo
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

// PUT /api/pessoa-fisica/:id
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
    console.log('[API] Dados recebidos:', req.body);

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

// DELETE /api/pessoa-fisica/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      UPDATE cadastro.pessoa_fisica 
      SET ativo = false, data_exclusao = CURRENT_TIMESTAMP 
      WHERE id = $1 AND ativo = true
      RETURNING id, nome_completo
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa física não encontrada' });
    }

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
