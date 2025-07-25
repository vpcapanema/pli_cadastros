/**
 * CNPJ Consulta - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para consulta automática de dados de CNPJ
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configura a consulta de CNPJ
    setupCNPJConsulta();
});

/**
 * Configura a consulta automática de CNPJ
 */
function setupCNPJConsulta() {
    const cnpjInput = document.getElementById('cnpj');
    if (!cnpjInput) return;
    
    cnpjInput.addEventListener('blur', async function() {
        const cnpj = cnpjInput.value.replace(/\D/g, '');
        
        // Verifica se o CNPJ tem 14 dígitos
        if (cnpj.length !== 14) return;
        
        // Verifica se o CNPJ é válido
        if (!Utils.validarCNPJ(cnpj)) {
            Notification.error('CNPJ inválido');
            return;
        }
        
        try {
            // Exibe mensagem de carregamento
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'alert alert-info mt-2';
            loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando CNPJ...';
            cnpjInput.parentNode.appendChild(loadingMessage);
            
            // Consulta o CNPJ na API
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            const data = await response.json();
            
            if (response.status !== 200) {
                throw new Error(data.message || 'Erro ao consultar CNPJ');
            }
            
            // Preenche os campos com os dados retornados
            document.getElementById('razaoSocial').value = data.razao_social || '';
            document.getElementById('nomeFantasia').value = data.nome_fantasia || '';
            
            // Preenche o porte da empresa
            const porteEmpresa = document.getElementById('porteEmpresa');
            if (porteEmpresa) {
                if (data.porte) {
                    switch (data.porte.toLowerCase()) {
                        case 'micro empresa':
                            porteEmpresa.value = 'ME';
                            break;
                        case 'pequeno porte':
                            porteEmpresa.value = 'EPP';
                            break;
                        case 'medio porte':
                            porteEmpresa.value = 'MEDIO';
                            break;
                        case 'grande porte':
                            porteEmpresa.value = 'GRANDE';
                            break;
                        default:
                            porteEmpresa.value = '';
                    }
                }
            }
            
            // Preenche a natureza jurídica
            if (data.natureza_juridica) {
                document.getElementById('naturezaJuridica').value = data.natureza_juridica.codigo || '';
            }
            
            // Preenche o CNAE principal
            if (data.cnae_fiscal) {
                document.getElementById('cnaePrincipal').value = data.cnae_fiscal;
            }
            
            // Preenche a data de abertura
            if (data.data_inicio_atividade) {
                const dataAbertura = new Date(data.data_inicio_atividade);
                const dataFormatada = dataAbertura.toISOString().split('T')[0];
                document.getElementById('dataAbertura').value = dataFormatada;
            }
            
            // Preenche o endereço
            if (data.cep) {
                document.getElementById('cep').value = data.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                
                // Dispara o evento de busca de CEP
                const cepInput = document.getElementById('cep');
                const blurEvent = new Event('blur');
                cepInput.dispatchEvent(blurEvent);
            } else {
                // Preenche o endereço manualmente
                document.getElementById('logradouro').value = data.logradouro || '';
                document.getElementById('numero').value = data.numero || '';
                document.getElementById('complemento').value = data.complemento || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.municipio || '';
                
                // Seleciona a UF
                const ufSelect = document.getElementById('uf');
                if (ufSelect && data.uf) {
                    Array.from(ufSelect.options).forEach(option => {
                        if (option.value === data.uf) {
                            option.selected = true;
                        }
                    });
                }
            }
            
            // Preenche o telefone
            if (data.ddd_telefone_1) {
                document.getElementById('telefone').value = Utils.formatTelefone(data.ddd_telefone_1);
            }
            
            // Preenche o email
            if (data.email) {
                document.getElementById('email').value = data.email;
            }
            
            // Exibe mensagem de sucesso
            loadingMessage.className = 'alert alert-success mt-2';
            loadingMessage.innerHTML = '<i class="fas fa-check-circle"></i> CNPJ consultado com sucesso!';
            
            // Remove a mensagem após 3 segundos
            setTimeout(() => {
                loadingMessage.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao consultar CNPJ:', error);
            Notification.error('Erro ao consultar CNPJ. Verifique se o número está correto.');
            
            // Remove a mensagem de carregamento
            const loadingMessage = cnpjInput.parentNode.querySelector('.alert');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
    });
}