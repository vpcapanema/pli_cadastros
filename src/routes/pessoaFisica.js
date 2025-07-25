// backend/src/routes/pessoaFisica.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { formatCPF, formatPhone, formatCEP, formatEmail, toUpperCase } = require('../utils/formatUtils');

// Listar pessoas físicas
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT id, nome_completo, cpf, data_nascimento, email_principal as email, telefone_principal as telefone, ativo
      FROM cadastro.pessoa_fisica
      ORDER BY nome_completo
      LIMIT 100
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pessoas físicas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pessoa física
router.post('/', async (req, res) => {
  try {
    const { 
      nome_completo, nome_social, cpf, data_nascimento, sexo, estado_civil, nacionalidade, naturalidade,
      nome_pai, nome_mae, rg, orgao_expeditor, uf_rg, data_expedicao_rg, titulo_eleitor, zona_eleitoral,
      secao_eleitoral, pis_pasep, email, email_secundario, telefone_principal, telefone_secundario,
      cep, logradouro, numero, complemento, bairro, cidade, uf, pais, profissao, escolaridade, renda_mensal
    } = req.body;
    
    // Validar campos obrigatórios
    if (!nome_completo || !cpf) {
      return res.status(400).json({ error: 'Nome completo e CPF são obrigatórios' });
    }
    
    // Formatar dados
    const cpfFormatado = formatCPF(cpf);
    const emailFormatado = formatEmail(email);
    const emailSecundarioFormatado = email_secundario ? formatEmail(email_secundario) : null;
    const telefonePrincipalFormatado = formatPhone(telefone_principal);
    const telefoneSecundarioFormatado = telefone_secundario ? formatPhone(telefone_secundario) : null;
    const cepFormatado = formatCEP(cep);
    const ufFormatado = uf ? toUpperCase(uf) : null;
    const nacionalidadeFormatada = nacionalidade ? toUpperCase(nacionalidade) : 'BRASILEIRA';
    const paisFormatado = pais ? toUpperCase(pais) : 'BRASIL';
    const pisPasepFormatado = pis_pasep ? formatCPF(pis_pasep) : null;
    const tituloEleitorFormatado = titulo_eleitor ? titulo_eleitor.replace(/\D/g, '') : null;
    
    // Verificar se CPF já existe
    const checkCpf = await query('SELECT id FROM cadastro.pessoa_fisica WHERE cpf = $1', [cpfFormatado]);
    if (checkCpf.rows.length > 0) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    
    const sql = `
      INSERT INTO cadastro.pessoa_fisica 
        (nome_completo, nome_social, cpf, data_nascimento, sexo, estado_civil, nacionalidade, naturalidade,
         nome_pai, nome_mae, rg, rg_orgao_expedidor, uf_rg, rg_data_expedicao, titulo_eleitor, zona_eleitoral,
         secao_eleitoral, pis_pasep, email_principal, email_secundario, telefone_principal, telefone_secundario,
         cep, logradouro, numero, complemento, bairro, cidade, estado, pais, profissao, escolaridade, renda_mensal,
         ativo, data_criacao) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
         $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, true, NOW()) 
      RETURNING id, nome_completo, cpf
    `;
    
    const result = await query(sql, [
      nome_completo, 
      nome_social || null,
      cpfFormatado, 
      data_nascimento || null, 
      sexo || null,
      estado_civil || null,
      nacionalidadeFormatada,
      naturalidade || null,
      nome_pai || null,
      nome_mae || null,
      rg || null,
      orgao_expeditor || null,
      uf_rg || null,
      data_expedicao_rg || null,
      tituloEleitorFormatado || null,
      zona_eleitoral || null,
      secao_eleitoral || null,
      pisPasepFormatado || null,
      emailFormatado || null,
      emailSecundarioFormatado || null,
      telefonePrincipalFormatado || null, 
      telefoneSecundarioFormatado || null,
      cepFormatado || null,
      logradouro || null,
      numero || null,
      complemento || null,
      bairro || null,
      cidade || null, 
      ufFormatado || null,
      paisFormatado,
      profissao || null,
      escolaridade || null,
      renda_mensal || null
    ]);
    
    res.status(201).json({
      message: 'Pessoa física cadastrada com sucesso',
      pessoa: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar pessoa física:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pessoa física por ID
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT id, nome_completo, nome_social, cpf, data_nascimento, sexo, rg, rg_orgao_expedidor, uf_rg,
             email_principal as email, telefone_principal, telefone_secundario, 
             cep, logradouro, numero, complemento, bairro, cidade, estado, 
             ativo, data_criacao, data_atualizacao
      FROM cadastro.pessoa_fisica
      WHERE id = $1
    `;
    const result = await query(sql, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa física não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar pessoa física por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar pessoa física
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome_completo, nome_social, cpf, data_nascimento, sexo, rg, orgao_expeditor, uf_rg,
      email, telefone_principal, telefone_secundario, cep, logradouro, numero, complemento,
      bairro, cidade, uf, ativo 
    } = req.body;
    
    // Verificar se pessoa existe
    const checkPessoa = await query('SELECT id FROM cadastro.pessoa_fisica WHERE id = $1', [id]);
    if (checkPessoa.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa física não encontrada' });
    }
    
    // Formatar dados
    const cpfFormatado = cpf ? formatCPF(cpf) : null;
    const emailFormatado = email ? formatEmail(email) : null;
    const telefonePrincipalFormatado = telefone_principal ? formatPhone(telefone_principal) : null;
    const telefoneSecundarioFormatado = telefone_secundario ? formatPhone(telefone_secundario) : null;
    const cepFormatado = cep ? formatCEP(cep) : null;
    const ufFormatado = uf ? toUpperCase(uf) : null;
    
    // Verificar se CPF já existe para outro registro
    if (cpfFormatado) {
      const checkCpf = await query('SELECT id FROM cadastro.pessoa_fisica WHERE cpf = $1 AND id != $2', [cpfFormatado, id]);
      if (checkCpf.rows.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado para outra pessoa' });
      }
    }
    
    const sql = `
      UPDATE cadastro.pessoa_fisica SET 
        nome_completo = COALESCE($1, nome_completo),
        nome_social = COALESCE($2, nome_social),
        cpf = COALESCE($3, cpf),
        data_nascimento = COALESCE($4, data_nascimento),
        sexo = COALESCE($5, sexo),
        rg = COALESCE($6, rg),
        rg_orgao_expedidor = COALESCE($7, rg_orgao_expedidor),
        uf_rg = COALESCE($8, uf_rg),
        email_principal = COALESCE($9, email_principal),
        telefone_principal = COALESCE($10, telefone_principal),
        telefone_secundario = COALESCE($11, telefone_secundario),
        cep = COALESCE($12, cep),
        logradouro = COALESCE($13, logradouro),
        numero = COALESCE($14, numero),
        complemento = COALESCE($15, complemento),
        bairro = COALESCE($16, bairro),
        cidade = COALESCE($17, cidade),
        estado = COALESCE($18, estado),
        ativo = COALESCE($19, ativo),
        data_atualizacao = NOW()
      WHERE id = $20
      RETURNING id, nome_completo, cpf, ativo
    `;
    
    const result = await query(sql, [
      nome_completo, 
      nome_social,
      cpfFormatado, 
      data_nascimento, 
      sexo,
      rg,
      orgao_expeditor,
      uf_rg,
      emailFormatado, 
      telefonePrincipalFormatado, 
      telefoneSecundarioFormatado,
      cepFormatado,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade, 
      ufFormatado,
      ativo,
      id
    ]);
    
    res.json({
      message: 'Pessoa física atualizada com sucesso',
      pessoa: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar pessoa física:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar pessoa física (desativação lógica)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se pessoa existe
    const checkPessoa = await query('SELECT id FROM cadastro.pessoa_fisica WHERE id = $1', [id]);
    if (checkPessoa.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa física não encontrada' });
    }
    
    // Desativação lógica em vez de exclusão física
    const sql = `
      UPDATE cadastro.pessoa_fisica SET 
        ativo = false,
        data_atualizacao = NOW(),
        data_exclusao = NOW()
      WHERE id = $1
      RETURNING id, nome_completo, ativo
    `;
    
    const result = await query(sql, [id]);
    
    res.json({
      message: 'Pessoa física desativada com sucesso',
      pessoa: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar pessoa física:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
