/**
 * Modal Fix - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para corrigir problemas com modais Bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  // Corrige os botões de abertura de modais
  setupModalButtons();

  // Configura os formulários para envio ao banco de dados
  setupFormSubmissions();
});

/**
 * Configura os botões para abrir os modais corretamente
 */
function setupModalButtons() {
  // Botão de Pessoa Física
  const btnPessoaFisica = document.querySelector('button[data-bs-target="#pessoaFisicaModal"]');
  if (btnPessoaFisica) {
    btnPessoaFisica.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('pessoaFisicaModal'));
      modal.show();
    });
  }

  // Botão de Pessoa Jurídica
  const btnPessoaJuridica = document.querySelector('button[data-bs-target="#pessoaJuridicaModal"]');
  if (btnPessoaJuridica) {
    btnPessoaJuridica.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('pessoaJuridicaModal'));
      modal.show();
    });
  }

  // Botão de Usuário
  const btnUsuario = document.querySelector('button[data-bs-target="#usuarioModal"]');
  if (btnUsuario) {
    btnUsuario.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
      modal.show();
    });
  }
}

/**
 * Configura os formulários para envio ao banco de dados
 */
function setupFormSubmissions() {
  // Formulário de Pessoa Física
  const formPessoaFisica = document.getElementById('pessoaFisicaForm');
  if (formPessoaFisica) {
    formPessoaFisica.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Coleta os dados do formulário
      const formData = new FormData(formPessoaFisica);
      const pessoaFisica = Object.fromEntries(formData.entries());

      try {
        // Envia os dados para o servidor
        const response = await fetch('/api/pessoa-fisica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(pessoaFisica),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar cadastro');
        }

        // Exibe mensagem de sucesso
        alert('Cadastro salvo com sucesso!');

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('pessoaFisicaModal'));
        modal.hide();

        // Recarrega a página para atualizar a lista
        window.location.reload();
      } catch (error) {
        alert(error.message || 'Erro ao salvar cadastro');
      }
    });
  }

  // Formulário de Pessoa Jurídica
  const formPessoaJuridica = document.getElementById('pessoaJuridicaForm');
  if (formPessoaJuridica) {
    formPessoaJuridica.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Coleta os dados do formulário
      const formData = new FormData(formPessoaJuridica);
      const pessoaJuridica = Object.fromEntries(formData.entries());

      try {
        // Envia os dados para o servidor
        const response = await fetch('/api/pessoa-juridica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(pessoaJuridica),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar cadastro');
        }

        // Exibe mensagem de sucesso
        alert('Cadastro salvo com sucesso!');

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('pessoaJuridicaModal'));
        modal.hide();

        // Recarrega a página para atualizar a lista
        window.location.reload();
      } catch (error) {
        alert(error.message || 'Erro ao salvar cadastro');
      }
    });
  }

  // Formulário de Usuário
  const formUsuario = document.getElementById('usuarioForm');
  if (formUsuario) {
    formUsuario.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Coleta os dados do formulário
      const formData = new FormData(formUsuario);
      const usuario = Object.fromEntries(formData.entries());

      try {
        // Envia os dados para o servidor
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(usuario),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar usuário');
        }

        // Exibe mensagem de sucesso
        alert('Usuário salvo com sucesso!');

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        modal.hide();

        // Recarrega a página para atualizar a lista
        window.location.reload();
      } catch (error) {
        alert(error.message || 'Erro ao salvar usuário');
      }
    });
  }
}
