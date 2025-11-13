/**
 * ================================================
 * CADASTRO PESSOA FÍSICA - PÁGINA PÚBLICA
 * ================================================
 * Gerencia o formulário de cadastro público de pessoa física
 * Inclui validações, máscara de inputs e integração com APIs
 */

console.log('🔄 Iniciando configurações...');

// ========================================
// INICIALIZAÇÃO DOS HANDLERS
// ========================================

/**
 * Inicializa handlers de pessoa física
 */
function initPessoaFisicaHandlers() {
    console.log('✅ Handlers de pessoa física inicializados');

    // Configura botão de voltar
    const btnVoltar = document.getElementById('auto_evt_898c1af1');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function () {
            window.location.href = '/';
        });
    }
}

// ========================================
// LOCALIZAÇÃO BR - ESTADOS E MUNICÍPIOS
// ========================================

/**
 * Carrega estados brasileiros nos selects de UF
 */
async function carregarEstados() {
    console.log('📍 Carregando estados brasileiros...');

    try {
        // Verifica se o módulo de localização está disponível
        if (!window.localizacaoBR) {
            console.warn('⚠️ Módulo localizacaoBR não encontrado');
            return;
        }

        // Busca estados do JSON
        const response = await fetch('/static/data/estados-br.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar estados');
        }

        const estados = await response.json();

        // Popula todos os selects de UF
        const selectsUF = [
            document.getElementById('ufRg'),
            document.getElementById('uf'),
            document.getElementById('ufNaturalidade')
        ];

        selectsUF.forEach(select => {
            if (select) {
                // Limpa options existentes (exceto o primeiro)
                while (select.options.length > 1) {
                    select.remove(1);
                }

                // Adiciona estados
                estados.forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado.sigla;
                    option.textContent = `${estado.sigla} - ${estado.nome}`;
                    select.appendChild(option);
                });

                console.log(`✅ Estados carregados no select: ${select.id}`);
            }
        });

        // Configura evento de mudança para carregar municípios da naturalidade
        const ufNaturalidade = document.getElementById('ufNaturalidade');
        if (ufNaturalidade) {
            ufNaturalidade.addEventListener('change', async function () {
                await carregarMunicipiosPorUF(this.value, 'municipioNaturalidade');
            });
        }

    } catch (error) {
        console.error('❌ Erro ao carregar estados:', error);
    }
}

/**
 * Carrega municípios de um estado específico
 * @param {string} uf - Sigla do estado
 * @param {string} selectId - ID do select de destino
 */
