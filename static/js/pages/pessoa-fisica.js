/**
 * Pessoa Física Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de cadastro de pessoa física
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] Pessoa física page - DOM carregado');

  // Verifica autenticação de forma mais robusta
  try {
    if (typeof Auth !== 'undefined' && Auth.isAuthenticated && !Auth.isAuthenticated()) {
      console.log('[DEBUG] Usuário não autenticado, redirecionando...');
      window.location.href = '/login.html';
      return;
    }
  } catch (e) {
    console.warn('[DEBUG] Erro ao verificar autenticação:', e);
    // Continua mesmo com erro de auth para debug
  }

  // Inicializa a página
  initPage();

  // Configura eventos
  setupEvents();

  // Carrega dados
  loadPessoasFisicas();
});

/**
 * Inicializa a página
 */
function initPage() {
  // Exibe nome do usuário
  const user = Auth.getUser();
  const userNameElement = document.getElementById('userName');
  if (user && userNameElement) {
    userNameElement.textContent = user.nome || user.email;
  }

  // Inicializa máscaras
  initMasks();

  // Inicializa validadores
  initValidators();
}

/**
 * Inicializa máscaras para os campos
 */
function initMasks() {
  // Máscara para CPF
  const cpfInputs = document.querySelectorAll('[data-mask="cpf"]');
  cpfInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      e.target.value = Utils.formatCPF(e.target.value);
    });
  });

  // Máscara para telefone
  const telefoneInputs = document.querySelectorAll('[data-mask="telefone"]');
  telefoneInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      e.target.value = Utils.formatTelefone(e.target.value);
    });
  });

  // Máscara para CEP
  const cepInputs = document.querySelectorAll('[data-mask="cep"]');
  cepInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 8) value = value.substring(0, 8);
      if (value.length > 5) {
        e.target.value = value.substring(0, 5) + '-' + value.substring(5);
      } else {
        e.target.value = value;
      }
    });
  });
}

/**
 * Inicializa validadores de formulário
 */
function initValidators() {
  // Formulário de cadastro
  const formCadastro = document.getElementById('formPessoaFisica');
  if (formCadastro) {
    new FormValidator(formCadastro);
  }

  // Formulário de pesquisa
  const formPesquisa = document.getElementById('formPesquisa');
  if (formPesquisa) {
    new FormValidator(formPesquisa, {
      validateOnSubmit: true,
      validateOnInput: false,
      validateOnBlur: false,
    });
  }
}

/**
 * Configura eventos da página
 */
function setupEvents() {
  // Evento de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();

      Notification.confirm('Deseja realmente sair do sistema?', () => {
        Auth.logout();
      });
    });
  }

  // Evento para novo cadastro
  const btnNovoCadastro = document.querySelector('[data-bs-target="#pessoaFisicaModal"]');
  if (btnNovoCadastro) {
    btnNovoCadastro.addEventListener('click', () => {
      // Limpa o formulário
      const form = document.getElementById('pessoaFisicaForm');
      if (form) {
        form.reset();
        form.removeAttribute('data-id');
        form.classList.remove('was-validated');

        // Reseta o título do modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
          modalTitle.innerHTML = '<i class="fas fa-user"></i> Nova Pessoa Física';
        }
      }
    });
  }

  // Evento para abrir modal de alteração de senha
  window.openChangePasswordModal = function () {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  };

  // Validação do formulário de alteração de senha
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    new FormValidator(changePasswordForm);

    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;

      try {
        Loading.show('Alterando senha...');

        await Auth.changePassword(currentPassword, newPassword);

        Loading.hide();
        Notification.success('Senha alterada com sucesso!');

        // Fecha o modal
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();

        // Limpa o formulário
        changePasswordForm.reset();
      } catch (error) {
        Loading.hide();
        Notification.error(error.message || 'Erro ao alterar senha');
      }
    });
  }

  // Evento para buscar CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      const cep = cepInput.value.replace(/\D/g, '');

      if (cep.length !== 8) return;

      try {
        Loading.showInElement('#endereco-container', {
          message: 'Buscando CEP...',
          spinnerOnly: false,
        });

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          throw new Error('CEP não encontrado');
        }

        document.getElementById('logradouro').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('estado').value = data.uf;

        // Foca no campo número
        document.getElementById('numero').focus();
      } catch (error) {
        Notification.error('CEP não encontrado ou serviço indisponível');
      } finally {
        Loading.hideInElement('#endereco-container');
      }
    });
  }

  // Evento para envio do formulário de cadastro
  const formCadastro = document.getElementById('pessoaFisicaForm');
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!formCadastro.checkValidity()) {
        e.stopPropagation();
        formCadastro.classList.add('was-validated');
        return;
      }

      // Coleta os dados do formulário
      const formData = new FormData(formCadastro);
      const pessoaFisica = Object.fromEntries(formData.entries());

      // Remove formatação de campos se existirem
      if (pessoaFisica.cpf) pessoaFisica.cpf = pessoaFisica.cpf.replace(/\D/g, '');
      if (pessoaFisica.telefone_principal)
        pessoaFisica.telefone_principal = pessoaFisica.telefone_principal.replace(/\D/g, '');
      if (pessoaFisica.telefone_secundario)
        pessoaFisica.telefone_secundario = pessoaFisica.telefone_secundario.replace(/\D/g, '');
      if (pessoaFisica.cep) pessoaFisica.cep = pessoaFisica.cep.replace(/\D/g, '');

      // Converte checkbox para boolean
      pessoaFisica.ativo = formData.has('ativo');

      try {
        Loading.show('Salvando cadastro...');

        // Verifica se é edição ou novo cadastro
        const pessoaId = formCadastro.dataset.id;
        let response;

        if (pessoaId) {
          response = await API.put(`/pessoa-fisica/${pessoaId}`, pessoaFisica);
          Notification.success('Cadastro atualizado com sucesso!');
        } else {
          response = await API.post('/pessoa-fisica', pessoaFisica);
          Notification.success('Cadastro criado com sucesso!');
        }

        Loading.hide();

        // Limpa o formulário
        formCadastro.reset();
        formCadastro.removeAttribute('data-id');
        formCadastro.classList.remove('was-validated');

        // Reseta o título do modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
          modalTitle.innerHTML = '<i class="fas fa-user"></i> Nova Pessoa Física';
        }

        // Atualiza a tabela
        loadPessoasFisicas();

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('pessoaFisicaModal'));
        if (modal) {
          modal.hide();
        }
      } catch (error) {
        Loading.hide();
        console.error('Erro ao salvar cadastro:', error);
        Notification.error(error.message || 'Erro ao salvar cadastro');
      }
    });
  }

  // Evento para pesquisa
  const formPesquisa = document.getElementById('formPesquisa');
  if (formPesquisa) {
    formPesquisa.addEventListener('submit', (e) => {
      e.preventDefault();
      loadPessoasFisicas();
    });
  }

  // Evento para limpar pesquisa
  const btnLimparPesquisa = document.getElementById('btnLimparPesquisa');
  if (btnLimparPesquisa) {
    btnLimparPesquisa.addEventListener('click', () => {
      formPesquisa.reset();
      loadPessoasFisicas();
    });
  }

  // Funções globais para os filtros
  window.aplicarFiltros = function () {
    loadPessoasFisicas();
  };

  window.limparFiltros = function () {
    document.getElementById('filtroNome').value = '';
    document.getElementById('filtroCpf').value = '';
    document.getElementById('filtroEmail').value = '';
    document.getElementById('filtroAtivo').value = '';
    loadPessoasFisicas();
  };
}

