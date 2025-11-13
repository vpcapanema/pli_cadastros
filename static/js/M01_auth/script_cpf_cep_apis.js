(function () {
    'use strict';

    const CONFIG = {
        API_CPF_VALIDAR: '/api/v1/externas/cpf/validar',
        API_CNPJ_VALIDAR: '/api/v1/externas/cnpj/validar',
        API_CEP_CONSULTAR: '/api/v1/externas/cep/consultar',
        DEBOUNCE_DELAY: 500 // ms
    };

    let debounceTimers = {};

    function formatarCPF(cpf) {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cleaned;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function limparCPF(cpf) {
        return cpf.replace(/\D/g, '');
    }

    function formatarCEP(cep) {
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length !== 8) return cleaned;
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    function limparCEP(cep) {
        return cep.replace(/\D/g, '');
    }

    function mostrarErro(elementId, mensagem) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.classList.add('is-invalid');
            const feedback = elemento.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = mensagem;
                feedback.style.display = 'block';
            }
        }
    }

    function limparErro(elementId) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.classList.remove('is-invalid');
            const feedback = elemento.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }
    }

    function mostrarSucesso(elementId) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.classList.remove('is-invalid');
            elemento.classList.add('is-valid');
        }
    }

    async function validarCPF(cpf, elementId = 'documento') {
        try {
            const cpfLimpo = limparCPF(cpf);

            if (cpfLimpo.length !== 11) {
                mostrarErro(elementId, 'CPF deve conter 11 dígitos');
                return false;
            }

            const response = await fetch(CONFIG.API_CPF_VALIDAR, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cpf: cpfLimpo })
            });

            if (!response.ok) {
                throw new Error('Erro ao validar CPF');
            }

            const data = await response.json();

            if (data.valido) {
                mostrarSucesso(elementId);
                limparErro(elementId);
                return true;
            } else {
                mostrarErro(elementId, data.mensagem || 'CPF inválido');
                return false;
            }

        } catch (error) {
            console.error('Erro ao validar CPF:', error);
            mostrarErro(elementId, 'Erro ao validar CPF. Tente novamente.');
            return false;
        }
    }

    async function consultarCEP(cep, elementId = 'cep') {
        try {
            const cepLimpo = limparCEP(cep);

            if (cepLimpo.length !== 8) {
                mostrarErro(elementId, 'CEP deve conter 8 dígitos');
                return null;
            }

            const response = await fetch(CONFIG.API_CEP_CONSULTAR, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cep: cepLimpo })
            });

            if (!response.ok) {
                throw new Error('Erro ao consultar CEP');
            }

            const data = await response.json();

            if (data.erro) {
                mostrarErro(elementId, data.mensagem || 'CEP não encontrado');
                return null;
            }

            mostrarSucesso(elementId);
            limparErro(elementId);
            return data;

        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            mostrarErro(elementId, 'Erro ao consultar CEP. Verifique a entrada.');
            return null;
        }
    }

    function preencherEndereco(dados) {
        if (dados.logradouro) {
            const logradouro = document.getElementById('logradouro');
            if (logradouro) logradouro.value = dados.logradouro;
        }

        if (dados.bairro) {
            const bairro = document.getElementById('bairro');
            if (bairro) bairro.value = dados.bairro;
        }

        if (dados.localidade) {
            const cidade = document.getElementById('cidade');
            if (cidade) cidade.value = dados.localidade;
        }

        if (dados.uf) {
            const estado = document.getElementById('uf');
            if (estado) estado.value = dados.uf;
        }

        if (dados.complemento) {
            const complemento = document.getElementById('complemento');
            if (complemento) complemento.value = dados.complemento;
        }
    }

    function preencherEmpresa(dados) {
        if (dados.nome) {
            const nome = document.getElementById('razao_social');
            if (nome) nome.value = dados.nome;
        }

        if (dados.nome_fantasia) {
            const fantasia = document.getElementById('nome_fantasia');
            if (fantasia) fantasia.value = dados.nome_fantasia;
        }

        if (dados.logradouro) {
            const logradouro = document.getElementById('endereco_empresa');
            if (logradouro) logradouro.value = dados.logradouro;
        }

        if (dados.numero) {
            const numero = document.getElementById('numero_empresa');
            if (numero) numero.value = dados.numero;
        }

        if (dados.complemento) {
            const complemento = document.getElementById('complemento_empresa');
            if (complemento) complemento.value = dados.complemento;
        }

        if (dados.bairro) {
            const bairro = document.getElementById('bairro_empresa');
            if (bairro) bairro.value = dados.bairro;
        }

        if (dados.municipio) {
            const cidade = document.getElementById('cidade_empresa');
            if (cidade) cidade.value = dados.municipio;
        }

        if (dados.uf) {
            const estado = document.getElementById('estado_empresa');
            if (estado) estado.value = dados.uf;
        }

        if (dados.cep) {
            const cep = document.getElementById('cep_empresa');
            if (cep) cep.value = dados.cep;
        }

        if (dados.telefone) {
            const telefone = document.getElementById('telefone_empresa');
            if (telefone) telefone.value = dados.telefone;
        }

        if (dados.email) {
            const email = document.getElementById('email_empresa');
            if (email) email.value = dados.email;
        }
    }

    function formatarCNPJ(cnpj) {
        const cleaned = cnpj.replace(/\D/g, '');
        if (cleaned.length !== 14) return cleaned;
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    function limparCNPJ(cnpj) {
        return cnpj.replace(/\D/g, '');
    }

    async function validarCNPJ(cnpj, elementId = 'documento_empresa') {
        try {
            const cnpjLimpo = limparCNPJ(cnpj);

            if (cnpjLimpo.length !== 14) {
                mostrarErro(elementId, 'CNPJ deve conter 14 dígitos');
                return false;
            }

            const response = await fetch(CONFIG.API_CNPJ_VALIDAR, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cnpj: cnpjLimpo })
            });

            if (!response.ok) {
                throw new Error('Erro ao validar CNPJ');
            }

            const data = await response.json();

            if (data.valido) {
                mostrarSucesso(elementId);
                limparErro(elementId);

                preencherEmpresa(data);

                return true;
            } else {
                mostrarErro(elementId, data.mensagem || 'CNPJ inválido');
                return false;
            }

        } catch (error) {
            console.error('Erro ao validar CNPJ:', error);
            mostrarErro(elementId, 'Erro ao validar CNPJ. Tente novamente.');
            return false;
        }
    }

    function setupCPFValidation(elementId = 'cpf') {
        const cpfInput = document.getElementById(elementId);
        if (!cpfInput) return;

        cpfInput.addEventListener('blur', async (e) => {
            const cpf = e.target.value.trim();
            if (cpf.length > 0) {
                await validarCPF(cpf, elementId);
            }
        });

        cpfInput.addEventListener('input', (e) => {
            const cpf = e.target.value;
            if (cpf.length === 11 && limparCPF(cpf).length === 11) {
                e.target.value = formatarCPF(cpf);
            }
        });

        console.log(`✅ setupCPFValidation aplicado ao elemento #${elementId}`);
    }

    function setupCNPJValidation(elementId = 'documento_empresa') {
        const cnpjInput = document.getElementById(elementId);
        if (!cnpjInput) return;

        cnpjInput.addEventListener('blur', async (e) => {
            const cnpj = e.target.value.trim();
            if (cnpj.length > 0) {
                await validarCNPJ(cnpj, elementId);
            }
        });

        cnpjInput.addEventListener('input', (e) => {
            const cnpj = e.target.value;
            if (limparCNPJ(cnpj).length === 14) {
                e.target.value = formatarCNPJ(cnpj);
            }
        });

        console.log(`✅ setupCNPJValidation aplicado ao elemento #${elementId}`);
    }

    function setupCEPConsultation(elementId = 'cep') {
        const cepInput = document.getElementById(elementId);
        if (!cepInput) return;

        cepInput.addEventListener('blur', async (e) => {
            const cep = e.target.value.trim();
            if (cep.length === 8 || cep.length === 9) {
                const dados = await consultarCEP(cep, elementId);
                if (dados) {
                    preencherEndereco(dados);
                }
            }
        });

        cepInput.addEventListener('input', (e) => {
            const cep = e.target.value;
            if (limparCEP(cep).length === 8) {
                e.target.value = formatarCEP(cep);
            }
        });

        console.log(`✅ setupCEPConsultation aplicado ao elemento #${elementId}`);
    }

    function inicializar() {
        document.addEventListener('DOMContentLoaded', () => {
            setupCPFValidation('cpf');
            setupCNPJValidation('documento_empresa');
            setupCEPConsultation('cep');
        });
    }

    window.CPFCEPApis = {
        formatarCPF,
        limparCPF,
        formatarCEP,
        limparCEP,
        formatarCNPJ,
        limparCNPJ,
        validarCPF,
        validarCNPJ,
        consultarCEP,
        preencherEndereco,
        preencherEmpresa,
        // Exportar helpers de inicialização reutilizáveis
        setupCPFValidation,
        setupCNPJValidation,
        setupCEPConsultation,
        // Nome alternativo esperado por alguns scripts
        setupCEPAutocomplete: setupCEPConsultation
    };

    inicializar();

})();
