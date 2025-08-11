# Correspondência entre Campos do Banco de Dados e Formulários

Este documento analisa a correspondência entre os campos das tabelas do banco de dados e os campos dos formulários HTML, identificando quais campos são preenchidos pelo sistema e quais são preenchidos via formulário.

## 1. Tabela: cadastro.pessoa_fisica

### Campos preenchidos pelo sistema:

- id (uuid) - Gerado automaticamente
- coordenadas (USER-DEFINED) - Preenchido automaticamente via CEP
- ativo (boolean) - Default true
- data_criacao (timestamp) - Default CURRENT_TIMESTAMP
- data_atualizacao (timestamp) - Default CURRENT_TIMESTAMP
- data_exclusao (timestamp) - Preenchido quando desativado

### Campos preenchidos via formulário:

| Campo no Banco      | Tipo         | Campo no Formulário HTML     | ID no HTML         | Obrigatório |
| ------------------- | ------------ | ---------------------------- | ------------------ | ----------- |
| cpf                 | varchar(14)  | CPF                          | cpf                | Sim         |
| nome_completo       | varchar(255) | Nome Completo                | nomeCompleto       | Sim         |
| nome_social         | varchar(255) | Nome Social                  | nomeSocial         | Não         |
| data_nascimento     | date         | Data de Nascimento           | dataNascimento     | Sim         |
| sexo                | varchar(20)  | Sexo                         | sexo               | Não         |
| estado_civil        | varchar(30)  | _Não presente no formulário_ | -                  | -           |
| nacionalidade       | varchar(50)  | _Não presente no formulário_ | -                  | -           |
| naturalidade        | varchar(100) | _Não presente no formulário_ | -                  | -           |
| nome_pai            | varchar(255) | _Não presente no formulário_ | -                  | -           |
| nome_mae            | varchar(255) | _Não presente no formulário_ | -                  | -           |
| rg                  | varchar(20)  | RG                           | rg                 | Não         |
| rg_orgao_expedidor  | varchar(10)  | Órgão Expeditor              | orgaoExpeditor     | Não         |
| rg_data_expedicao   | date         | _Não presente no formulário_ | -                  | -           |
| titulo_eleitor      | varchar(15)  | _Não presente no formulário_ | -                  | -           |
| zona_eleitoral      | varchar(10)  | _Não presente no formulário_ | -                  | -           |
| secao_eleitoral     | varchar(10)  | _Não presente no formulário_ | -                  | -           |
| pis_pasep           | varchar(15)  | _Não presente no formulário_ | -                  | -           |
| cep                 | varchar(10)  | CEP                          | cep                | Sim         |
| logradouro          | varchar(255) | Logradouro                   | logradouro         | Sim         |
| numero              | varchar(20)  | Número                       | numero             | Sim         |
| complemento         | varchar(100) | Complemento                  | complemento        | Não         |
| bairro              | varchar(100) | Bairro                       | bairro             | Sim         |
| cidade              | varchar(100) | Cidade                       | cidade             | Sim         |
| estado              | varchar(2)   | UF                           | uf                 | Sim         |
| pais                | varchar(50)  | _Não presente no formulário_ | -                  | -           |
| telefone_principal  | varchar(20)  | Telefone Principal           | telefonePrincipal  | Sim         |
| telefone_secundario | varchar(20)  | Telefone Secundário          | telefoneSecundario | Não         |
| email_principal     | varchar(255) | Email                        | email              | Sim         |
| email_secundario    | varchar(255) | _Não presente no formulário_ | -                  | -           |
| profissao           | varchar(100) | _Não presente no formulário_ | -                  | -           |
| escolaridade        | varchar(30)  | _Não presente no formulário_ | -                  | -           |
| renda_mensal        | numeric      | _Não presente no formulário_ | -                  | -           |

### Campos no banco que não estão no formulário:

1. estado_civil
2. nacionalidade
3. naturalidade
4. nome_pai
5. nome_mae
6. rg_data_expedicao
7. titulo_eleitor
8. zona_eleitoral
9. secao_eleitoral
10. pis_pasep
11. pais
12. email_secundario
13. profissao
14. escolaridade
15. renda_mensal

## 2. Tabela: cadastro.pessoa_juridica

### Campos preenchidos pelo sistema:

- id (uuid) - Gerado automaticamente
- coordenadas (USER-DEFINED) - Preenchido automaticamente via CEP
- ativo (boolean) - Default true
- data_criacao (timestamp) - Default CURRENT_TIMESTAMP
- data_atualizacao (timestamp) - Default CURRENT_TIMESTAMP
- data_exclusao (timestamp) - Preenchido quando desativado

