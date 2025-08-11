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
  if (!dadosUsuario.pessoa_fisica_id) {
    mensagens.push('Pessoa física (ID) é obrigatória');
  }
  if (!dadosUsuario.pessoa_juridica_id) {
    mensagens.push('Instituição (ID) é obrigatória');
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
    email: formatEmail,
    email_institucional: formatEmail,
    tipo_usuario: toUpperCase,
    username: toLowerCase,
    documento: formatCPF
    // pessoa_fisica_id e pessoa_juridica_id não precisam de formatação
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
    // Geração de campos de sistema
    dadosUsuario.ativo = false;
    dadosUsuario.email_verificado = false;
    dadosUsuario.primeiro_acesso = true;
    dadosUsuario.nivel_acesso = 1;
    dadosUsuario.fuso_horario = 'America/Sao_Paulo';
    dadosUsuario.idioma = 'pt-BR';
    dadosUsuario.tema_interface = 'light';
    // Geração de id e salt
    const id = 'PLI-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    // Hash da senha
    const senha_hash = crypto.pbkdf2Sync(dadosUsuario.senha, salt, 10000, 64, 'sha512').toString('hex');

    const insertSql = `INSERT INTO usuarios.usuario_sistema (
      username, email, senha_hash, salt, pessoa_fisica_id, pessoa_juridica_id, tipo_usuario, departamento, cargo, email_institucional, telefone_institucional, ramal_institucional
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    ) RETURNING id, pessoa_fisica_id, email, tipo_usuario, data_criacao`;

    const params = [
      dadosUsuario.username,
      dadosUsuario.email,
      senha_hash,
      salt,
      dadosUsuario.pessoa_fisica_id,
      dadosUsuario.pessoa_juridica_id, 
      dadosUsuario.tipo_usuario,
      dadosUsuario.departamento || null,
      dadosUsuario.cargo || null,
      dadosUsuario.email_institucional || null,
      dadosUsuario.telefone_institucional || null,
      dadosUsuario.ramal_institucional || null
    ];
    
    
    let novoUsuario;
    try {
      const result = await query(insertSql, params);
      if (!result.rows[0]) {
        console.error('[USUÁRIO] Falha ao inserir usuário no banco. Parâmetros:', params);
        throw new Error('Falha ao inserir usuário');
      }
      novoUsuario = result.rows[0];
      console.log(`[USUÁRIO] Usuário cadastrado com sucesso! ID: ${novoUsuario.id}, Pessoa Física: ${novoUsuario.pessoa_fisica_id}, Email: ${novoUsuario.email}, Tipo: ${novoUsuario.tipo_usuario}, Data: ${novoUsuario.data_criacao}`);
    } catch (dbError) {
      console.error('[USUÁRIO] Erro ao inserir usuário no banco:', dbError, '\nParâmetros:', params);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao salvar usuário no banco de dados. Por favor, tente novamente mais tarde.',
        erro: dbError.message
      });
    }

    // Buscar nome completo da pessoa física
    let nomeCompleto = '';
    try {
      const resultNome = await query('SELECT nome_completo FROM cadastro.pessoa_fisica WHERE id = $1', [dadosUsuario.pessoa_fisica_id]);
      if (resultNome.rows && resultNome.rows[0]) {
        nomeCompleto = resultNome.rows[0].nome_completo;
      }
    } catch (e) {
      console.warn('Não foi possível buscar nome completo da pessoa física:', e);
    }
    
    // Gerar token de verificação de email se houver email institucional
    let tokenVerificacao = null;
    if (dadosUsuario.email_institucional) {
      try {
        // Gerar token único para verificação de email
        const crypto = require('crypto');
        tokenVerificacao = crypto.randomBytes(32).toString('hex');
        
        // Definir expiração do token (24 horas a partir de agora)
        const expiraEm = new Date();
        expiraEm.setHours(expiraEm.getHours() + 24);
        
        // Atualizar o usuário com o token de verificação diretamente na tabela usuario_sistema
        await query(
          `UPDATE usuarios.usuario_sistema 
           SET token_verificacao_email = $1, token_expira_em = $2, data_atualizacao = NOW()
           WHERE id = $3`,
          [tokenVerificacao, expiraEm, novoUsuario.id]
        );
        
        console.log(`[USUÁRIO] Token de verificação de email gerado para usuário ID: ${novoUsuario.id}`);
      } catch (tokenError) {
        console.error('Erro ao gerar token de verificação de email:', tokenError);
        // Não bloquear o cadastro se falhar ao gerar token
      }
    }
    
    // Envia email de confirmação para o usuário, incluindo nome completo, para ambos os e-mails
    const destinatarios = [dadosUsuario.email, dadosUsuario.email_institucional].filter(Boolean);
    const emailUsuarioEnviado = await emailService.enviarConfirmacaoSolicitacao({ 
      ...novoUsuario, 
      ...dadosUsuario, 
      nome_completo: nomeCompleto, 
      to: destinatarios,
      token_verificacao: tokenVerificacao
    });
    // Notifica administradores sobre a nova solicitação
    const emailAdminEnviado = await emailService.notificarAdministradores({ ...novoUsuario, ...dadosUsuario });
    // Registrar logs detalhados da solicitação
    console.log(`[USUÁRIO] Nova solicitação criada: Protocolo: ${id} | Pessoa Física: ${dadosUsuario.pessoa_fisica_id} | Tipo: ${dadosUsuario.tipo_usuario} | Email: ${dadosUsuario.email} | Email institucional: ${dadosUsuario.email_institucional} | Instituição: ${dadosUsuario.instituicao}`);
    if (emailUsuarioEnviado) {
      console.log(`[USUÁRIO] Email de confirmação enviado para o usuário: ${dadosUsuario.email}`);
    } else {
      console.warn(`[USUÁRIO] Falha ao enviar email de confirmação para o usuário: ${dadosUsuario.email}`);
    }
    if (emailAdminEnviado) {
      console.log(`[USUÁRIO] Notificação enviada para administradores.`);
    } else {
      console.warn(`[USUÁRIO] Falha ao notificar administradores.`);
    }
    // Feedback detalhado ao usuário
    res.status(201).json({
      sucesso: true,
      mensagem: `Solicitação de cadastro recebida com sucesso! Seu protocolo é ${id}. Aguarde análise e verifique seu e-mail para confirmação.`,
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
    const { query } = require('../config/database');
    const updateSql = `UPDATE usuarios.usuario_sistema 
                       SET ativo = true, nivel_acesso = COALESCE($2, nivel_acesso), data_atualizacao = NOW()
                       WHERE id = $1
                       RETURNING id, username AS nome_completo, email, tipo_usuario, nivel_acesso, ativo`;
    let usuarioDb;
    try {
      const r = await query(updateSql, [id, nivel_acesso || null]);
      if (!r.rows.length) {
        return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
      }
      usuarioDb = r.rows[0];
    } catch (e) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar usuário', erro: e.message });
    }
    const emailEnviado = await emailService.enviarAprovacao(usuarioDb);
    res.status(200).json({ sucesso: true, mensagem: 'Solicitação de usuário aprovada com sucesso', usuario: usuarioDb, notificacoes: { emailEnviado } });
  } catch (error) {
    console.error('Erro ao aprovar solicitação de usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao aprovar solicitação de usuário', erro: error.message });
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
    const { query } = require('../config/database');
    const updateSql = `UPDATE usuarios.usuario_sistema 
                       SET ativo = false, data_atualizacao = NOW()
                       WHERE id = $1
                       RETURNING id, username AS nome_completo, email`;
    let usuarioDb;
    try {
      const r = await query(updateSql, [id]);
      if (!r.rows.length) {
        return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
      }
      usuarioDb = r.rows[0];
    } catch (e) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar usuário', erro: e.message });
    }
    const emailEnviado = await emailService.enviarRejeicao(usuarioDb, motivo);
    res.status(200).json({ sucesso: true, mensagem: 'Solicitação de usuário rejeitada', notificacoes: { emailEnviado } });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao rejeitar solicitação de usuário', erro: error.message });
  }
};

/**
 * Lista todas as solicitações pendentes
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.listarSolicitacoesPendentes = async (req, res) => {
  try {
    const { query } = require('../config/database');
    const selectSql = `SELECT id, username AS nome_completo, email, tipo_usuario, data_criacao
                       FROM usuarios.usuario_sistema
                       WHERE ativo = false
                       ORDER BY data_criacao DESC
                       LIMIT 200`;
    let solicitacoes = [];
    try {
      const r = await query(selectSql);
      solicitacoes = r.rows;
    } catch (e) {
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao consultar solicitações pendentes', erro: e.message });
    }
    res.status(200).json({ sucesso: true, total: solicitacoes.length, solicitacoes });
  } catch (error) {
    console.error('Erro ao listar solicitações pendentes:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar solicitações pendentes', erro: error.message });
  }
};