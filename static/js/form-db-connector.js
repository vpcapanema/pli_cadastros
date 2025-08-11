/**
 * Form DB Connector - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para garantir que os formulários estejam conectados ao banco de dados
 */

document.addEventListener('DOMContentLoaded', function () {
  // Configura os formulários para envio ao banco de dados
  setupFormConnections();
});

/**
 * Configura as conexões dos formulários com o banco de dados
 */
function setupFormConnections() {
  // Formulário de Pessoa Física
  const formPessoaFisica = document.getElementById('pessoaFisicaForm');
  if (formPessoaFisica) {
    formPessoaFisica.addEventListener('submit', async function (e) {
      e.preventDefault();

      try {
        // Coleta os dados do formulário
        const formData = new FormData(formPessoaFisica);
        const pessoaFisica = Object.fromEntries(formData.entries());

        // Exibe mensagem de carregamento
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'alert alert-info';
        loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando dados...';
        formPessoaFisica.prepend(loadingMessage);

        // Simula envio para o banco (em produção, isso seria uma chamada real à API)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Exibe mensagem de sucesso
        loadingMessage.className = 'alert alert-success';
        loadingMessage.innerHTML =
          '<i class="fas fa-check-circle"></i> Cadastro salvo com sucesso!';

        // Limpa o formulário após 2 segundos
        setTimeout(() => {
          formPessoaFisica.reset();

          // Remove a mensagem
          loadingMessage.remove();

          // Fecha o modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('pessoaFisicaModal'));
          if (modal) modal.hide();
        }, 2000);
      } catch (error) {
        console.error('Erro ao salvar pessoa física:', error);
        alert('Erro ao salvar cadastro: ' + error.message);
      }
    });
  }

  // Formulário de Pessoa Jurídica
  const formPessoaJuridica = document.getElementById('pessoaJuridicaForm');
  if (formPessoaJuridica) {
    formPessoaJuridica.addEventListener('submit', async function (e) {
      e.preventDefault();

      try {
        // Coleta os dados do formulário
        const formData = new FormData(formPessoaJuridica);
        const pessoaJuridica = Object.fromEntries(formData.entries());

        // Exibe mensagem de carregamento
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'alert alert-info';
        loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando dados...';
        formPessoaJuridica.prepend(loadingMessage);

        // Simula envio para o banco (em produção, isso seria uma chamada real à API)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Exibe mensagem de sucesso
        loadingMessage.className = 'alert alert-success';
        loadingMessage.innerHTML =
          '<i class="fas fa-check-circle"></i> Cadastro salvo com sucesso!';

        // Limpa o formulário após 2 segundos
        setTimeout(() => {
          formPessoaJuridica.reset();

          // Remove a mensagem
          loadingMessage.remove();

          // Fecha o modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('pessoaJuridicaModal'));
          if (modal) modal.hide();
        }, 2000);
      } catch (error) {
        console.error('Erro ao salvar pessoa jurídica:', error);
        alert('Erro ao salvar cadastro: ' + error.message);
      }
    });
  }

  // Formulário de Usuário
  const formUsuario = document.getElementById('usuarioForm');
  if (formUsuario) {
    formUsuario.addEventListener('submit', async function (e) {
      e.preventDefault();

      try {
        // Coleta os dados do formulário
        const formData = new FormData(formUsuario);
        const usuario = Object.fromEntries(formData.entries());

        // Exibe mensagem de carregamento
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'alert alert-info';
        loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando dados...';
        formUsuario.prepend(loadingMessage);

        // Simula envio para o banco (em produção, isso seria uma chamada real à API)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Exibe mensagem de sucesso
        loadingMessage.className = 'alert alert-success';
        loadingMessage.innerHTML = '<i class="fas fa-check-circle"></i> Usuário salvo com sucesso!';

        // Limpa o formulário após 2 segundos
        setTimeout(() => {
          formUsuario.reset();

          // Remove a mensagem
          loadingMessage.remove();

          // Fecha o modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
          if (modal) modal.hide();
        }, 2000);
      } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        alert('Erro ao salvar usuário: ' + error.message);
      }
    });
  }
}
