/**
 * Script para gerenciar o carregamento de dados de pessoas físicas e instituições
 * na página de cadastro de usuários
 */

document.addEventListener('DOMContentLoaded', function() {
    // Carrega pessoas físicas e instituições
    carregarPessoasFisicas();
    carregarInstituicoes();
    
    // Configura máscaras para campos de telefone
    if (window.jQuery && $.fn.mask) {
        $('#telefone_institucional').mask('(00) 00000-0000');
        $('#ramal_institucional').mask('0000');
    }
    
    // Configura evento de mudança na seleção de pessoa física
    document.getElementById('nome').addEventListener('change', function() {
        const pessoaId = this.value;
        if (pessoaId) {
            carregarDadosPessoaFisica(pessoaId);
        } else {
            // Limpa os campos
            document.getElementById('email').value = '';
            document.getElementById('telefone').value = '';
        }
    });
});

/**
 * Carrega lista de pessoas físicas do banco de dados
 */
function carregarPessoasFisicas() {
    // Buscar pessoas físicas reais da API
    fetch('/api/pessoas-fisicas')
        .then(res => res.json())
        .then(pessoasFisicas => {
            const selectPessoa = document.getElementById('nome');
            // Limpa opções existentes, exceto a primeira
            while (selectPessoa.options.length > 1) {
                selectPessoa.remove(1);
            }
            pessoasFisicas.forEach(pessoa => {
                const option = document.createElement('option');
                option.value = pessoa.id;
                option.textContent = `${pessoa.nome_completo} (${pessoa.cpf})`;
                option.dataset.email = pessoa.email_principal;
                option.dataset.telefone = pessoa.telefone_principal;
                selectPessoa.appendChild(option);
            });
        })
        .catch(() => {});
}

/**
 * Carrega dados da pessoa física selecionada
 */
function carregarDadosPessoaFisica(pessoaId) {
    // Em produção, isso seria uma chamada para a API
    // Aqui estamos usando os dados armazenados no dataset das opções
    const option = document.querySelector(`#nome option[value="${pessoaId}"]`);
    
    if (option) {
        document.getElementById('email').value = option.dataset.email || '';
        document.getElementById('telefone').value = option.dataset.telefone || '';
    }
}

/**
 * Carrega lista de instituições (pessoas jurídicas) do banco de dados
 */
function carregarInstituicoes() {
    // Buscar instituições reais da API
    fetch('/api/instituicoes')
        .then(res => res.json())
        .then(instituicoes => {
            const selectInstituicao = document.getElementById('instituicao');
            while (selectInstituicao.options.length > 1) {
                selectInstituicao.remove(1);
            }
            instituicoes.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.id;
                option.textContent = `${inst.razao_social} (${inst.cnpj})`;
                selectInstituicao.appendChild(option);
            });
        })
        .catch(() => {});
}

/**
 * Prepara o formulário para edição de um usuário existente
 */
function prepararEdicaoUsuario(usuario) {
    // Preenche os campos com os dados do usuário
    if (usuario.pessoa_fisica_id) {
        document.getElementById('nome').value = usuario.pessoa_fisica_id;
        carregarDadosPessoaFisica(usuario.pessoa_fisica_id);
    }
    
    if (usuario.instituicao_id) {
        document.getElementById('instituicao').value = usuario.instituicao_id;
    }
    
    // Preenche os campos de dados profissionais
    document.getElementById('departamento').value = usuario.departamento || '';
    document.getElementById('cargo').value = usuario.cargo || '';
    document.getElementById('email_institucional').value = usuario.email_institucional || '';
    document.getElementById('telefone_institucional').value = usuario.telefone_institucional || '';
    document.getElementById('ramal_institucional').value = usuario.ramal_institucional || '';
    
    // Preenche os campos de acesso
    document.getElementById('tipo_usuario').value = usuario.tipo_usuario || '';
    document.getElementById('tipoAcesso').value = usuario.tipo_acesso || '';
}