/**
 * Carrega a lista de pessoas físicas
 */
async function loadPessoasFisicas() {
  try {
    console.log('[DEBUG] Iniciando loadPessoasFisicas...');
    Loading.show('Carregando cadastros...');

    // Obtém os parâmetros de pesquisa dos filtros
    const searchParams = {
      nome: document.getElementById('filtroNome')?.value || '',
      cpf: document.getElementById('filtroCpf')?.value?.replace(/\D/g, '') || '',
      email: document.getElementById('filtroEmail')?.value || '',
      ativo: document.getElementById('filtroAtivo')?.value || '',
    };

    // Remove parâmetros vazios
    Object.keys(searchParams).forEach((key) => {
      if (!searchParams[key]) delete searchParams[key];
    });

    console.log('[DEBUG] Parâmetros de busca:', searchParams);

    // Realiza a busca
    console.log('[DEBUG] Fazendo requisição para /api/pessoa-fisica');
    const pessoasFisicas = await API.get('/pessoa-fisica', searchParams);
    console.log('[DEBUG] Dados recebidos via API.get:', pessoasFisicas);

    // Renderiza a tabela
    renderTable(pessoasFisicas);

    Loading.hide();
  } catch (error) {
    Loading.hide();
    Notification.error('Erro ao carregar cadastros');
    console.error('Erro ao carregar pessoas físicas:', error);
  }
}

/**
 * Renderiza a tabela de pessoas físicas
 * @param {Array} pessoasFisicas - Lista de pessoas físicas
 */
