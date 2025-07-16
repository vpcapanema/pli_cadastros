# 📋 DEFINIÇÃO DAS TABELAS BASE DO SISTEMA
**Sistema:** SIGMA_PLI (Sistema Integrado de Gestão, Monitoramento e Análise do PLI)  
**Data:** 15 de julho de 2025  
**Versão:** 1.0  

---

## 📊 **RESUMO DAS TABELAS**

| Tabela | Função | Status |
|--------|--------|---------|
| `pessoa_fisica` | Cadastro de pessoas físicas (funcionários, clientes, usuários) | ✅ Definida |
| `pessoa_juridica` | Cadastro de empresas, órgãos, instituições | ✅ Definida |
| `usuario_sistema` | Usuários que acessam os sistemas (vinculados às pessoas) | ✅ Definida |
| `uploaded_ata` | Documentos/atas com análise NLP automatizada (SIGATA) | ✅ Definida |
| `relatorio_atas` | Relatórios consolidados das análises de atas | ✅ Definida |

---

## 🏢 **1. TABELA: pessoa_juridica**

### **Função:** Cadastro de empresas, órgãos e instituições

| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `id` | UUID | - | ✅ | gen_random_uuid() | Identificador único |
| `cnpj` | VARCHAR | 18 | ✅ | - | Formato: 00.000.000/0000-00 |
| `razao_social` | VARCHAR | 255 | ✅ | - | Razão social completa |
| `nome_fantasia` | VARCHAR | 255 | ❌ | - | Nome fantasia |
| `porte_empresa` | VARCHAR | 20 | ❌ | - | MEI, ME, EPP, MEDIO, GRANDE |
| `natureza_juridica` | VARCHAR | 10 | ❌ | - | Código IBGE |
| `cnae_principal` | VARCHAR | 10 | ❌ | - | Formato: 0000-0/00 |
| `email` | VARCHAR | 255 | ❌ | - | E-mail principal |
| `telefone` | VARCHAR | 20 | ❌ | - | Formato: (00) 00000-0000 |
| `site` | VARCHAR | 255 | ❌ | - | Website da empresa |
| `cep` | VARCHAR | 9 | ❌ | - | Formato: 00000-000 |
| `logradouro` | VARCHAR | 255 | ❌ | - | Endereço completo |
| `numero` | VARCHAR | 20 | ❌ | - | Número do endereço |
| `complemento` | VARCHAR | 100 | ❌ | - | Complemento |
| `bairro` | VARCHAR | 100 | ❌ | - | Bairro |
| `cidade` | VARCHAR | 100 | ❌ | - | Cidade |
| `uf` | CHAR | 2 | ❌ | - | Estado (UF) |
| `situacao_receita` | VARCHAR | 20 | ❌ | 'ATIVA' | Situação na Receita Federal |
| `data_abertura` | DATE | - | ❌ | - | Data de abertura da empresa |
| `data_criacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de atualização |
| `data_exclusao` | TIMESTAMP | - | ❌ | NULL | Data de exclusão (soft delete) |

### **Restrições:**
- `cnpj` deve ser UNIQUE
- `porte_empresa` deve estar em ('MEI', 'ME', 'EPP', 'MEDIO', 'GRANDE')

---

## 👤 **2. TABELA: pessoa_fisica**

### **Função:** Cadastro de pessoas físicas (funcionários, clientes, usuários)

| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `id` | UUID | - | ✅ | gen_random_uuid() | Identificador único |
| `cpf` | VARCHAR | 14 | ✅ | - | Formato: 000.000.000-00 |
| `nome_completo` | VARCHAR | 255 | ✅ | - | Nome completo |
| `nome_social` | VARCHAR | 255 | ❌ | - | Nome social |
| `data_nascimento` | DATE | - | ❌ | - | Data de nascimento |
| `sexo` | CHAR | 1 | ❌ | - | M, F, O |
| `estado_civil` | VARCHAR | 20 | ❌ | - | SOLTEIRO, CASADO, DIVORCIADO, VIUVO, UNIAO_ESTAVEL |
| `nacionalidade` | VARCHAR | 50 | ❌ | 'BRASILEIRA' | Nacionalidade |
| `naturalidade` | VARCHAR | 100 | ❌ | - | Cidade de nascimento |
| `rg` | VARCHAR | 20 | ❌ | - | Número do RG |
| `orgao_expeditor` | VARCHAR | 10 | ❌ | - | Órgão expeditor do RG |
| `uf_rg` | CHAR | 2 | ❌ | - | UF do RG |
| `data_expedicao_rg` | DATE | - | ❌ | - | Data de expedição do RG |
| `pis_pasep` | VARCHAR | 14 | ❌ | - | Formato: 000.00000.00-0 |
| `titulo_eleitor` | VARCHAR | 15 | ❌ | - | Número do título de eleitor |
| `zona_eleitoral` | VARCHAR | 10 | ❌ | - | Zona eleitoral |
| `secao_eleitoral` | VARCHAR | 10 | ❌ | - | Seção eleitoral |
| `email` | VARCHAR | 255 | ❌ | - | E-mail principal |
| `telefone_principal` | VARCHAR | 20 | ❌ | - | Formato: (00) 00000-0000 |
| `telefone_secundario` | VARCHAR | 20 | ❌ | - | Telefone secundário |
| `cep` | VARCHAR | 9 | ❌ | - | Formato: 00000-000 |
| `logradouro` | VARCHAR | 255 | ❌ | - | Endereço residencial |
| `numero` | VARCHAR | 20 | ❌ | - | Número da residência |
| `complemento` | VARCHAR | 100 | ❌ | - | Complemento |
| `bairro` | VARCHAR | 100 | ❌ | - | Bairro |
| `cidade` | VARCHAR | 100 | ❌ | - | Cidade |
| `uf` | CHAR | 2 | ❌ | - | Estado (UF) |
| `profissao` | VARCHAR | 100 | ❌ | - | Profissão |
| `escolaridade` | VARCHAR | 50 | ❌ | - | FUNDAMENTAL, MEDIO, SUPERIOR, POS_GRADUACAO, MESTRADO, DOUTORADO |
| `renda_mensal` | DECIMAL | 10,2 | ❌ | - | Renda mensal |
| `ativo` | BOOLEAN | - | ❌ | TRUE | Status ativo/inativo |
| `data_criacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de atualização |
| `data_exclusao` | TIMESTAMP | - | ❌ | NULL | Data de exclusão (soft delete) |

