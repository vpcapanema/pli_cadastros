/**
 * Dashboard Page - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para a página de dashboard
 */

/**
 * Atualiza as informações do dashboard
 */
function updateDashboardInfo() {
    // Data de hoje
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = meses[hoje.getMonth()];
    const ano = hoje.getFullYear();
    document.getElementById('welcomeDate').textContent = `${dia} de ${mes} de ${ano}`;
    
    // Calendário compacto no card
    renderCompactCalendar();
    
    // Calendário completo do mês atual (se existir)
    const fullCalendarEl = document.getElementById('fullCalendar');
    if (fullCalendarEl) {
        renderFullCalendar();
    }
    
    // Mini calendário da semana atual (se existir)
    const miniCalendarEl = document.getElementById('miniCalendar');
    if (miniCalendarEl) {
        renderMiniCalendar(hoje);
    }
    
    // Inicializa a página
    initPage();
    
    // Configura eventos
    setupEvents();
    
    // Carrega dados
    loadDashboardData();
}

/**
 * Renderiza um calendário completo do mês atual
 */
function renderFullCalendar() {
    const calendarEl = document.getElementById('fullCalendar');
    if (!calendarEl) return;
    
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    // Último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0);
    // Dia da semana do primeiro dia (0 = domingo)
    const diaSemanaInicio = primeiroDia.getDay();
    
    let html = '';
    
    // Cabeçalho dos dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        html += `<div class="calendar-day header">${dia}</div>`;
    });
    
    // Dias do mês anterior (para completar a primeira semana)
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const dia = ultimoDiaMesAnterior - i;
        html += `<div class="calendar-day other-month">${dia}</div>`;
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const isToday = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
        const classe = isToday ? 'calendar-day today' : 'calendar-day';
        html += `<div class="${classe}">${dia}</div>`;
    }
    
    // Dias do próximo mês (para completar a última semana)
    const totalCelulas = Math.ceil((diaSemanaInicio + ultimoDia.getDate()) / 7) * 7;
    const diasRestantes = totalCelulas - (diaSemanaInicio + ultimoDia.getDate());
    for (let dia = 1; dia <= diasRestantes; dia++) {
        html += `<div class="calendar-day other-month">${dia}</div>`;
    }
    
    calendarEl.innerHTML = html;
}

/**
 * Renderiza um calendário compacto para o card
 */
function renderCompactCalendar() {
    const calendarEl = document.getElementById('compactCalendar');
    if (!calendarEl) return;
    
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    // Último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0);
    // Dia da semana do primeiro dia (0 = domingo)
    const diaSemanaInicio = primeiroDia.getDay();
    
    let html = '';
    
    // Cabeçalho dos dias da semana (abreviado)
    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    diasSemana.forEach(dia => {
        html += `<div class="calendar-day header">${dia}</div>`;
    });
    
    // Dias do mês anterior (para completar a primeira semana)
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const dia = ultimoDiaMesAnterior - i;
        html += `<div class="calendar-day other-month">${dia}</div>`;
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const isToday = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
        const classe = isToday ? 'calendar-day today' : 'calendar-day';
        html += `<div class="${classe}">${dia}</div>`;
    }
    
    // Dias do próximo mês (para completar a última semana)
    const totalCelulas = Math.ceil((diaSemanaInicio + ultimoDia.getDate()) / 7) * 7;
    const diasRestantes = totalCelulas - (diaSemanaInicio + ultimoDia.getDate());
    for (let dia = 1; dia <= diasRestantes && diasRestantes > 0; dia++) {
        html += `<div class="calendar-day other-month">${dia}</div>`;
    }
    
    calendarEl.innerHTML = html;
}

/**
 * Renderiza um mini calendário da semana atual
 * @param {Date} dataBase - Data base para o calendário
 */
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

/**
 * Inicializa a página
 */
