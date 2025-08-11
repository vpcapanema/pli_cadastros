/**
 * Serviço de Notificações - SIGMA-PLI
 * Responsável por enviar notificações de mudanças de status e ativação
 */

const emailService = require('./emailService');

class NotificationService {
    /**
     * Notificar mudança de status do usuário
     * @param {Object} usuario - Dados do usuário
     * @param {string} statusAnterior - Status anterior
     * @param {string} statusNovo - Status novo
     * @param {string} responsavel - Nome do responsável pela mudança
     */
    static async notificarMudancaStatus(usuario, statusAnterior, statusNovo, responsavel) {
        try {
            const statusMap = {
                'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
                'APROVADO': 'Aprovado',
                'REJEITADO': 'Rejeitado',
                'SUSPENSO': 'Suspenso',
                'INATIVO': 'Inativo'
            };

            const statusAnteriorFormatado = statusMap[statusAnterior] || statusAnterior;
            const statusNovoFormatado = statusMap[statusNovo] || statusNovo;

            let assunto, mensagem, corStatus;

            // Definir cores e mensagens baseadas no status
            switch (statusNovo) {
                case 'APROVADO':
                    corStatus = '#28a745'; // Verde
                    assunto = '✅ Conta Aprovada - SIGMA-PLI';
                    mensagem = `
                        <p>Parabéns! Sua conta no sistema SIGMA-PLI foi <strong style="color: ${corStatus};">aprovada</strong>.</p>
                        <p>Agora você pode acessar o sistema com suas credenciais.</p>
                        <p>Para ativar completamente sua conta, verifique seu email institucional se ainda não o fez.</p>
                    `;
                    break;

                case 'REJEITADO':
                    corStatus = '#dc3545'; // Vermelho
                    assunto = '❌ Solicitação de Conta Rejeitada - SIGMA-PLI';
                    mensagem = `
                        <p>Informamos que sua solicitação de conta no sistema SIGMA-PLI foi <strong style="color: ${corStatus};">rejeitada</strong>.</p>
                        <p>Para mais informações sobre os motivos da rejeição, entre em contato com o administrador do sistema.</p>
                        <p>Você pode enviar uma nova solicitação após resolver as pendências.</p>
                    `;
                    break;

                case 'SUSPENSO':
                    corStatus = '#ffc107'; // Amarelo
                    assunto = '⚠️ Conta Suspensa - SIGMA-PLI';
                    mensagem = `
                        <p>Sua conta no sistema SIGMA-PLI foi <strong style="color: ${corStatus};">suspensa</strong> temporariamente.</p>
                        <p>Durante este período, você não poderá acessar o sistema.</p>
                        <p>Entre em contato com o administrador para mais informações.</p>
                    `;
                    break;

                case 'AGUARDANDO_APROVACAO':
                    corStatus = '#17a2b8'; // Azul
                    assunto = '🔄 Status Alterado para Aguardando Aprovação - SIGMA-PLI';
                    mensagem = `
                        <p>O status da sua conta foi alterado para <strong style="color: ${corStatus};">Aguardando Aprovação</strong>.</p>
                        <p>Sua solicitação está sendo analisada por nossa equipe.</p>
                        <p>Você receberá uma notificação assim que houver uma decisão.</p>
                    `;
                    break;

                default:
                    corStatus = '#6c757d'; // Cinza
                    assunto = '📋 Status da Conta Alterado - SIGMA-PLI';
                    mensagem = `
                        <p>O status da sua conta no sistema SIGMA-PLI foi alterado.</p>
                        <p><strong>Status anterior:</strong> ${statusAnteriorFormatado}</p>
                        <p><strong>Status atual:</strong> <span style="color: ${corStatus};">${statusNovoFormatado}</span></p>
                    `;
            }

            const htmlCompleto = this.criarTemplateEmail(
                usuario.nome_completo || usuario.username,
                assunto.replace(/[^\w\s-]/g, ''), // Remove emojis do título interno
                mensagem,
                responsavel
            );

            await emailService.enviarEmail(usuario.email_institucional, assunto, htmlCompleto);

            console.log(`[NOTIFICATION] Email de mudança de status enviado para ${usuario.email_institucional}`);

        } catch (error) {
            console.error('[NOTIFICATION] Erro ao enviar notificação de mudança de status:', error);
            throw error;
        }
    }