### **Restrições:**
- `cpf` deve ser UNIQUE
- `sexo` deve estar em ('M', 'F', 'O')
- `estado_civil` deve estar em ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL')
- `escolaridade` deve estar em ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO')

---

## 👥 **3. TABELA: usuario_sistema**

### **Função:** Usuários que acessam os sistemas (vinculados às pessoas)

| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `id` | UUID | - | ✅ | gen_random_uuid() | Identificador único |
| `username` | VARCHAR | 50 | ✅ | - | Nome de usuário (único) |
| `email` | VARCHAR | 255 | ✅ | - | E-mail (único) |
| `senha_hash` | VARCHAR | 255 | ✅ | - | Hash da senha |
| `salt` | VARCHAR | 32 | ❌ | - | Salt para criptografia |
| `duplo_fator_habilitado` | BOOLEAN | - | ❌ | FALSE | 2FA habilitado |
| `duplo_fator_chave_secreta` | VARCHAR | 32 | ❌ | - | Chave secreta do 2FA |
| `pessoa_fisica_id` | UUID | - | ❌ | - | FK para pessoa_fisica |
| `pessoa_juridica_id` | UUID | - | ❌ | - | FK para pessoa_juridica |
| `tipo_usuario` | VARCHAR | 20 | ✅ | - | ADMIN, GESTOR, ANALISTA, OPERADOR, VISUALIZADOR |
| `nivel_acesso` | INTEGER | - | ❌ | 1 | Nível de 1 a 5 |
| `departamento` | VARCHAR | 100 | ❌ | - | Departamento |
| `cargo` | VARCHAR | 100 | ❌ | - | Cargo |
| `ativo` | BOOLEAN | - | ❌ | TRUE | Status ativo/inativo |
| `email_verificado` | BOOLEAN | - | ❌ | FALSE | E-mail verificado |
| `primeiro_acesso` | BOOLEAN | - | ❌ | TRUE | Primeiro acesso |
| `data_ultimo_login` | TIMESTAMP | - | ❌ | - | Data do último login |
| `tentativas_login` | INTEGER | - | ❌ | 0 | Tentativas de login |
| `bloqueado_ate` | TIMESTAMP | - | ❌ | - | Bloqueado até |
| `fuso_horario` | VARCHAR | 50 | ❌ | 'America/Sao_Paulo' | Fuso horário |
| `idioma` | VARCHAR | 5 | ❌ | 'pt-BR' | Idioma |
| `tema_interface` | VARCHAR | 20 | ❌ | 'light' | Tema da interface |
| `data_criacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de atualização |
| `criado_por_id` | UUID | - | ❌ | - | FK para usuario_sistema |
| `data_exclusao` | TIMESTAMP | - | ❌ | NULL | Data de exclusão (soft delete) |

### **Restrições:**
- `username` deve ser UNIQUE
- `email` deve ser UNIQUE
- `tipo_usuario` deve estar em ('ADMIN', 'GESTOR', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR')
- `nivel_acesso` deve estar entre 1 e 5
- **Vinculação exclusiva**: apenas uma das FKs deve ser preenchida (pessoa_fisica_id OU pessoa_juridica_id)
- `pessoa_fisica_id` referencia pessoa_fisica(id)
- `pessoa_juridica_id` referencia pessoa_juridica(id)
- `criado_por_id` referencia usuario_sistema(id)

---

## 📄 **4. TABELA: uploaded_ata**

### **Função:** Documentos/atas com análise NLP automatizada (Sistema SIGATA)

| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `id` | UUID | - | ✅ | gen_random_uuid() | Identificador único |
| `codigo_documento` | VARCHAR | 50 | ✅ | - | Código único gerado |
| `tipo_documento` | VARCHAR | 30 | ✅ | - | ATA, RELATORIO, CONTRATO, OFICIO, MEMORANDO, OUTROS |
| `subtipo_documento` | VARCHAR | 50 | ❌ | - | Ex: "Ata de Reunião", "Relatório Mensal" |
| `categoria` | VARCHAR | 50 | ❌ | - | Ex: "Administrativo", "Técnico", "Financeiro" |
| `titulo_documento` | VARCHAR | 255 | ✅ | - | Título do documento |
| `descricao` | TEXT | - | ❌ | - | Descrição |
| `palavras_chave` | TEXT[] | - | ❌ | - | Array de palavras-chave |

### **📁 Armazenamento do Arquivo:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `nome_arquivo_original` | VARCHAR | 255 | ✅ | - | Nome original do arquivo |
| `caminho_arquivo` | VARCHAR | 500 | ✅ | - | Path no filesystem |
| `arquivo_binario` | BYTEA | - | ❌ | - | **Arquivo original completo** |
| `arquivo_texto_extraido` | TEXT | - | ❌ | - | **Texto limpo para NLP** |
| `arquivo_metadados` | JSONB | - | ❌ | - | **Metadados de extração** |
| `tamanho_arquivo_bytes` | BIGINT | - | ❌ | - | Tamanho em bytes |
| `tipo_mime` | VARCHAR | 100 | ❌ | - | Tipo MIME |
| `hash_arquivo` | VARCHAR | 64 | ❌ | - | SHA-256 para integridade |

### **👤 Metadados do Upload:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `data_upload` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data do upload |
| `usuario_upload_id` | UUID | - | ✅ | - | FK para usuario_sistema |
| `endereco_ip_upload` | INET | - | ❌ | - | IP do upload |
| `agente_usuario` | TEXT | - | ❌ | - | User agent |

### **⚙️ Processamento e Status:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `status_processamento` | VARCHAR | 20 | ❌ | 'PENDENTE' | PENDENTE, PROCESSANDO, CONCLUIDO, ERRO, REJEITADO |
| `data_inicio_processamento` | TIMESTAMP | - | ❌ | - | Início do processamento |
| `data_fim_processamento` | TIMESTAMP | - | ❌ | - | Fim do processamento |
| `tempo_processamento_ms` | INTEGER | - | ❌ | - | Tempo em milissegundos |

### **🤖 Análise NLP Básica:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `nlp_processado` | BOOLEAN | - | ❌ | FALSE | NLP processado |
| `nlp_idioma_detectado` | VARCHAR | 10 | ❌ | - | Ex: "pt-BR" |
| `nlp_confianca_idioma` | DECIMAL | 5,2 | ❌ | - | 0.00 a 100.00 |

### **📊 Métricas BERTopic (Clustering Semântico):**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `metrica_coerencia` | DECIMAL | 8,6 | ❌ | - | Coeficiente de coerência dos tópicos |
| `metrica_silhueta` | DECIMAL | 8,6 | ❌ | - | Medida de separação entre clusters |
| `metrica_diversidade_topicos` | DECIMAL | 8,6 | ❌ | - | Índice de diversidade lexical |
| `quantidade_topicos` | INTEGER | - | ❌ | - | Número de tópicos encontrados |
| `topicos_principais` | JSONB | - | ❌ | - | {"topico_id": "descricao", "probabilidade": 0.85} |

### **🔍 Métricas KeyBERT (Palavras-chave):**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `metrica_relevancia_marginal` | DECIMAL | 8,6 | ❌ | - | Relevância Marginal Máxima |
| `metrica_similaridade` | DECIMAL | 8,6 | ❌ | - | Similaridade cosseno BERT |
| `nlp_palavras_chave` | JSONB | - | ❌ | - | {"palavra": {"relevancia": 0.95, "diversidade": 0.7}} |
| `nlp_relevancia_ngramas` | JSONB | - | ❌ | - | N-gramas com TF-IDF + similaridade |

### **⚡ Métricas BERTScore (Qualidade):**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `bert_precisao` | DECIMAL | 8,6 | ❌ | - | Precisão BERT |
| `bert_revocacao` | DECIMAL | 8,6 | ❌ | - | Recall BERT |
| `bert_pontuacao_f1` | DECIMAL | 8,6 | ❌ | - | F1-Score BERT |

### **📈 Performance Score:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `metrica_performance` | DECIMAL | 8,6 | ❌ | - | 0.3×Coherence + 0.3×F1 + 0.4×Similarity |
| `intervalo_confianca_95` | DECIMAL | 8,6 | ❌ | - | Intervalo de confiança 95% |

### **💭 Análise de Sentimento:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `nlp_sentimento_geral` | VARCHAR | 20 | ❌ | - | POSITIVO, NEUTRO, NEGATIVO |
| `nlp_pontuacao_sentimento` | DECIMAL | 5,2 | ❌ | - | -100.00 a +100.00 |

### **🏷️ Named Entity Recognition:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `nlp_entidades_extraidas` | JSONB | - | ❌ | - | {"pessoas": [], "organizacoes": [], "locais": [], "datas": []} |
| `participantes_extraidos` | TEXT[] | - | ❌ | - | Array de nomes extraídos |

### **📝 Informações Específicas de ATA:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `data_reuniao` | DATE | - | ❌ | - | Data da reunião |
| `hora_inicio_reuniao` | TIME | - | ❌ | - | Horário de início |
| `hora_fim_reuniao` | TIME | - | ❌ | - | Horário de fim |
| `local_reuniao` | VARCHAR | 255 | ❌ | - | Local da reunião |
| `decisoes_extraidas` | TEXT[] | - | ❌ | - | Array de decisões |
| `acoes_extraidas` | JSONB | - | ❌ | - | [{"acao": "texto", "responsavel": "nome", "prazo": "data"}] |

### **✅ Métricas de Qualidade:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `taxa_conversao` | DECIMAL | 5,2 | ❌ | - | % de documentos convertidos |
| `qualidade_texto` | DECIMAL | 5,2 | ❌ | - | Ratio caracteres válidos vs. ruído |
| `segmentacao_score` | DECIMAL | 5,2 | ❌ | - | Qualidade da segmentação |
| `legibilidade_score` | DECIMAL | 5,2 | ❌ | - | Score de legibilidade |
| `completude_informacoes` | DECIMAL | 5,2 | ❌ | - | Completude da informação |

### **📊 Contadores de Estrutura:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `quantidade_paginas` | INTEGER | - | ❌ | - | Número de páginas |
| `quantidade_palavras` | INTEGER | - | ❌ | - | Número de palavras |
| `quantidade_caracteres` | INTEGER | - | ❌ | - | Número de caracteres |
| `quantidade_paragrafos` | INTEGER | - | ❌ | - | Número de parágrafos |

### **🖥️ Métricas de Sistema:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `quantidade_tentativas_processamento` | INTEGER | - | ❌ | 0 | Número de tentativas |
| `tempo_total_processamento_ms` | INTEGER | - | ❌ | - | Tempo total em ms |
| `memoria_utilizada_mb` | DECIMAL | 8,2 | ❌ | - | Memória utilizada |
| `cpu_utilizada_percentual` | DECIMAL | 5,2 | ❌ | - | CPU utilizada |
| `modelo_bert_utilizado` | VARCHAR | 100 | ❌ | - | Modelo BERT usado |
| `versoes_algoritmos` | JSONB | - | ❌ | - | {"bertopic": "0.15.0", "keybert": "0.8.0"} |

### **📝 Resumo e Análise:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `nlp_resumo_automatico` | TEXT | - | ❌ | - | Resumo gerado automaticamente |
| `nlp_palavras_frequentes` | JSONB | - | ❌ | - | {"palavra": frequencia} |

### **🔄 Controle de Versão:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `versao_documento` | INTEGER | - | ❌ | 1 | Versão do documento |
| `documento_pai_id` | UUID | - | ❌ | - | FK para uploaded_ata(id) |

### **✅ Validação e Aprovação:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `status_validacao` | VARCHAR | 20 | ❌ | 'PENDENTE' | PENDENTE, VALIDADO, REJEITADO |
| `validado_por_id` | UUID | - | ❌ | - | FK para usuario_sistema |
| `data_validacao` | TIMESTAMP | - | ❌ | - | Data da validação |
| `observacoes_validacao` | TEXT | - | ❌ | - | Observações da validação |

### **🔒 Controle de Acesso:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `visibilidade` | VARCHAR | 20 | ❌ | 'PRIVADO' | PUBLICO, PRIVADO, RESTRITO |
| `confidencialidade` | VARCHAR | 20 | ❌ | 'NORMAL' | PUBLICO, NORMAL, CONFIDENCIAL, SECRETO |

### **📅 Auditoria:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `data_criacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de atualização |
| `data_exclusao` | TIMESTAMP | - | ❌ | NULL | Data de exclusão (soft delete) |
| `vetor_busca` | TSVECTOR | - | ❌ | - | Busca textual completa |

