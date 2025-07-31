# Sistema de Feedback Padronizado PLI

## Visão Geral

O sistema implementa duas soluções de feedback conforme definido:

- **Modal Feedbacks**: Para todo o sistema (padrão)
- **Progress Feedback**: Específico para páginas de login e cadastro

## Instalação

Adicione ao seu HTML:

```html
<!-- Bootstrap 5 necessário -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- FontAwesome para ícones -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- CSS PLI -->
<link rel="stylesheet" href="/static/css/sistema_aplicacao_cores_pli.css">

<!-- Sistema de Feedback PLI -->
<script src="/static/js/feedback-system.js"></script>
```

## 1. Modal Feedbacks (Sistema Padrão)

### Uso Básico

```javascript
// Sucesso
showSuccess('Operação Concluída', 'Usuário salvo com sucesso!');

// Erro
showError('Erro na Operação', 'Não foi possível conectar com o servidor.');

// Aviso
showWarning('Atenção Necessária', 'Verifique os dados antes de continuar.');

// Informação
showInfo('Sistema Atualizado', 'Nova versão disponível para download.');
```

### Confirmação com Ações

```javascript
showConfirm(
    'Confirmar Exclusão',
    'Tem certeza que deseja excluir este usuário?',
    function() {
        // Ação de confirmação
        console.log('Usuário confirmou exclusão');
        // Aqui você faria a exclusão
        showSuccess('Usuário Excluído', 'Operação realizada com sucesso!');
    },
    function() {
        // Ação de cancelamento (opcional)
        console.log('Usuário cancelou');
    }
);
```

### Modal com Botões Customizados

```javascript
PLIFeedback.info('Backup Disponível', 'Foi encontrado um backup dos dados. O que deseja fazer?', {
    buttons: [
        {
            text: 'Restaurar Backup',
            icon: 'fas fa-download',
            onclick: 'restaurarBackup()',
            dismiss: false
        },
        {
            text: 'Criar Novo',
            icon: 'fas fa-plus',
            onclick: 'criarNovo()'
        },
        {
            text: 'Cancelar',
            icon: 'fas fa-times'
        }
    ]
});
```

## 2. Progress Feedback (Login e Cadastro)

### Login Process

```javascript
// Iniciar processo de login
startLoginProcess();

// Simular progresso (em suas funções de login)
setTimeout(() => PLIProgress.nextStep(), 1000);  // Credenciais validadas
setTimeout(() => PLIProgress.nextStep(), 2000);  // Permissões carregadas
setTimeout(() => PLIProgress.nextStep(), 3000);  // Dashboard preparado
setTimeout(() => PLIProgress.nextStep(), 4000);  // Login finalizado
```

### Cadastro Process

```javascript
// Iniciar processo de cadastro
startCadastroProcess();

// Simular progresso com possível erro
setTimeout(() => PLIProgress.nextStep(), 1000);  // Dados validados
setTimeout(() => {
    // Simular erro no banco de dados
    PLIProgress.nextStep(false, 'Erro na conexão com o banco de dados');
}, 2000);
```

### Progress Customizado

```javascript
const stepsCustomizados = [
    { title: 'Verificando CPF', description: 'Consultando base da Receita Federal...' },
    { title: 'Validando empresa', description: 'Verificando CNPJ no sistema...' },
    { title: 'Criando usuário', description: 'Inserindo dados no banco...' },
    { title: 'Enviando email', description: 'Enviando credenciais por email...' }
];

PLIProgress.start(
    stepsCustomizados, 
    'Cadastro Avançado', 
    'Validação completa de dados empresariais'
);

PLIProgress.begin();

// Controle manual dos passos
setTimeout(() => PLIProgress.nextStep(), 2000);
setTimeout(() => PLIProgress.nextStep(), 4000);
setTimeout(() => PLIProgress.nextStep(), 6000);
setTimeout(() => PLIProgress.nextStep(), 8000);
```

## Exemplos de Integração

### Formulário de Login

```javascript
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    // Iniciar feedback de progresso
    startLoginProcess();
    
    try {
        // Passo 1: Validar credenciais
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        PLIProgress.nextStep(); // Credenciais validadas
        
        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }
        
        const data = await response.json();
        
        // Passo 2: Carregar permissões
        PLIProgress.nextStep();
        
        // Passo 3: Preparar dashboard
        PLIProgress.nextStep();
        
        // Passo 4: Finalizar
        PLIProgress.nextStep();
        
        // Redirect após completar
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);
        
    } catch (error) {
        PLIProgress.nextStep(false, error.message);
        
        setTimeout(() => {
            showError('Erro no Login', error.message);
        }, 2000);
    }
});
```

