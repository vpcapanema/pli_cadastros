# Análise de Colunas das Tabelas do SIGMA-PLI | Módulo de Gerenciamento de Cadastros

Este documento apresenta uma análise detalhada das tabelas dos esquemas `cadastro` e `usuarios`, identificando quais colunas são preenchidas pelo sistema e quais são preenchidas via formulário.

## Esquema: cadastro

### Tabela: pessoa_fisica

| Coluna | Tipo | Preenchimento | Observação |
|--------|------|--------------|------------|
| id | uuid | Sistema | Gerado automaticamente |
| cpf | varchar(14) | Formulário | Campo obrigatório |
| nome_completo | varchar(255) | Formulário | Campo obrigatório |
| nome_social | varchar(255) | Formulário | Campo opcional |
| data_nascimento | date | Formulário | Campo obrigatório |
| sexo | varchar(20) | Formulário | Campo opcional (select) |
| estado_civil | varchar(30) | Formulário | Campo opcional (select) |
| nacionalidade | varchar(50) | Formulário | Campo opcional (default 'Brasileira') |
| naturalidade | varchar(100) | Formulário | Campo opcional |
| nome_pai | varchar(255) | Formulário | Campo opcional |
| nome_mae | varchar(255) | Formulário | Campo opcional |
| rg | varchar(20) | Formulário | Campo opcional |
| rg_orgao_expedidor | varchar(10) | Formulário | Campo opcional |
| rg_data_expedicao | date | Formulário | Campo opcional |
| titulo_eleitor | varchar(15) | Formulário | Campo opcional |
| zona_eleitoral | varchar(10) | Formulário | Campo opcional |
| secao_eleitoral | varchar(10) | Formulário | Campo opcional |
| pis_pasep | varchar(15) | Formulário | Campo opcional |
| cep | varchar(10) | Formulário | Campo obrigatório |
| logradouro | varchar(255) | Formulário | Campo obrigatório |
| numero | varchar(20) | Formulário | Campo obrigatório |
| complemento | varchar(100) | Formulário | Campo opcional |
| bairro | varchar(100) | Formulário | Campo obrigatório |
| cidade | varchar(100) | Formulário | Campo obrigatório |
| estado | varchar(2) | Formulário | Campo obrigatório (select) |
| pais | varchar(50) | Formulário | Campo opcional (default 'Brasil') |
| coordenadas | USER-DEFINED | Sistema | Preenchido automaticamente via CEP |
| telefone_principal | varchar(20) | Formulário | Campo obrigatório |
| telefone_secundario | varchar(20) | Formulário | Campo opcional |
| email_principal | varchar(255) | Formulário | Campo obrigatório |
| email_secundario | varchar(255) | Formulário | Campo opcional |
| profissao | varchar(100) | Formulário | Campo opcional |
| escolaridade | varchar(30) | Formulário | Campo opcional (select) |
| renda_mensal | numeric | Formulário | Campo opcional |
| ativo | boolean | Sistema | Default true |
| data_criacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| data_atualizacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| data_exclusao | timestamp | Sistema | Preenchido quando desativado |

### Tabela: pessoa_juridica

| Coluna | Tipo | Preenchimento | Observação |
|--------|------|--------------|------------|
| id | uuid | Sistema | Gerado automaticamente |
| cnpj | varchar(18) | Formulário | Campo obrigatório |
| razao_social | varchar(255) | Formulário | Campo obrigatório |
| nome_fantasia | varchar(255) | Formulário | Campo opcional |
| inscricao_estadual | varchar(20) | Formulário | Campo opcional |
| inscricao_municipal | varchar(20) | Formulário | Campo opcional |
| situacao_receita_federal | varchar(50) | Formulário | Campo opcional (default 'ATIVA') |
| data_abertura | date | Formulário | Campo opcional |
| natureza_juridica | varchar(100) | Formulário | Campo opcional |
| porte_empresa | varchar(50) | Formulário | Campo opcional (select) |
| regime_tributario | varchar(50) | Formulário | Campo opcional |
| cep | varchar(10) | Formulário | Campo obrigatório |
| logradouro | varchar(255) | Formulário | Campo obrigatório |
| numero | varchar(20) | Formulário | Campo obrigatório |
| complemento | varchar(100) | Formulário | Campo opcional |
| bairro | varchar(100) | Formulário | Campo obrigatório |
| cidade | varchar(100) | Formulário | Campo obrigatório |
| estado | varchar(2) | Formulário | Campo obrigatório (select) |
| pais | varchar(50) | Formulário | Campo opcional (default 'Brasil') |
| coordenadas | USER-DEFINED | Sistema | Preenchido automaticamente via CEP |
| telefone_principal | varchar(20) | Formulário | Campo obrigatório |
| telefone_secundario | varchar(20) | Formulário | Campo opcional |
| email_principal | varchar(255) | Formulário | Campo obrigatório |
| email_secundario | varchar(255) | Formulário | Campo opcional |
| website | varchar(255) | Formulário | Campo opcional |
| ativo | boolean | Sistema | Default true |
| data_criacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| data_atualizacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| data_exclusao | timestamp | Sistema | Preenchido quando desativado |