### **Restrições da tabela uploaded_ata:**
- `codigo_documento` deve ser UNIQUE
- `tipo_documento` deve estar em ('ATA', 'RELATORIO', 'CONTRATO', 'OFICIO', 'MEMORANDO', 'OUTROS')
- `status_processamento` deve estar em ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'ERRO', 'REJEITADO')
- `status_validacao` deve estar em ('PENDENTE', 'VALIDADO', 'REJEITADO')
- `visibilidade` deve estar em ('PUBLICO', 'PRIVADO', 'RESTRITO')
- `confidencialidade` deve estar em ('PUBLICO', 'NORMAL', 'CONFIDENCIAL', 'SECRETO')
- `usuario_upload_id` referencia usuario_sistema(id)
- `validado_por_id` referencia usuario_sistema(id)
- `documento_pai_id` referencia uploaded_ata(id)

---

## 📈 **RELACIONAMENTOS ENTRE TABELAS**

```
pessoa_fisica (1) ──┐
                    ├── (0,1) usuario_sistema
pessoa_juridica (1) ──┘

usuario_sistema (1) ──── (N) uploaded_ata [usuario_upload_id]
usuario_sistema (1) ──── (N) uploaded_ata [validado_por_id]
usuario_sistema (1) ──── (N) usuario_sistema [created_by]

uploaded_ata (1) ──── (N) uploaded_ata [documento_pai_id] (versionamento)
```

