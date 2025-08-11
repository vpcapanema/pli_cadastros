# Plano de Reestruturação CSS (Português - Brasil)

Documento gerado automaticamente. Este plano NÃO aplica mudanças por si só.

## Objetivos Gerais

1. Governança de tokens e variáveis centralizadas.
2. Redução de conflitos e duplicidades de classes.
3. Arquitetura em camadas organizada e previsível.
4. Padronização de nomenclatura em português respeitando contexto de cada página.
5. Componentização consistente (botões, cards, formulários, navegação, rodapé, etc.).
6. Isolamento de estilos específicos de página sem vazamento global.
7. Auditoria contínua automatizada (relatórios + CI futuro).
8. Performance de carregamento (critical CSS, divisão de bundles).
9. Evolução para temas (modo escuro / alternativos) sem reescrita de componentes.
10. Fluxo colaborativo com controle e rollback seguro.

## Estrutura de Diretórios Proposta

Ordem de carga (0 → 8):

```
static/css/
  00-configuracoes/   (tokens, variáveis globais, temas)
  01-ferramentas/     (ferramentas internas / mixins futuros)
  02-genericos/       (reset, normalização)
  03-elementos/       (tags HTML base)
  04-estruturas/      (padrões de layout reutilizáveis)
  05-componentes/     (componentes funcionais)
  06-utilitarios/     (helpers de propósito único)
  07-paginas/         (regras específicas de página)
  08-experimentos/    (testes temporários)
  99-depreciados/     (quarentena antes de remoção – temporário)
```

## Convenção de Classes (Prefixos)

- `comp-` componentes (ex: `comp-botao`, `comp-card--elevado`)
- `estr-` estruturas/layout (ex: `estr-grid`, `estr-pilha`)
- `util-` utilitários (ex: `util-flex`, `util-mt-sm`)
- `pag-` wrapper de página (ex: `pag-login`, `pag-dashboard`)
- `estado-` estado (ex: `estado-ativo`, `estado-invalido`)
- `tem-` posse/indicadores (ex: `tem-icone`, `tem-erro`)
- Modificadores: `--` (ex: `comp-botao--primario`)
- Elementos internos: `__` (ex: `comp-card__cabecalho`)

## Variáveis CSS (Custom Properties) – Base Semântica

Exemplos de tokens unificados:

```
--cor-primaria, --cor-secundaria, --cor-sucesso, --cor-perigo
--cor-fundo, --cor-fundo-alt, --cor-texto, --cor-texto-suave
--espacamento-xxs, --espacamento-xs, --espacamento-sm, --espacamento-md, --espacamento-lg
--raio-borda-sm, --raio-borda-md, --raio-borda-lg
--sombra-card-base, --sombra-elevada
--fonte-base-familia, --fonte-base-tamanho, --fonte-base-altura
--transicao-base
```

Camada semântica adicional (ex: `--botao-primario-fundo`) pode apontar para tokens de cor.

## Fases de Execução

| Fase | Nome | Objetivo | Saída Chave | Risco Principal |
|------|------|----------|-------------|-----------------|
| 0 | Preparação e Baseline | Capturar estado atual | baseline JSON/HTML | Nenhum |
| 1 | Estrutura de Diretórios | Criar pastas novas vazias | Diretórios + READMEs | Ordem de import |
| 2 | Consolidação de Tokens | Centralizar variáveis | `00-configuracoes/tokens.css` | Variável faltante |
| 3 | Wrappers de Página | Escopo por `.pag-*` | Regras movidas para 07-paginas | Regressão de especificidade |
| 4 | Componentização | Extrair padrões | Arquivos `comp-*` | JS referindo classes antigas |
| 5 | Utilities & Limpeza | Consolidar helpers | Redução conflitos | Bloat de utilities |
| 6 | Performance CSS | Critical + splitting | Core reduzido | FOUC |
| 7 | Editor Controlado | Whitelist de variáveis | Bloqueio tokens estruturais | Necessidade de hotfix |
| 8 | Auditoria CI | Gatilhos automáticos | Build falha em regressão | Falsos positivos |
| 9 | Temas | Modo escuro / variação | `[data-tema=...]` overrides | Cores hardcoded | 
| 10 | Depreciação Final | Remover legado | Limpeza diretórios | Remoção precoce |

## Métricas de Sucesso

- Conflitos CSS reduzidos ≥ 60% até Fase 5.
- Peso do core estabilizado / redução mensurável.
- Nenhuma página com > X (definir) classes órfãs pós Fase 5.
- FCP / LCP melhorado após Fase 6.
- Zero tokens duplicados após Fase 2.

## Rollback Estratégico

Cada fase = commit isolado + tag: `refator-css-fase-X`. Em caso de regressão, `git revert` daquele commit e restauração do baseline da fase.

## Próximos Passos Imediatos

1. Executar Fase 0 (baseline).
2. Executar Fase 1 (estruturas de diretórios vazias + READMEs).
3. Atualizar painel de progresso.

---
Documento gerado em: 