function renderTable(pessoasFisicas) {
  const tbody = document.querySelector('#pessoaFisicaTable tbody');

  if (!pessoasFisicas || pessoasFisicas.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Nenhum cadastro encontrado
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = '';

  pessoasFisicas.forEach((pessoa) => {
    const row = document.createElement('tr');

    // Define a classe de status baseado no campo 'ativo'
    let statusClass = '';
    let statusText = '';

    if (pessoa.ativo === true) {
      statusClass = 'bg-success';
      statusText = 'Ativo';
    } else if (pessoa.ativo === false) {
      statusClass = 'bg-danger';
      statusText = 'Inativo';
    } else {
      statusClass = 'bg-secondary';
      statusText = 'Desconhecido';
    }

    // Formatar cidade/UF
    const cidadeUf = pessoa.cidade && pessoa.uf ? `${pessoa.cidade}/${pessoa.uf}` : '-';

    row.innerHTML = `
            <td>${pessoa.nome_completo || '-'}</td>
            <td>${Utils.formatCPF ? Utils.formatCPF(pessoa.cpf) : pessoa.cpf || '-'}</td>
            <td>${pessoa.email || '-'}</td>
            <td>${Utils.formatTelefone ? Utils.formatTelefone(pessoa.telefone) : pessoa.telefone || '-'}</td>
            <td>${cidadeUf}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-primary btn-editar" data-id="${pessoa.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger btn-excluir" data-id="${pessoa.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });

  // Adiciona eventos aos botões
  setupTableEvents();
}

/**
 * Configura eventos da tabela
 */
function setupTableEvents() {
  // Evento para editar
  document.querySelectorAll('.btn-editar').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;

      try {
        Loading.show('Carregando cadastro...');

        const pessoa = await API.get(`/pessoa-fisica/${id}`);

        // Preenche o formulário
        const form = document.getElementById('pessoaFisicaForm');
        form.dataset.id = id;

        // Limpa o formulário primeiro
        form.reset();

        // Preenche os campos conforme os nomes no formulário
        document.getElementById('nomeCompleto').value = pessoa.nome_completo || '';
        document.getElementById('nomeSocial').value = pessoa.nome_social || '';
        document.getElementById('cpf').value = pessoa.cpf || '';
        document.getElementById('dataNascimento').value = pessoa.data_nascimento || '';
        document.getElementById('sexo').value = pessoa.sexo || '';
        document.getElementById('estadoCivil').value = pessoa.estado_civil || '';
        document.getElementById('nacionalidade').value = pessoa.nacionalidade || '';
        document.getElementById('naturalidade').value = pessoa.naturalidade || '';

        // Documentos
        if (document.getElementById('rg')) document.getElementById('rg').value = pessoa.rg || '';
        if (document.getElementById('orgaoExpeditor'))
          document.getElementById('orgaoExpeditor').value = pessoa.rg_orgao_expedidor || '';
        if (document.getElementById('ufRg'))
          document.getElementById('ufRg').value = pessoa.uf_rg || '';

        // Contato
        if (document.getElementById('email'))
          document.getElementById('email').value = pessoa.email_principal || '';
        if (document.getElementById('emailSecundario'))
          document.getElementById('emailSecundario').value = pessoa.email_secundario || '';
        if (document.getElementById('telefone'))
          document.getElementById('telefone').value = pessoa.telefone_principal || '';
        if (document.getElementById('telefoneSecundario'))
          document.getElementById('telefoneSecundario').value = pessoa.telefone_secundario || '';

        // Endereço
        if (document.getElementById('cep')) document.getElementById('cep').value = pessoa.cep || '';
        if (document.getElementById('logradouro'))
          document.getElementById('logradouro').value = pessoa.logradouro || '';
        if (document.getElementById('numero'))
          document.getElementById('numero').value = pessoa.numero || '';
        if (document.getElementById('complemento'))
          document.getElementById('complemento').value = pessoa.complemento || '';
        if (document.getElementById('bairro'))
          document.getElementById('bairro').value = pessoa.bairro || '';
        if (document.getElementById('cidade'))
          document.getElementById('cidade').value = pessoa.cidade || '';
        if (document.getElementById('uf'))
          document.getElementById('uf').value = pessoa.estado || '';

        // Outros
        if (document.getElementById('profissao'))
          document.getElementById('profissao').value = pessoa.profissao || '';
        if (document.getElementById('escolaridade'))
          document.getElementById('escolaridade').value = pessoa.escolaridade || '';
        if (document.getElementById('rendaMensal'))
          document.getElementById('rendaMensal').value = pessoa.renda_mensal || '';
        if (document.getElementById('ativo'))
          document.getElementById('ativo').checked = pessoa.ativo || false;

        // Atualiza o título do modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
          modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Pessoa Física';
        }

        Loading.hide();

        // Abre o modal
        const modal = new bootstrap.Modal(document.getElementById('pessoaFisicaModal'));
        modal.show();
      } catch (error) {
        Loading.hide();
        console.error('Erro ao carregar cadastro:', error);
        Notification.error('Erro ao carregar cadastro para edição');
      }
    });
  });

  // Evento para excluir
  document.querySelectorAll('.btn-excluir').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const row = btn.closest('tr');
      const nome = row.querySelector('td:first-child').textContent;

      // Preenche o nome no modal de confirmação
      const deleteItemName = document.getElementById('deleteItemName');
      if (deleteItemName) {
        deleteItemName.textContent = nome;
      }

      // Configura o botão de confirmação
      const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
      if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = async () => {
          try {
            Loading.show('Excluindo cadastro...');

            await API.delete(`/pessoa-fisica/${id}`);

            Loading.hide();
            Notification.success('Cadastro excluído com sucesso!');

            // Fecha o modal
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            if (deleteModal) {
              deleteModal.hide();
            }

            // Atualiza a tabela
            loadPessoasFisicas();
          } catch (error) {
            Loading.hide();
            console.error('Erro ao excluir cadastro:', error);
            Notification.error(error.message || 'Erro ao excluir cadastro');
          }
        };
      }

      // Abre o modal de confirmação
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    });
  });
}
