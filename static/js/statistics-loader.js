/**
 * Script para carregar estatísticas na página inicial
 */

document.addEventListener('DOMContentLoaded', function () {
  // Elementos que mostram as estatísticas
  const totalCadastrosEl = document.getElementById('totalCadastros');
  const totalUsuariosEl = document.getElementById('totalUsuarios');
  const totalPFEl = document.getElementById('totalPF');
  const totalPJEl = document.getElementById('totalPJ');

  // Função para carregar estatísticas do sistema
  async function loadStatistics() {
    try {
      // Em produção, isso seria uma chamada para a API real
      const response = await fetch('/api/estatisticas');

      if (response.ok) {
        const data = await response.json();

        // Atualiza os contadores com os dados reais
        if (totalCadastrosEl) totalCadastrosEl.textContent = data.totalCadastros || '0';
        if (totalUsuariosEl) totalUsuariosEl.textContent = data.totalUsuarios || '0';
        if (totalPFEl) totalPFEl.textContent = data.totalPF || '0';
        if (totalPJEl) totalPJEl.textContent = data.totalPJ || '0';
      } else {
        console.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);

      // Fallback para valores padrão em caso de erro
      if (totalCadastrosEl) totalCadastrosEl.textContent = '0';
      if (totalUsuariosEl) totalUsuariosEl.textContent = '0';
      if (totalPFEl) totalPFEl.textContent = '0';
      if (totalPJEl) totalPJEl.textContent = '0';
    }
  }

  // Carrega as estatísticas
  loadStatistics();
});
