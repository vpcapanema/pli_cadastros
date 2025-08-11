/**
 * Pessoa Jurídica Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de cadastro de pessoa jurídica
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] Pessoa jurídica page - DOM carregado');

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
  loadPessoasJuridicas();
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

  // Carrega estados brasileiros
  loadEstados();
}

/**
 * Inicializa máscaras para os campos
 */
function initMasks() {
  // Máscara para CNPJ
  const cnpjInput = document.getElementById('cnpj');
  if (cnpjInput) {
    cnpjInput.addEventListener('input', (e) => {
      e.target.value = Utils.formatCNPJ(e.target.value);
    });
  }

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      e.target.value = Utils.formatTelefone(e.target.value);
    });
  }

  // Máscara para CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 8) value = value.substring(0, 8);
      if (value.length > 5) {
        e.target.value = value.substring(0, 5) + '-' + value.substring(5);
      } else {
        e.target.value = value;
      }
    });
  }

  // Máscara para CNAE
  const cnaeInput = document.getElementById('cnaePrincipal');
  if (cnaeInput) {
    cnaeInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 7) value = value.substring(0, 7);
      if (value.length > 4) {
        e.target.value =
          value.substring(0, 4) + '-' + value.substring(4, 5) + '/' + value.substring(5);
      } else if (value.length > 0) {
        e.target.value = value;
      }
    });
  }
}

/**
 * Inicializa validadores de formulário
 */
function initValidators() {
  // Formulário de cadastro
  const formCadastro = document.getElementById('pessoaJuridicaForm');
  if (formCadastro) {
    new FormValidator(formCadastro);
  }
}

/**
 * Carrega a lista de estados brasileiros
 */
function loadEstados() {
  const estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
  ];

  // Preenche os selects de UF
  const ufSelects = document.querySelectorAll('select[name="uf"]');
  ufSelects.forEach((select) => {
    estados.forEach((estado) => {
      const option = document.createElement('option');
      option.value = estado.sigla;
      option.textContent = `${estado.sigla} - ${estado.nome}`;
      select.appendChild(option);
    });
  });
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

  // Evento para buscar CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      const cep = cepInput.value.replace(/\D/g, '');

      if (cep.length !== 8) return;

      try {
        Loading.showInElement('#logradouro', {
          message: 'Buscando CEP...',
          spinnerOnly: true,
        });

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          throw new Error('CEP não encontrado');
        }

        document.getElementById('logradouro').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade;

        // Seleciona o estado
        const ufSelect = document.getElementById('uf');
        if (ufSelect) {
          Array.from(ufSelect.options).forEach((option) => {
            if (option.value === data.uf) {
              option.selected = true;
            }
          });
        }

        // Foca no campo número
        document.getElementById('numero').focus();
      } catch (error) {
        Notification.error('CEP não encontrado ou serviço indisponível');
      } finally {
        Loading.hideInElement('#logradouro');
      }
    });
  }

  // Evento para envio do formulário de cadastro
  const formCadastro = document.getElementById('pessoaJuridicaForm');
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!formCadastro.checkValidity()) {
        e.stopPropagation();
        return;
      }

      // Coleta os dados do formulário
      const formData = new FormData(formCadastro);
      const pessoaJuridica = Object.fromEntries(formData.entries());

      // Remove formatação de campos
      pessoaJuridica.cnpj = pessoaJuridica.cnpj.replace(/\D/g, '');
      pessoaJuridica.telefone = pessoaJuridica.telefone.replace(/\D/g, '');
      pessoaJuridica.cep = pessoaJuridica.cep.replace(/\D/g, '');

      try {
        Loading.show('Salvando cadastro...');

        // Verifica se é edição ou novo cadastro
        const pessoaId = formCadastro.dataset.id;
        let response;

        if (pessoaId) {
          response = await API.put(`/pessoa-juridica/${pessoaId}`, pessoaJuridica);
        } else {
          response = await API.post('/pessoa-juridica', pessoaJuridica);
        }

        Loading.hide();
        Notification.success('Cadastro salvo com sucesso!');

        // Limpa o formulário
        formCadastro.reset();
        formCadastro.removeAttribute('data-id');

        // Atualiza a tabela
        loadPessoasJuridicas();

        // Fecha o modal
        bootstrap.Modal.getInstance(document.getElementById('pessoaJuridicaModal')).hide();
      } catch (error) {
        Loading.hide();
        Notification.error(error.message || 'Erro ao salvar cadastro');
      }
    });
  }

  // Funções para filtros
  window.aplicarFiltrosPJ = function () {
    loadPessoasJuridicas();
  };

  window.limparFiltrosPJ = function () {
    document.getElementById('filtroRazaoSocial').value = '';
    document.getElementById('filtroCnpj').value = '';
    document.getElementById('filtroEmail').value = '';
    document.getElementById('filtroSituacao').value = '';

    loadPessoasJuridicas();
  };
}

/**
 * Carrega a lista de pessoas jurídicas
 */
async function loadPessoasJuridicas() {
  try {
    console.log('[DEBUG] Iniciando loadPessoasJuridicas...');
    Loading.show('Carregando cadastros...');

    // Obtém os parâmetros de pesquisa
    const params = {
      razaoSocial: document.getElementById('filtroRazaoSocial')?.value || '',
      cnpj: document.getElementById('filtroCnpj')?.value?.replace(/\D/g, '') || '',
      email: document.getElementById('filtroEmail')?.value || '',
      situacao: document.getElementById('filtroSituacao')?.value || '',
    };

    // Remove parâmetros vazios
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    console.log('[DEBUG] Parâmetros de busca:', params);

    // Realiza a busca
    console.log('[DEBUG] Fazendo requisição para /api/pessoa-juridica');
    const pessoasJuridicas = await API.get('/pessoa-juridica', params);
    console.log('[DEBUG] Dados recebidos via API.get:', pessoasJuridicas);

    // Renderiza a tabela
    renderTable(pessoasJuridicas);

    Loading.hide();
  } catch (error) {
    Loading.hide();
    Notification.error('Erro ao carregar cadastros');
    console.error('Erro ao carregar pessoas jurídicas:', error);
  }
}