    /**
     * Notificar mudança de status ativo
     * @param {Object} usuario - Dados do usuário
     * @param {boolean} ativoAnterior - Status ativo anterior
     * @param {boolean} ativoNovo - Status ativo novo
     * @param {string} responsavel - Nome do responsável pela mudança
     */
    static async notificarMudancaAtivo(usuario, ativoAnterior, ativoNovo, responsavel) {
        try {
            const statusAnterior = ativoAnterior ? 'ativado' : 'desativado';
            const statusNovo = ativoNovo ? 'ativado' : 'desativado';

            let assunto, mensagem, corStatus;

            if (ativoNovo) {
                // Conta ativada
                corStatus = '#28a745'; // Verde
                assunto = '🟢 Conta Ativada - SIGMA-PLI';
                mensagem = `
                    <p>Excelente! Sua conta no sistema SIGMA-PLI foi <strong style="color: ${corStatus};">ativada</strong> com sucesso.</p>
                    <p>Agora você tem acesso completo às funcionalidades do sistema conforme seu perfil de usuário.</p>
                    <p>Faça login no sistema para começar a utilizar os recursos disponíveis.</p>
                    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
                        <p style="margin: 0;"><strong>💡 Dica:</strong> Certifique-se de que seu email institucional está verificado para ter acesso total ao sistema.</p>
                    </div>
                `;
            } else {
                // Conta desativada
                corStatus = '#dc3545'; // Vermelho
                assunto = '🔴 Conta Desativada - SIGMA-PLI';
                mensagem = `
                    <p>Informamos que sua conta no sistema SIGMA-PLI foi <strong style="color: ${corStatus};">desativada</strong>.</p>
                    <p>Você não poderá acessar o sistema até que sua conta seja reativada.</p>
                    <p>Se você acredita que isso é um erro ou precisa de esclarecimentos, entre em contato com o administrador do sistema.</p>
                    <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">
                        <p style="margin: 0;"><strong>📞 Suporte:</strong> Para reativação da conta, entre em contato com o departamento responsável.</p>
                    </div>
                `;
            }

            const htmlCompleto = this.criarTemplateEmail(
                usuario.nome_completo || usuario.username,
                assunto.replace(/[^\w\s-]/g, ''), // Remove emojis do título interno
                mensagem,
                responsavel
            );

            await emailService.enviarEmail(usuario.email_institucional, assunto, htmlCompleto);

            console.log(`[NOTIFICATION] Email de mudança de ativo enviado para ${usuario.email_institucional}`);

        } catch (error) {
            console.error('[NOTIFICATION] Erro ao enviar notificação de mudança de ativo:', error);
            throw error;
        }
    }

    /**
     * Criar template HTML para emails
     * @param {string} nomeUsuario - Nome do usuário
     * @param {string} titulo - Título da notificação
     * @param {string} conteudo - Conteúdo principal da mensagem
     * @param {string} responsavel - Nome do responsável pela mudança
     */
    static criarTemplateEmail(nomeUsuario, titulo, conteudo, responsavel) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${titulo}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 300; }
                .content { padding: 30px; line-height: 1.6; color: #333; }
                .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; }
                .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                .info-box { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏛️ SIGMA-PLI</h1>
                    <p>Sistema de Gerenciamento de Cadastros</p>
                </div>
                
                <div class="content">
                    <h2>Olá, ${nomeUsuario}!</h2>
                    
                    ${conteudo}
                    
                    <div class="info-box">
                        <p style="margin: 0;"><strong>📧 Sistema:</strong> SIGMA-PLI - Módulo de Gerenciamento de Cadastros</p>
                        <p style="margin: 5px 0 0 0;"><strong>🕒 Data:</strong> ${new Date().toLocaleString('pt-BR', { 
                            timeZone: 'America/Sao_Paulo'
                        })}</p>
                        ${responsavel ? `<p style="margin: 5px 0 0 0;"><strong>👤 Responsável:</strong> ${responsavel}</p>` : ''}
                    </div>
                    
                    <p>Se você tiver dúvidas ou precisar de suporte, entre em contato com nossa equipe.</p>
                    
                    <p style="margin-top: 30px;">
                        Atenciosamente,<br>
                        <strong>Equipe SIGMA-PLI</strong>
                    </p>
                </div>
                
                <div class="footer">
                    <p>Esta é uma mensagem automática do sistema SIGMA-PLI.</p>
                    <p>Por favor, não responda este email. Para suporte, utilize os canais oficiais.</p>
                    <p>© 2025 SIGMA-PLI - Sistema de Gerenciamento de Cadastros</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Notificar múltiplas mudanças (status + ativo)
     * @param {Object} usuario - Dados do usuário
     * @param {Object} mudancas - Objeto com as mudanças realizadas
     * @param {string} responsavel - Nome do responsável
     */
    static async notificarMudancasMultiplas(usuario, mudancas, responsavel) {
        try {
            const notificacoes = [];

            if (mudancas.status) {
                notificacoes.push(
                    this.notificarMudancaStatus(
                        usuario, 
                        mudancas.status.anterior, 
                        mudancas.status.novo, 
                        responsavel
                    )
                );
            }

            if (mudancas.ativo !== undefined) {
                notificacoes.push(
                    this.notificarMudancaAtivo(
                        usuario, 
                        mudancas.ativo.anterior, 
                        mudancas.ativo.novo, 
                        responsavel
                    )
                );
            }

            await Promise.all(notificacoes);

        } catch (error) {
            console.error('[NOTIFICATION] Erro ao enviar notificações múltiplas:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
