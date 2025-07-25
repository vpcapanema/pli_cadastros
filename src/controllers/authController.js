/**
 * Controlador de Autenticação - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Responsável pela autenticação de usuários
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './config/.env' });

/**
 * Realiza o login do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.login = async (req, res) => {
  try {
    const { email, password, tipo_usuario } = req.body;
    
    // Validar dados de entrada
    if (!email || !password) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email e senha são obrigatórios'
      });
    }
    
    // Buscar usuário pelo email
    // Em produção, isso seria uma consulta ao banco de dados
    // const usuario = await usuarioModel.buscarPorEmail(email);
    
    // Simulação para demonstração
    const usuario = buscarUsuarioSimulado(email, tipo_usuario);
    
    // Verificar se o usuário existe
    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Usuário inativo. Aguarde a aprovação do administrador.'
      });
    }
    
    // Verificar a senha
    // Em produção, isso seria uma comparação com hash
    // const senhaCorreta = await bcrypt.compare(password, usuario.senha_hash);
    
    // Simulação para demonstração
    const senhaCorreta = password === 'senha123'; // Senha simulada
    
    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }
    
    // Se o tipo de usuário foi especificado, verificar se o usuário tem esse tipo
    if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario) {
      // Buscar se o usuário tem outro perfil com o tipo solicitado
      const outroPerfilUsuario = buscarUsuarioSimulado(email, tipo_usuario);
      
      if (!outroPerfilUsuario) {
        return res.status(403).json({
          sucesso: false,
          mensagem: `Você não possui um perfil do tipo ${tipo_usuario}`
        });
      }
      
      // Se encontrou outro perfil com o tipo solicitado, usar esse perfil
      usuario = outroPerfilUsuario;
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome_completo,
        tipo_usuario: usuario.tipo_usuario,
        nivel_acesso: usuario.nivel_acesso
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Retornar token e dados do usuário
    res.status(200).json({
      sucesso: true,
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome_completo,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        nivel_acesso: usuario.nivel_acesso
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar login',
      erro: error.message
    });
  }
};

/**
 * Realiza o logout do usuário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.logout = async (req, res) => {
  try {
    // Em uma implementação real, poderia invalidar o token no servidor
    // ou adicionar à lista de tokens inválidos
    
    // Limpar cookie de autenticação
    res.clearCookie('token');
    
    res.status(200).json({
      sucesso: true,
      mensagem: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar logout',
      erro: error.message
    });
  }
};

/**
 * Verifica se o usuário está autenticado
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
exports.verificarAutenticacao = async (req, res) => {
  try {
    // O middleware de autenticação já verificou o token
    // e adicionou os dados do usuário ao objeto req
    
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Não autenticado'
      });
    }
    
    res.status(200).json({
      sucesso: true,
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação',
      erro: error.message
    });
  }
};

/**
 * Busca um usuário simulado para demonstração
 * @param {string} email - Email do usuário
 * @param {string} tipo_usuario - Tipo de usuário (opcional)
 * @returns {Object|null} - Usuário encontrado ou null
 */
function buscarUsuarioSimulado(email, tipo_usuario) {
  // Dados simulados de usuários
  const usuarios = [
    {
      id: '1',
      nome_completo: 'Administrador',
      email: 'admin@exemplo.com',
      documento: '123.456.789-00',
      tipo_usuario: 'ADMIN',
      nivel_acesso: 5,
      ativo: true
    },
    {
      id: '2',
      nome_completo: 'Administrador',
      email: 'admin@exemplo.com',
      documento: '123.456.789-00',
      tipo_usuario: 'GESTOR',
      nivel_acesso: 4,
      ativo: true
    },
    {
      id: '3',
      nome_completo: 'João Silva',
      email: 'joao@exemplo.com',
      documento: '987.654.321-00',
      tipo_usuario: 'ANALISTA',
      nivel_acesso: 3,
      ativo: true
    },
    {
      id: '4',
      nome_completo: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      documento: '111.222.333-44',
      tipo_usuario: 'OPERADOR',
      nivel_acesso: 2,
      ativo: true
    },
    {
      id: '5',
      nome_completo: 'Carlos Santos',
      email: 'carlos@exemplo.com',
      documento: '555.666.777-88',
      tipo_usuario: 'VISUALIZADOR',
      nivel_acesso: 1,
      ativo: false // Usuário inativo
    }
  ];
  
  // Filtrar pelo email
  const usuariosFiltrados = usuarios.filter(u => u.email === email);
  
  // Se não especificou tipo, retorna o primeiro usuário encontrado
  if (!tipo_usuario && usuariosFiltrados.length > 0) {
    return usuariosFiltrados[0];
  }
  
  // Se especificou tipo, busca o usuário com esse tipo
  if (tipo_usuario) {
    return usuariosFiltrados.find(u => u.tipo_usuario === tipo_usuario) || null;
  }
  
  return null;
}