### Formulário de Cadastro

```javascript
document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const dados = Object.fromEntries(formData);
    
    startCadastroProcess();
    
    try {
        // Passo 1: Validar dados
        if (!dados.email || !dados.senha) {
            throw new Error('Dados obrigatórios não preenchidos');
        }
        PLIProgress.nextStep();
        
        // Passo 2: Salvar no banco
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar usuário');
        }
        
        PLIProgress.nextStep();
        
        // Passo 3: Enviar notificações
        await fetch('/api/notifications/new-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: response.data.id })
        });
        
        PLIProgress.nextStep();
        
        // Passo 4: Finalizar
        PLIProgress.nextStep();
        
        setTimeout(() => {
            showSuccess('Cadastro Realizado', 'Usuário criado com sucesso! Verifique seu email.');
        }, 500);
        
    } catch (error) {
        PLIProgress.nextStep(false, error.message);
        
        setTimeout(() => {
            showError('Erro no Cadastro', error.message);
        }, 2000);
    }
});
```

### Operações CRUD Padrão

```javascript
// Excluir usuário
function excluirUsuario(id) {
    showConfirm(
        'Confirmar Exclusão',
        'Esta ação não pode ser desfeita. Confirma a exclusão?',
        async function() {
            try {
                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    showSuccess('Usuário Excluído', 'Operação realizada com sucesso!');
                    location.reload(); // Recarregar página
                } else {
                    throw new Error('Erro ao excluir usuário');
                }
            } catch (error) {
                showError('Erro na Exclusão', error.message);
            }
        }
    );
}

// Salvar dados
async function salvarUsuario(dados) {
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (response.ok) {
            showSuccess('Dados Salvos', 'Usuário salvo com sucesso!');
        } else {
            throw new Error('Erro ao salvar dados');
        }
    } catch (error) {
        showError('Erro ao Salvar', error.message);
    }
}

// Validação de formulário
function validarFormulario(form) {
    const erros = [];
    
    if (!form.email.value) erros.push('Email é obrigatório');
    if (!form.nome.value) erros.push('Nome é obrigatório');
    
    if (erros.length > 0) {
        showWarning('Campos Obrigatórios', erros.join('\n'));
        return false;
    }
    
    return true;
}
```

## API Reference

### PLIFeedback (Modals)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| `success(title, message, options)` | string, string, object | Modal de sucesso |
| `error(title, message, options)` | string, string, object | Modal de erro |
| `warning(title, message, options)` | string, string, object | Modal de aviso |
| `info(title, message, options)` | string, string, object | Modal de informação |
| `confirm(title, message, onConfirm, onCancel)` | string, string, function, function | Modal de confirmação |

### PLIProgress (Progress Feedback)

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| `start(steps, title, subtitle)` | array, string, string | Inicia progresso |
| `begin()` | - | Inicia primeiro passo |
| `nextStep(success, errorMessage)` | boolean, string | Avança passo |
| `errorStep(index, message)` | number, string | Força erro em passo |
| `reset()` | - | Reinicia progresso |
| `hideOverlay()` | - | Fecha overlay |

## Personalização

### Cores PLI

O sistema usa as variáveis CSS do PLI:

```css
:root {
    --pli-azul-escuro: #0f203e;
    --pli-azul-medio: #244b72;
    --pli-verde-principal: #5cb65c;
    --pli-verde-claro: #bfe5b2;
}
```

### Classes Customizadas

- `.pli-card` - Cartão padrão PLI
- `.text-pli-dark` - Texto azul escuro PLI
- `.border-pli-primary` - Borda verde PLI

## Troubleshooting

### Bootstrap não carregado
```javascript
if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap 5 é necessário para o sistema de feedback');
}
```

### FontAwesome não carregado
```javascript
// Fallback para ícones texto se FontAwesome não estiver disponível
if (!document.querySelector('[href*="font-awesome"]')) {
    console.warn('FontAwesome recomendado para melhor experiência visual');
}
```

### CSS PLI não encontrado
```javascript
// Sistema funciona sem CSS PLI, mas usa estilos genéricos
if (!document.querySelector('[href*="sistema_aplicacao_cores_pli"]')) {
    console.info('CSS PLI não encontrado, usando estilos padrão');
}
```
