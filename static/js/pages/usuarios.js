/**
 * Usuários Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de gerenciamento de usuários
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[DEBUG] Usuários page - DOM carregado');

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
  await initPage();

  // Configura eventos
  setupEvents();

  // Carrega dados
  loadUsuarios();
});

/**
 * Inicializa a página
 */
async function initPage() {
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

  // Adiciona validação personalizada para email institucional
  addCustomValidations();

  // Carrega listas para os selects
  try {
    await loadPessoasFisicas();
    await loadInstituicoes();
  } catch (error) {
    console.error('Erro ao carregar listas:', error);
  }
}

/**
 * Inicializa máscaras para os campos
 */
function initMasks() {
  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      e.target.value = Utils.formatTelefone(e.target.value);
    });
  }

  // Máscara para telefone institucional
  const telefoneInstitucionalInput = document.getElementById('telefoneInstitucional');
  if (telefoneInstitucionalInput) {
    telefoneInstitucionalInput.addEventListener('input', (e) => {
      e.target.value = Utils.formatTelefone(e.target.value);
    });
  }
}

/**
 * Inicializa validadores de formulário
 */
function initValidators() {
  // Formulário de cadastro
  const formCadastro = document.getElementById('usuarioForm');
  if (formCadastro) {
    new FormValidator(formCadastro);
  }

  // Formulário de alteração de senha
  const formSenha = document.getElementById('changePasswordForm');
  if (formSenha) {
    new FormValidator(formSenha);
  }
}

/**
 * Adiciona validações personalizadas
 */
function addCustomValidations() {
  // Validação para email institucional não ser igual ao email pessoal
  const emailInstitucional = document.getElementById('emailInstitucional');
  const emailPessoal = document.getElementById('email');

  if (emailInstitucional && emailPessoal) {
    emailInstitucional.addEventListener('blur', function () {
      const emailPessoalValue = emailPessoal.value.trim().toLowerCase();
      const emailInstitucionalValue = this.value.trim().toLowerCase();

      if (
        emailInstitucionalValue &&
        emailPessoalValue &&
        emailInstitucionalValue === emailPessoalValue
      ) {
        this.classList.add('is-invalid');
        const feedbackElement = this.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
          feedbackElement.textContent = 'O email institucional deve ser diferente do email pessoal';
        }
      } else {
        this.classList.remove('is-invalid');
        const feedbackElement = this.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
          feedbackElement.textContent = '';
        }
      }
    });
  }

  // Validação para username único (seria necessário implementar verificação no backend)
  const usernameField = document.getElementById('username');
  if (usernameField) {
    usernameField.addEventListener('blur', async function () {
      const username = this.value.trim();
      if (username && username.length >= 3) {
        // Aqui poderia ser implementada uma verificação no backend
        // para verificar se o username já existe
        console.log('[DEBUG] Verificação de username único:', username);
      }
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

  // Evento para novo usuário
  const btnNovoUsuario = document.getElementById('btnNovoUsuario');
  if (btnNovoUsuario) {
    btnNovoUsuario.addEventListener('click', () => {
      // Limpa o formulário
      const form = document.getElementById('usuarioForm');
      form.reset();
      form.removeAttribute('data-id');

      // Mostra a seção de senha
      document.getElementById('passwordSection').style.display = 'block';

      // Atualiza o título do modal
      document.getElementById('modalTitle').innerHTML =
        '<i class="fas fa-user-plus"></i> Novo Usuário';

      // Configura os campos como obrigatórios
      document.getElementById('senha').setAttribute('required', '');
      document.getElementById('confirmarSenha').setAttribute('required', '');

      // Limpa todos os campos
      const clearField = (fieldId) => {
        const element = document.getElementById(fieldId);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = false;
          } else {
            element.value = '';
          }
        }
      };

      // Limpa campos específicos
      clearField('nome');
      clearField('idPessoaFisica');
      clearField('email');
      clearField('telefone');
      clearField('documento');
      clearField('instituicaoNome');
      clearField('idPessoaJuridica');
      clearField('departamento');
      clearField('cargo');
      clearField('emailInstitucional');
      clearField('telefoneInstitucional');
      clearField('ramalInstitucional');
      clearField('tipo_usuario');
      clearField('username');
      clearField('nivelAcesso');

      // Configurações padrão
      document.getElementById('ativo').checked = true;
      document.getElementById('primeiroLogin').checked = true;
      document.getElementById('nivelAcesso').value = '1';

      // Mostra/esconde seções adequadas
      document.getElementById('passwordSection').style.display = 'block';
      document.getElementById('termsSection').style.display = 'block';
    });
  }
}

