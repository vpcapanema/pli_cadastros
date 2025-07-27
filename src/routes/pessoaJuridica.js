// backend/src/routes/pessoaJuridica.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

const { requireAuth } = require('../middleware/auth');

// Listar pessoas jurídicas (apenas autenticado)
router.get('/', requireAuth, async (req, res) => {
  try {
    const sql = `
      SELECT id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal, situacao_receita_federal, data_abertura, natureza_juridica, porte_empresa, regime_tributario, cep, logradouro, numero, complemento, bairro, cidade, estado, pais, coordenadas, telefone_principal, telefone_secundario, email_principal, email_secundario, website, ativo, data_criacao, data_atualizacao, data_exclusao
      FROM cadastro.pessoa_juridica
      ORDER BY razao_social
      LIMIT 100
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pessoas jurídicas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pessoa jurídica (apenas autenticado)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { 
      razao_social, 
      nome_fantasia, 
      cnpj, 
      inscricao_estadual, 
      inscricao_municipal,
      situacao_receita_federal,
      data_abertura,
      natureza_juridica,
      porte_empresa,
      regime_tributario,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais,
      coordenadas,
      telefone_principal,
      telefone_secundario,
      email_principal,
      email_secundario,
      website,
      socios
    } = req.body;
    
    // Validar campos obrigatórios
    if (!razao_social || !cnpj) {
      return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios' });
    }
    
    // Verificar se CNPJ já existe
    const checkCnpj = await query('SELECT id FROM cadastro.pessoa_juridica WHERE cnpj = $1', [cnpj]);
    if (checkCnpj.rows.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    
    // Usar transação para garantir integridade
    const { transaction } = require('../config/database');
    
    const result = await transaction(async (client) => {
      // Inserir pessoa jurídica
      const sqlPJ = `
        INSERT INTO cadastro.pessoa_juridica 
          (razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal, situacao_receita_federal, data_abertura, natureza_juridica, porte_empresa, regime_tributario, cep, logradouro, numero, complemento, bairro, cidade, estado, pais, coordenadas, telefone_principal, telefone_secundario, email_principal, email_secundario, website, ativo, data_criacao)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, true, NOW())
        RETURNING id, razao_social, cnpj
      `;
      
      const pjResult = await client.query(sqlPJ, [
        razao_social, 
        nome_fantasia || null, 
        cnpj, 
        inscricao_estadual || null, 
        inscricao_municipal || null,
        situacao_receita_federal || null,
        data_abertura || null,
        natureza_juridica || null,
        porte_empresa || null,
        regime_tributario || null,
        cep || null,
        logradouro || null,
        numero || null,
        complemento || null,
        bairro || null,
        cidade || null,
        estado || null,
        pais || null,
        coordenadas || null,
        telefone_principal || null,
        telefone_secundario || null,
        email_principal || null,
        email_secundario || null,
        website || null
      ]);
      
      const pessoaJuridica = pjResult.rows[0];
      
      // Inserir sócios/representantes se fornecidos
      if (socios && Array.isArray(socios) && socios.length > 0) {
        const sociosIds = [];
        
        for (const socio of socios) {
          if (!socio.nome || !socio.cpf) {
            continue; // Pular sócios sem nome ou CPF
          }
          
          const sqlSocio = `
            INSERT INTO cadastro.socio_representante
              (pessoa_juridica_id, nome, cpf, cargo, email, telefone, data_cadastro)
            VALUES
              ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id
          `;
          
          const socioResult = await client.query(sqlSocio, [
            pessoaJuridica.id,
            socio.nome,
            socio.cpf,
            socio.cargo || null,
            socio.email || null,
            socio.telefone || null
          ]);
          
          sociosIds.push(socioResult.rows[0].id);
        }
        
        pessoaJuridica.socios_ids = sociosIds;
      }
      
      return pessoaJuridica;
    });
    
    res.status(201).json({
      message: 'Pessoa jurídica cadastrada com sucesso',
      pessoa: result
    });
  } catch (error) {
    console.error('Erro ao criar pessoa jurídica:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pessoa jurídica por ID (apenas autenticado)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const sql = `
      SELECT id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
             email, telefone, endereco, cidade, estado, cep, ativo, data_cadastro, data_atualizacao
      FROM cadastro.pessoa_juridica
      WHERE id = $1
    `;
    const result = await query(sql, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa jurídica não encontrada' });
    }
    
    // Buscar sócios/representantes
    const sqlSocios = `
      SELECT id, nome, cpf, cargo, email, telefone
      FROM cadastro.socio_representante
      WHERE pessoa_juridica_id = $1
      ORDER BY nome
    `;
    const sociosResult = await query(sqlSocios, [req.params.id]);
    
    const pessoaJuridica = result.rows[0];
    pessoaJuridica.socios = sociosResult.rows;
    
    res.json(pessoaJuridica);
  } catch (error) {
    console.error('Erro ao buscar pessoa jurídica por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar pessoa jurídica (apenas autenticado)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      razao_social, 
      nome_fantasia, 
      cnpj, 
      inscricao_estadual, 
      inscricao_municipal,
      email, 
      telefone, 
      endereco, 
      cidade, 
      estado, 
      cep,
      ativo,
      socios
    } = req.body;
    
    // Verificar se pessoa jurídica existe
    const checkPJ = await query('SELECT id FROM cadastro.pessoa_juridica WHERE id = $1', [id]);
    if (checkPJ.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa jurídica não encontrada' });
    }
    
    // Verificar se CNPJ já existe para outro registro
    if (cnpj) {
      const checkCnpj = await query('SELECT id FROM cadastro.pessoa_juridica WHERE cnpj = $1 AND id != $2', [cnpj, id]);
      if (checkCnpj.rows.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado para outra empresa' });
      }
    }
    
    // Usar transação para garantir integridade
    const { transaction } = require('../config/database');
    
    const result = await transaction(async (client) => {
      // Atualizar pessoa jurídica
      const sqlPJ = `
        UPDATE cadastro.pessoa_juridica SET 
          razao_social = COALESCE($1, razao_social),
          nome_fantasia = COALESCE($2, nome_fantasia),
          cnpj = COALESCE($3, cnpj),
          inscricao_estadual = COALESCE($4, inscricao_estadual),
          inscricao_municipal = COALESCE($5, inscricao_municipal),
          situacao_receita_federal = COALESCE($6, situacao_receita_federal),
          data_abertura = COALESCE($7, data_abertura),
          natureza_juridica = COALESCE($8, natureza_juridica),
          porte_empresa = COALESCE($9, porte_empresa),
          regime_tributario = COALESCE($10, regime_tributario),
          cep = COALESCE($11, cep),
          logradouro = COALESCE($12, logradouro),
          numero = COALESCE($13, numero),
          complemento = COALESCE($14, complemento),
          bairro = COALESCE($15, bairro),
          cidade = COALESCE($16, cidade),
          estado = COALESCE($17, estado),
          pais = COALESCE($18, pais),
          coordenadas = COALESCE($19, coordenadas),
          telefone_principal = COALESCE($20, telefone_principal),
          telefone_secundario = COALESCE($21, telefone_secundario),
          email_principal = COALESCE($22, email_principal),
          email_secundario = COALESCE($23, email_secundario),
          website = COALESCE($24, website),
          ativo = COALESCE($25, ativo),
          data_atualizacao = NOW()
        WHERE id = $26
        RETURNING id, razao_social, cnpj, ativo
      `;
      
      const pjResult = await client.query(sqlPJ, [
        razao_social, 
        nome_fantasia, 
        cnpj, 
        inscricao_estadual, 
        inscricao_municipal,
        situacao_receita_federal,
        data_abertura,
        natureza_juridica,
        porte_empresa,
        regime_tributario,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        pais,
        coordenadas,
        telefone_principal,
        telefone_secundario,
        email_principal,
        email_secundario,
        website,
        ativo,
        id
      ]);
      
      const pessoaJuridica = pjResult.rows[0];
      
      // Atualizar sócios/representantes se fornecidos
      if (socios && Array.isArray(socios)) {
        // Implementação simplificada: remover todos os sócios existentes e adicionar os novos
        await client.query('DELETE FROM cadastro.socio_representante WHERE pessoa_juridica_id = $1', [id]);
        
        const sociosIds = [];
        
        for (const socio of socios) {
          if (!socio.nome || !socio.cpf) {
            continue; // Pular sócios sem nome ou CPF
          }
          
          const sqlSocio = `
            INSERT INTO cadastro.socio_representante
              (pessoa_juridica_id, nome, cpf, cargo, email, telefone, data_cadastro)
            VALUES
              ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id
          `;
          
          const socioResult = await client.query(sqlSocio, [
            id,
            socio.nome,
            socio.cpf,
            socio.cargo || null,
            socio.email || null,
            socio.telefone || null
          ]);
          
          sociosIds.push(socioResult.rows[0].id);
        }
        
        pessoaJuridica.socios_ids = sociosIds;
      }
      
      return pessoaJuridica;
    });
    
    res.json({
      message: 'Pessoa jurídica atualizada com sucesso',
      pessoa: result
    });
  } catch (error) {
    console.error('Erro ao atualizar pessoa jurídica:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar pessoa jurídica (desativação lógica)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se pessoa jurídica existe
    const checkPJ = await query('SELECT id FROM cadastro.pessoa_juridica WHERE id = $1', [id]);
    if (checkPJ.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa jurídica não encontrada' });
    }
    
    // Desativação lógica em vez de exclusão física
    const sql = `
      UPDATE cadastro.pessoa_juridica SET 
        ativo = false,
        data_atualizacao = NOW()
      WHERE id = $1
      RETURNING id, razao_social, ativo
    `;
    
    const result = await query(sql, [id]);
    
    res.json({
      message: 'Pessoa jurídica desativada com sucesso',
      pessoa: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao desativar pessoa jurídica:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
