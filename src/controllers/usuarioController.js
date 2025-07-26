/**
 * Controlador de Usuários - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Gerencia operações relacionadas a usuários
 */
const emailService = require('../services/emailService');
const { formatData, toUpperCase, capitalize, toTitleCase, formatCPF, formatEmail, toLowerCase } = require('../utils/formatUtils');

/**
 * Valida os dados do usuário antes de criar a solicitação
 * @param {Object} dadosUsuario - Dados do usuário
 * @returns {Object} - Resultado da validação {valido, mensagens}
 */
function validarDadosUsuario(dadosUsuario) {
  const mensagens = [];
  
  // Validar campos obrigatórios
  if (!dadosUsuario.nome_completo) {
    mensagens.push('Nome completo é obrigatório');
  }
  
  if (!dadosUsuario.email) {
    mensagens.push('Email é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosUsuario.email)) {
    mensagens.push('Email inválido');
  }
  
  if (!dadosUsuario.email_institucional) {
    mensagens.push('Email institucional é obrigatório');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosUsuario.email_institucional)) {
    mensagens.push('Email institucional inválido');
  }
  
  if (!dadosUsuario.instituicao) {
    mensagens.push('Instituição é obrigatória');
  }
  
  if (!dadosUsuario.tipo_usuario) {
    mensagens.push('Tipo de usuário é obrigatório');
  }
  
  if (!dadosUsuario.username) {
    mensagens.push('Nome de usuário é obrigatório');
  }
  
  if (!dadosUsuario.senha) {
    mensagens.push('Senha é obrigatória');
  } else if (dadosUsuario.senha.length < 8) {
    mensagens.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  return {
    valido: mensagens.length === 0,
    mensagens
  };
}

/**
 * Verifica se já existe um usuário com o mesmo CPF e tipo
 * @param {string} documento - CPF do usuário
 * @param {string} tipo_usuario - Tipo de usuário
 * @returns {Promise<boolean>} - True se já existe, False caso contrário
 */
async function verificarUsuarioExistente(documento, tipo_usuario) {
  try {
    // Em produção, isso seria uma consulta ao banco de dados
    // const result = await query(
    //   'SELECT * FROM usuarios.usuario_sistema WHERE documento = $1 AND tipo_usuario = $2',
    //   [documento, tipo_usuario]
    // );
    // return result.rows.length > 0;
    
    // Simulação para demonstração
    return false; // Assume que não existe usuário com esse CPF e tipo
  } catch (error) {
    console.error('Erro ao verificar usuário existente:', error);
    return false;
  }
}

/**
 * Cria uma nova solicitação de usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
/**
 * Aplica regras de formatação para dados de usuário
 * @param {Object} dadosUsuario - Dados do usuário
 * @returns {Object} - Dados formatados
 */
function formatarDadosUsuario(dadosUsuario) {
  // Definir regras de formatação para cada campo
  const regrasFormatacao = {
    nome_completo: toTitleCase,
    email: formatEmail,
    email_institucional: formatEmail,
    instituicao: toUpperCase,
    tipo_usuario: toUpperCase,
    username: toLowerCase,
    documento: formatCPF
  };
  
  // Aplicar formatação usando a função formatData
  return formatData(dadosUsuario, regrasFormatacao);
}

const { query } = require('../config/database');

exports.criarSolicitacao = async (req, res) => {
  try {
    let dadosUsuario = req.body;
    // O frontend deve enviar pessoa_fisica_id (não nome_completo)
    if (!dadosUsuario.pessoa_fisica_id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Selecione um nome válido (pessoa física)',
        erros: ['O campo pessoa_fisica_id é obrigatório']
      });
    }
    const validacao = validarDadosUsuario(dadosUsuario);
    if (!validacao.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados inválidos',
        erros: validacao.mensagens
      });
    }
    dadosUsuario = formatarDadosUsuario(dadosUsuario);
    const usuarioExistente = await verificarUsuarioExistente(dadosUsuario.documento, dadosUsuario.tipo_usuario);
    if (usuarioExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Já existe um usuário com este CPF e tipo de acesso',
        erro: 'USUARIO_DUPLICADO'
      });
    }
    dadosUsuario.ativo = false;
    const id = 'PLI-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();

    // Inserção real no banco de dados (usando pessoa_fisica_id)
    const insertSql = `INSERT INTO usuarios.usuario_sistema (
      id, pessoa_fisica_id, email, email_institucional, instituicao, tipo_usuario, username, senha, documento, ativo, data_criacao
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
    ) RETURNING id, pessoa_fisica_id, email, tipo_usuario, data_criacao`;
    const params = [
      id,
      dadosUsuario.pessoa_fisica_id,
      dadosUsuario.email,
      dadosUsuario.email_institucional,
      dadosUsuario.instituicao,
      dadosUsuario.tipo_usuario,
      dadosUsuario.username,
      dadosUsuario.senha,
      dadosUsuario.documento,
      dadosUsuario.ativo
    ];
    let novoUsuario;
    try {
      const result = await query(insertSql, params);
      if (!result.rows[0]) {
        throw new Error('Falha ao inserir usuário');
      }
      novoUsuario = result.rows[0];
    } catch (dbError) {
      console.error('Erro ao inserir usuário no banco:', dbError);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao salvar usuário no banco de dados',
        erro: dbError.message
      });
    }

    // Envia email de confirmação para o usuário
    const emailUsuarioEnviado = await emailService.enviarConfirmacaoSolicitacao({ ...novoUsuario, ...dadosUsuario });
    // Notifica administradores sobre a nova solicitação
    const emailAdminEnviado = await emailService.notificarAdministradores({ ...novoUsuario, ...dadosUsuario });
    // Registrar logs da solicitação
    console.log(`Nova solicitação de usuário criada: ${id} - pessoa_fisica_id: ${dadosUsuario.pessoa_fisica_id} - Tipo: ${dadosUsuario.tipo_usuario}`);
    res.status(201).json({
      sucesso: true,
      mensagem: 'Solicitação de usuário criada com sucesso',
      protocolo: id,
      usuario: {
        id: novoUsuario.id,
        pessoa_fisica_id: novoUsuario.pessoa_fisica_id,
        email: novoUsuario.email,
        tipo_usuario: novoUsuario.tipo_usuario,
        data_criacao: novoUsuario.data_criacao
      },
      notificacoes: {
        emailUsuario: emailUsuarioEnviado,
        emailAdmin: emailAdminEnviado
      }
    });
  } catch (error) {
    console.error('Erro ao criar solicitação de usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar solicitação de usuário',
      erro: error.message
    });
  }
};

