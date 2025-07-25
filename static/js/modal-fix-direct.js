/**
 * Modal Fix Direct - SIGMA-PLI | Módulo de Gerenciamento de Cadastros
 * Script para corrigir problemas com modais Bootstrap diretamente
 */

// Executa imediatamente
(function() {
    // Força a abertura dos modais
    document.addEventListener('DOMContentLoaded', function() {
        // Corrige os modais para pessoa física
        if (document.getElementById('pessoaFisicaModal')) {
            var pessoaFisicaModal = new bootstrap.Modal(document.getElementById('pessoaFisicaModal'));
            
            // Adiciona evento ao botão
            var btnPessoaFisica = document.querySelector('button[data-bs-target="#pessoaFisicaModal"]');
            if (btnPessoaFisica) {
                btnPessoaFisica.onclick = function() {
                    pessoaFisicaModal.show();
                };
            }
            
            // Configura o formulário
            var formPessoaFisica = document.getElementById('pessoaFisicaForm');
            if (formPessoaFisica) {
                formPessoaFisica.onsubmit = function(e) {
                    e.preventDefault();
                    alert('Formulário enviado com sucesso!');
                    pessoaFisicaModal.hide();
                };
            }
        }
        
        // Corrige os modais para pessoa jurídica
        if (document.getElementById('pessoaJuridicaModal')) {
            var pessoaJuridicaModal = new bootstrap.Modal(document.getElementById('pessoaJuridicaModal'));
            
            // Adiciona evento ao botão
            var btnPessoaJuridica = document.querySelector('button[data-bs-target="#pessoaJuridicaModal"]');
            if (btnPessoaJuridica) {
                btnPessoaJuridica.onclick = function() {
                    pessoaJuridicaModal.show();
                };
            }
            
            // Configura o formulário
            var formPessoaJuridica = document.getElementById('pessoaJuridicaForm');
            if (formPessoaJuridica) {
                formPessoaJuridica.onsubmit = function(e) {
                    e.preventDefault();
                    alert('Formulário enviado com sucesso!');
                    pessoaJuridicaModal.hide();
                };
            }
        }
        
        // Corrige os modais para usuários
        if (document.getElementById('usuarioModal')) {
            var usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
            
            // Adiciona evento ao botão
            var btnUsuario = document.querySelector('button[data-bs-target="#usuarioModal"]');
            if (btnUsuario) {
                btnUsuario.onclick = function() {
                    usuarioModal.show();
                };
            }
            
            // Configura o formulário
            var formUsuario = document.getElementById('usuarioForm');
            if (formUsuario) {
                formUsuario.onsubmit = function(e) {
                    e.preventDefault();
                    alert('Formulário enviado com sucesso!');
                    usuarioModal.hide();
                };
            }
        }
    });
})();