---

---

## 📊 **5. TABELA: relatorio_atas**

### **Função:** Relatórios gerados com base nas análises das atas processadas (Sistema SIGATA)

| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `id` | UUID | - | ✅ | gen_random_uuid() | Identificador único |
| `codigo_relatorio` | VARCHAR | 50 | ✅ | - | Código único do relatório |
| `titulo_relatorio` | VARCHAR | 255 | ✅ | - | Título do relatório |
| `descricao` | TEXT | - | ❌ | - | Descrição do relatório |

### **📅 Período e Escopo:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `data_inicio_periodo` | DATE | - | ✅ | - | Data inicial do período analisado |
| `data_fim_periodo` | DATE | - | ✅ | - | Data final do período analisado |
| `tipo_periodo` | VARCHAR | 20 | ❌ | - | DIARIO, SEMANAL, MENSAL, TRIMESTRAL, ANUAL, PERSONALIZADO |
| `escopo_relatorio` | VARCHAR | 30 | ✅ | - | GERAL, POR_CATEGORIA, POR_USUARIO, POR_TIPO_DOCUMENTO |

### **📋 Atas Incluídas:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `atas_incluidas` | JSONB | - | ❌ | - | [{"ata_id": "uuid", "titulo": "texto", "data": "2025-07-15"}] |
| `total_atas_analisadas` | INTEGER | - | ❌ | 0 | Número total de atas incluídas |
| `filtros_aplicados` | JSONB | - | ❌ | - | {"tipo_documento": ["ATA"], "categoria": ["Técnico"]} |

