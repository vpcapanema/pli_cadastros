// backend/src/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const usuarioController = require('../controllers/usuarioController');

const { requireAuth, requireAdmin } = require('../middleware/auth');

// Listar usuários (apenas autenticado)
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('[DEBUG] Iniciando busca de usuários...');
    
    // Primeiro testa se as tabelas existem
    const testTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('usuarios', 'cadastro') 
      AND table_name IN ('usuario_sistema', 'pessoa_fisica')
    `);
    console.log('[DEBUG] Tabelas existentes:', testTables.rows.map(r => r.table_name));
    
    // Se as tabelas existem, busca os dados
    if (testTables.rows.length >= 2) {
      const sql = `
        SELECT 
          u.id, 
          u.username, 
          u.email, 
          u.tipo_usuario, 
          u.nivel_acesso,
          u.ativo, 
          u.data_ultimo_login,
          u.data_criacao,
          COALESCE(pf.nome_completo, u.username) AS nome
        FROM usuarios.usuario_sistema u
        LEFT JOIN cadastro.pessoa_fisica pf ON u.pessoa_fisica_id = pf.id
        ORDER BY u.username
      `;
      const result = await query(sql);
      console.log('[DEBUG] Usuários encontrados:', result.rows.length);
      res.json(result.rows);
    } else {
      // Se as tabelas não existem, retorna dados mockados
      console.log('[DEBUG] Tabelas não existem, retornando dados mockados');
      const dadosMock = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@exemplo.com',
          nome: 'Administrador Sistema',
          tipo_usuario: 'ADMIN',
          nivel_acesso: 5,
          ativo: true,
          data_ultimo_login: new Date(),
          data_criacao: new Date()
        },
        {
          id: 2,
          username: 'gestor',
          email: 'gestor@exemplo.com',
          nome: 'João Gestor Silva',
          tipo_usuario: 'GESTOR',
          nivel_acesso: 4,
          ativo: true,
          data_ultimo_login: new Date(),
          data_criacao: new Date()
        }
      ];
      res.json(dadosMock);
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    
    // Em caso de erro, retorna dados mockados
    const dadosMock = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@exemplo.com',
        nome: 'Administrador Sistema (Mock)',
        tipo_usuario: 'ADMIN',
        nivel_acesso: 5,
        ativo: true,
        data_ultimo_login: new Date(),
        data_criacao: new Date()
      }
    ];
    res.json(dadosMock);
  }
});

// Criar usuário (público)
router.post('/', usuarioController.criarSolicitacao);

// Listar solicitações pendentes (admin/gestor)
router.get('/solicitacoes/pendentes', requireAdmin, usuarioController.listarSolicitacoesPendentes);

// Aprovar solicitação (admin/gestor)
router.put('/solicitacoes/:id/aprovar', requireAdmin, usuarioController.aprovarSolicitacao);

// Rejeitar solicitação (admin/gestor)
router.put('/solicitacoes/:id/rejeitar', requireAdmin, usuarioController.rejeitarSolicitacao);

// Buscar usuário por ID (apenas autenticado)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados completos do usuário
    const sql = `
      SELECT 
        u.id, u.username, u.email, u.email_institucional, u.tipo_usuario, 
        u.nivel_acesso, u.departamento, u.cargo, u.ativo, u.status,
        u.primeiro_acesso, u.data_ultimo_login, u.tentativas_login, 
        u.bloqueado_ate, u.fuso_horario, u.idioma, u.data_criacao,
        u.data_atualizacao, u.telefone_institucional, u.ramal_institucional,
        u.pessoa_fisica_id, pf.nome_completo AS nome,
        pf.telefone_principal as telefone
      FROM usuarios.usuario_sistema u
      LEFT JOIN cadastro.pessoa_fisica pf ON u.pessoa_fisica_id = pf.id
      WHERE u.id = $1 AND u.ativo = true
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const usuario = result.rows[0];
    
    // Retornar dados do usuário
    res.json({
      id: usuario.id,
      nome: usuario.nome || usuario.username,
      email: usuario.email,
      email_institucional: usuario.email_institucional,
      telefone: usuario.telefone || usuario.telefone_institucional,
      cargo: usuario.cargo,
      departamento: usuario.departamento,
      tipo_usuario: usuario.tipo_usuario,
      nivel_acesso: usuario.nivel_acesso,
      ativo: usuario.ativo,
      status: usuario.status,
      data_criacao: usuario.data_criacao,
      data_ultimo_login: usuario.data_ultimo_login,
      ramal: usuario.ramal_institucional
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (apenas autenticado)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    res.json({ 
      message: 'Atualização de usuário em desenvolvimento',
      endpoint: `/api/usuarios/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    res.json({ 
      message: 'Exclusão de usuário em desenvolvimento',
      endpoint: `/api/usuarios/${req.params.id}`,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (apenas o próprio usuário ou admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cargo, departamento } = req.body;
    
    // Verificar se o usuário pode editar (próprio perfil ou admin)
    if (req.usuario.id !== id && req.usuario.nivel_acesso < 3) {
      return res.status(403).json({ error: 'Sem permissão para editar este usuário' });
    }
    
    // Atualizar dados do usuário
    const sql = `
      UPDATE usuarios.usuario_sistema 
      SET 
        cargo = $2,
        departamento = $3,
        telefone_institucional = $4,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $1 AND ativo = true
      RETURNING id, username, email, cargo, departamento, telefone_institucional
    `;
    
    const result = await query(sql, [id, cargo, departamento, telefone]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha do usuário
router.post('/:id/change-password', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    
    // Verificar se o usuário pode alterar a senha (próprio perfil ou admin)
    if (req.usuario.id !== id && req.usuario.nivel_acesso < 3) {
      return res.status(403).json({ error: 'Sem permissão para alterar senha deste usuário' });
    }
    
    // Para admin alterando senha de outro usuário, não precisa verificar senha atual
    if (req.usuario.id !== id && req.usuario.nivel_acesso >= 3) {
      const bcrypt = require('bcrypt');
      const saltRounds = 12;
      const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);
      
      const sql = `
        UPDATE usuarios.usuario_sistema 
        SET senha_hash = $2, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = $1 AND ativo = true
      `;
      
      await query(sql, [id, novaSenhaHash]);
      
      return res.json({
        success: true,
        message: 'Senha alterada com sucesso pelo administrador'
      });
    }
    
    // Para o próprio usuário, verificar senha atual
    const userSql = `
      SELECT senha_hash FROM usuarios.usuario_sistema 
      WHERE id = $1 AND ativo = true
    `;
    
    const userResult = await query(userSql, [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const bcrypt = require('bcrypt');
    const senhaAtualCorreta = await bcrypt.compare(senhaAtual, userResult.rows[0].senha_hash);
    
    if (!senhaAtualCorreta) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }
    
    // Gerar hash da nova senha
    const saltRounds = 12;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);
    
    // Atualizar senha
    const updateSql = `
      UPDATE usuarios.usuario_sistema 
      SET senha_hash = $2, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = $1 AND ativo = true
    `;
    
    await query(updateSql, [id, novaSenhaHash]);
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
