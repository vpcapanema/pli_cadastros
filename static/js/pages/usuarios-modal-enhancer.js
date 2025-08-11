/**
 * ================================================
 * USUARIOS PAGE - Modal Enhancement Module
 * ================================================
 * Módulo para melhorar funcionalidade dos modais
 * da página de usuários
 */

const UsuariosModalEnhancer = {
  /**
   * Inicializa melhorias para modais
   */
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupModalTriggers();
    });
  },

  /**
   * Configura gatilhos para modais
   */
  setupModalTriggers() {
    // Força a abertura do modal quando o botão é clicado
    const btnNovoUsuario = document.querySelector('button[data-bs-target="#usuarioModal"]');
    if (btnNovoUsuario) {
      btnNovoUsuario.addEventListener('click', (e) => {
        e.preventDefault();
        this.openUsuarioModal();
      });
    }

    // Outros gatilhos de modal podem ser adicionados aqui
    this.setupEditModals();
    this.setupDeleteModals();
  },

  /**
   * Abre o modal de usuário
   */
  openUsuarioModal() {
    const modalElement = document.getElementById('usuarioModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.warn('Modal usuarioModal não encontrado ou Bootstrap não carregado');
    }
  },

  /**
   * Configura modais de edição
   */
  setupEditModals() {
    const editButtons = document.querySelectorAll('[data-bs-target*="edit"]');
    editButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const targetModal = button.getAttribute('data-bs-target');
        if (targetModal) {
          const modalElement = document.querySelector(targetModal);
          if (modalElement && typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      });
    });
  },

  /**
   * Configura modais de confirmação de exclusão
   */
  setupDeleteModals() {
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Lógica de confirmação pode ser implementada aqui
        // Usando SweetAlert2 se disponível
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Confirmar exclusão?',
            text: 'Esta ação não pode ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              // Executar ação de exclusão
              this.performDelete(button);
            }
          });
        }
      });
    });
  },

  /**
   * Executa a exclusão do usuário
   * @param {HTMLElement} button - Botão que disparou a ação
   */
  performDelete(button) {
    const userId = button.getAttribute('data-user-id');
    if (userId && window.UsuariosController) {
      // Chama método do controller principal se disponível
      window.UsuariosController.deleteUser(userId);
    }
  },
};

// Auto-inicialização
UsuariosModalEnhancer.init();