### **📊 Métricas Consolidadas - Qualidade:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `qualidade_media_geral` | DECIMAL | 8,6 | ❌ | - | Média da qualidade de todas as atas |
| `metrica_performance_media` | DECIMAL | 8,6 | ❌ | - | Média do performance score |
| `metrica_coerencia_media` | DECIMAL | 8,6 | ❌ | - | Média do coherence score BERTopic |
| `bert_pontuacao_f1_media` | DECIMAL | 8,6 | ❌ | - | Média do F1-Score BERT |
| `legibilidade_media` | DECIMAL | 8,6 | ❌ | - | Média da legibilidade |
| `completude_media` | DECIMAL | 8,6 | ❌ | - | Média da completude |

### **🎯 Análise de Tópicos:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `topicos_mais_frequentes` | JSONB | - | ❌ | - | [{"topico": "planejamento", "frequencia": 15, "percentual": 23.5}] |
| `evolucao_topicos` | JSONB | - | ❌ | - | {"mes_atual": {...}, "mes_anterior": {...}} |
| `topicos_emergentes` | JSONB | - | ❌ | - | Tópicos que apareceram recentemente |
| `total_topicos_identificados` | INTEGER | - | ❌ | 0 | Total de tópicos únicos encontrados |

### **👥 Análise de Participação:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `participantes_mais_ativos` | JSONB | - | ❌ | - | [{"nome": "João Silva", "participacoes": 12, "percentual": 18.5}] |
| `total_participantes_unicos` | INTEGER | - | ❌ | 0 | Número de participantes únicos |
| `media_participantes_por_ata` | DECIMAL | 5,2 | ❌ | - | Média de participantes por ata |
| `organizacoes_mais_presentes` | JSONB | - | ❌ | - | Organizações que mais aparecem |

