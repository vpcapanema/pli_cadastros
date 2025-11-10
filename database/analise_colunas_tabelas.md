# Análise de Colunas das Tabelas do SIGMA-PLI | Módulo de Gerenciamento de Cadastros

Este documento apresenta uma análise detalhada das tabelas dos esquemas `cadastro` e `usuarios`, identificando quais colunas são preenchidas pelo sistema e quais são preenchidas via formulário.

## Mapas de correspondencia

| PLI-CADASTRO (Node.js) | SIGMA-PRINCIPAL (FastAPI/PostgreSQL) | Observacoes |
| ---------------------- | ------------------------------------ | ----------- |
| `cadastro.pessoa_fisica` | `cadastro.pessoa` | Representa as pessoas naturais; mesma intencao de dominio. |
| `cadastro.pessoa_juridica` | `cadastro.instituicao` | Instituicoes exercem o papel de pessoa juridica. |
| `usuarios.usuario_sistema` | `usuarios.pessoa` | Dados civis do usuario autenticado; credenciais ficam em `usuarios.conta_usuario`. |

## Esquema: cadastro

### Tabela: cadastro.pessoa (equivalente a pessoa_fisica)

| Coluna           | Tipo  | Preenchimento | Observacao |
| ---------------- | ----- | ------------- | ---------- |
| id               | uuid  | Sistema       | Gerado automaticamente. |
| nome_completo    | text  | Formulario    | Campo obrigatorio. |
| cpf              | text  | Formulario    | Campo opcional com constraint de unicidade. |
| email            | text  | Formulario    | Campo opcional (usado para contato). |
| telefone         | text  | Formulario    | Campo opcional. |
| cargo            | text  | Formulario    | Campo opcional. |
| instituicao_id   | uuid  | Formulario    | Relaciona com `cadastro.instituicao`. |
| departamento_id  | uuid  | Formulario    | Relaciona com `cadastro.departamento`. |
| ativa            | boolean | Sistema     | Default true. |
| created_at       | timestamp | Sistema   | Default CURRENT_TIMESTAMP. |

### Tabela: cadastro.instituicao (equivalente a pessoa_juridica)

| Coluna   | Tipo  | Preenchimento | Observacao |
| -------- | ----- | ------------- | ---------- |
| id       | uuid  | Sistema       | Gerado automaticamente. |
| nome     | text  | Formulario    | Campo obrigatorio. |
| sigla    | text  | Formulario    | Campo opcional. |
| cnpj     | text  | Formulario    | Campo opcional com constraint de unicidade. |
| tipo     | text  | Formulario    | Campo opcional (federal, estadual, etc.). |
| endereco | text  | Formulario    | Campo opcional (bloco unico). |
| telefone | text  | Formulario    | Campo opcional. |
| email    | text  | Formulario    | Campo opcional. |
| site     | text  | Formulario    | Campo opcional. |
| ativa    | boolean | Sistema     | Default true. |
| created_at | timestamp | Sistema  | Default CURRENT_TIMESTAMP. |

## Esquema: usuarios

### Tabela: usuarios.pessoa (equivalente a usuario_sistema)

| Coluna          | Tipo    | Preenchimento | Observacao |
| --------------- | ------- | ------------- | ---------- |
| id              | uuid    | Sistema       | Gerado automaticamente. |
| nome_completo   | text    | Formulario    | Campo obrigatorio. |
| primeiro_nome   | text    | Formulario    | Campo opcional. |
| ultimo_nome     | text    | Formulario    | Campo opcional. |
| email           | text    | Formulario    | Campo opcional (pode ser institucional). |
| telefone        | text    | Formulario    | Campo opcional. |
| cpf             | text    | Formulario    | Campo opcional com constraint de unicidade. |
| data_nascimento | date    | Formulario    | Campo opcional. |
| genero          | text    | Formulario    | Campo opcional. |
| foto_url        | text    | Sistema       | Preenchido quando armazenada foto de perfil. |
| instituicao_id  | uuid    | Formulario    | Relaciona com `cadastro.instituicao`. |
| departamento_id | uuid    | Formulario    | Relaciona com `cadastro.departamento`. |
| cargo           | text    | Formulario    | Campo opcional. |
| matricula       | text    | Formulario    | Campo opcional. |
| ativo           | boolean | Sistema       | Default true. |
| criado_em       | timestamp | Sistema     | Default CURRENT_TIMESTAMP. |
| atualizado_em   | timestamp | Sistema     | Atualizado via trigger. |

### Tabela: usuario_historico_formularios

| Coluna                      | Tipo        | Preenchimento | Observação                            |
| --------------------------- | ----------- | ------------- | ------------------------------------- |
| id                          | uuid        | Sistema       | Gerado automaticamente                |
| usuario_id                  | uuid        | Sistema       | Referência ao usuário                 |
| versao_formulario           | integer     | Sistema       | Controle de versão                    |
| tipo_operacao               | varchar(20) | Sistema       | Tipo de operação realizada            |
| formulario_dados_completos  | jsonb       | Sistema       | Dados completos do formulário         |
| formulario_html_renderizado | text        | Sistema       | HTML renderizado do formulário        |
| campos_alterados            | jsonb       | Sistema       | Campos que foram alterados            |
| valores_anteriores          | jsonb       | Sistema       | Valores antes da alteração            |
| valores_novos               | jsonb       | Sistema       | Valores após a alteração              |
| motivo_alteracao            | text        | Formulário    | Campo opcional                        |
| observacoes                 | text        | Formulário    | Campo opcional                        |
| operacao_realizada_por_id   | uuid        | Sistema       | ID do usuário que realizou a operação |
| endereco_ip_operacao        | inet        | Sistema       | IP da operação                        |
| agente_usuario_operacao     | text        | Sistema       | User agent do navegador               |
| data_operacao               | timestamp   | Sistema       | Default CURRENT_TIMESTAMP             |
| hash_formulario             | varchar(64) | Sistema       | Hash para verificação de integridade  |
| numero_comprovante          | varchar(50) | Sistema       | Número do comprovante gerado          |
| comprovante_pdf             | bytea       | Sistema       | PDF do comprovante                    |
| comprovante_html            | text        | Sistema       | HTML do comprovante                   |
| assinatura_digital          | jsonb       | Sistema       | Dados da assinatura digital           |
| data_criacao                | timestamp   | Sistema       | Default CURRENT_TIMESTAMP             |

## Resumo

### Estatísticas de Preenchimento

| Tabela                        | Total de Colunas | Preenchidas pelo Sistema | Preenchidas via Formulário |
| ----------------------------- | ---------------- | ------------------------ | -------------------------- |
| pessoa_fisica                 | 37               | 5                        | 32                         |
| pessoa_juridica               | 29               | 5                        | 24                         |
| usuario_sistema               | 30               | 13                       | 17                         |
| usuario_historico_formularios | 21               | 19                       | 2                          |

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