// Evento para envio do formulário de cadastro
const formCadastro = document.getElementById('usuarioForm');
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formCadastro.checkValidity()) {
      e.stopPropagation();
      return;
    }

    // Coleta os dados do formulário
    const formData = new FormData(formCadastro);
    const usuario = Object.fromEntries(formData.entries());

    // Ajusta os valores booleanos
    usuario.ativo = formData.get('ativo') === 'on';
    usuario.primeiro_acesso = formData.get('primeiro_login') === 'on';
    usuario.termo_privacidade = formData.get('termo_privacidade') === 'on';
    usuario.termo_uso = formData.get('termo_uso') === 'on';

    // Validação personalizada: pelo menos um telefone deve ser preenchido
    const telefone = usuario.telefone?.replace(/\D/g, '') || '';
    const telefoneInstitucional = usuario.telefone_institucional?.replace(/\D/g, '') || '';

    if (!telefone && !telefoneInstitucional) {
      Notification.error('Pelo menos um telefone (pessoal ou institucional) deve ser informado');
      return;
    }

    // Validação personalizada: emails devem ser diferentes
    if (
      usuario.email &&
      usuario.email_institucional &&
      usuario.email.toLowerCase() === usuario.email_institucional.toLowerCase()
    ) {
      Notification.error('O email institucional deve ser diferente do email pessoal');
      return;
    }

    // Remove a confirmação de senha
    delete usuario.confirmarSenha;

    // Remove formatação de campos de telefone
    if (usuario.telefone) {
      usuario.telefone = usuario.telefone.replace(/\D/g, '');
    }
    if (usuario.telefone_institucional) {
      usuario.telefone_institucional = usuario.telefone_institucional.replace(/\D/g, '');
    }

    try {
      Loading.show('Salvando usuário...');

      // Verifica se é edição ou novo cadastro
      const usuarioId = formCadastro.dataset.id;
      let response;

      if (usuarioId) {
        // Se for edição e não tiver senha, remove o campo
        if (!usuario.senha) {
          delete usuario.senha;
        }

        response = await API.put(`/usuarios/${usuarioId}`, usuario);
      } else {
        response = await API.post('/usuarios', usuario);
      }

      Loading.hide();
      Notification.success('Usuário salvo com sucesso!');

      // Limpa o formulário
      formCadastro.reset();
      formCadastro.removeAttribute('data-id');

      // Atualiza a tabela
      loadUsuarios();

      // Fecha o modal
      bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
    } catch (error) {
      Loading.hide();
      Notification.error(error.message || 'Erro ao salvar usuário');
    }
  });
}

// Evento para envio do formulário de alteração de senha
const formSenha = document.getElementById('changePasswordForm');
if (formSenha) {
  formSenha.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formSenha.checkValidity()) {
      e.stopPropagation();
      return;
    }

    // Coleta os dados do formulário
    const novaSenha = document.getElementById('novaSenha').value;
    const forcarAlteracao = document.getElementById('forcarAlteracao').checked;
    const usuarioId = formSenha.dataset.userId;

    try {
      Loading.show('Alterando senha...');

      await API.post(`/usuarios/${usuarioId}/alterar-senha`, {
        novaSenha,
        forcarAlteracao,
      });

      Loading.hide();
      Notification.success('Senha alterada com sucesso!');

      // Limpa o formulário
      formSenha.reset();
      formSenha.removeAttribute('data-userId');

      // Fecha o modal
      bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
    } catch (error) {
      Loading.hide();
      Notification.error(error.message || 'Erro ao alterar senha');
    }
  });
}

