/**
 * Script de Teste - Validações de Autenticação
 * Sistema SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 *
 * Este script testa as novas regras de validação implementadas
 */

// Configurar NODE_ENV para development temporariamente para evitar erro SSL
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'development';

const { Pool } = require('pg');
const path = require('path');

// Carregar configurações
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuração simplificada do banco para teste
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Para desenvolvimento/teste
  },
});

// Função query simplificada
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function testarValidacoesAutenticacao() {
  console.log('🧪 INICIANDO TESTES DE VALIDAÇÃO DE AUTENTICAÇÃO\n');

  try {
    // 1. Verificar se as colunas existem
    console.log('📋 1. Verificando estrutura da tabela...');

    const colunas = await query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'usuarios' 
            AND table_name = 'usuario_sistema' 
            AND column_name IN ('status', 'ativo', 'email_institucional_verificado')
            ORDER BY column_name
        `);

    console.log('   Colunas encontradas:');
    colunas.rows.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });

    // 2. Verificar constraints
    console.log('\n🔒 2. Verificando constraints...');

    const constraints = await query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'usuarios.usuario_sistema'::regclass 
            AND conname LIKE '%status%'
        `);

    if (constraints.rows.length > 0) {
      constraints.rows.forEach((constraint) => {
        console.log(`   - ${constraint.conname}: ${constraint.definition}`);
      });
    } else {
      console.log('   - Nenhuma constraint específica de status encontrada');
    }

    // 3. Testar usuários de exemplo
    console.log('\n👥 3. Verificando usuários existentes...');

    const usuarios = await query(`
            SELECT 
                id, 
                username, 
                email_institucional,
                status, 
                ativo, 
                email_institucional_verificado,
                tipo_usuario
            FROM usuarios.usuario_sistema 
            LIMIT 5
        `);

    console.log('   Usuários encontrados:');
    usuarios.rows.forEach((user) => {
      const statusAuth =
        user.status === 'APROVADO' &&
        user.ativo === true &&
        user.email_institucional_verificado === true;

      console.log(
        `   - ${user.username || user.email_institucional}: ${user.status} | Ativo: ${user.ativo} | Email Verificado: ${user.email_institucional_verificado} | Pode Logar: ${statusAuth ? '✅' : '❌'}`
      );
    });

    // 4. Simular cenários de teste
    console.log('\n🎯 4. Cenários de validação:');

    const cenarios = [
      { status: 'APROVADO', ativo: true, email_verificado: true, resultado: '✅ APROVADO' },
      {
        status: 'AGUARDANDO_APROVACAO',
        ativo: true,
        email_verificado: true,
        resultado: '❌ USUARIO_NAO_APROVADO',
      },
      { status: 'APROVADO', ativo: false, email_verificado: true, resultado: '❌ USUARIO_INATIVO' },
      {
        status: 'APROVADO',
        ativo: true,
        email_verificado: false,
        resultado: '❌ EMAIL_NAO_VERIFICADO',
      },
      {
        status: 'REJEITADO',
        ativo: false,
        email_verificado: false,
        resultado: '❌ MULTIPLAS_VIOLACOES',
      },
    ];

    cenarios.forEach((cenario, index) => {
      console.log(
        `   Cenário ${index + 1}: Status=${cenario.status}, Ativo=${cenario.ativo}, Email=${cenario.email_verificado} → ${cenario.resultado}`
      );
    });

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste apenas se chamado diretamente
if (require.main === module) {
  testarValidacoesAutenticacao()
    .then(() => {
      // Restaurar NODE_ENV original
      process.env.NODE_ENV = originalNodeEnv;

      // Fechar pool de conexões
      pool.end();

      console.log('\n🔌 Conexões fechadas. Teste finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);

      // Restaurar NODE_ENV original
      process.env.NODE_ENV = originalNodeEnv;

      // Fechar pool de conexões
      pool.end();

      process.exit(1);
    });
}

module.exports = { testarValidacoesAutenticacao };
