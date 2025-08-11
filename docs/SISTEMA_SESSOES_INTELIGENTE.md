# Sistema Inteligente de Sessões - SIGMA-PLI

## Visão Geral

O Sistema Inteligente de Sessões foi implementado para proporcionar uma experiência mais segura e fluida no SIGMA-PLI. O sistema oferece renovação automática de sessões baseada na atividade do usuário e controle inteligente de janelas/abas.

## Características Principais

### 🕒 **Duração da Sessão: 15 Minutos**

- Sessões têm duração padrão de 15 minutos
- Renovação automática baseada na atividade do usuário
- Renovação inteligente quando restam 5 minutos

### 🖱️ **Detecção de Atividade Inteligente**

O sistema monitora automaticamente:

- Movimentos do mouse
- Cliques e toques
- Teclas pressionadas
- Rolagem da página
- Foco/desfoque da janela
- Mudanças de visibilidade da aba

### 🔄 **Renovação Automática**

- **Renovação baseada em atividade**: Quando o usuário está ativo e restam 5 minutos
- **Verificação a cada minuto**: Sistema verifica automaticamente se precisa renovar
- **Notificação discreta**: Usuário é informado quando a sessão é renovada
- **Renovação manual**: Ctrl+R força renovação imediata

### 🪟 **Controle Inteligente de Janelas**

- **Registro automático**: Cada nova aba/janela é registrada
- **Detecção de fechamento**: Sistema detecta quando janelas são fechadas
- **Logout automático**: Quando todas as janelas são fechadas, logout automático em 30 segundos
- **Comunicação entre janelas**: Logout em uma janela afeta todas as outras

### 💓 **Sistema Heartbeat**

- **Heartbeat a cada 30 segundos**: Mantém a sessão ativa
- **Verificação de saúde**: Detecta problemas de conectividade
- **Failover automático**: Redireciona para login se sessão for invalidada

## Interface do Usuário

### Indicador Visual de Sessão

- **Localização**: Canto superior direito da tela
- **Informações mostradas**:
  - Ícone de status (verde = ativo, amarelo = alerta, vermelho = crítico)
  - Timer regressivo (MM:SS)
  - Clique para ver detalhes da sessão

### Cores do Indicador

- 🟢 **Verde**: Mais de 5 minutos restantes
- 🟡 **Amarelo**: Entre 2-5 minutos restantes
- 🔴 **Vermelho**: Menos de 2 minutos restantes

## Funcionalidades Técnicas

### Renovação Inteligente

```javascript
// Renovação automática quando:
- Usuário está ativo AND restam ≤ 5 minutos
- Verificação a cada 1 minuto
- Detecção de atividade em tempo real

// Tipos de renovação:
- AUTO_RENEWAL: Renovação automática programada
- ACTIVITY_BASED: Renovação baseada em atividade detectada
- MANUAL_FORCE: Renovação manual (Ctrl+R)
```

### Controle de Janelas

```javascript
// Cada janela/aba registra:
- ID único da janela
- URL atual
- Status de atividade
- Timestamp de abertura
- Última atividade detectada

// Logout automático quando:
- Todas as janelas são fechadas
- Aguarda 30 segundos para reabertura
- Se não reabrir, faz logout automático
```

### Eventos de Sessão

Todos os eventos são registrados para auditoria:

- `RENEWAL`: Renovações de sessão
- `ACTIVITY`: Atividade do usuário detectada
- `LOGOUT`: Logout manual ou automático
- `HEARTBEAT`: Verificações de saúde

## API Endpoints

### `/api/session/register-window`

Registra uma nova janela/aba

```json
POST /api/session/register-window
{
  "windowId": "window_abc123_1234567890",
  "url": "https://exemplo.com/pagina",
  "timestamp": 1234567890000
}
```

### `/api/session/renew`

Renova a sessão atual

```json
POST /api/session/renew
{
  "windowId": "window_abc123_1234567890",
  "reason": "ACTIVITY_BASED",
  "lastActivity": 1234567890000
}
```

### `/api/session/heartbeat`

Envia heartbeat para manter sessão

```json
POST /api/session/heartbeat
{
  "windowId": "window_abc123_1234567890",
  "isActive": true,
  "lastActivity": 1234567890000,
  "timestamp": 1234567890000
}
```

### `/api/session/logout`

Realiza logout completo

```json
POST /api/session/logout
{
  "windowId": "window_abc123_1234567890",
  "reason": "USER_LOGOUT"
}
```

## Comportamentos do Sistema

### Ao Fazer Login

1. Sistema cria sessão com duração de 15 minutos
2. Registra a primeira janela como "principal"
3. Inicia monitoramento de atividade
4. Configura renovação automática
5. Exibe indicador visual

### Durante o Uso

1. **Atividade detectada**: Atualiza timestamp de última atividade
2. **5 minutos restantes + usuário ativo**: Renova automaticamente
3. **Nova aba/janela aberta**: Registra nova janela
4. **Aba/janela fechada**: Remove do registro
5. **Heartbeat a cada 30s**: Verifica saúde da sessão