### **💭 Análise de Sentimento:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `sentimento_geral_periodo` | VARCHAR | 20 | ❌ | - | POSITIVO, NEUTRO, NEGATIVO |
| `pontuacao_sentimento_media` | DECIMAL | 5,2 | ❌ | - | Score médio de sentimento |
| `distribuicao_sentimentos` | JSONB | - | ❌ | - | {"positivo": 60, "neutro": 30, "negativo": 10} |
| `evolucao_sentimento` | JSONB | - | ❌ | - | Evolução do sentimento ao longo do tempo |

### **🔍 Palavras-chave e Termos:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `palavras_chave_periodo` | JSONB | - | ❌ | - | Palavras-chave mais relevantes do período |
| `termos_tecnicos_frequentes` | JSONB | - | ❌ | - | Termos técnicos que mais aparecem |
| `evolucao_vocabulario` | JSONB | - | ❌ | - | Como o vocabulário mudou no período |

### **📈 Decisões e Ações:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `total_decisoes_periodo` | INTEGER | - | ❌ | 0 | Total de decisões identificadas |
| `total_acoes_periodo` | INTEGER | - | ❌ | 0 | Total de ações definidas |
| `status_acoes` | JSONB | - | ❌ | - | {"pendentes": 25, "concluidas": 15, "atrasadas": 5} |
| `responsaveis_mais_acionados` | JSONB | - | ❌ | - | Responsáveis que mais receberam ações |
| `prazo_medio_acoes` | INTEGER | - | ❌ | - | Prazo médio das ações em dias |

