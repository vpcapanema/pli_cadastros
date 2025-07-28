/**
 * Teste do Sistema de Sessões - SIGMA-PLI
 * Script para verificar todas as funcionalidades
 */

const crypto = require('crypto');

class SessionSystemTest {
    constructor() {
        this.baseUrl = 'http://localhost:8888';
        this.testResults = [];
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        console.log('🧪 Iniciando testes do sistema de sessões...\n');

        try {
            // Testes de API
            await this.testSessionAPI();
            await this.testAuthAPI();
            await this.testStatsAPI();

            // Verificar arquivos
            await this.testFiles();

            // Exibir resultados
            this.showResults();

        } catch (error) {
            console.error('❌ Erro nos testes:', error);
        }
    }

    /**
     * Testa endpoints de sessões
     */
    async testSessionAPI() {
        console.log('🔍 Testando API de sessões...');

        // Teste 1: Listar sessões ativas (sem auth)
        try {
            const response = await fetch(`${this.baseUrl}/api/sessions/ativas`);
            this.addResult('API Sessions - Listar (sem auth)', response.status === 401, 
                'Deve retornar 401 sem autenticação');
        } catch (error) {
            this.addResult('API Sessions - Listar (sem auth)', false, `Erro: ${error.message}`);
        }

        // Teste 2: Estatísticas (sem auth)
        try {
            const response = await fetch(`${this.baseUrl}/api/sessions/estatisticas`);
            this.addResult('API Sessions - Estatísticas (sem auth)', response.status === 401, 
                'Deve retornar 401 sem autenticação');
        } catch (error) {
            this.addResult('API Sessions - Estatísticas (sem auth)', false, `Erro: ${error.message}`);
        }

        console.log('✅ Testes de API de sessões concluídos\n');
    }

    /**
     * Testa endpoints de autenticação
     */
    async testAuthAPI() {
        console.log('🔐 Testando API de autenticação...');

        // Teste de login inválido
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'usuario_inexistente',
                    password: 'senha_errada'
                })
            });
            
            const data = await response.json();
            this.addResult('Auth - Login inválido', !data.sucesso, 
                'Login com credenciais inválidas deve falhar');
        } catch (error) {
            this.addResult('Auth - Login inválido', false, `Erro: ${error.message}`);
        }

        console.log('✅ Testes de autenticação concluídos\n');
    }

    /**
     * Testa endpoint de estatísticas
     */
    async testStatsAPI() {
        console.log('📊 Testando API de estatísticas...');

        try {
            const response = await fetch(`${this.baseUrl}/api/estatisticas`);
            const data = await response.json();
            
            this.addResult('API Estatísticas - Acesso público', response.ok, 
                'Endpoint de estatísticas deve ser acessível');
                
            if (data.sucesso) {
                this.addResult('API Estatísticas - Estrutura', 
                    data.estatisticas && typeof data.estatisticas === 'object',
                    'Deve retornar objeto de estatísticas');
            }
        } catch (error) {
            this.addResult('API Estatísticas', false, `Erro: ${error.message}`);
        }

        console.log('✅ Testes de estatísticas concluídos\n');
    }

    /**
     * Verifica se todos os arquivos necessários existem
     */
    async testFiles() {
        console.log('📁 Verificando arquivos do sistema...');

        const fs = require('fs').promises;
        const path = require('path');
        const basePath = 'c:\\Users\\vinic\\pli_cadastros';

        const files = [
            // Backend
            'src/services/SessionService.js',
            'src/middleware/sessionAuth.js',
            'src/routes/sessions.js',
            'src/jobs/sessionJobs.js',
            
            // Frontend
            'static/js/sessionMonitor.js',
            'static/js/session-auto-init.js',
            'static/js/pages/sessions-manager.js',
            'static/css/sessions-manager.css',
            
            // Views
            'views/sessions-manager.html'
        ];

        for (const file of files) {
            try {
                const fullPath = path.join(basePath, file);
                await fs.access(fullPath);
                this.addResult(`Arquivo - ${file}`, true, 'Arquivo existe');
            } catch (error) {
                this.addResult(`Arquivo - ${file}`, false, 'Arquivo não encontrado');
            }
        }

        console.log('✅ Verificação de arquivos concluída\n');
    }

    /**
     * Adiciona resultado do teste
     */
    addResult(test, passed, message) {
        this.testResults.push({
            test,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Exibe resultados dos testes
     */
    showResults() {
        console.log('📋 RESULTADOS DOS TESTES\n');
        console.log('='.repeat(60));

        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;

        this.testResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.test}`);
            console.log(`   ${result.message}\n`);
        });

        console.log('='.repeat(60));
        console.log(`📊 RESUMO: ${passed}/${total} testes aprovados (${((passed/total)*100).toFixed(1)}%)`);

        if (passed === total) {
            console.log('🎉 Todos os testes passaram! Sistema funcionando corretamente.');
        } else {
            console.log('⚠️  Alguns testes falharam. Verifique os problemas acima.');
        }

        console.log('\n🔗 Para testar manualmente:');
        console.log(`   • Login: ${this.baseUrl}/login.html`);
        console.log(`   • Dashboard: ${this.baseUrl}/dashboard.html`);
        console.log(`   • Gerenciador: ${this.baseUrl}/sessions-manager.html`);
    }

    /**
     * Gera relatório em JSON
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.passed).length,
                failed: this.testResults.filter(r => !r.passed).length
            },
            tests: this.testResults
        };

        const fs = require('fs');
        fs.writeFileSync('session-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Relatório salvo em: session-test-report.json');
    }
}

// Executar testes se chamado diretamente
if (require.main === module) {
    const test = new SessionSystemTest();
    test.runAllTests().then(() => {
        test.generateReport();
        process.exit(0);
    }).catch(error => {
        console.error('Erro fatal nos testes:', error);
        process.exit(1);
    });
}

module.exports = SessionSystemTest;
