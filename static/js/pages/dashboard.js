/**
 * Dashboard Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    // Logout automático ao fechar/recarregar
    Auth.enableAutoLogoutOnClose();
    // Boas-vindas personalizada
    const user = Auth.getUser();
    if (user && user.nome) {
        const primeiroNome = user.nome.split(' ')[0];
        document.getElementById('welcomeUser').textContent = primeiroNome;
    }
    // Data de hoje
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = meses[hoje.getMonth()];
    const ano = hoje.getFullYear();
    document.getElementById('welcomeDate').textContent = `${dia} de ${mes} de ${ano}`;
    // Mini calendário da semana atual
    renderMiniCalendar(hoje);
// Renderiza um mini calendário da semana atual
function renderMiniCalendar(dataBase) {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const miniCalendar = document.getElementById('miniCalendar');
    if (!miniCalendar) return;

    // Descobre o primeiro dia da semana (domingo)
    const diaSemana = dataBase.getDay();
    const primeiroDia = new Date(dataBase);
    primeiroDia.setDate(dataBase.getDate() - diaSemana);

    // Monta cabeçalho
    let html = '<div class="d-flex justify-content-center mb-1">';
    diasSemana.forEach(dia => {
        html += `<div class="text-center fw-bold" style="width:32px">${dia}</div>`;
    });
    html += '</div><div class="d-flex justify-content-center">';

    // Monta os dias da semana
    for (let i = 0; i < 7; i++) {
        const diaAtual = new Date(primeiroDia);
        diaAtual.setDate(primeiroDia.getDate() + i);
        const isHoje = (diaAtual.toDateString() === dataBase.toDateString());
        html += `<div class="text-center rounded ${isHoje ? 'bg-primary text-white' : 'bg-light'} mx-1" style="width:32px; height:32px; line-height:32px; font-weight:500;">${diaAtual.getDate()}</div>`;
    }
    html += '</div>';
    miniCalendar.innerHTML = html;
}
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
    loadDashboardData();
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
    
    // Exibe último login
    const lastLogin = Auth.getLastLogin();
    if (lastLogin) {
        document.getElementById('lastLogin').textContent = Utils.formatData(lastLogin) + ' ' + 
            new Date(lastLogin).toLocaleTimeString('pt-BR');
    }
}

/**
 * Configura eventos da página
 */
function setupEvents() {
    // Evento de logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        
        Notification.confirm(
            'Deseja realmente sair do sistema?',
            () => {
                Auth.logout();
            }
        );
    });
    
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
}

/**
 * Carrega os dados do dashboard
 */
async function loadDashboardData() {
    try {
        Loading.show('Carregando dados...');
        
        // Carrega estatísticas
        const estatisticas = await API.get('/estatisticas');

        // Preenche os cards usando os campos do backend
        document.getElementById('totalPessoasFisicas').textContent = estatisticas.totalPF || 0;
        document.getElementById('totalPessoasJuridicas').textContent = estatisticas.totalPJ || 0;
        document.getElementById('totalUsuarios').textContent = estatisticas.totalUsuarios || 0;
        document.getElementById('totalCadastros').textContent = 
            (estatisticas.totalPF || 0) + (estatisticas.totalPJ || 0);
        
        // Carrega últimos cadastros
        const ultimosCadastros = await API.get('/estatisticas/ultimos-cadastros');
        renderUltimosCadastros(ultimosCadastros);
        
        // Inicializa gráficos
        initCharts(estatisticas);
        
        Loading.hide();
    } catch (error) {
        Loading.hide();
        Notification.error('Erro ao carregar dados do dashboard');
        console.error('Erro ao carregar dashboard:', error);
    }
}

/**
 * Renderiza a tabela de últimos cadastros
 * @param {Array} cadastros - Lista de cadastros
 */
function renderUltimosCadastros(cadastros) {
    const tbody = document.getElementById('ultimosCadastros');
    
    if (!cadastros || cadastros.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    Nenhum cadastro encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    cadastros.forEach(cadastro => {
        const row = document.createElement('tr');
        
        // Define a classe de status
        let statusClass = '';
        let statusText = '';
        
        switch (cadastro.status) {
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
                statusText = cadastro.status || 'Desconhecido';
        }
        
        row.innerHTML = `
            <td>${cadastro.nome || cadastro.razaoSocial || '-'}</td>
            <td>${cadastro.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
            <td>${cadastro.tipo === 'pf' ? 
                Utils.formatCPF(cadastro.cpf) : 
                Utils.formatCNPJ(cadastro.cnpj)}</td>
            <td>${Utils.formatData(cadastro.dataCadastro)}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Inicializa os gráficos
 * @param {Object} estatisticas - Dados para os gráficos
 */
function initCharts(estatisticas) {
    // Gráfico de distribuição por tipo
    const ctxTipos = document.getElementById('chartTipos').getContext('2d');
    new Chart(ctxTipos, {
        type: 'pie',
        data: {
            labels: ['Pessoas Físicas', 'Pessoas Jurídicas'],
            datasets: [{
                data: [
                    estatisticas.totalPF || 0,
                    estatisticas.totalPJ || 0
                ],
                backgroundColor: [
                    '#007bff',
                    '#17a2b8'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Gráfico de cadastros por mês
    const ctxMensal = document.getElementById('chartMensal').getContext('2d');
    new Chart(ctxMensal, {
        type: 'bar',
        data: {
            labels: estatisticas.meses || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
                {
                    label: 'Pessoas Físicas',
                    data: estatisticas.pessoasFisicasPorMes || [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#007bff'
                },
                {
                    label: 'Pessoas Jurídicas',
                    data: estatisticas.pessoasJuridicasPorMes || [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#17a2b8'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}