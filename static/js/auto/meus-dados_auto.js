// moved from inline <script>

let isEditMode = false;
let originalData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  checkAuthentication();
  loadUserData();
  setupEventListeners();
});

function checkAuthentication() {
  // Usar os mesmos nomes que o auth.js usa
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const sessionActive = localStorage.getItem('sessionActive');

  console.log('[MEUS-DADOS] Verificando autenticação...');
  console.log('[MEUS-DADOS] Token presente:', !!token);
  console.log('[MEUS-DADOS] User presente:', !!user);
  console.log('[MEUS-DADOS] Session active:', sessionActive);

  if (!token || !user || sessionActive !== 'true') {
    console.log('[MEUS-DADOS] Não autenticado - redirecionando para login');
    window.location.href = 'login.html';
    return;
  }

  console.log('[MEUS-DADOS] ? Usuário autenticado');
}

function setupEventListeners() {
  document.getElementById('userDataForm').addEventListener('submit', saveUserData);
  document.getElementById('passwordForm').addEventListener('submit', changePassword);
}

async function loadUserData() {
  try {
    // Usar os nomes corretos do localStorage
    const userDataStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userDataStr || !token) {
      console.log('[MEUS-DADOS] Dados não encontrados no localStorage');
      return;
    }

    const userData = JSON.parse(userDataStr);
    console.log('[MEUS-DADOS] Dados do usuário carregados:', userData);

    // Carregar dados básicos do localStorage primeiro
    populateForm(userData);

    // Tentar carregar dados mais recentes da API
    if (userData.id) {
      const response = await fetch(`/api/usuarios/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedData = await response.json();
        populateForm(updatedData);
        // Atualizar localStorage
        localStorage.setItem('user', JSON.stringify(updatedData));
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    showAlert('Erro ao carregar dados do usuário', 'danger');
  }
}

function populateForm(userData) {
  console.log('[MEUS-DADOS] Preenchendo formulário com dados:', userData);

  document.getElementById('nome').value = userData.nome || '';
  document.getElementById('email').value = userData.email || '';
  document.getElementById('telefone').value = userData.telefone || '';
  document.getElementById('cargo').value = userData.cargo || '';
  document.getElementById('departamento').value = userData.departamento || '';
  document.getElementById('dataAdmissao').value = userData.data_criacao
    ? userData.data_criacao.split('T')[0]
    : '';

  // Informações da conta
  document.getElementById('userId').textContent = userData.id || '-';
  document.getElementById('dataCriacao').textContent = userData.data_criacao
    ? formatDate(userData.data_criacao)
    : '-';
  document.getElementById('ultimoAcesso').textContent = userData.data_ultimo_login
    ? formatDate(userData.data_ultimo_login)
    : '-';
  document.getElementById('perfilAcesso').textContent = userData.tipo_usuario || 'Usuário';

  // Avatar
  const avatar = document.getElementById('avatarPreview');
  const firstLetter = userData.nome ? userData.nome.charAt(0).toUpperCase() : 'U';
  avatar.textContent = firstLetter;

  // Guardar dados originais
  originalData = { ...userData };
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  const form = document.getElementById('userDataForm');
  const inputs = form.querySelectorAll('input:not([type="submit"])');
  const editModeText = document.getElementById('editModeText');
  const editButtons = document.getElementById('editButtons');

  if (isEditMode) {
    inputs.forEach((input) => {
      if (input.id !== 'email') {
        // Email não pode ser editado
        input.disabled = false;
      }
    });
    editModeText.textContent = 'Cancelar Edição';
    editButtons.classList.remove('d-none');
  } else {
    inputs.forEach((input) => (input.disabled = true));
    editModeText.textContent = 'Editar';
    editButtons.classList.add('d-none');
    // Restaurar dados originais
    populateForm(originalData);
  }
}

function cancelEdit() {
  toggleEditMode();
}

async function saveUserData(event) {
  event.preventDefault();

  try {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    if (!userDataStr) {
      showAlert('Dados do usuário não encontrados', 'danger');
      return;
    }

    const userData = JSON.parse(userDataStr);

    const formData = {
      nome: document.getElementById('nome').value,
      telefone: document.getElementById('telefone').value,
      cargo: document.getElementById('cargo').value,
      departamento: document.getElementById('departamento').value,
      data_admissao: document.getElementById('dataAdmissao').value,
    };

    const response = await fetch(`/api/usuarios/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showAlert('Dados atualizados com sucesso!', 'success');
      toggleEditMode();
      loadUserData();
    } else {
      const error = await response.json();
      showAlert(error.message || 'Erro ao atualizar dados', 'danger');
    }
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    showAlert('Erro ao salvar dados', 'danger');
  }
}

async function changePassword(event) {
  event.preventDefault();

  const senhaAtual = document.getElementById('senhaAtual').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  if (novaSenha !== confirmarSenha) {
    showAlert('As senhas não coincidem', 'danger');
    return;
  }

  if (novaSenha.length < 6) {
    showAlert('A nova senha deve ter pelo menos 6 caracteres', 'danger');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    if (!userDataStr) {
      showAlert('Dados do usuário não encontrados', 'danger');
      return;
    }

    const userData = JSON.parse(userDataStr);

    const response = await fetch(`/api/usuarios/${userData.id}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senhaAtual,
        novaSenha,
      }),
    });

    if (response.ok) {
      showAlert('Senha alterada com sucesso!', 'success');
      document.getElementById('passwordForm').reset();
    } else {
      const error = await response.json();
      showAlert(error.message || 'Erro ao alterar senha', 'danger');
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    showAlert('Erro ao alterar senha', 'danger');
  }
}

function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
  alertContainer.appendChild(alertDiv);

  // Remove alert after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página meus-dados');
});

// Garante carregamento do Bootstrap
PLIScriptLoader.ensureBootstrap().then(() => {
  console.log('Bootstrap carregado para página meus-dados');
});

// converted from on* handlers

document.getElementById('auto_evt_6bcf612e').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      toggleEditMode();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});

document.getElementById('auto_evt_8cff6972').addEventListener('click', function (event) {
  var __result;
  try {
    __result = function () {
      cancelEdit();
    }.call(this, event);
  } catch (e) {
    console.error(e);
  }
  if (__result === false) {
    event.preventDefault();
    event.stopPropagation();
  }
});
