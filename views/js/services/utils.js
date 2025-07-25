/**
 * Utils Service - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Funções utilitárias para o sistema
 */

const Utils = {
    /**
     * Formata um CPF (xxx.xxx.xxx-xx)
     * @param {string} cpf - CPF a ser formatado
     * @returns {string} - CPF formatado
     */
    formatCPF(cpf) {
        if (!cpf) return '';
        
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Aplica a máscara
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    /**
     * Formata um CNPJ (xx.xxx.xxx/xxxx-xx)
     * @param {string} cnpj - CNPJ a ser formatado
     * @returns {string} - CNPJ formatado
     */
    formatCNPJ(cnpj) {
        if (!cnpj) return '';
        
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/\D/g, '');
        
        // Aplica a máscara
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    
    /**
     * Formata um telefone ((xx) xxxxx-xxxx)
     * @param {string} telefone - Telefone a ser formatado
     * @returns {string} - Telefone formatado
     */
    formatTelefone(telefone) {
        if (!telefone) return '';
        
        // Remove caracteres não numéricos
        telefone = telefone.replace(/\D/g, '');
        
        // Aplica a máscara conforme o tamanho
        if (telefone.length === 11) {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telefone.length === 10) {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return telefone;
    },
    
    /**
     * Formata uma data (DD/MM/YYYY)
     * @param {string} data - Data a ser formatada
     * @returns {string} - Data formatada
     */
    formatData(data) {
        if (!data) return '';
        
        const date = new Date(data);
        
        if (isNaN(date.getTime())) {
            return '';
        }
        
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    },
    
    /**
     * Formata um valor monetário (R$ x.xxx,xx)
     * @param {number} valor - Valor a ser formatado
     * @returns {string} - Valor formatado
     */
    formatMoeda(valor) {
        if (valor === undefined || valor === null) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },
    
    /**
     * Valida um CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} - True se válido, false caso contrário
     */
    validarCPF(cpf) {
        if (!cpf) return false;
        
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let resto = soma % 11;
        let dv1 = resto < 2 ? 0 : 11 - resto;
        
        if (parseInt(cpf.charAt(9)) !== dv1) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        resto = soma % 11;
        let dv2 = resto < 2 ? 0 : 11 - resto;
        
        return parseInt(cpf.charAt(10)) === dv2;
    },
    
    /**
     * Valida um CNPJ
     * @param {string} cnpj - CNPJ a ser validado
     * @returns {boolean} - True se válido, false caso contrário
     */
    validarCNPJ(cnpj) {
        if (!cnpj) return false;
        
        // Remove caracteres não numéricos
        cnpj = cnpj.replace(/\D/g, '');
        
        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        // Validação do primeiro dígito verificador
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) return false;
        
        // Validação do segundo dígito verificador
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        
        return resultado === parseInt(digitos.charAt(1));
    },
    
    /**
     * Gera um ID único
     * @returns {string} - ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};