/**
 * Renderiza a tabela de pessoas jurídicas
 * @param {Array} pessoasJuridicas - Lista de pessoas jurídicas
 */
function renderTable(pessoasJuridicas) {
  const tbody = document.querySelector('#pessoaJuridicaTable tbody');

  if (!pessoasJuridicas || pessoasJuridicas.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Nenhum cadastro encontrado
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = '';

  pessoasJuridicas.forEach((empresa) => {
    const row = document.createElement('tr');

    // Define a classe de situação baseado no campo 'situacao' e 'ativo'
    let situacaoClass = '';
    let situacaoText = '';

    if (empresa.ativo === false) {
      situacaoClass = 'bg-danger';
      situacaoText = 'Inativa';
    } else if (empresa.situacao) {
      switch (empresa.situacao.toUpperCase()) {
        case 'ATIVA':
          situacaoClass = 'bg-success';
          situacaoText = 'Ativa';
          break;
        case 'BAIXADA':
          situacaoClass = 'bg-danger';
          situacaoText = 'Baixada';
          break;
        case 'SUSPENSA':
          situacaoClass = 'bg-warning';
          situacaoText = 'Suspensa';
          break;
        case 'INAPTA':
          situacaoClass = 'bg-secondary';
          situacaoText = 'Inapta';
          break;
        default:
          situacaoClass = 'bg-info';
          situacaoText = empresa.situacao;
      }
    } else {
      situacaoClass = 'bg-info';
      situacaoText = 'Não informada';
    }

    // Formatar cidade/UF
    const cidadeUf = empresa.cidade && empresa.uf ? `${empresa.cidade}/${empresa.uf}` : '-';

    row.innerHTML = `
            <td>${empresa.razao_social || '-'}</td>
            <td>${Utils.formatCNPJ ? Utils.formatCNPJ(empresa.cnpj) : empresa.cnpj || '-'}</td>
            <td>${empresa.email || '-'}</td>
            <td>${Utils.formatTelefone ? Utils.formatTelefone(empresa.telefone) : empresa.telefone || '-'}</td>
            <td>${cidadeUf}</td>
            <td><span class="badge ${situacaoClass}">${situacaoText}</span></td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-primary btn-editar" data-id="${empresa.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger btn-excluir" data-id="${empresa.id}">
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

        const empresa = await API.get(`/pessoa-juridica/${id}`);

        // Preenche o formulário
        const form = document.getElementById('pessoaJuridicaForm');
        form.dataset.id = id;

        // Atualiza o título do modal
        document.getElementById('modalTitle').innerHTML =
          '<i class="fas fa-building"></i> Editar Pessoa Jurídica';

        // Preenche os campos
        document.getElementById('cnpj').value = Utils.formatCNPJ(empresa.cnpj);
        document.getElementById('razaoSocial').value = empresa.razao_social;
        document.getElementById('nomeFantasia').value = empresa.nome_fantasia || '';
        document.getElementById('porteEmpresa').value = empresa.porte_empresa || '';
        document.getElementById('situacaoReceita').value = empresa.situacao_receita || 'ATIVA';
        document.getElementById('naturezaJuridica').value = empresa.natureza_juridica || '';
        document.getElementById('cnaePrincipal').value = empresa.cnae_principal || '';
        document.getElementById('dataAbertura').value = empresa.data_abertura
          ? empresa.data_abertura.split('T')[0]
          : '';
        document.getElementById('email').value = empresa.email || '';
        document.getElementById('telefone').value = Utils.formatTelefone(empresa.telefone) || '';
        document.getElementById('site').value = empresa.site || '';
        document.getElementById('cep').value = empresa.cep
          ? empresa.cep.replace(/(\d{5})(\d{3})/, '$1-$2')
          : '';
        document.getElementById('logradouro').value = empresa.logradouro || '';
        document.getElementById('numero').value = empresa.numero || '';
        document.getElementById('complemento').value = empresa.complemento || '';
        document.getElementById('bairro').value = empresa.bairro || '';
        document.getElementById('cidade').value = empresa.cidade || '';
        document.getElementById('uf').value = empresa.uf || '';

        Loading.hide();

        // Abre o modal
        const modal = new bootstrap.Modal(document.getElementById('pessoaJuridicaModal'));
        modal.show();
      } catch (error) {
        Loading.hide();
        Notification.error('Erro ao carregar cadastro');
      }
    });
  });

  // Evento para excluir
  document.querySelectorAll('.btn-excluir').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nome = btn.closest('tr').querySelector('td:first-child').textContent;

      // Preenche o nome no modal de confirmação
      document.getElementById('deleteItemName').textContent = nome;

      // Configura o botão de confirmação
      document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
          Loading.show('Excluindo cadastro...');

          await API.delete(`/pessoa-juridica/${id}`);

          Loading.hide();
          Notification.success('Cadastro excluído com sucesso!');

          // Fecha o modal
          bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();

          // Atualiza a tabela
          loadPessoasJuridicas();
        } catch (error) {
          Loading.hide();
          Notification.error(error.message || 'Erro ao excluir cadastro');
        }
      };

      // Abre o modal de confirmação
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    });
  });
}
