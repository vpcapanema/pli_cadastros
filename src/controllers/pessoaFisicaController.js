/**
 * Controlador de Pessoa Física - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Gerencia operações relacionadas a pessoas físicas
 */
const {
  formatData,
  toUpperCase,
  capitalize,
  toTitleCase,
  formatCPF,
  formatPhone,
  formatCEP,
  formatEmail,
} = require('../utils/formatUtils');

/**
 * Valida os dados da pessoa física antes de criar/atualizar
 * @param {Object} dadosPessoa - Dados da pessoa física
 * @returns {Object} - Resultado da validação {valido, mensagens}
 */
function validarDadosPessoaFisica(dadosPessoa) {
  const mensagens = [];

  // Validar campos obrigatórios
  if (!dadosPessoa.nome_completo) {
    mensagens.push('Nome completo é obrigatório');
  }

  if (!dadosPessoa.cpf) {
    mensagens.push('CPF é obrigatório');
  } else if (dadosPessoa.cpf.replace(/[^\d]/g, '').length !== 11) {
    mensagens.push('CPF inválido');
  }

  if (dadosPessoa.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosPessoa.email)) {
    mensagens.push('Email inválido');
  }

  return {
    valido: mensagens.length === 0,
    mensagens,
  };
}

/**
 * Aplica regras de formatação para dados de pessoa física
 * @param {Object} dadosPessoa - Dados da pessoa física
 * @returns {Object} - Dados formatados
 */
function formatarDadosPessoaFisica(dadosPessoa) {
  // Definir regras de formatação para cada campo
  const regrasFormatacao = {
    nome_completo: toTitleCase,
    cpf: formatCPF,
    rg: toUpperCase,
    orgao_emissor: toUpperCase,
    nacionalidade: capitalize,
    estado_civil: capitalize,
    profissao: capitalize,
    email: formatEmail,
    telefone: formatPhone,
    celular: formatPhone,
    cep: formatCEP,
    logradouro: toTitleCase,
    numero: String,
    complemento: toTitleCase,
    bairro: toTitleCase,
    cidade: toTitleCase,
    estado: toUpperCase,
  };

  // Aplicar formatação usando a função formatData
  return formatData(dadosPessoa, regrasFormatacao);
}

/**
 * Cria um novo cadastro de pessoa física
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.criar = async (req, res) => {
  try {
    let dadosPessoa = req.body;

    // Validar dados da pessoa física
    const validacao = validarDadosPessoaFisica(dadosPessoa);
    if (!validacao.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados inválidos',
        erros: validacao.mensagens,
      });
    }

    // Aplicar formatação aos dados
    dadosPessoa = formatarDadosPessoaFisica(dadosPessoa);

    // Aqui seria feita a inserção no banco de dados
    // const novaPessoa = await pessoaFisicaModel.criar(dadosPessoa);

    // Simulando uma pessoa criada para teste
    const novaPessoa = {
      id: 'PF-' + Date.now().toString(36).toUpperCase(),
      ...dadosPessoa,
      data_cadastro: new Date(),
    };

    // Registrar logs do cadastro
    console.log(
      `Novo cadastro de pessoa física: ${novaPessoa.id} - ${novaPessoa.nome_completo} - CPF: ${novaPessoa.cpf}`
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Cadastro de pessoa física criado com sucesso',
      pessoa: novaPessoa,
    });
  } catch (error) {
    console.error('Erro ao criar cadastro de pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar cadastro de pessoa física',
      erro: error.message,
    });
  }
};

/**
 * Atualiza um cadastro de pessoa física existente
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    let dadosPessoa = req.body;

    // Validar dados da pessoa física
    const validacao = validarDadosPessoaFisica(dadosPessoa);
    if (!validacao.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados inválidos',
        erros: validacao.mensagens,
      });
    }

    // Aplicar formatação aos dados
    dadosPessoa = formatarDadosPessoaFisica(dadosPessoa);

    // Aqui seria feita a atualização no banco de dados
    // const pessoaAtualizada = await pessoaFisicaModel.atualizar(id, dadosPessoa);

    // Simulando uma pessoa atualizada para teste
    const pessoaAtualizada = {
      id,
      ...dadosPessoa,
      data_atualizacao: new Date(),
    };

    res.status(200).json({
      sucesso: true,
      mensagem: 'Cadastro de pessoa física atualizado com sucesso',
      pessoa: pessoaAtualizada,
    });
  } catch (error) {
    console.error('Erro ao atualizar cadastro de pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar cadastro de pessoa física',
      erro: error.message,
    });
  }
};

/**
 * Busca uma pessoa física pelo ID
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Aqui seria feita a busca no banco de dados
    // const pessoa = await pessoaFisicaModel.buscarPorId(id);

    // Simulando uma pessoa para teste
    const pessoa = {
      id,
      nome_completo: 'João da Silva',
      cpf: '12345678901',
      rg: '1234567',
      orgao_emissor: 'SSP/SP',
      data_nascimento: '1980-01-01',
      nacionalidade: 'Brasileira',
      estado_civil: 'Casado',
      profissao: 'Engenheiro',
      email: 'joao@exemplo.com',
      telefone: '1122334455',
      celular: '11987654321',
      cep: '01234567',
      logradouro: 'Rua Exemplo',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      data_cadastro: new Date(),
    };

    if (!pessoa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Pessoa física não encontrada',
      });
    }

    res.status(200).json({
      sucesso: true,
      pessoa,
    });
  } catch (error) {
    console.error('Erro ao buscar pessoa física:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar pessoa física',
      erro: error.message,
    });
  }
};

/**
 * Lista pessoas físicas com filtros
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.listar = async (req, res) => {
  try {
    const { nome, cpf, cidade, estado, page = 1, limit = 10 } = req.query;

    // Formatar parâmetros de busca
    const filtros = {};
    if (nome) filtros.nome_completo = nome;
    if (cpf) filtros.cpf = formatCPF(cpf);
    if (cidade) filtros.cidade = cidade;
    if (estado) filtros.estado = toUpperCase(estado);

    // Aqui seria feita a busca no banco de dados
    // const resultado = await pessoaFisicaModel.buscarPorFiltro(filtros, page, limit);

    // Simulando resultado para teste
    const pessoas = [
      {
        id: 'PF-1',
        nome_completo: 'João da Silva',
        cpf: '12345678901',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      {
        id: 'PF-2',
        nome_completo: 'Maria Oliveira',
        cpf: '98765432101',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
    ];

    res.status(200).json({
      sucesso: true,
      total: pessoas.length,
      pagina: parseInt(page),
      limite: parseInt(limit),
      pessoas,
    });
  } catch (error) {
    console.error('Erro ao listar pessoas físicas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar pessoas físicas',
      erro: error.message,
    });
  }
};