// Funções para filtros
window.aplicarFiltrosUsuarios = function () {
  loadUsuarios();
};

window.limparFiltrosUsuarios = function () {
  document.getElementById('filtroNome').value = '';
  document.getElementById('filtroEmail').value = '';
  document.getElementById('filtroTipoAcesso').value = '';
  document.getElementById('filtroAtivo').value = '';

  loadUsuarios();
};

/**
 * Carrega a lista de usuários
 */
async function loadUsuarios() {
  try {
    console.log('[DEBUG] Iniciando loadUsuarios...');
    Loading.show('Carregando usuários...');

    // Obtém os parâmetros de pesquisa
    const params = {
      nome: document.getElementById('filtroNome')?.value || '',
      email: document.getElementById('filtroEmail')?.value || '',
      tipoAcesso: document.getElementById('filtroTipoAcesso')?.value || '',
      ativo: document.getElementById('filtroAtivo')?.value || '',
    };

    // Remove parâmetros vazios
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    console.log('[DEBUG] Parâmetros de busca:', params);

    // Realiza a busca
    console.log('[DEBUG] Fazendo requisição para /api/usuarios');
    const usuarios = await API.get('/usuarios', params);
    console.log('[DEBUG] Dados recebidos via API.get:', usuarios);

    // Renderiza a tabela
    renderTable(usuarios);

    Loading.hide();
  } catch (error) {
    Loading.hide();
    Notification.error('Erro ao carregar usuários');
    console.error('Erro ao carregar usuários:', error);
  }
}

/**
 * Carrega a lista de pessoas físicas para o select
 */
async function loadPessoasFisicas() {
  try {
    console.log('[DEBUG] Iniciando loadPessoasFisicas...');

    const selectNome = document.getElementById('nome');
    console.log('[DEBUG] Select nome encontrado:', selectNome);

    if (!selectNome) {
      console.error('[DEBUG] Select #nome não encontrado!');
      return;
    }

    console.log('[DEBUG] Fazendo requisição para /pessoas-fisicas...');
    const pessoasFisicas = await API.get('/pessoas-fisicas');
    console.log('[DEBUG] Pessoas físicas carregadas:', pessoasFisicas.length, 'registros');

    // Limpa as opções existentes, mantendo apenas a primeira
    selectNome.innerHTML = '<option value="">Selecione uma pessoa física cadastrada</option>';
    console.log('[DEBUG] Select limpo');

    // Adiciona as pessoas físicas
    pessoasFisicas.forEach((pessoa, index) => {
      const option = document.createElement('option');
      option.value = pessoa.id;
      option.textContent = pessoa.nome_completo;
      option.dataset.email = pessoa.email_principal || '';
      option.dataset.telefone = pessoa.telefone_principal || '';
      option.dataset.cpf = pessoa.cpf || '';
      selectNome.appendChild(option);
      console.log(`[DEBUG] Adicionada pessoa ${index + 1}: ${pessoa.nome_completo}`);
    });

    console.log('[DEBUG] Total de opções no select:', selectNome.options.length);

    // Adiciona evento para preencher campos relacionados
    selectNome.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.value) {
        document.getElementById('idPessoaFisica').value = selectedOption.value;
        document.getElementById('email').value = selectedOption.dataset.email || '';
        document.getElementById('telefone').value =
          Utils.formatTelefone(selectedOption.dataset.telefone) || '';
        document.getElementById('documento').value = selectedOption.dataset.cpf || '';

        // Gera username baseado no email
        const email = selectedOption.dataset.email;
        if (email) {
          const username = email.split('@')[0];
          document.getElementById('username').value = username;
        }
      } else {
        // Limpa os campos se nenhuma opção for selecionada
        document.getElementById('idPessoaFisica').value = '';
        document.getElementById('email').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('documento').value = '';
        document.getElementById('username').value = '';
      }
    });

    console.log('[DEBUG] Evento change adicionado ao select nome');
  } catch (error) {
    console.error('Erro ao carregar pessoas físicas:', error);
    Notification.error('Erro ao carregar lista de pessoas físicas');
  }
}