async function carregarMunicipiosPorUF(uf, selectId) {
    if (!uf) {
        return;
    }

    console.log(`📍 Carregando municípios para UF: ${uf}`);

    try {
        const response = await fetch(`/static/data/municipios-${uf.toLowerCase()}.json`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar municípios de ${uf}`);
        }

        const municipios = await response.json();
        const select = document.getElementById(selectId);

        if (select) {
            // Limpa options existentes
            select.innerHTML = '<option value="">Selecione o Município</option>';

            // Adiciona municípios
            municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.codigo_ibge || municipio.nome;
                option.textContent = municipio.nome;
                select.appendChild(option);
            });

            console.log(`✅ ${municipios.length} municípios carregados para ${uf}`);
        }

    } catch (error) {
        console.error(`❌ Erro ao carregar municípios de ${uf}:`, error);

        // Fallback: desabilita e mostra mensagem
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Municípios não disponíveis</option>';
            select.disabled = true;
        }
    }
}

// ========================================
// MÁSCARAS DE INPUT
// ========================================

/**
 * Aplica máscaras nos campos do formulário
 */
function aplicarMascaras() {
    console.log('🎭 Aplicando máscaras de input...');

    try {
        // Verifica se o script de máscaras está disponível
        if (typeof window.InputMasks === 'undefined') {
            console.warn('⚠️ script_input_masks.js não carregou corretamente');
            return;
        }

        // Compatibilidade: InputMasks pode expor funções helper ou um manager com setupField/setupFields
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            if (typeof window.InputMasks.cpf === 'function') {
                window.InputMasks.cpf(cpfInput);
            } else if (typeof window.InputMasks.setupField === 'function') {
                window.InputMasks.setupField('cpf', 'cpf');
            }
        }

        const cepInput = document.getElementById('cep');
        if (cepInput) {
            if (typeof window.InputMasks.cep === 'function') {
                window.InputMasks.cep(cepInput);
            } else if (typeof window.InputMasks.setupField === 'function') {
                window.InputMasks.setupField('cep', 'cep');
            }
        }

        const telefoneInputs = [
            document.getElementById('telefone'),
            document.getElementById('telefoneSecundario')
        ];

        telefoneInputs.forEach(input => {
            if (input) {
                if (typeof window.InputMasks.telefone === 'function') {
                    window.InputMasks.telefone(input);
                } else if (typeof window.InputMasks.setupField === 'function') {
                    window.InputMasks.setupField(input.id, 'telefone');
                }
            }
        });

        console.log('✅ Máscaras aplicadas com sucesso');

    } catch (error) {
        console.error('❌ Erro ao aplicar máscaras:', error);
    }
}

// ========================================
// VALIDAÇÃO CPF E CEP
// ========================================

/**
 * Configura validações de CPF e CEP
 */
function configurarValidacoes() {
    console.log('✅ Configurando validações de CPF e CEP...');

    try {
        // Verifica se o módulo CPFCEPApis está disponível
        if (typeof window.CPFCEPApis === 'undefined') {
            console.warn('⚠️ Módulo CPFCEPApis não encontrado');
            return;
        }

        // Configura validação de CPF
        if (window.CPFCEPApis.setupCPFValidation) {
            window.CPFCEPApis.setupCPFValidation('cpf');
            console.log('✅ Validação de CPF configurada');
        } else {
            console.warn('⚠️ Função setupCPFValidation não encontrada');
        }

        // Configura busca automática de CEP
        if (window.CPFCEPApis.setupCEPAutocomplete) {
            window.CPFCEPApis.setupCEPAutocomplete('cep', {
                logradouro: 'logradouro',
                bairro: 'bairro',
                cidade: 'cidade',
                uf: 'uf'
            });
            console.log('✅ Autocomplete de CEP configurado');
        } else {
            console.warn('⚠️ Função setupCEPAutocomplete não encontrada');
        }

    } catch (error) {
        console.error('❌ Erro ao configurar validações:', error);
    }
}

// ========================================
// VALIDAÇÃO DO FORMULÁRIO
// ========================================

/**
 * Configura validação do formulário Bootstrap
 */
function configurarValidacaoFormulario() {
    const form = document.getElementById('pessoaFisicaPublicForm');

    if (!form) {
        console.warn('❌ Formulário pessoaFisicaPublicForm não encontrado');
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            // Formulário válido - enviar dados
            enviarFormulario(form);
        } else {
            // Formulário inválido - mostrar erros
            form.classList.add('was-validated');

            // Scroll para o primeiro campo com erro
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
        }
    });

    console.log('✅ Validação do formulário configurada');
}

/**
 * Envia o formulário para o backend
 * @param {HTMLFormElement} form - Formulário a ser enviado
 */
async function enviarFormulario(form) {
    console.log('📤 Enviando formulário...');

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Mostra loading
        mostrarProgresso('Enviando dados...');

        const primaryEndpoint = '/api/cadastro/pessoa-fisica';
        const fallbackEndpoint = '/api/pessoa-fisica';

        let response;
        try {
            response = await fetch(primaryEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (primaryErr) {
            console.warn('Falha no endpoint primário, tentando fallback:', primaryErr);
            try {
                response = await fetch(fallbackEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } catch (fallbackErr) {
                console.error('Falha no endpoint de fallback:', fallbackErr);
                throw new Error('Falha ao conectar com o servidor. Tente novamente mais tarde.');
            }
        }

        if (response.ok) {
            // Sucesso
            esconderProgresso();
            mostrarModalSucesso();
            form.reset();
            form.classList.remove('was-validated');
        } else {
            // Erro
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar cadastro');
        }

    } catch (error) {
        console.error('❌ Erro ao enviar formulário:', error);
        esconderProgresso();
        mostrarErro(error.message || 'Erro ao processar sua solicitação');
    }
}

/**
 * Mostra feedback de progresso
 * @param {string} mensagem - Mensagem a exibir
 */
function mostrarProgresso(mensagem) {
    const container = document.getElementById('progressContainer');
    const message = document.getElementById('progressMessage');

    if (container && message) {
        message.textContent = mensagem;
        container.style.display = 'block';
    }
}

/**
 * Esconde feedback de progresso
 */
function esconderProgresso() {
    const container = document.getElementById('progressContainer');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Mostra modal de sucesso
 */
function mostrarModalSucesso() {
    const modal = document.getElementById('successModal');
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

/**
 * Mostra mensagem de erro
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErro(mensagem) {
    alert(`Erro: ${mensagem}`);
    // TODO: Implementar toast de erro mais elegante
}

// ========================================
// INICIALIZAÇÃO PRINCIPAL
// ========================================

/**
 * Inicializa toda a página quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 DOM carregado - inicializando página de cadastro');

    try {
        // Inicializa handlers básicos
        initPessoaFisicaHandlers();

        // Preferência: usar LocalizacaoBR Manager global, senão usar fallback estático
        if (window.localizacaoBR) {
            try {
                await window.localizacaoBR.inicializar(
                    ['uf', 'ufRg', 'ufNaturalidade'],
                    [
                        { ufSelectId: 'ufNaturalidade', municipioSelectId: 'municipioNaturalidade' }
                    ]
                );

                // Preencher selects uf via localizacaoBR
                await window.localizacaoBR.preencherSelectUFs('uf');
                await window.localizacaoBR.preencherSelectUFs('ufRg');
            } catch (e) {
                console.warn('⚠️ Falha na inicialização de localizacaoBR, usando fallback estático', e);
                await carregarEstados();
            }
        } else {
            await carregarEstados();
        }

        // Aplica máscaras de input
        aplicarMascaras();

        // Configura validações
        configurarValidacoes();

        // Configura validação do formulário
        configurarValidacaoFormulario();

        console.log('✅ Página de cadastro inicializada com sucesso');

    } catch (error) {
        console.error('❌ Erro na inicialização da página:', error);
    }
});
