# Fase 9 - Temas (Dark Mode)

## Objetivo
Introduzir suporte a múltiplos temas (inicialmente `light` e `dark`) sem criar novos tokens fora da whitelist. O modo escuro é aplicado via atributo `data-theme="dark"` em `<html>`.

## Implementação Realizada
- Arquivo `static/css/08-themes/theme-dark.css` criado com overrides somente de tokens existentes.
- Inclusão desse CSS no template `views/templates/base.ejs` (carregado sempre; só efetiva com `[data-theme="dark"]`).
- Script inline de bootstrap antecipado (evita FOUC) decide tema inicial com prioridade:
  1. Preferência do usuário (localStorage `pli_theme`).
  2. `prefers-color-scheme: dark` do sistema.
  3. Fallback: `light`.
- Botões de toggle (`.theme-toggle-btn`) nas duas navbars com `aria-pressed` atualizado.
- Persistência da escolha do usuário em `localStorage`.
- Observação de mudanças do sistema operacional quando o usuário ainda não escolheu tema explicitamente.

## Política de Tokens
- Apenas cores, sombras, gradientes, bordas e texto foram ajustados.
- Não foram criadas novas variáveis `--pli-*` (cumprindo governança da Fase 8).
- Variáveis deprecated continuam isoladas até Fase 10 (remoção/alias definitivo).

## Próximos Passos (Opcional)
1. Criar `theme-high-contrast.css` para acessibilidade futura.
2. Expor endpoint de preferência de tema no perfil do usuário (sincronizar server-side).
3. Adicionar transição suave (`prefers-reduced-motion` condicional) entre temas.
4. Testes de contraste (WCAG AA) automatizados para paleta dark.
5. Incluir ícone do estado (sol/lua) com `aria-live=polite` para leitores de tela.

## Teste Rápido
Abra uma página com o template base e clique no botão com sol/lua. Verifique se `<html>` recebe ou remove `data-theme="dark"` e se as cores são atualizadas imediatamente sem flash.

## Métricas a Capturar (Sugestão)
- Tempo até pintura inicial sem FOUC (comparar antes/depois).
- Número de tokens sobrescritos no tema (atual: ~20).
- Contraste mínimo medido em textos corpo x fundo (> 4.5 recomendado).

---
Fase 9 inicial concluída (dark mode básico funcional). Ajustes avançados podem ser iterados posteriormente.
