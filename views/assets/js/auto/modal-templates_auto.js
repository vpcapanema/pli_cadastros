// moved from inline <script>

/**
 * Utilitários para modais
 */
window.ModalUtils = {
    
    /**
     * Mostra modal de confirmação
     */
    confirm: function(title, message, callback, buttonText = 'Confirmar') {
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmButton').textContent = buttonText;
        
        // Remove listeners anteriores
        const newButton = document.getElementById('confirmButton').cloneNode(true);
        document.getElementById('confirmButton').parentNode.replaceChild(newButton, document.getElementById('confirmButton'));
        
        // Adiciona novo listener
        document.getElementById('confirmButton').addEventListener('click', function() {
            modal.hide();
            if (callback) callback();
        });
        
        modal.show();
    },
    
    /**
     * Mostra modal de loading
     */
    showLoading: function(message = 'Processando...') {
        document.getElementById('loadingMessage').textContent = message;
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
        return modal;
    },
    
    /**
     * Esconde modal de loading
     */
    hideLoading: function() {
        const modalElement = document.getElementById('loadingModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    },
    
    /**
     * Mostra modal de visualização
     */
    showView: function(title, content, showEditButton = false) {
        document.getElementById('viewModalTitle').innerHTML = `<i class="fas fa-eye me-2"></i>${title}`;
        document.getElementById('viewModalBody').innerHTML = content;
        
        const editButton = document.getElementById('editFromView');
        if (showEditButton) {
            editButton.style.display = 'block';
        } else {
            editButton.style.display = 'none';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('viewModal'));
        modal.show();
    }
};

/**
 * Alterna visibilidade da senha
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Verifica força da senha
 */
function checkPasswordStrength(password) {
    let strength = 0;
    let text = '';
    let colorClass = '';
    
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    if (strength <= 40) {
        text = 'Fraca';
        colorClass = 'bg-danger';
    } else if (strength <= 60) {
        text = 'Média';
        colorClass = 'bg-warning';
    } else if (strength <= 80) {
        text = 'Boa';
        colorClass = 'bg-info';
    } else {
        text = 'Forte';
        colorClass = 'bg-success';
    }
    
    return { strength, text, colorClass };
}

/**
 * Eventos dos modais
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Form de alteração de perfil
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simula salvamento
        ModalUtils.showLoading('Salvando perfil...');
        
        setTimeout(() => {
            ModalUtils.hideLoading();
            
            // Atualiza dados locais
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            Object.assign(user, data);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Fecha modal
            bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
            
            // Mostra notificação
            showNotification('Perfil atualizado com sucesso!', 'success');
        }, 2000);
    });
    
    // Form de alteração de senha
    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        
        if (newPassword !== confirmPassword) {
            showNotification('As senhas não coincidem!', 'error');
            return;
        }
        
        ModalUtils.showLoading('Alterando senha...');
        
        setTimeout(() => {
            ModalUtils.hideLoading();
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            showNotification('Senha alterada com sucesso!', 'success');
            
            // Limpa form
            document.getElementById('changePasswordForm').reset();
        }, 2000);
    });
    
    // Monitora força da senha
    document.getElementById('newPassword').addEventListener('input', function() {
        const password = this.value;
        const result = checkPasswordStrength(password);
        
        const progressBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordStrengthText');
        
        progressBar.style.width = result.strength + '%';
        progressBar.className = `progress-bar ${result.colorClass}`;
        strengthText.textContent = result.text;
        strengthText.className = `text-${result.colorClass.replace('bg-', '')}`;
    });
    
    // Form de upload
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('uploadFile');
        const file = fileInput.files[0];
        
        if (!file) {
            showNotification('Selecione um arquivo!', 'warning');
            return;
        }
        
        // Simula upload com progresso
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer.querySelector('.progress-bar');
        
        progressContainer.style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
                    showNotification('Arquivo enviado com sucesso!', 'success');
                    
                    // Reset form
                    document.getElementById('uploadForm').reset();
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 500);
            }
            
            progressBar.style.width = progress + '%';
        }, 200);
    });
    
    // Preview de arquivo no upload
    document.getElementById('uploadFile').addEventListener('change', function() {
        const file = this.files[0];
        const previewContainer = document.getElementById('uploadPreview');
        const previewContent = document.getElementById('previewContent');
        
        if (file) {
            previewContainer.style.display = 'block';
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContent.innerHTML = `<img src="${e.target.result}" class="img-fluid" style="max-height: 200px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                previewContent.innerHTML = `
                    <i class="fas fa-file fa-3x text-muted mb-2"></i>
                    <p class="mb-0">${file.name}</p>
                    <small class="text-muted">${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                `;
            }
        } else {
            previewContainer.style.display = 'none';
        }
    });
});

// converted from on* handlers

document.getElementById("auto_evt_5ea175d6").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ togglePassword('currentPassword') }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});


document.getElementById("auto_evt_06120adb").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ togglePassword('newPassword') }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});


document.getElementById("auto_evt_f31017fc").addEventListener("click", function(event) {
  var __result;
  try {
    __result = (function(){ togglePassword('confirmNewPassword') }).call(this, event);
  } catch(e) { console.error(e); }
  if (__result === false) { event.preventDefault(); event.stopPropagation(); }
});
