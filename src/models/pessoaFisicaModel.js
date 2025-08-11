/**
 * Modelo de Pessoa Física - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Gerencia operações de banco de dados para pessoas físicas
 */
const { pool } = require('../config/database');
const { formatData, toUpperCase, toTitleCase, formatCPF } = require('../utils/formatUtils');

/**
 * Cria um novo registro de pessoa física no banco de dados
 * @param {Object} dadosPessoa - Dados da pessoa física (já formatados)
 * @returns {Promise<Object>} - Pessoa física criada
 */
exports.criar = async (dadosPessoa) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Query para inserir pessoa física
    const query = `
      INSERT INTO cadastros.pessoa_fisica (
        nome_completo, cpf, rg, orgao_emissor, data_nascimento, 
        nacionalidade, estado_civil, profissao, email, telefone, 
        celular, cep, logradouro, numero, complemento, 
        bairro, cidade, estado, data_cadastro
      ) VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, 
        $16, $17, $18, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const values = [
      dadosPessoa.nome_completo,
      dadosPessoa.cpf,
      dadosPessoa.rg,
      dadosPessoa.orgao_emissor,
      dadosPessoa.data_nascimento,
      dadosPessoa.nacionalidade,
      dadosPessoa.estado_civil,
      dadosPessoa.profissao,
      dadosPessoa.email,
      dadosPessoa.telefone,
      dadosPessoa.celular,
      dadosPessoa.cep,
      dadosPessoa.logradouro,
      dadosPessoa.numero,
      dadosPessoa.complemento,
      dadosPessoa.bairro,
      dadosPessoa.cidade,
      dadosPessoa.estado,
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Atualiza um registro de pessoa física no banco de dados
 * @param {number} id - ID da pessoa física
 * @param {Object} dadosPessoa - Dados da pessoa física (já formatados)
 * @returns {Promise<Object>} - Pessoa física atualizada
 */
exports.atualizar = async (id, dadosPessoa) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Query para atualizar pessoa física
    const query = `
      UPDATE cadastros.pessoa_fisica SET
        nome_completo = $1,
        cpf = $2,
        rg = $3,
        orgao_emissor = $4,
        data_nascimento = $5,
        nacionalidade = $6,
        estado_civil = $7,
        profissao = $8,
        email = $9,
        telefone = $10,
        celular = $11,
        cep = $12,
        logradouro = $13,
        numero = $14,
        complemento = $15,
        bairro = $16,
        cidade = $17,
        estado = $18,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *
    `;

    const values = [
      dadosPessoa.nome_completo,
      dadosPessoa.cpf,
      dadosPessoa.rg,
      dadosPessoa.orgao_emissor,
      dadosPessoa.data_nascimento,
      dadosPessoa.nacionalidade,
      dadosPessoa.estado_civil,
      dadosPessoa.profissao,
      dadosPessoa.email,
      dadosPessoa.telefone,
      dadosPessoa.celular,
      dadosPessoa.cep,
      dadosPessoa.logradouro,
      dadosPessoa.numero,
      dadosPessoa.complemento,
      dadosPessoa.bairro,
      dadosPessoa.cidade,
      dadosPessoa.estado,
      id,
    ];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Pessoa física não encontrada');
    }

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Busca uma pessoa física pelo ID
 * @param {number} id - ID da pessoa física
 * @returns {Promise<Object>} - Pessoa física encontrada
 */
exports.buscarPorId = async (id) => {
  const query = 'SELECT * FROM cadastros.pessoa_fisica WHERE id = $1';
  const result = await pool.query(query, [id]);

  return result.rows[0];
};

/**
 * Busca pessoas físicas por CPF
 * @param {string} cpf - CPF formatado (apenas números)
 * @returns {Promise<Array>} - Pessoas físicas encontradas
 */
exports.buscarPorCPF = async (cpf) => {
  // Garantir que o CPF esteja formatado corretamente para a busca
  const cpfFormatado = formatCPF(cpf);

  const query = 'SELECT * FROM cadastros.pessoa_fisica WHERE cpf = $1';
  const result = await pool.query(query, [cpfFormatado]);

  return result.rows;
};

/**
 * Busca pessoas físicas com filtros
 * @param {Object} filtros - Filtros de busca
 * @param {number} page - Número da página
 * @param {number} limit - Limite de registros por página
 * @returns {Promise<Object>} - Resultado da busca com paginação
 */
exports.buscarPorFiltro = async (filtros, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM cadastros.pessoa_fisica WHERE 1=1';
  const values = [];
  let paramCount = 1;

  // Aplicar filtros
  if (filtros.nome_completo) {
    query += ` AND nome_completo ILIKE $${paramCount}`;
    values.push(`%${filtros.nome_completo}%`);
    paramCount++;
  }

  if (filtros.cpf) {
    query += ` AND cpf = $${paramCount}`;
    values.push(filtros.cpf);
    paramCount++;
  }

  if (filtros.cidade) {
    query += ` AND cidade ILIKE $${paramCount}`;
    values.push(`%${filtros.cidade}%`);
    paramCount++;
  }

  if (filtros.estado) {
    query += ` AND estado = $${paramCount}`;
    values.push(filtros.estado);
    paramCount++;
  }

  // Adicionar paginação
  query += ` ORDER BY nome_completo LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  // Executar query
  const result = await pool.query(query, values);

  // Contar total de registros
  let countQuery = 'SELECT COUNT(*) FROM cadastros.pessoa_fisica WHERE 1=1';
  let countValues = [];
  paramCount = 1;

  if (filtros.nome_completo) {
    countQuery += ` AND nome_completo ILIKE $${paramCount}`;
    countValues.push(`%${filtros.nome_completo}%`);
    paramCount++;
  }

  if (filtros.cpf) {
    countQuery += ` AND cpf = $${paramCount}`;
    countValues.push(filtros.cpf);
    paramCount++;
  }

  if (filtros.cidade) {
    countQuery += ` AND cidade ILIKE $${paramCount}`;
    countValues.push(`%${filtros.cidade}%`);
    paramCount++;
  }

  if (filtros.estado) {
    countQuery += ` AND estado = $${paramCount}`;
    countValues.push(filtros.estado);
    paramCount++;
  }

  const countResult = await pool.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    total,
    pagina: page,
    limite: limit,
    totalPaginas: Math.ceil(total / limit),
    pessoas: result.rows,
  };
};