### Campos preenchidos via formulário:

| Campo no Banco           | Tipo         | Campo no Formulário HTML     | ID no HTML   | Obrigatório |
| ------------------------ | ------------ | ---------------------------- | ------------ | ----------- |
| cnpj                     | varchar(18)  | CNPJ                         | cnpj         | Sim         |
| razao_social             | varchar(255) | Razão Social                 | razaoSocial  | Sim         |
| nome_fantasia            | varchar(255) | Nome Fantasia                | nomeFantasia | Não         |
| inscricao_estadual       | varchar(20)  | _Não presente no formulário_ | -            | -           |
| inscricao_municipal      | varchar(20)  | _Não presente no formulário_ | -            | -           |
| situacao_receita_federal | varchar(50)  | _Não presente no formulário_ | -            | -           |
| data_abertura            | date         | Data de Abertura             | dataAbertura | Não         |
| natureza_juridica        | varchar(100) | _Não presente no formulário_ | -            | -           |
| porte_empresa            | varchar(50)  | Porte da Empresa             | porteEmpresa | Não         |
| regime_tributario        | varchar(50)  | _Não presente no formulário_ | -            | -           |
| cep                      | varchar(10)  | CEP                          | cep          | Sim         |
| logradouro               | varchar(255) | Logradouro                   | logradouro   | Sim         |
| numero                   | varchar(20)  | Número                       | numero       | Sim         |
| complemento              | varchar(100) | Complemento                  | complemento  | Não         |
| bairro                   | varchar(100) | Bairro                       | bairro       | Sim         |
| cidade                   | varchar(100) | Cidade                       | cidade       | Sim         |
| estado                   | varchar(2)   | UF                           | uf           | Sim         |
| pais                     | varchar(50)  | _Não presente no formulário_ | -            | -           |
| telefone_principal       | varchar(20)  | Telefone                     | telefone     | Sim         |
| telefone_secundario      | varchar(20)  | _Não presente no formulário_ | -            | -           |
| email_principal          | varchar(255) | Email                        | email        | Sim         |
| email_secundario         | varchar(255) | _Não presente no formulário_ | -            | -           |
| website                  | varchar(255) | Website                      | site         | Não         |

### Campos no banco que não estão no formulário:

1. inscricao_estadual
2. inscricao_municipal
3. situacao_receita_federal
4. natureza_juridica
5. regime_tributario
6. pais
7. telefone_secundario
8. email_secundario

### Campos no formulário que não estão no banco:

1. nomeRepresentante (Nome Completo do Representante Legal)
2. cpfRepresentante (CPF do Representante Legal)
3. cargoRepresentante (Cargo do Representante Legal)
4. emailRepresentante (Email do Representante Legal)
5. telefoneRepresentante (Telefone do Representante Legal)

**Observação:** O formulário de Pessoa Jurídica inclui campos para o Representante Legal, mas não há uma tabela específica para sócios/representantes no banco de dados analisado. O código do controlador `pessoaJuridica.js` faz referência a uma tabela `cadastro.socio_representante` que parece não existir no banco de dados atual.

## 3. Tabela: usuarios.usuario_sistema

### Campos preenchidos pelo sistema:

- id (uuid) - Gerado automaticamente
- senha_hash (varchar(255)) - Derivado da senha informada pelo usuário
- salt (varchar(32)) - Gerado automaticamente para segurança
- ativo (boolean) - Default true
- email_verificado (boolean) - Default false
- primeiro_acesso (boolean) - Default true
- data_ultimo_login (timestamp) - Atualizado automaticamente
- tentativas_login (integer) - Default 0
- bloqueado_ate (timestamp) - Preenchido quando bloqueado
- data_criacao (timestamp) - Default CURRENT_TIMESTAMP
- data_atualizacao (timestamp) - Default CURRENT_TIMESTAMP
- criado_por_id (uuid) - ID do usuário que criou o registro
- atualizado_por_id (uuid) - ID do usuário que atualizou o registro
- data_exclusao (timestamp) - Preenchido quando desativado

### Campos preenchidos via formulário:

