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
    // Em produção, isso seria uma chamada para a API
    // Simulando dados para demonstração
    const pessoasFisicas = [
        { id: '1', nome: 'João Silva', cpf: '123.456.789-00', email: 'joao@exemplo.com', telefone: '(11) 98765-4321' },
        { id: '2', nome: 'Maria Oliveira', cpf: '987.654.321-00', email: 'maria@exemplo.com', telefone: '(11) 91234-5678' },
        { id: '3', nome: 'Carlos Santos', cpf: '456.789.123-00', email: 'carlos@exemplo.com', telefone: '(11) 95555-9999' }
    ];
    
    const selectPessoa = document.getElementById('nome');
    
    // Limpa opções existentes, exceto a primeira
    while (selectPessoa.options.length > 1) {
        selectPessoa.remove(1);
    }
    
    // Adiciona opções ao select
    pessoasFisicas.forEach(pessoa => {
        const option = document.createElement('option');
        option.value = pessoa.id;
        option.textContent = `${pessoa.nome} (${pessoa.cpf})`;
        option.dataset.email = pessoa.email;
        option.dataset.telefone = pessoa.telefone;
        selectPessoa.appendChild(option);
    });
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
    // Em produção, isso seria uma chamada para a API
    // Simulando dados para demonstração
    const instituicoes = [
        { id: '1', nome: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90' },
        { id: '2', nome: 'XYZ Tecnologia S.A.', cnpj: '98.765.432/0001-10' },
        { id: '3', nome: 'Prefeitura Municipal', cnpj: '11.222.333/0001-44' }
    ];
    
    const selectInstituicao = document.getElementById('instituicao');
    
    // Limpa opções existentes, exceto a primeira
    while (selectInstituicao.options.length > 1) {
        selectInstituicao.remove(1);
    }
    
    // Adiciona opções ao select
    instituicoes.forEach(instituicao => {
        const option = document.createElement('option');
        option.value = instituicao.id;
        option.textContent = `${instituicao.nome} (${instituicao.cnpj})`;
        selectInstituicao.appendChild(option);
    });
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