### **🏢 Análise por Local/Reunião:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `locais_mais_utilizados` | JSONB | - | ❌ | - | [{"local": "Sala de Reunião A", "vezes": 8}] |
| `horarios_preferenciais` | JSONB | - | ❌ | - | Análise dos horários mais comuns |
| `duracao_media_reunioes` | INTEGER | - | ❌ | - | Duração média em minutos |
| `reunioes_por_dia_semana` | JSONB | - | ❌ | - | {"segunda": 5, "terca": 8, ...} |

### **📊 Métricas de Performance Técnica:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `tempo_processamento_total_ms` | INTEGER | - | ❌ | - | Tempo total de processamento em ms |
| `memoria_utilizada_total_mb` | DECIMAL | 8,2 | ❌ | - | Memória total utilizada em MB |
| `algoritmos_utilizados` | JSONB | - | ❌ | - | Versões dos algoritmos usados |
| `taxa_sucesso_processamento` | DECIMAL | 5,2 | ❌ | - | % de atas processadas com sucesso |

### **📄 Geração do Relatório:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `formato_relatorio` | VARCHAR | 20 | ❌ | 'HTML' | HTML, PDF, EXCEL, JSON |
| `modelo_utilizado` | VARCHAR | 50 | ❌ | - | Template usado para geração |
| `relatorio_html` | TEXT | - | ❌ | - | Relatório em HTML |
| `relatorio_dados_brutos` | JSONB | - | ❌ | - | Dados brutos para regeneração |
| `graficos_incluidos` | JSONB | - | ❌ | - | Metadados dos gráficos gerados |