| Campo no Banco            | Tipo         | Campo no Formulário HTML     | ID no HTML             | Obrigatório |
| ------------------------- | ------------ | ---------------------------- | ---------------------- | ----------- |
| username                  | varchar(50)  | _Não presente no formulário_ | -                      | -           |
| email                     | varchar(255) | Email                        | email                  | Sim         |
| duplo_fator_habilitado    | boolean      | _Não presente no formulário_ | -                      | -           |
| duplo_fator_chave_secreta | varchar(32)  | _Não presente no formulário_ | -                      | -           |
| pessoa_fisica_id          | uuid         | Nome Completo (select)       | nome                   | Sim         |
| instituicao               | uuid         | Instituição (select)         | instituicao            | Sim         |
| tipo_usuario              | varchar(20)  | Tipo de Usuário              | tipo_usuario           | Sim         |
| nivel_acesso              | integer      | _Não presente no formulário_ | -                      | -           |
| departamento              | varchar(100) | Departamento                 | departamento           | Não         |
| cargo                     | varchar(100) | Cargo                        | cargo                  | Não         |
| fuso_horario              | varchar(50)  | _Não presente no formulário_ | -                      | -           |
| idioma                    | varchar(5)   | _Não presente no formulário_ | -                      | -           |
| tema_interface            | varchar(20)  | _Não presente no formulário_ | -                      | -           |
| email_institucional       | varchar(255) | E-mail Institucional         | email_institucional    | Não         |
| telefone_institucional    | varchar(20)  | Telefone Institucional       | telefone_institucional | Não         |
| ramal_institucional       | varchar(20)  | Ramal Institucional          | ramal_institucional    | Não         |

### Campos no banco que não estão no formulário:

1. username
2. duplo_fator_habilitado
3. duplo_fator_chave_secreta
4. nivel_acesso
5. fuso_horario
6. idioma
7. tema_interface

### Campos no formulário que não estão no banco:

1. senha (Campo para inserir senha, que é transformada em senha_hash)
2. confirmarSenha (Campo para confirmar senha)
3. documento (Campo para mostrar o CPF da pessoa física selecionada)
4. telefone (Campo para mostrar o telefone da pessoa física selecionada)

## 4. Tabela: usuarios.usuario_historico_formularios

Esta tabela é usada principalmente para registrar o histórico de operações nos formulários e não possui um formulário HTML específico para preenchimento direto.

### Campos preenchidos pelo sistema:

- id (uuid) - Gerado automaticamente
- usuario_id (uuid) - Referência ao usuário
- versao_formulario (integer) - Controle de versão
- tipo_operacao (varchar(20)) - Tipo de operação realizada
- formulario_dados_completos (jsonb) - Dados completos do formulário
- formulario_html_renderizado (text) - HTML renderizado do formulário
- campos_alterados (jsonb) - Campos que foram alterados
- valores_anteriores (jsonb) - Valores antes da alteração
- valores_novos (jsonb) - Valores após a alteração
- operacao_realizada_por_id (uuid) - ID do usuário que realizou a operação
- endereco_ip_operacao (inet) - IP da operação
- agente_usuario_operacao (text) - User agent do navegador
- data_operacao (timestamp) - Default CURRENT_TIMESTAMP
- hash_formulario (varchar(64)) - Hash para verificação de integridade
- numero_comprovante (varchar(50)) - Número do comprovante gerado
- comprovante_pdf (bytea) - PDF do comprovante
- comprovante_html (text) - HTML do comprovante
- assinatura_digital (jsonb) - Dados da assinatura digital
- data_criacao (timestamp) - Default CURRENT_TIMESTAMP

### Campos preenchidos via formulário:

| Campo no Banco   | Tipo | Campo no Formulário HTML                | ID no HTML | Obrigatório |
| ---------------- | ---- | --------------------------------------- | ---------- | ----------- |
| motivo_alteracao | text | _Não presente em formulário específico_ | -          | -           |
| observacoes      | text | _Não presente em formulário específico_ | -          | -           |

## Resumo e Observações

### Pessoa Física

- O formulário HTML cobre apenas os dados básicos e de contato
- Muitos campos do banco de dados não estão presentes no formulário, sugerindo que podem ser preenchidos em uma etapa posterior ou em outro formulário
- Campos como estado_civil, nacionalidade, naturalidade, etc., poderiam ser adicionados ao formulário para coletar informações mais completas

### Pessoa Jurídica

- O formulário inclui campos para o Representante Legal, mas não há uma tabela específica para sócios/representantes no banco analisado
- Campos importantes como inscrição estadual e municipal não estão presentes no formulário
- O código do controlador faz referência a uma tabela `cadastro.socio_representante` que parece não existir no banco de dados atual

### Usuário Sistema

- O campo username não está presente no formulário, mas é obrigatório no banco
- Campos relacionados a preferências do usuário (fuso_horario, idioma, tema_interface) não estão no formulário
- O formulário coleta a senha do usuário, que é transformada em senha_hash pelo sistema

### Histórico de Formulários

- Esta tabela é usada principalmente para auditoria e não possui um formulário HTML específico
- Os campos motivo_alteracao e observacoes poderiam ser preenchidos em um formulário de confirmação após alterações em outros formulários