### Ao Fechar Janelas

1. **Última janela fechada**: Agenda logout em 30 segundos
2. **Reabertura antes de 30s**: Cancela logout automático
3. **30 segundos sem reabertura**: Executa logout automático
4. **Logout em uma janela**: Todas as outras janelas fazem logout

### Renovação de Sessão

1. **Verifica atividade do usuário**: Se ativo nos últimos 2 minutos
2. **Calcula tempo restante**: Se ≤ 5 minutos, renova
3. **Atualiza expiração**: +15 minutos a partir de agora
4. **Registra evento**: Log de auditoria da renovação
5. **Notifica usuário**: Mensagem discreta de confirmação

## Monitoramento e Auditoria

### Tabelas do Banco de Dados

#### `usuarios.sessao_janelas`

Controla janelas/abas ativas por sessão:

```sql
- session_id: ID da sessão pai
- window_id: ID único da janela
- url: URL da página
- ativa: Se a janela está aberta
- is_main_window: Se é a janela principal
- is_active: Se há atividade do usuário
- ultima_atividade: Timestamp da última atividade
```

#### `usuarios.sessao_eventos`

Log de eventos de sessão:

```sql
- session_id: ID da sessão
- window_id: ID da janela (opcional)
- evento_tipo: RENEWAL, ACTIVITY, LOGOUT, etc.
- evento_dados: Dados JSON do evento
- data_evento: Timestamp do evento
```

### Consultas Úteis

```sql
-- Sessões com múltiplas janelas ativas
SELECT * FROM usuarios.v_estatisticas_janelas
WHERE janelas_ativas > 1;

-- Eventos de renovação nas últimas 24h
SELECT * FROM usuarios.sessao_eventos
WHERE evento_tipo = 'RENEWAL'
AND data_evento >= NOW() - INTERVAL '24 hours';

-- Janelas ativas por sessão
SELECT session_id, COUNT(*) as janelas_ativas
FROM usuarios.sessao_janelas
WHERE ativa = true
GROUP BY session_id;
```

## Configuração

### Parâmetros Ajustáveis

```javascript
// IntelligentSessionManager
sessionDuration: 15 * 60 * 1000,     // 15 minutos
renewalThreshold: 5 * 60 * 1000,     // Renovar com 5 min restantes
activityTimeout: 2 * 60 * 1000,      // 2 min sem atividade = inativo
heartbeatInterval: 30 * 1000,        // Heartbeat a cada 30s
```

### Eventos Monitorados

```javascript
activityEvents: [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus',
  'blur',
];
```

## Troubleshooting

### Problemas Comuns

#### Sessão expira muito rápido

- **Causa**: Usuário inativo por mais de 2 minutos
- **Solução**: Mover mouse ou teclar para reativar

#### Logout automático inesperado

- **Causa**: Todas as janelas foram fechadas
- **Solução**: Reabrir dentro de 30 segundos

#### Indicador não aparece

- **Causa**: JavaScript desabilitado ou erro de carregamento
- **Solução**: Verificar console do navegador para erros

#### Renovação não funciona

- **Causa**: Problema de conectividade ou sessão inválida
- **Solução**: Fazer logout/login manual

### Logs de Debug

```javascript
// Habilitar logs detalhados no console
localStorage.setItem('debug-session', 'true');

// Ver informações da sessão atual
window.IntelligentSessionManager?.getSessionInfo();

// Forçar renovação manual
window.IntelligentSessionManager?.forceRenewal();
```

## Benefícios

### Para o Usuário

- ✅ **Sem interrupções**: Trabalho contínuo sem timeouts inesperados
- ✅ **Segurança**: Logout automático quando sai do sistema
- ✅ **Transparência**: Indicador visual mostra status da sessão
- ✅ **Flexibilidade**: Múltiplas abas funcionam corretamente

### Para o Sistema

- ✅ **Segurança aprimorada**: Controle preciso de sessões ativas
- ✅ **Auditoria completa**: Log detalhado de todos os eventos
- ✅ **Performance otimizada**: Limpeza automática de sessões inativas
- ✅ **Escalabilidade**: Suporte a múltiplas janelas por usuário

### Para Administradores

- ✅ **Monitoramento**: Visibilidade completa das sessões ativas
- ✅ **Controle**: Capacidade de forçar logout de sessões específicas
- ✅ **Relatórios**: Estatísticas detalhadas de uso do sistema
- ✅ **Manutenção**: Limpeza automática de dados antigos

## Compatibilidade

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge (modernas)
- ✅ **Dispositivos**: Desktop, Tablet, Mobile
- ✅ **Protocolos**: HTTP, HTTPS
- ✅ **Tecnologias**: WebSockets não necessário (usa HTTP polling)

---

**Desenvolvido para SIGMA-PLI | Módulo de Gerenciamento de Cadastros**  
_Sistema robusto, seguro e inteligente para controle de sessões_
