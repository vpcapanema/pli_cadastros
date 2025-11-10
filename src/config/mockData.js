// Mock data para desenvolvimento quando o banco não está disponível
const mockStats = {
  totalPessoasFisicas: 1250,
  totalPessoasJuridicas: 340,
  totalUsuarios: 89,
  usuariosPorTipo: [
    { tipo_usuario: 'ADMIN', total: 5, ativos: 5, inativos: 0 },
    { tipo_usuario: 'OPERADOR', total: 45, ativos: 42, inativos: 3 },
    { tipo_usuario: 'CONSULTOR', total: 39, ativos: 35, inativos: 4 }
  ]
};

// Flag para controlar se usar mock ou banco real
const USE_MOCK = process.env.NODE_ENV === 'development' && process.env.USE_MOCK === 'true';

module.exports = {
  mockStats,
  USE_MOCK
};