/**
 * Carrega a lista de instituições para o select
 */
async function loadInstituicoes() {
  try {
    console.log('[DEBUG] Iniciando loadInstituicoes...');

    const selectInstituicao = document.getElementById('instituicaoNome');
    console.log('[DEBUG] Select instituicaoNome encontrado:', selectInstituicao);

    if (!selectInstituicao) {
      console.error('[DEBUG] Select #instituicaoNome não encontrado!');
      return;
    }

    console.log('[DEBUG] Fazendo requisição para /instituicoes...');
    const instituicoes = await API.get('/instituicoes');
    console.log('[DEBUG] Instituições carregadas:', instituicoes.length, 'registros');

    // Limpa as opções existentes, mantendo apenas a primeira
    selectInstituicao.innerHTML = '<option value="">Selecione uma instituição</option>';
    console.log('[DEBUG] Select instituição limpo');

    // Adiciona as instituições
    instituicoes.forEach((instituicao, index) => {
      const option = document.createElement('option');
      option.value = instituicao.id;
      option.textContent = instituicao.razao_social;
      selectInstituicao.appendChild(option);
      console.log(`[DEBUG] Adicionada instituição ${index + 1}: ${instituicao.razao_social}`);
    });

    console.log('[DEBUG] Total de opções no select instituição:', selectInstituicao.options.length);

    // Adiciona evento para preencher campos relacionados
    selectInstituicao.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.value) {
        document.getElementById('idPessoaJuridica').value = selectedOption.value;
      } else {
        document.getElementById('idPessoaJuridica').value = '';
      }
    });

    console.log('[DEBUG] Evento change adicionado ao select instituição');
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    Notification.error('Erro ao carregar lista de instituições');
  }
}

/**
 * Renderiza a tabela de usuários
 * @param {Array} usuarios - Lista de usuários
 */
