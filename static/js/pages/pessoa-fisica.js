/**
 * Pessoa Física Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de cadastro de pessoa física
 */

document.addEventListener('DOMContentLoaded', () => {
    // Logout automático ao fechar/recarregar
    Auth.enableAutoLogoutOnClose();
    // Verifica autenticação
    if (!Auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
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
    if (user) {
        document.getElementById('userName').textContent = user.nome || user.email;
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
    cpfInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = Utils.formatCPF(e.target.value);
        });
    });
    
    // Máscara para telefone
    const telefoneInputs = document.querySelectorAll('[data-mask="telefone"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = Utils.formatTelefone(e.target.value);
        });
    });
    
    // Máscara para CEP
    const cepInputs = document.querySelectorAll('[data-mask="cep"]');
    cepInputs.forEach(input => {
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
            validateOnBlur: false
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
            
            Notification.confirm(
                'Deseja realmente sair do sistema?',
                () => {
                    Auth.logout();
                }
            );
        });
    }
    
    // Evento para abrir modal de alteração de senha
    window.openChangePasswordModal = function() {
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
                    spinnerOnly: false
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
    const formCadastro = document.getElementById('formPessoaFisica');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!formCadastro.checkValidity()) {
                e.stopPropagation();
                return;
            }
            
            // Coleta os dados do formulário
            const formData = new FormData(formCadastro);
            const pessoaFisica = Object.fromEntries(formData.entries());
            
            // Remove formatação de campos
            pessoaFisica.cpf = pessoaFisica.cpf.replace(/\D/g, '');
            pessoaFisica.telefone = pessoaFisica.telefone.replace(/\D/g, '');
            pessoaFisica.cep = pessoaFisica.cep.replace(/\D/g, '');
            
            try {
                Loading.show('Salvando cadastro...');
                
                // Verifica se é edição ou novo cadastro
                const pessoaId = formCadastro.dataset.id;
                let response;
                
                if (pessoaId) {
                    response = await API.put(`/pessoa-fisica/${pessoaId}`, pessoaFisica);
                } else {
                    response = await API.post('/pessoa-fisica', pessoaFisica);
                }
                
                Loading.hide();
                Notification.success('Cadastro salvo com sucesso!');
                
                // Limpa o formulário
                formCadastro.reset();
                formCadastro.removeAttribute('data-id');
                
                // Atualiza a tabela
                loadPessoasFisicas();
                
                // Fecha o modal
                bootstrap.Modal.getInstance(document.getElementById('modalPessoaFisica')).hide();
            } catch (error) {
                Loading.hide();
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
    
    // Evento para novo cadastro
    const btnNovoCadastro = document.getElementById('btnNovoCadastro');
    if (btnNovoCadastro) {
        btnNovoCadastro.addEventListener('click', () => {
            const formCadastro = document.getElementById('formPessoaFisica');
            formCadastro.reset();
            formCadastro.removeAttribute('data-id');
            
            // Atualiza o título do modal
            document.getElementById('modalPessoaFisicaLabel').textContent = 'Novo Cadastro de Pessoa Física';
            
            // Abre o modal
            const modal = new bootstrap.Modal(document.getElementById('modalPessoaFisica'));
            modal.show();
        });
    }
}

/**
 * Carrega a lista de pessoas físicas
 */
async function loadPessoasFisicas() {
    try {
        Loading.show('Carregando cadastros...');
        
        // Obtém os parâmetros de pesquisa
        const formPesquisa = document.getElementById('formPesquisa');
        const params = formPesquisa ? new FormData(formPesquisa) : new FormData();
        
        // Converte FormData para objeto
        const searchParams = {};
        params.forEach((value, key) => {
            if (value) searchParams[key] = value;
        });
        
        // Realiza a busca
        const pessoasFisicas = await API.get('/pessoa-fisica', searchParams);
        
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
    
    pessoasFisicas.forEach(pessoa => {
        const row = document.createElement('tr');
        
        // Define a classe de status
        let statusClass = '';
        let statusText = '';
        
        switch (pessoa.status) {
            case 'ativo':
                statusClass = 'bg-success';
                statusText = 'Ativo';
                break;
            case 'inativo':
                statusClass = 'bg-danger';
                statusText = 'Inativo';
                break;
            case 'pendente':
                statusClass = 'bg-warning';
                statusText = 'Pendente';
                break;
            default:
                statusClass = 'bg-secondary';
                statusText = pessoa.status || 'Desconhecido';
        }
        
        row.innerHTML = `
            <td>${pessoa.nome || '-'}</td>
            <td>${Utils.formatCPF(pessoa.cpf) || '-'}</td>
            <td>${pessoa.email || '-'}</td>
            <td>${Utils.formatTelefone(pessoa.telefone) || '-'}</td>
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
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            
            try {
                Loading.show('Carregando cadastro...');
                
                const pessoa = await API.get(`/pessoa-fisica/${id}`);
                
                // Preenche o formulário
                const form = document.getElementById('formPessoaFisica');
                form.dataset.id = id;
                
                Object.keys(pessoa).forEach(key => {
                    const input = form.elements[key];
                    if (input) {
                        input.value = pessoa[key];
                    }
                });
                
                // Formata campos
                if (form.elements['cpf']) {
                    form.elements['cpf'].value = Utils.formatCPF(pessoa.cpf);
                }
                
                if (form.elements['telefone']) {
                    form.elements['telefone'].value = Utils.formatTelefone(pessoa.telefone);
                }
                
                if (form.elements['cep']) {
                    form.elements['cep'].value = pessoa.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                }
                
                // Atualiza o título do modal
                document.getElementById('modalPessoaFisicaLabel').textContent = 'Editar Cadastro de Pessoa Física';
                
                Loading.hide();
                
                // Abre o modal
                const modal = new bootstrap.Modal(document.getElementById('modalPessoaFisica'));
                modal.show();
            } catch (error) {
                Loading.hide();
                Notification.error('Erro ao carregar cadastro');
            }
        });
    });
    
    // Evento para excluir
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            
            Notification.confirm(
                'Deseja realmente excluir este cadastro?',
                async () => {
                    try {
                        Loading.show('Excluindo cadastro...');
                        
                        await API.delete(`/pessoa-fisica/${id}`);
                        
                        Loading.hide();
                        Notification.success('Cadastro excluído com sucesso!');
                        
                        // Atualiza a tabela
                        loadPessoasFisicas();
                    } catch (error) {
                        Loading.hide();
                        Notification.error(error.message || 'Erro ao excluir cadastro');
                    }
                }
            );
        });
    });
}