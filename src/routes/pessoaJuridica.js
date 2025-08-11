// backend/src/routes/pessoaJuridica.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

const { requireAuth } = require('../middleware/auth');

// Listar pessoas jurídicas (apenas autenticado)
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('[DEBUG] Iniciando busca de pessoas jurídicas...');

    // Primeiro testa se a tabela existe
    const testTable = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'cadastro' AND table_name = 'pessoa_juridica'
    `);
    console.log('[DEBUG] Tabela pessoa_juridica existe:', testTable.rows[0].count > 0);

    if (testTable.rows[0].count == 0) {
      return res
        .status(500)
        .json({
          error:
            'Estrutura de tabela ausente (cadastro.pessoa_juridica). Provisionar banco antes de usar a API.',
        });
    }
    const sql = `
      SELECT 
        id, 
        razao_social, 
        nome_fantasia,
        cnpj, 
        email_principal as email, 
        telefone_principal as telefone, 
        cidade,
        estado as uf,
        situacao_receita_federal as situacao,
        ativo,
        data_criacao
      FROM cadastro.pessoa_juridica
      ORDER BY razao_social
      LIMIT 100
    `;
    const result = await query(sql);
    console.log('[DEBUG] Pessoas jurídicas encontradas:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pessoas jurídicas:', error);
    res
      .status(500)
      .json({ error: 'Erro interno ao buscar pessoas jurídicas', details: error.message });
  }
});

// Criar pessoa jurídica (formulário público)
router.post('/', async (req, res) => {
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
      socios,
    } = req.body;

    // Validar campos obrigatórios
    if (!razao_social || !cnpj) {
      return res.status(400).json({ error: 'Razão social e CNPJ são obrigatórios' });
    }

    // Verificar se CNPJ já existe
    const checkCnpj = await query('SELECT id FROM cadastro.pessoa_juridica WHERE cnpj = $1', [
      cnpj,
    ]);
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
        website || null,
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
            socio.telefone || null,
          ]);

          sociosIds.push(socioResult.rows[0].id);
        }

        pessoaJuridica.socios_ids = sociosIds;
      }

      return pessoaJuridica;
    });

    res.status(201).json({
      message: 'Pessoa jurídica cadastrada com sucesso',
      pessoa: result,
    });
  } catch (error) {
    console.error('Erro ao criar pessoa jurídica:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pessoa jurídica por ID (apenas autenticado)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    console.log('[DEBUG] Buscando pessoa jurídica por ID:', req.params.id);

    const sql = `
      SELECT id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
             email_principal as email, telefone_principal as telefone, cep, logradouro as endereco, 
             cidade, estado, ativo, data_criacao as data_cadastro, data_atualizacao
      FROM cadastro.pessoa_juridica
      WHERE id = $1
    `;
    const result = await query(sql, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa jurídica não encontrada' });
    }

    // Verificar se a tabela socio_representante existe antes de buscar sócios
    const checkSociosTable = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'cadastro' AND table_name = 'socio_representante'
    `);

    let socios = [];
    if (checkSociosTable.rows[0].count > 0) {
      // Buscar sócios/representantes se a tabela existir
      const sqlSocios = `
        SELECT id, nome, cpf, cargo, email, telefone
        FROM cadastro.socio_representante
        WHERE pessoa_juridica_id = $1
        ORDER BY nome
      `;
      const sociosResult = await query(sqlSocios, [req.params.id]);
      socios = sociosResult.rows;
    } else {
      console.log(
        '[DEBUG] Tabela socio_representante não existe, retornando array vazio para sócios'
      );
    }

    const pessoaJuridica = result.rows[0];
    pessoaJuridica.socios = socios;

    res.json(pessoaJuridica);
  } catch (error) {
    console.error('Erro ao buscar pessoa jurídica por ID:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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
      porte_empresa,
      situacao_receita,
      natureza_juridica,
      cnae_principal,
      data_abertura,
      email,
      telefone,
      site,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      ativo,
      socios,
    } = req.body;

    // Verificar se pessoa jurídica existe
    const checkPJ = await query('SELECT id FROM cadastro.pessoa_juridica WHERE id = $1', [id]);
    if (checkPJ.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa jurídica não encontrada' });
    }

    // Verificar se CNPJ já existe para outro registro
    if (cnpj) {
      const checkCnpj = await query(
        'SELECT id FROM cadastro.pessoa_juridica WHERE cnpj = $1 AND id != $2',
        [cnpj, id]
      );
      if (checkCnpj.rows.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado para outra empresa' });
      }
    }

    // Formatar dados - converter strings vazias em null
    const razaoSocialFormatada = razao_social && razao_social.trim() !== '' ? razao_social : null;
    const nomeFantasiaFormatada =
      nome_fantasia && nome_fantasia.trim() !== '' ? nome_fantasia : null;
    const cnpjFormatado = cnpj && cnpj.trim() !== '' ? cnpj : null;
    const inscricaoEstadualFormatada =
      inscricao_estadual && inscricao_estadual.trim() !== '' ? inscricao_estadual : null;
    const inscricaoMunicipalFormatada =
      inscricao_municipal && inscricao_municipal.trim() !== '' ? inscricao_municipal : null;
    const porteEmpresaFormatado =
      porte_empresa && porte_empresa.trim() !== '' ? porte_empresa : null;
    const situacaoReceitaFormatada =
      situacao_receita && situacao_receita.trim() !== '' ? situacao_receita : null;
    const naturezaJuridicaFormatada =
      natureza_juridica && natureza_juridica.trim() !== '' ? natureza_juridica : null;
    const cnaePrincipalFormatado =
      cnae_principal && cnae_principal.trim() !== '' ? cnae_principal : null;
    const dataAberturaFormatada =
      data_abertura && data_abertura.trim() !== '' ? data_abertura : null;
    const emailFormatado = email && email.trim() !== '' ? email : null;
    const telefoneFormatado = telefone && telefone.trim() !== '' ? telefone : null;
    const siteFormatado = site && site.trim() !== '' ? site : null;
    const cepFormatado = cep && cep.trim() !== '' ? cep : null;
    const logradouroFormatado = logradouro && logradouro.trim() !== '' ? logradouro : null;
    const numeroFormatado = numero && numero.trim() !== '' ? numero : null;
    const complementoFormatado = complemento && complemento.trim() !== '' ? complemento : null;
    const bairroFormatado = bairro && bairro.trim() !== '' ? bairro : null;
    const cidadeFormatada = cidade && cidade.trim() !== '' ? cidade : null;
    const ufFormatado = uf && uf.trim() !== '' ? uf : null;

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
        razaoSocialFormatada,
        nomeFantasiaFormatada,
        cnpjFormatado,
        inscricaoEstadualFormatada,
        inscricaoMunicipalFormatada,
        situacaoReceitaFormatada, // situacao_receita_federal no banco
        dataAberturaFormatada,
        naturezaJuridicaFormatada,
        porteEmpresaFormatado,
        null, // regime_tributario não está sendo enviado no form
        cepFormatado,
        logradouroFormatado,
        numeroFormatado,
        complementoFormatado,
        bairroFormatado,
        cidadeFormatada,
        ufFormatado, // estado no banco
        null, // pais não está sendo enviado
        null, // coordenadas não está sendo enviado
        telefoneFormatado, // telefone_principal no banco
        null, // telefone_secundario não está sendo enviado
        emailFormatado, // email_principal no banco
        null, // email_secundario não está sendo enviado
        siteFormatado, // website no banco
        ativo,
        id,
      ]);

      const pessoaJuridica = pjResult.rows[0];

      // Atualizar sócios/representantes se fornecidos
      if (socios && Array.isArray(socios)) {
        // Implementação simplificada: remover todos os sócios existentes e adicionar os novos
        await client.query(
          'DELETE FROM cadastro.socio_representante WHERE pessoa_juridica_id = $1',
          [id]
        );

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
            socio.telefone || null,
          ]);

          sociosIds.push(socioResult.rows[0].id);
        }

        pessoaJuridica.socios_ids = sociosIds;
      }

      return pessoaJuridica;
    });

    res.json({
      message: 'Pessoa jurídica atualizada com sucesso',
      pessoa: result,
    });
  } catch (error) {
    console.error('Erro ao atualizar pessoa jurídica:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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
      pessoa: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao desativar pessoa jurídica:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