## Esquema: usuarios

### Tabela: usuario_sistema

| Coluna | Tipo | Preenchimento | Observação |
|--------|------|--------------|------------|
| id | uuid | Sistema | Gerado automaticamente |
| username | varchar(50) | Formulário | Campo obrigatório |
| email | varchar(255) | Formulário | Campo obrigatório (preenchido automaticamente da pessoa física) |
| senha_hash | varchar(255) | Sistema | Derivado da senha informada pelo usuário |
| salt | varchar(32) | Sistema | Gerado automaticamente para segurança |
| duplo_fator_habilitado | boolean | Formulário | Default false |
| duplo_fator_chave_secreta | varchar(32) | Formulário | Campo opcional |
| pessoa_fisica_id | uuid | Formulário | Campo obrigatório (select) |
| instituicao | uuid | Formulário | Campo obrigatório (select) |
| tipo_usuario | varchar(20) | Formulário | Campo obrigatório (select) |
| nivel_acesso | integer | Formulário | Default 1 |
| departamento | varchar(100) | Formulário | Campo opcional |
| cargo | varchar(100) | Formulário | Campo opcional |
| ativo | boolean | Sistema | Default true |
| email_verificado | boolean | Sistema | Default false |
| primeiro_acesso | boolean | Sistema | Default true |
| data_ultimo_login | timestamp | Sistema | Atualizado automaticamente |
| tentativas_login | integer | Sistema | Default 0 |
| bloqueado_ate | timestamp | Sistema | Preenchido quando bloqueado |
| fuso_horario | varchar(50) | Formulário | Default 'America/Sao_Paulo' |
| idioma | varchar(5) | Formulário | Default 'pt-BR' |
| tema_interface | varchar(20) | Formulário | Default 'light' |
| data_criacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| data_atualizacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| criado_por_id | uuid | Sistema | ID do usuário que criou o registro |
| atualizado_por_id | uuid | Sistema | ID do usuário que atualizou o registro |
| data_exclusao | timestamp | Sistema | Preenchido quando desativado |
| email_institucional | varchar(255) | Formulário | Campo opcional |
| telefone_institucional | varchar(20) | Formulário | Campo opcional |
| ramal_institucional | varchar(20) | Formulário | Campo opcional |

### Tabela: usuario_historico_formularios

| Coluna | Tipo | Preenchimento | Observação |
|--------|------|--------------|------------|
| id | uuid | Sistema | Gerado automaticamente |
| usuario_id | uuid | Sistema | Referência ao usuário |
| versao_formulario | integer | Sistema | Controle de versão |
| tipo_operacao | varchar(20) | Sistema | Tipo de operação realizada |
| formulario_dados_completos | jsonb | Sistema | Dados completos do formulário |
| formulario_html_renderizado | text | Sistema | HTML renderizado do formulário |
| campos_alterados | jsonb | Sistema | Campos que foram alterados |
| valores_anteriores | jsonb | Sistema | Valores antes da alteração |
| valores_novos | jsonb | Sistema | Valores após a alteração |
| motivo_alteracao | text | Formulário | Campo opcional |
| observacoes | text | Formulário | Campo opcional |
| operacao_realizada_por_id | uuid | Sistema | ID do usuário que realizou a operação |
| endereco_ip_operacao | inet | Sistema | IP da operação |
| agente_usuario_operacao | text | Sistema | User agent do navegador |
| data_operacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |
| hash_formulario | varchar(64) | Sistema | Hash para verificação de integridade |
| numero_comprovante | varchar(50) | Sistema | Número do comprovante gerado |
| comprovante_pdf | bytea | Sistema | PDF do comprovante |
| comprovante_html | text | Sistema | HTML do comprovante |
| assinatura_digital | jsonb | Sistema | Dados da assinatura digital |
| data_criacao | timestamp | Sistema | Default CURRENT_TIMESTAMP |

## Resumo

### Estatísticas de Preenchimento

| Tabela | Total de Colunas | Preenchidas pelo Sistema | Preenchidas via Formulário |
|--------|-----------------|--------------------------|----------------------------|
| pessoa_fisica | 37 | 5 | 32 |
| pessoa_juridica | 29 | 5 | 24 |
| usuario_sistema | 30 | 13 | 17 |
| usuario_historico_formularios | 21 | 19 | 2 |

### Observações Gerais

1. As colunas preenchidas pelo sistema geralmente incluem:
   - Identificadores (IDs)
   - Timestamps (data de criação, atualização)
   - Campos de controle (ativo, bloqueado)
   - Campos derivados (senha_hash, salt)

2. As colunas preenchidas via formulário incluem:
   - Dados pessoais e de contato
   - Endereços
   - Preferências do usuário
   - Informações profissionais

3. Alguns campos são preenchidos automaticamente com base em outros campos:
   - Email e telefone do usuário são preenchidos com base na pessoa física selecionada
   - Coordenadas podem ser preenchidas automaticamente com base no CEP