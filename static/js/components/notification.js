/**
 * Notification Component - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Componente para exibição de notificações
 */

const Notification = {
  /**
   * Exibe uma notificação de sucesso
   * @param {string} message - Mensagem a ser exibida
   * @param {Object} options - Opções adicionais
   */
  success(message, options = {}) {
    this.show({
      title: options.title || 'Sucesso!',
      text: message,
      icon: 'success',
      ...options,
    });
  },

  /**
   * Exibe uma notificação de erro
   * @param {string} message - Mensagem a ser exibida
   * @param {Object} options - Opções adicionais
   */
  error(message, options = {}) {
    this.show({
      title: options.title || 'Erro!',
      text: message,
      icon: 'error',
      ...options,
    });
  },

  /**
   * Exibe uma notificação de aviso
   * @param {string} message - Mensagem a ser exibida
   * @param {Object} options - Opções adicionais
   */
  warning(message, options = {}) {
    this.show({
      title: options.title || 'Atenção!',
      text: message,
      icon: 'warning',
      ...options,
    });
  },

  /**
   * Exibe uma notificação de informação
   * @param {string} message - Mensagem a ser exibida
   * @param {Object} options - Opções adicionais
   */
  info(message, options = {}) {
    this.show({
      title: options.title || 'Informação',
      text: message,
      icon: 'info',
      ...options,
    });
  },

  /**
   * Exibe uma notificação de confirmação
   * @param {string} message - Mensagem a ser exibida
   * @param {Function} confirmCallback - Função a ser executada ao confirmar
   * @param {Function} cancelCallback - Função a ser executada ao cancelar
   * @param {Object} options - Opções adicionais
   */
  confirm(message, confirmCallback, cancelCallback = null, options = {}) {
    Swal.fire({
      title: options.title || 'Confirmação',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Confirmar',
      cancelButtonText: options.cancelText || 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      ...options,
    }).then((result) => {
      if (result.isConfirmed && confirmCallback) {
        confirmCallback();
      } else if (result.dismiss === Swal.DismissReason.cancel && cancelCallback) {
        cancelCallback();
      }
    });
  },

  /**
   * Exibe uma notificação personalizada
   * @param {Object} options - Opções da notificação
   */
  show(options = {}) {
    Swal.fire({
      title: options.title || '',
      text: options.text || '',
      icon: options.icon || 'info',
      toast: options.toast || false,
      position: options.position || 'center',
      showConfirmButton: options.showConfirmButton !== undefined ? options.showConfirmButton : true,
      confirmButtonText: options.confirmButtonText || 'OK',
      confirmButtonColor: options.confirmButtonColor || '#007bff',
      timer: options.timer || null,
      timerProgressBar: options.timerProgressBar || false,
      ...options,
    });
  },

  /**
   * Exibe uma notificação do tipo toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo da notificação (success, error, warning, info)
   * @param {Object} options - Opções adicionais
   */
  toast(message, type = 'success', options = {}) {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
    };

    Swal.fire({
      text: message,
      icon: type,
      toast: true,
      position: options.position || 'top-end',
      showConfirmButton: false,
      timer: options.timer || 3000,
      timerProgressBar: true,
      ...options,
    });
  },
};