function initPage() {
    // Exibe nome do usuário no elemento welcomeUser
    const user = Auth.getUser();
    const welcomeUserElement = document.getElementById('welcomeUser');
    
    if (user && welcomeUserElement) {
        welcomeUserElement.textContent = user.nome || user.email || 'Usuário';
    }
    
    // Se existir elemento de último login (opcional)
    const lastLoginElement = document.getElementById('lastLogin');
    if (lastLoginElement) {
        const lastLogin = Auth.getLastLogin();
        if (lastLogin) {
            lastLoginElement.textContent = Utils.formatData(lastLogin) + ' ' + 
                new Date(lastLogin).toLocaleTimeString('pt-BR');
        }
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
        
        // Carrega estatísticas reais
        const estatisticas = await API.get('/estatisticas');

        // Preenche os cards com dados reais - com verificação de segurança
        const totalPFElement = document.getElementById('totalPessoasFisicas');
        const totalPJElement = document.getElementById('totalPessoasJuridicas');
        const totalUsuariosElement = document.getElementById('totalUsuarios');
        const todosOsCadastrosElement = document.getElementById('todosOsCadastros');
        const totalSolicitacoesElement = document.getElementById('totalSolicitacoes');

        if (totalPFElement) totalPFElement.textContent = estatisticas.totalPF || 0;
        if (totalPJElement) totalPJElement.textContent = estatisticas.totalPJ || 0;
        if (totalUsuariosElement) totalUsuariosElement.textContent = estatisticas.totalUsuarios || 0;
        
        // Calcula "Todos os Cadastros" (PF + PJ + Usuários)
        const todosOsCadastros = (estatisticas.totalPF || 0) + (estatisticas.totalPJ || 0) + (estatisticas.totalUsuarios || 0);
        if (todosOsCadastrosElement) todosOsCadastrosElement.textContent = todosOsCadastros;
        
        // Solicitações de cadastro
        if (totalSolicitacoesElement) totalSolicitacoesElement.textContent = estatisticas.totalSolicitacoes || 0;
        
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
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-info-circle me-1"></i>
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
        let statusIcon = '';
        
        switch (cadastro.status?.toLowerCase()) {
            case 'ativo':
                statusClass = 'bg-success';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'inativo':
                statusClass = 'bg-danger';
                statusIcon = 'fas fa-times-circle';
                break;
            case 'pendente':
                statusClass = 'bg-warning';
                statusIcon = 'fas fa-clock';
                break;
            default:
                statusClass = 'bg-secondary';
                statusIcon = 'fas fa-question-circle';
        }
        
        // Formatar data
        const dataFormatada = cadastro.dataCadastro ? 
            new Date(cadastro.dataCadastro).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';
        
        // Formatar documento
        let documentoFormatado = cadastro.documento || '-';
        if (cadastro.documento && cadastro.documento !== 'N/A') {
            if (cadastro.tipo === 'Pessoa Física' && cadastro.documento.length === 11) {
                documentoFormatado = Utils.formatCPF ? Utils.formatCPF(cadastro.documento) : cadastro.documento;
            } else if (cadastro.tipo === 'Pessoa Jurídica' && cadastro.documento.length === 14) {
                documentoFormatado = Utils.formatCNPJ ? Utils.formatCNPJ(cadastro.documento) : cadastro.documento;
            }
        }
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas ${cadastro.tipo === 'Pessoa Física' ? 'fa-user' : 
                                   cadastro.tipo === 'Pessoa Jurídica' ? 'fa-building' : 
                                   'fa-user-cog'} text-muted me-2"></i>
                    <span>${cadastro.nome || '-'}</span>
                </div>
            </td>
            <td>
                <span class="badge bg-light text-dark border">${cadastro.tipo}</span>
            </td>
            <td><code class="text-muted">${documentoFormatado}</code></td>
            <td><small class="text-muted">${dataFormatada}</small></td>
            <td>
                <span class="badge ${statusClass}">
                    <i class="${statusIcon} me-1"></i>
                    ${cadastro.status}
                </span>
            </td>
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
    const chartTiposElement = document.getElementById('chartTipos');
    if (chartTiposElement) {
        const ctxTipos = chartTiposElement.getContext('2d');
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
    }
    
    // Gráfico de cadastros por mês
    const chartMensalElement = document.getElementById('chartMensal');
    if (chartMensalElement) {
        const ctxMensal = chartMensalElement.getContext('2d');
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
}// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    // Boas-vindas personalizada
    const user = Auth.getUser();
    if (user && user.nome) {
        const primeiroNome = user.nome.split(' ')[0];
        document.getElementById('welcomeUser').textContent = primeiroNome;
    }
    
    // Atualizar informações do dashboard
    updateDashboardInfo();
});