/**
 * Aprova uma solicitação de usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.aprovarSolicitacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { nivel_acesso } = req.body;
    
    // Aqui seria feita a busca e atualização no banco de dados
    // const usuario = await usuarioModel.buscarPorId(id);
    // await usuarioModel.atualizar(id, { ativo: true, nivel_acesso });
    
    // Simulando um usuário para teste
    const usuario = {
      id,
      nome_completo: 'Nome do Usuário',
      email: 'usuario@exemplo.com',
      tipo_usuario: 'ANALISTA',
      nivel_acesso: nivel_acesso || 1,
      ativo: true
    };
    
    // Envia email de aprovação para o usuário
    const emailEnviado = await emailService.enviarAprovacao(usuario);
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Solicitação de usuário aprovada com sucesso',
      usuario,
      notificacoes: {
        emailEnviado
      }
    });
  } catch (error) {
    console.error('Erro ao aprovar solicitação de usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao aprovar solicitação de usuário',
      erro: error.message
    });
  }
};

/**
 * Rejeita uma solicitação de usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.rejeitarSolicitacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    // Aqui seria feita a busca e exclusão/marcação no banco de dados
    // const usuario = await usuarioModel.buscarPorId(id);
    // await usuarioModel.marcarComoRejeitado(id, motivo);
    
    // Simulando um usuário para teste
    const usuario = {
      id,
      nome_completo: 'Nome do Usuário',
      email: 'usuario@exemplo.com'
    };
    
    // Envia email de rejeição para o usuário
    const emailEnviado = await emailService.enviarRejeicao(usuario, motivo);
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Solicitação de usuário rejeitada',
      notificacoes: {
        emailEnviado
      }
    });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao rejeitar solicitação de usuário',
      erro: error.message
    });
  }
};

/**
 * Lista todas as solicitações pendentes
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.listarSolicitacoesPendentes = async (req, res) => {
  try {
    // Aqui seria feita a busca no banco de dados
    // const solicitacoes = await usuarioModel.buscarPorFiltro({ ativo: false });
    
    // Simulando solicitações para teste
    const solicitacoes = [
      {
        id: 'uuid-1',
        nome_completo: 'João Silva',
        email: 'joao@exemplo.com',
        tipo_usuario: 'ANALISTA',
        instituicao: 'Empresa ABC',
        data_criacao: new Date()
      },
      {
        id: 'uuid-2',
        nome_completo: 'Maria Oliveira',
        email: 'maria@exemplo.com',
        tipo_usuario: 'OPERADOR',
        instituicao: 'Empresa XYZ',
        data_criacao: new Date()
      }
    ];
    
    res.status(200).json({
      sucesso: true,
      total: solicitacoes.length,
      solicitacoes
    });
  } catch (error) {
    console.error('Erro ao listar solicitações pendentes:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar solicitações pendentes',
      erro: error.message
    });
  }
};