/**
 * ================================================
 * INDEX PAGE - Statistics Loader Module
 * ================================================
 * Módulo responsável por carregar estatísticas da API
 * e atualizar os elementos da página inicial
 */

const IndexStatistics = {
  /**
   * Carrega estatísticas do banco de dados via API
   */
  async carregarEstatisticas() {
    try {
      // Carregar dados do banco via API
      const response = await fetch('/api/estatisticas');
      if (response.ok) {
        const dados = await response.json();

        // Atualizar os números nas telas
        this.atualizarElementos(dados);
      } else {
        // Valores padrão se a API não responder
        this.carregarValoresPadrao();
      }
    } catch (error) {
      console.log('Erro ao carregar estatísticas:', error);
      // Valores padrão em caso de erro
      this.carregarValoresPadrao();
    }
  },

  /**
   * Atualiza elementos DOM com dados da API
   * @param {Object} dados - Dados retornados da API
   */
  atualizarElementos(dados) {
    const elementos = {
      totalCadastros: dados.totalCadastros || '0',
      totalUsuarios: dados.totalUsuarios || '0',
      totalPF: dados.totalPF || '0',
      totalPJ: dados.totalPJ || '0',
    };

    for (const [id, valor] of Object.entries(elementos)) {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.textContent = valor;
      }
    }
  },

  /**
   * Carrega valores padrão em caso de falha da API
   */
  carregarValoresPadrao() {
    const valoresPadrao = {
      totalCadastros: '150',
      totalUsuarios: '25',
      totalPF: '95',
      totalPJ: '55',
    };

    this.atualizarElementos(valoresPadrao);
  },

  /**
   * Inicializa o módulo quando a página carregar
   */
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.carregarEstatisticas();
    });
  },
};

// Auto-inicialização
IndexStatistics.init();