### **👤 Controle de Geração:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `gerado_por_id` | UUID | - | ✅ | - | FK para usuario_sistema |
| `data_geracao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data/hora de geração |
| `tempo_geracao_ms` | INTEGER | - | ❌ | - | Tempo de geração em ms |
| `status_geracao` | VARCHAR | 20 | ❌ | 'CONCLUIDO' | PROCESSANDO, CONCLUIDO, ERRO |

### **🔄 Agendamento e Automação:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `relatorio_agendado` | BOOLEAN | - | ❌ | FALSE | Relatório gerado automaticamente |
| `frequencia_agendamento` | VARCHAR | 20 | ❌ | - | DIARIO, SEMANAL, MENSAL, TRIMESTRAL |
| `proximo_agendamento` | TIMESTAMP | - | ❌ | - | Próxima execução agendada |
| `relatorio_pai_id` | UUID | - | ❌ | - | FK para relatorio_atas (série temporal) |

### **📤 Compartilhamento:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `visibilidade` | VARCHAR | 20 | ❌ | 'PRIVADO' | PUBLICO, PRIVADO, RESTRITO |
| `compartilhado_com` | JSONB | - | ❌ | - | [{"usuario_id": "uuid", "permissao": "leitura"}] |
| `link_compartilhamento` | VARCHAR | 255 | ❌ | - | Link público (se aplicável) |
| `data_expiracao_link` | TIMESTAMP | - | ❌ | - | Expiração do link público |

### **📅 Auditoria:**
| Coluna | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
|--------|------|---------|-------------|---------|-----------|
| `data_criacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de criação |
| `data_atualizacao` | TIMESTAMP | - | ❌ | CURRENT_TIMESTAMP | Data de atualização |
| `data_exclusao` | TIMESTAMP | - | ❌ | NULL | Data de exclusão (soft delete) |
| `versao_relatorio` | INTEGER | - | ❌ | 1 | Versão do relatório |

### **Restrições da tabela relatorio_atas:**
- `codigo_relatorio` deve ser UNIQUE
- `data_inicio_periodo` deve ser <= `data_fim_periodo`
- `tipo_periodo` deve estar em ('DIARIO', 'SEMANAL', 'MENSAL', 'TRIMESTRAL', 'ANUAL', 'PERSONALIZADO')
- `escopo_relatorio` deve estar em ('GERAL', 'POR_CATEGORIA', 'POR_USUARIO', 'POR_TIPO_DOCUMENTO')
- `formato_relatorio` deve estar em ('HTML', 'PDF', 'EXCEL', 'JSON')
- `status_geracao` deve estar em ('PROCESSANDO', 'CONCLUIDO', 'ERRO')
- `frequencia_agendamento` deve estar em ('DIARIO', 'SEMANAL', 'MENSAL', 'TRIMESTRAL')
- `visibilidade` deve estar em ('PUBLICO', 'PRIVADO', 'RESTRITO')
- `gerado_por_id` referencia usuario_sistema(id)
- `relatorio_pai_id` referencia relatorio_atas(id)

---

## 📈 **RELACIONAMENTOS ATUALIZADOS**

```
pessoa_fisica (1) ──┐
                    ├── (0,1) usuario_sistema
pessoa_juridica (1) ──┘

usuario_sistema (1) ──── (N) uploaded_ata [usuario_upload_id]
usuario_sistema (1) ──── (N) uploaded_ata [validado_por_id]
usuario_sistema (1) ──── (N) usuario_sistema [criado_por_id]
usuario_sistema (1) ──── (N) relatorio_atas [gerado_por_id]

uploaded_ata (1) ──── (N) uploaded_ata [documento_pai_id] (versionamento)
uploaded_ata (N) ──── (1) relatorio_atas [atas_incluidas] (via JSONB)

relatorio_atas (1) ──── (N) relatorio_atas [relatorio_pai_id] (série temporal)
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **Definição das tabelas** - CONCLUÍDO
2. ⏳ **Geração do arquivo SQL** - PRÓXIMO PASSO
3. ⏳ **Criação dos índices de performance**
4. ⏳ **Implementação das funções auxiliares**
5. ⏳ **Criação dos triggers**
6. ⏳ **Scripts de inserção de dados iniciais**

---

**Elaborado por:** GitHub Copilot  
**Projeto:** SIGMA_PLI  
**Arquivo:** `database/tabelas_base_definicao.md`
