/**
 * Controlador de Pessoa Jurídica - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Gerencia operações relacionadas a pessoas jurídicas
 */
const { formatData, toUpperCase, capitalize, toTitleCase, formatCNPJ, formatPhone, formatCEP, formatEmail } = require('../utils/formatUtils');

/**
 * Valida os dados da pessoa jurídica antes de criar/atualizar
 * @param {Object} dadosPessoa - Dados da pessoa jurídica
 * @returns {Object} - Resultado da validação {valido, mensagens}
 */
function validarDadosPessoaJuridica(dadosPessoa) {
  const mensagens = [];
  
  // Validar campos obrigatórios
  if (!dadosPessoa.razao_social) {
    mensagens.push('Razão social é obrigatória');
  }
  
  if (!dadosPessoa.cnpj) {
    mensagens.push('CNPJ é obrigatório');
  } else if (dadosPessoa.cnpj.replace(/[^\d]/g, '').length !== 14) {
    mensagens.push('CNPJ inválido');
  }
  
  if (dadosPessoa.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosPessoa.email)) {
    mensagens.push('Email inválido');
  }
  
  return {
    valido: mensagens.length === 0,
    mensagens
  };
}

/**
 * Aplica regras de formatação para dados de pessoa jurídica
 * @param {Object} dadosPessoa - Dados da pessoa jurídica
 * @returns {Object} - Dados formatados
 */
function formatarDadosPessoaJuridica(dadosPessoa) {
  // Definir regras de formatação para cada campo
  const regrasFormatacao = {
    razao_social: toUpperCase,
    nome_fantasia: toTitleCase,
    cnpj: formatCNPJ,
    inscricao_estadual: toUpperCase,
    inscricao_municipal: toUpperCase,
    natureza_juridica: toUpperCase,
    email: formatEmail,
    telefone: formatPhone,
    cep: formatCEP,
    logradouro: toTitleCase,
    numero: String,
    complemento: toTitleCase,
    bairro: toTitleCase,
    cidade: toTitleCase,
    estado: toUpperCase,
    porte: toUpperCase,
    cnae_principal: toUpperCase
  };
  
  // Aplicar formatação usando a função formatData
  return formatData(dadosPessoa, regrasFormatacao);
}

