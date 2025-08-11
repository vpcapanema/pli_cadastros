## Módulo Style Map / Editor de Variáveis

Este módulo gera relatórios HTML com inventário de classes CSS e suas declarações, oferecendo edição segura de variáveis (custom properties) whitelisted.

### Fluxo
1. Gerar relatórios: `npm run stylemap:generate` (saída em `docs/style-map-pages/`).
2. Acessar índice: `http://localhost:8888/style-map/`.
3. Expandir uma classe que contenha variáveis. Um formulário é exibido para cada bloco com custom properties.
4. Editar valores e usar:
   - Pré-visualizar: mostra diff textual.
   - Salvar vars: envia POST `/api/stylemap/update-css`.
5. Alterações ficam registradas em `logs/stylemap-changes.log`.

### Segurança
- Somente variáveis listadas em `docs/variables-whitelist.json` são aplicadas.
- Variáveis internas aparecem como `internalAllowed` mas não são editáveis se não constarem em `variables`.
- Endpoint de apoio (dev): `GET /api/stylemap/whitelist`.

### Convenções
- Nomes hashed são normalizados visualmente: `core.min.<hash>.css` → `core.min.css` (apenas exibição).
- O atributo `data-file` mantém o caminho real para escrita.

### Scripts
- `stylemap:generate` / `stylemap:regen`: regeneram relatórios.

### Log
Cada linha: `ISO_TIMESTAMP | ABS_PATH | VAR_NAME | OLD => NEW`.

### Próximos Passos (opcional)
- Integrar a pipeline CI para gerar relatório pós-build.
- Adicionar diff histórico (git pre-commit hook) para validar mudanças de tokens.
