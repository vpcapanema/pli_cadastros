// backend/src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, transaction } = require('../config/database');
const authConfig = require('../config/auth');
const emailService = require('./emailService');

class AuthService {
  /**
   * Fazer login do usuário
   */
  static async login(email, password) {
    try {
      // Buscar usuário no banco
      const result = await query(`
        SELECT 
          id, email, nome, senha_hash, tipo_acesso, ativo,
          data_ultimo_login, tentativas_login, bloqueado_ate
        FROM usuarios.usuario_sistema 
        WHERE LOWER(email) = LOWER($1)
      `, [email]);

      if (result.rows.length === 0) {
        throw new Error('Email ou senha incorretos');
      }

      const user = result.rows[0];

      // Verificar se usuário está ativo
      if (!user.ativo) {
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      // Verificar se usuário está bloqueado
      if (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()) {
        throw new Error('Usuário temporariamente bloqueado. Tente novamente mais tarde.');
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.senha_hash);
      
      if (!passwordMatch) {
        // Incrementar tentativas de login
        await this.incrementLoginAttempts(user.id);
        throw new Error('Email ou senha incorretos');
      }

      // Reset tentativas de login em caso de sucesso
      await this.resetLoginAttempts(user.id);

      // Gerar token JWT
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo_acesso: user.tipo_acesso
      });

      // Atualizar último login
      await query(`
        UPDATE usuarios.usuario_sistema 
        SET data_ultimo_login = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [user.id]);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          tipo_acesso: user.tipo_acesso,
          data_ultimo_login: user.data_ultimo_login
        }
      };
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  }

  /**
   * Gerar token JWT
   */
  static generateToken(payload) {
    return jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
      issuer: 'PLI-Sistema',
      audience: 'PLI-Users'
    });
  }

  /**
   * Verificar token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, authConfig.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Incrementar tentativas de login
   */
  static async incrementLoginAttempts(userId) {
    try {
      const result = await query(`
        UPDATE usuarios.usuario_sistema 
        SET tentativas_login = COALESCE(tentativas_login, 0) + 1,
            bloqueado_ate = CASE 
              WHEN COALESCE(tentativas_login, 0) + 1 >= 5 
              THEN CURRENT_TIMESTAMP + INTERVAL '30 minutes'
              ELSE NULL 
            END
        WHERE id = $1
        RETURNING tentativas_login, bloqueado_ate
      `, [userId]);

      const user = result.rows[0];
      
      if (user.tentativas_login >= 5) {
        console.warn(`⚠️ Usuário ${userId} bloqueado por múltiplas tentativas`);
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar tentativas de login:', error.message);
    }
  }

  /**
   * Reset tentativas de login
   */
  static async resetLoginAttempts(userId) {
    try {
      await query(`
        UPDATE usuarios.usuario_sistema 
        SET tentativas_login = 0, bloqueado_ate = NULL 
        WHERE id = $1
      `, [userId]);
    } catch (error) {
      console.error('❌ Erro ao resetar tentativas de login:', error.message);
    }
  }

  /**
   * Iniciar recuperação de senha
   */
  static async initiatePasswordReset(email) {
    try {
      // Verificar se usuário existe
      const result = await query(`
        SELECT id, nome, email, ativo 
        FROM usuarios.usuario_sistema 
        WHERE LOWER(email) = LOWER($1)
      `, [email]);

      if (result.rows.length === 0) {
        // Por segurança, não revelar se email existe
        return { 
          success: true, 
          message: 'Se o email estiver cadastrado, você receberá instruções para redefinição.' 
        };
      }

      const user = result.rows[0];

      if (!user.ativo) {
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + authConfig.resetPasswordTokenExpiry);

      // Salvar token no banco
      await query(`
        UPDATE usuarios.usuario_sistema 
        SET reset_token = $1, reset_token_expiry = $2 
        WHERE id = $3
      `, [resetToken, resetExpiry, user.id]);

      // Enviar email
      await emailService.sendPasswordResetEmail(user.email, user.nome, resetToken);

      return {
        success: true,
        message: 'Instruções de redefinição enviadas para o seu email.'
      };
    } catch (error) {
      console.error('❌ Erro na recuperação de senha:', error.message);
      throw error;
    }
  }

  /**
   * Confirmar redefinição de senha
   */
  static async confirmPasswordReset(token, newPassword) {
    try {
      // Buscar usuário pelo token
      const result = await query(`
        SELECT id, email, nome, reset_token_expiry 
        FROM usuarios.usuario_sistema 
        WHERE reset_token = $1 AND ativo = true
      `, [token]);

      if (result.rows.length === 0) {
        throw new Error('Token de redefinição inválido ou expirado');
      }

      const user = result.rows[0];

      // Verificar se token não expirou
      if (new Date(user.reset_token_expiry) < new Date()) {
        throw new Error('Token de redefinição expirado');
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, authConfig.saltRounds);

      // Atualizar senha e limpar token
      await query(`
        UPDATE usuarios.usuario_sistema 
        SET senha_hash = $1, 
            reset_token = NULL, 
            reset_token_expiry = NULL,
            tentativas_login = 0,
            bloqueado_ate = NULL,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [hashedPassword, user.id]);

      return {
        success: true,
        message: 'Senha redefinida com sucesso. Faça login com a nova senha.'
      };
    } catch (error) {
      console.error('❌ Erro na confirmação de redefinição:', error.message);
      throw error;
    }
  }

  /**
   * Alterar senha (usuário logado)
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar senha atual
      const result = await query(`
        SELECT senha_hash 
        FROM usuarios.usuario_sistema 
        WHERE id = $1 AND ativo = true
      `, [userId]);

      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = result.rows[0];

      // Verificar senha atual
      const passwordMatch = await bcrypt.compare(currentPassword, user.senha_hash);
      
      if (!passwordMatch) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, authConfig.saltRounds);

      // Atualizar senha
      await query(`
        UPDATE usuarios.usuario_sistema 
        SET senha_hash = $1, data_atualizacao = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [hashedPassword, userId]);

      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro na alteração de senha:', error.message);
      throw error;
    }
  }

  /**
   * Validar força da senha
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = AuthService;
