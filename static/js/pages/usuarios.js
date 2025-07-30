/**
 * Usuários Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de gerenciamento de usuários
 */

document.addEventListener('DOMContentLoaded', () => {
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
    initPage();
    
    // Configura eventos
    setupEvents();
    
    // Carrega dados
    loadUsuarios();
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
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
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
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Novo Usuário';
            
            // Configura os campos como obrigatórios
            document.getElementById('senha').setAttribute('required', '');
            document.getElementById('confirmarSenha').setAttribute('required', '');
        });
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
            usuario.primeiro_login = formData.get('primeiro_login') === 'on';
            
            // Remove a confirmação de senha
            delete usuario.confirmarSenha;
            
            // Remove formatação de campos
            if (usuario.telefone) {
                usuario.telefone = usuario.telefone.replace(/\D/g, '');
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
                    forcarAlteracao
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
    window.aplicarFiltrosUsuarios = function() {
        loadUsuarios();
    };
    
    window.limparFiltrosUsuarios = function() {
        document.getElementById('filtroNome').value = '';
        document.getElementById('filtroEmail').value = '';
        document.getElementById('filtroTipoAcesso').value = '';
        document.getElementById('filtroAtivo').value = '';
        
        loadUsuarios();
    };
}

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
            ativo: document.getElementById('filtroAtivo')?.value || ''
        };
        
        // Remove parâmetros vazios
        Object.keys(params).forEach(key => {
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
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        
        // Define a classe de status baseado no campo 'ativo'
        let statusClass = usuario.ativo ? 'bg-success' : 'bg-danger';
        let statusText = usuario.ativo ? 'Ativo' : 'Inativo';
        
        // Formata o tipo de acesso baseado no tipo_usuario
        let tipoAcesso = usuario.tipo_usuario || '-';
        
        // Formata a data do último login
        let ultimoLogin = '-';
        if (usuario.data_ultimo_login) {
            const dataLogin = new Date(usuario.data_ultimo_login);
            ultimoLogin = dataLogin.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        row.innerHTML = `
            <td>${usuario.nome || usuario.username || '-'}</td>
            <td>${usuario.email || '-'}</td>
            <td><span class="badge bg-info">${tipoAcesso}</span></td>
            <td>${ultimoLogin}</td>
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
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            
            try {
                Loading.show('Carregando usuário...');
                
                const usuario = await API.get(`/usuarios/${id}`);
                
                // Preenche o formulário
                const form = document.getElementById('usuarioForm');
                form.dataset.id = id;
                
                // Esconde a seção de senha
                document.getElementById('passwordSection').style.display = 'none';
                
                // Remove a obrigatoriedade da senha
                document.getElementById('senha').removeAttribute('required');
                document.getElementById('confirmarSenha').removeAttribute('required');
                
                // Atualiza o título do modal
                document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuário';
                
                // Preenche os campos
                document.getElementById('nome').value = usuario.nome || '';
                document.getElementById('email').value = usuario.email || '';
                document.getElementById('tipo_usuario').value = usuario.tipo_usuario || '';
                document.getElementById('tipoAcesso').value = usuario.tipo_usuario || '';
                document.getElementById('nivelAcesso').value = usuario.nivel_acesso || 1;
                document.getElementById('telefone').value = Utils.formatTelefone(usuario.telefone) || '';
                document.getElementById('ativo').checked = usuario.ativo;
                document.getElementById('primeiroLogin').checked = usuario.primeiro_login;
                
                Loading.hide();
                
                // Abre o modal
                const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
                modal.show();
            } catch (error) {
                Loading.hide();
                Notification.error('Erro ao carregar usuário');
            }
        });
    });
    
    // Evento para alterar senha
    document.querySelectorAll('.btn-senha').forEach(btn => {
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
    document.querySelectorAll('.btn-excluir').forEach(btn => {
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