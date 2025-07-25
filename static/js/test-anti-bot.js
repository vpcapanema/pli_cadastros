/**
 * Script para testar as proteções anti-bot
 */

// Função para simular um bot tentando preencher o formulário
function simulateBotSubmission(formId) {
    console.log(`Simulando tentativa de bot no formulário: ${formId}`);
    
    // Obtém o formulário
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Preenche todos os campos visíveis
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = true;
        } else if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === 'password' || input.type === 'textarea' || input.type === 'number') {
            if (input.id === 'email' || input.name.includes('email')) {
                input.value = 'bot@example.com';
            } else if (input.id === 'cpf' || input.name.includes('cpf')) {
                input.value = '123.456.789-00';
            } else if (input.id === 'cnpj' || input.name.includes('cnpj')) {
                input.value = '12.345.678/0001-00';
            } else if (input.id === 'telefone' || input.name.includes('telefone')) {
                input.value = '(11) 98765-4321';
            } else if (input.id === 'cep' || input.name.includes('cep')) {
                input.value = '12345-678';
            } else if (input.id === 'senha' || input.name.includes('senha') || input.type === 'password') {
                input.value = 'Senha123!';
            } else if (input.id === 'confirmarSenha' || input.name.includes('confirmar')) {
                input.value = 'Senha123!';
            } else if (input.id === 'captcha' || input.name.includes('captcha')) {
                // Tenta adivinhar o CAPTCHA (obviamente vai falhar)
                input.value = '10';
            } else if (input.id === 'website' || input.name === 'website') {
                // Preenche o honeypot (o que um bot faria)
                input.value = 'https://malicious-bot.com';
            } else {
                input.value = 'Teste Bot';
            }
        } else if (input.tagName === 'SELECT') {
            if (input.options.length > 0) {
                input.selectedIndex = 1; // Seleciona a primeira opção não vazia
            }
        }
    });
    
    // Tenta enviar o formulário rapidamente (menos de 3 segundos após carregamento)
    console.log('Tentando enviar o formulário rapidamente...');
    form.requestSubmit();
    
    return false; // Evita que o teste realmente envie o formulário
}

// Função para testar cada proteção individualmente
function testProtections(formId) {
    console.log(`Testando proteções no formulário: ${formId}`);
    
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // 1. Teste do Honeypot
    console.log('1. Testando honeypot...');
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot) {
        honeypot.value = 'https://malicious-bot.com';
        console.log('Honeypot preenchido');
    } else {
        console.log('Honeypot não encontrado');
    }
    
    // 2. Teste de tempo
    console.log('2. Testando verificação de tempo...');
    const timeField = form.querySelector('input[name="form_start_time"]');
    if (timeField) {
        // Simula um tempo muito curto
        timeField.value = Date.now() - 1000; // Apenas 1 segundo
        console.log('Tempo modificado para 1 segundo');
    } else {
        console.log('Campo de tempo não encontrado');
    }
    
    // 3. Teste de CAPTCHA
    console.log('3. Testando CAPTCHA...');
    const captcha = form.querySelector('input[id="captcha"]');
    if (captcha) {
        // Tenta um valor aleatório (provavelmente errado)
        captcha.value = Math.floor(Math.random() * 20);
        console.log(`CAPTCHA preenchido com valor aleatório: ${captcha.value}`);
    } else {
        console.log('CAPTCHA não encontrado');
    }
    
    // Não envia o formulário, apenas mostra os resultados
    console.log('Teste concluído. Verifique o console para resultados.');
    
    // Exibe resultado em um modal
    if (window.Swal) {
        Swal.fire({
            title: 'Teste de Proteções Anti-Bot',
            html: `
                <div class="text-start">
                    <p><strong>Resultados:</strong></p>
                    <ul>
                        <li>Honeypot: ${honeypot ? 'Detectado e preenchido' : 'Não encontrado'}</li>
                        <li>Verificação de tempo: ${timeField ? 'Detectada e modificada' : 'Não encontrada'}</li>
                        <li>CAPTCHA: ${captcha ? `Detectado e preenchido com ${captcha.value}` : 'Não encontrado'}</li>
                    </ul>
                    <p>Se o formulário for enviado agora, as proteções anti-bot deveriam bloqueá-lo.</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Entendi'
        });
    }
    
    return false;
}

// Adiciona botões de teste à página
function addTestButtons() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.id) return;
        
        const formId = form.id;
        const container = document.createElement('div');
        container.className = 'test-buttons mt-3 p-3 bg-light border rounded';
        container.innerHTML = `
            <h6 class="mb-2">Ferramentas de Teste (apenas para desenvolvimento)</h6>
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-warning test-bot-btn">
                    <i class="fas fa-robot me-1"></i> Simular Bot
                </button>
                <button type="button" class="btn btn-sm btn-info test-protections-btn">
                    <i class="fas fa-shield-alt me-1"></i> Testar Proteções
                </button>
            </div>
        `;
        
        // Adiciona os botões após o formulário
        form.parentNode.insertBefore(container, form.nextSibling);
        
        // Adiciona os event listeners
        container.querySelector('.test-bot-btn').addEventListener('click', () => simulateBotSubmission(formId));
        container.querySelector('.test-protections-btn').addEventListener('click', () => testProtections(formId));
    });
}

// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de teste anti-bot carregado');
    addTestButtons();
});