function renderTable(usuarios) {
  const tbody = document.querySelector('#usuariosTable tbody');

  if (!usuarios || usuarios.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = '';

  usuarios.forEach((usuario) => {
    const row = document.createElement('tr');

    // Define a classe de status baseado no campo 'ativo'
    let statusClass = usuario.ativo ? 'bg-success' : 'bg-danger';
    let statusText = usuario.ativo ? 'Ativo' : 'Inativo';

    // Formata o tipo de acesso baseado no tipo_usuario
    let tipoAcesso = usuario.tipo_usuario || '-';

    // Formata a data do último acesso
    let ultimoAcesso = '-';
    if (usuario.data_ultimo_acesso) {
      const dataAcesso = new Date(usuario.data_ultimo_acesso);
      ultimoAcesso = dataAcesso.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    row.innerHTML = `
            <td>${usuario.nome || usuario.username || '-'}</td>
            <td>${usuario.email || '-'}</td>
            <td><span class="badge bg-info">${tipoAcesso}</span></td>
            <td>${ultimoAcesso}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-primary btn-editar" data-id="${usuario.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-warning btn-senha" data-id="${usuario.id}" data-nome="${usuario.nome || usuario.username}" title="Alterar Senha">
                    <i class="fas fa-key"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger btn-excluir" data-id="${usuario.id}" data-nome="${usuario.nome || usuario.username}" title="Excluir">
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
        Loading.show('Carregando usuário...');

        const usuario = await API.get(`/usuarios/${id}`);

        // Preenche o formulário
        const form = document.getElementById('usuarioForm');
        form.dataset.id = id;

        // Esconde a seção de senha e termos para edição
        document.getElementById('passwordSection').style.display = 'none';
        const termsSection = document.getElementById('termsSection');
        if (termsSection) {
          termsSection.style.display = 'none';
        }

        // Remove a obrigatoriedade da senha
        document.getElementById('senha').removeAttribute('required');
        document.getElementById('confirmarSenha').removeAttribute('required');

        // Atualiza o título do modal
        document.getElementById('modalTitle').innerHTML =
          '<i class="fas fa-user-edit"></i> Editar Usuário';

        // Preenche os campos básicos com verificação segura
        const setFieldValue = (fieldId, value) => {
          const element = document.getElementById(fieldId);
          if (element) {
            if (element.type === 'checkbox') {
              element.checked = value;
            } else {
              element.value = value || '';
            }
          } else {
            console.warn(`Campo ${fieldId} não encontrado no formulário`);
          }
        };

        // Preenche todos os campos do formulário
        setFieldValue('nome', usuario.pessoa_fisica_id); // Será o ID da pessoa física para o select
        setFieldValue('idPessoaFisica', usuario.pessoa_fisica_id);
        setFieldValue('email', usuario.email);
        setFieldValue('telefone', Utils.formatTelefone(usuario.telefone));
        setFieldValue('documento', usuario.cpf || usuario.documento);
        setFieldValue('instituicaoNome', usuario.pessoa_juridica_id); // Será o ID da pessoa jurídica para o select
        setFieldValue('idPessoaJuridica', usuario.pessoa_juridica_id);
        setFieldValue('departamento', usuario.departamento);
        setFieldValue('cargo', usuario.cargo);
        setFieldValue('emailInstitucional', usuario.email_institucional);
        setFieldValue(
          'telefoneInstitucional',
          Utils.formatTelefone(usuario.telefone_institucional)
        );
        setFieldValue('ramalInstitucional', usuario.ramal_institucional);
        setFieldValue('tipo_usuario', usuario.tipo_usuario);
        setFieldValue('username', usuario.username);
        setFieldValue('nivelAcesso', usuario.nivel_acesso || 1);
        setFieldValue('ativo', usuario.ativo);
        setFieldValue('primeiroLogin', usuario.primeiro_acesso || false);

        Loading.hide();

        // Abre o modal
        const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
        modal.show();
      } catch (error) {
        Loading.hide();
        console.error('Erro detalhado ao carregar usuário:', error);
        console.error('ID do usuário:', id);
        if (error.response) {
          console.error('Resposta do servidor:', error.response);
        }
        Notification.error('Erro ao carregar usuário');
      }
    });
  });

  // Evento para alterar senha
  document.querySelectorAll('.btn-senha').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nome = btn.dataset.nome;

      // Preenche o nome no modal
      document.getElementById('changePasswordUserName').textContent = nome;

      // Configura o formulário
      const form = document.getElementById('changePasswordForm');
      form.dataset.userId = id;
      form.reset();

      // Abre o modal
      const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
      modal.show();
    });
  });

  // Evento para excluir
  document.querySelectorAll('.btn-excluir').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nome = btn.dataset.nome;

      // Preenche o nome no modal de confirmação
      document.getElementById('deleteItemName').textContent = nome;

      // Configura o botão de confirmação
      document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
          Loading.show('Excluindo usuário...');

          await API.delete(`/usuarios/${id}`);

          Loading.hide();
          Notification.success('Usuário excluído com sucesso!');

          // Fecha o modal
          bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();

          // Atualiza a tabela
          loadUsuarios();
        } catch (error) {
          Loading.hide();
          Notification.error(error.message || 'Erro ao excluir usuário');
        }
      };

      // Abre o modal de confirmação
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    });
  });
}