/**
 * Cria um novo cadastro de pessoa jurídica
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.criar = async (req, res) => {
  try {
    let dadosPessoa = req.body;
    
    // Validar dados da pessoa jurídica
    const validacao = validarDadosPessoaJuridica(dadosPessoa);
    if (!validacao.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados inválidos',
        erros: validacao.mensagens
      });
    }
    
    // Aplicar formatação aos dados
    dadosPessoa = formatarDadosPessoaJuridica(dadosPessoa);
    
    // Formatar dados dos sócios, se houver
    if (dadosPessoa.socios && Array.isArray(dadosPessoa.socios)) {
      dadosPessoa.socios = dadosPessoa.socios.map(socio => {
        return formatData(socio, {
          nome: toTitleCase,
          cpf: formatCPF,
          cargo: toUpperCase,
          email: formatEmail
        });
      });
    }
    
    // Aqui seria feita a inserção no banco de dados
    // const novaPessoa = await pessoaJuridicaModel.criar(dadosPessoa);
    
    // Simulando uma pessoa jurídica criada para teste
    const novaPessoa = {
      id: 'PJ-' + Date.now().toString(36).toUpperCase(),
      ...dadosPessoa,
      data_cadastro: new Date()
    };
    
    // Registrar logs do cadastro
    console.log(`Novo cadastro de pessoa jurídica: ${novaPessoa.id} - ${novaPessoa.razao_social} - CNPJ: ${novaPessoa.cnpj}`);
    
    res.status(201).json({
      sucesso: true,
      mensagem: 'Cadastro de pessoa jurídica criado com sucesso',
      pessoa: novaPessoa
    });
  } catch (error) {
    console.error('Erro ao criar cadastro de pessoa jurídica:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar cadastro de pessoa jurídica',
      erro: error.message
    });
  }
};

/**
 * Atualiza um cadastro de pessoa jurídica existente
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    let dadosPessoa = req.body;
    
    // Validar dados da pessoa jurídica
    const validacao = validarDadosPessoaJuridica(dadosPessoa);
    if (!validacao.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados inválidos',
        erros: validacao.mensagens
      });
    }
    
    // Aplicar formatação aos dados
    dadosPessoa = formatarDadosPessoaJuridica(dadosPessoa);
    
    // Formatar dados dos sócios, se houver
    if (dadosPessoa.socios && Array.isArray(dadosPessoa.socios)) {
      dadosPessoa.socios = dadosPessoa.socios.map(socio => {
        return formatData(socio, {
          nome: toTitleCase,
          cpf: formatCPF,
          cargo: toUpperCase,
          email: formatEmail
        });
      });
    }
    
    // Aqui seria feita a atualização no banco de dados
    // const pessoaAtualizada = await pessoaJuridicaModel.atualizar(id, dadosPessoa);
    
    // Simulando uma pessoa jurídica atualizada para teste
    const pessoaAtualizada = {
      id,
      ...dadosPessoa,
      data_atualizacao: new Date()
    };
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Cadastro de pessoa jurídica atualizado com sucesso',
      pessoa: pessoaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar cadastro de pessoa jurídica:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar cadastro de pessoa jurídica',
      erro: error.message
    });
  }
};

/**
 * Busca uma pessoa jurídica pelo ID
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Aqui seria feita a busca no banco de dados
    // const pessoa = await pessoaJuridicaModel.buscarPorId(id);
    
    // Simulando uma pessoa jurídica para teste
    const pessoa = {
      id,
      razao_social: 'EMPRESA EXEMPLO LTDA',
      nome_fantasia: 'Empresa Exemplo',
      cnpj: '12345678000199',
      inscricao_estadual: '123456789',
      inscricao_municipal: '987654321',
      natureza_juridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
      email: 'contato@exemplo.com',
      telefone: '1122334455',
      cep: '01234567',
      logradouro: 'Avenida Exemplo',
      numero: '1000',
      complemento: 'Andar 10',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      porte: 'MÉDIO',
      cnae_principal: '6201500',
      socios: [
        {
          nome: 'João da Silva',
          cpf: '12345678901',
          cargo: 'DIRETOR',
          email: 'joao@exemplo.com'
        },
        {
          nome: 'Maria Oliveira',
          cpf: '98765432101',
          cargo: 'SÓCIO',
          email: 'maria@exemplo.com'
        }
      ],
      data_cadastro: new Date()
    };
    
    if (!pessoa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Pessoa jurídica não encontrada'
      });
    }
    
    res.status(200).json({
      sucesso: true,
      pessoa
    });
  } catch (error) {
    console.error('Erro ao buscar pessoa jurídica:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar pessoa jurídica',
      erro: error.message
    });
  }
};

/**
 * Lista pessoas jurídicas com filtros
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.listar = async (req, res) => {
  try {
    const { razao_social, cnpj, cidade, estado, page = 1, limit = 10 } = req.query;
    
    // Formatar parâmetros de busca
    const filtros = {};
    if (razao_social) filtros.razao_social = toUpperCase(razao_social);
    if (cnpj) filtros.cnpj = formatCNPJ(cnpj);
    if (cidade) filtros.cidade = toTitleCase(cidade);
    if (estado) filtros.estado = toUpperCase(estado);
    
    // Aqui seria feita a busca no banco de dados
    // const resultado = await pessoaJuridicaModel.buscarPorFiltro(filtros, page, limit);
    
    // Simulando resultado para teste
    const pessoas = [
      {
        id: 'PJ-1',
        razao_social: 'EMPRESA EXEMPLO LTDA',
        nome_fantasia: 'Empresa Exemplo',
        cnpj: '12345678000199',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      {
        id: 'PJ-2',
        razao_social: 'CORPORAÇÃO MODELO S.A.',
        nome_fantasia: 'Corporação Modelo',
        cnpj: '98765432000199',
        cidade: 'Rio de Janeiro',
        estado: 'RJ'
      }
    ];
    
    res.status(200).json({
      sucesso: true,
      total: pessoas.length,
      pagina: parseInt(page),
      limite: parseInt(limit),
      pessoas
    });
  } catch (error) {
    console.error('Erro ao listar pessoas jurídicas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar pessoas jurídicas',
      erro: error.message
    });
  }
};