# Fase 2 - Consolidação de Tokens (Progresso Parcial)

## Objetivo
Unificar variáveis CSS dispersas em um único arquivo `static/css/00-configuracoes/tokens.css`, reduzindo duplicação e preparando camadas posteriores.

## Status Atual
- [x] Arquivo inicial `tokens.css` criado (rascunho).
- [ ] Extração automática completa de todas as custom properties existentes.
- [ ] Detecção de sinônimos/duplicatas (ex: tons de azul repetidos).
- [ ] Mapeamento origem → novo token aplicado.
- [ ] Remoção de definições redundantes em outros arquivos.

## Próximos Passos (Automação)
1. Script para varrer `static/css/**/*.{css}` (exceto minificados hashed) coletando `--pli-*` e valores literais.
2. Gerar JSON agrupando por valor normalizado (case-insensitive, sem espaços) para encontrar duplicatas.
3. Sugerir nomes canônicos (heurística: já existente em `tokens.css` ou gerar slug pelo papel/cor).
4. Produzir relatório `docs/Fase2-Tokens-SUGESTOES.json` e tabela em Markdown.
5. Aplicar substituição segura (dry-run + diff) antes do rewrite definitivo.

## Riscos & Mitigações
| Risco | Mitigação |
|-------|-----------|
| Mudança quebra páginas específicas | Substituição gradual + teste manual das páginas principais |
| Token com mesmo valor mas semântica diferente | Marcar como "conflito-semântico" e manter separado até confirmação |
| Excesso de tokens genéricos | Consolidar somente após ter wrappers de página (Fase 3) |

## Métricas Para Concluir Fase 2
- 100% das ocorrências de `--pli-*` catalogadas.
- Redução >= 25% de valores duplicados diretos (exato ou mesma cor hex normalizada).
- Nenhuma página perde estilos críticos (checagem smoke manual top 5 páginas + login + dashboard).

## Anotações
Esta é a primeira âncora; expandiremos o arquivo conforme coleta automatizada.
