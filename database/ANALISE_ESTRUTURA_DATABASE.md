# Análise Completa da Estrutura do Banco de Dados PLI

## Informações de Conexão

- **Servidor**: pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com:5432
- **Banco**: pli_db
- **Tipo**: PostgreSQL com PostGIS
- **Usuário**: postgres
- **Status**: ✅ Conectado e funcional

## Resumo dos Schemas

### 1. Schema `cadastro`

**Propósito**: Gerenciamento de cadastros de pessoas físicas e jurídicas

#### Tabelas:

- `pessoa_fisica` - 1 registro existente
- `pessoa_juridica` - 0 registros

### 2. Schema `usuarios`

**Propósito**: Sistema de autenticação e controle de usuários

#### Tabelas:

- `usuario_sistema` - 1 registro existente (admin)
- `usuario_historico_formularios` - Histórico de ações dos usuários

### 3. Schema `sigata`

**Propósito**: Sistema de Gestão de Atas (SIGATA) - Core do sistema

#### Tabelas (10 + 3 views):

- `documento_base` - 0 registros
- `documento_arquivo` - Armazenamento de arquivos
- `documento_ata_dados` - Dados específicos de atas
- `documento_controle` - Controle de workflow
- `documento_nlp_dados` - Dados processados por NLP
- `documento_nlp_metricas` - Métricas de performance do NLP
- `documento_qualidade` - Controle de qualidade
- `relatorio_base` - Base para relatórios
- `relatorio_controle` - Controle de geração de relatórios
- `relatorio_resultados` - Resultados dos relatórios

#### Views:

- `v_documentos_basico` - Visão simplificada de documentos
- `v_relatorios_dashboard` - Dashboard de relatórios
- `v_stats_basico` - Estatísticas básicas

### 4. Schema `public`

**Propósito**: Funcionalidades padrão e extensões PostGIS

## Detalhamento das Tabelas Principais

### `usuarios.usuario_sistema` (1 registro)

```
Colunas principais:
- id (UUID): Primary Key
- username: Nome de usuário
- email: Email do usuário
- senha_hash: Hash da senha
- salt: Salt para senha
- duplo_fator_habilitado: 2FA ativo
- tipo_usuario: ADMIN, USER, etc.
- nivel_acesso: Nível de permissão
- ativo: Status ativo/inativo
- data_criacao: Data de criação

Registro existente:
- ID: c05ead9a-ac08-4510-8f16-d7287368e3b6
- Username: admin
- Email: admin@sigma-pli.com.br
- Tipo: ADMIN
- Status: Ativo
- Criado: 2025-07-15 17:32:17
```

### `cadastro.pessoa_fisica` (1 registro)

```
Colunas principais:
- id (UUID): Primary Key
- nome_completo: Nome completo
- cpf: CPF único
- coordenadas (PostGIS): Localização geográfica
- data_criacao: Data de criação

Registro existente:
- ID: 37497774-a10f-44ee-9b29-4914977a63cf
- Nome: "Administrador do Sistema"
- CPF: 00000000000
- Criado: 2025-07-15 17:27:28
```

### `sigata.documento_base` (0 registros)

```
Estrutura para gestão de documentos:
- id (UUID): Primary Key
- codigo_documento: Código único
- titulo_documento: Título
- tipo_documento: ATA_REUNIAO, DOCUMENTO_OFICIAL, etc.
- status_processamento: PENDENTE, PROCESSANDO, CONCLUIDO, etc.
- conteudo_original: Texto original
- conteudo_processado: Texto processado
- arquivo_id: Referência ao arquivo
- data_upload: Data de upload
- carregado_por_id: Usuário que carregou
- configuracoes_nlp: Configurações do processamento
```

### `sigata.documento_nlp_dados` (0 registros)

```
Dados de processamento NLP:
- documento_id (UUID): FK para documento_base
- nlp_entidades_extraidas (JSONB): Entidades identificadas
- participantes_extraidos (TEXT[]): Lista de participantes
- nlp_resumo_automatico: Resumo gerado
- nlp_palavras_frequentes (JSONB): Palavras mais frequentes
- decisoes_extraidas (TEXT[]): Decisões identificadas
- acoes_extraidas (JSONB): Ações extraídas
- vetor_busca (TSVECTOR): Índice de busca textual
```

### `sigata.documento_nlp_metricas` (0 registros)

```
Métricas de performance do NLP:
- documento_id (UUID): FK para documento_base
- nlp_processado: Status do processamento
- nlp_idioma_detectado: Idioma identificado
- nlp_confianca_idioma: Confiança da detecção
- tempo_processamento_ms: Tempo de processamento
- metrica_coerencia: Métricas de qualidade
- metrica_silhueta: Métricas de clustering
- bert_precisao/revocacao/f1: Métricas do modelo BERT
- nlp_sentimento_geral: POSITIVO/NEUTRO/NEGATIVO
- modelo_bert_utilizado: Modelo específico usado
```

## Recursos Avançados Identificados

### 1. **Indexação Avançada**

- Índices GIN para arrays e JSONB
- Índices específicos para busca textual (tsvector)
- Índices compostos para performance

### 2. **Triggers e Funções**

- `trg_update_vetor_busca_nlp`: Atualização automática de índices de busca
- Funções para manutenção automática dos dados

### 3. **Constraints e Validações**

- Check constraints para validação de dados
- Foreign keys com CASCADE para integridade
- Constraints únicos para evitar duplicação

### 4. **Capacidades de NLP/IA**

- Suporte completo para dados JSONB
- Armazenamento de vetores de busca
- Métricas de performance de modelos
- Integração com BERT e outros modelos

### 5. **PostGIS Integration**

- Suporte para coordenadas geográficas
- Capacidades de análise espacial

## Status Atual

- ✅ **Estrutura**: Completamente implementada e funcional
- ✅ **Usuário Admin**: Configurado e ativo
- ✅ **Schemas**: Todos os schemas criados
- ⚠️ **Dados**: Apenas dados de exemplo/admin
- 🔄 **Integração**: Pendente integração com aplicação

## Próximos Passos Recomendados

1. **Configurar conexão da aplicação** com o banco real
2. **Atualizar configurações** de database.ts
3. **Mapear models** TypeScript para as tabelas existentes
4. **Implementar migrations** se necessário
5. **Configurar seeds** para dados de desenvolvimento
6. **Validar integridade** das foreign keys

## Observações Técnicas

- O banco está **production-ready** com estrutura robusta
- Suporte completo para **workflow de processamento de documentos**
- **Segurança** implementada com hashing de senhas e salt
- **Auditoria** através de campos de data_criacao, data_atualizacao
- **Escalabilidade** com uso de UUIDs e estruturas JSONB
- **Performance** otimizada com índices específicos

---

_Análise realizada em: {{ date }}_
_Conexão verificada e funcional_
