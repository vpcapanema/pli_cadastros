# Funcionalidade de Mostrar/Ocultar Senha - SIGMA-PLI

## Visão Geral

Foi implementada uma funcionalidade universal para mostrar/ocultar senhas em todos os campos de senha do sistema SIGMA-PLI. A funcionalidade adiciona automaticamente um ícone de olho ao lado dos campos de senha, permitindo ao usuário visualizar temporariamente o texto digitado.

## Características da Implementação

### 🎯 **Funcionalidade Principal**
- **Ícone de olho**: Aparece automaticamente ao lado de todos os campos de senha
- **Toggle visual**: Alterna entre `fas fa-eye` (mostrar) e `fas fa-eye-slash` (ocultar)
- **Auto-detecção**: Identifica automaticamente campos `input[type="password"]`
- **Responsivo**: Funciona em dispositivos desktop, tablet e mobile

### 🕒 **Comportamento Inteligente**
- **Auto-ocultação**: Senha é ocultada automaticamente após 5 segundos
- **Ocultação no blur**: Senha é ocultada quando o campo perde o foco
- **Manutenção de foco**: Ao clicar no ícone, o foco permanece no campo de senha
- **Tooltip dinâmico**: Texto do tooltip muda entre "Mostrar senha" e "Ocultar senha"

### 🔧 **Detecção Automática**
- **Campos existentes**: Detecta campos já presentes na página
- **Campos dinâmicos**: Detecta campos adicionados via JavaScript (MutationObserver)
- **Containers suportados**: `.form-floating`, `.input-group`, `.form-group`, `.mb-3`
- **Evita duplicação**: Verifica se já existe toggle antes de adicionar

## Páginas Implementadas

### ✅ **Páginas com Funcionalidade Ativa**

1. **Login** (`/login.html`)
   - Campo: Senha do usuário
   - Auto-ocultação: 5 segundos

2. **Dashboard** (`/dashboard.html`)
   - Campos: Senha atual, nova senha, confirmar senha (modal de alteração)
   - Funcionalidade completa

3. **Cadastro de Usuário** (`/cadastro-usuario.html`)
   - Campos: Senha e confirmar senha
   - Detecta campos dinamicamente

4. **Recuperação de Senha** (`/recuperar-senha.html`)
   - Campos: Nova senha e confirmar senha
   - Validação de força de senha mantida

5. **Usuários** (`/usuarios.html`)
   - Campos: Senha e confirmar senha (modais de criação/edição)
   - Campos: Nova senha nos modais de alteração

6. **Meus Dados** (`/meus-dados.html`)
   - Campos: Senha atual, nova senha, confirmar senha
   - Integração com validação existente

## Componente JavaScript

### 📁 **Arquivo**: `/static/js/components/passwordToggle.js`

### 🔧 **Classe Principal**: `PasswordToggle`

```javascript
// Auto-inicialização
window.passwordToggle = new PasswordToggle();

// Métodos principais:
passwordToggle.addToggleToField(field)     // Adiciona toggle a campo específico
passwordToggle.removeToggle(fieldId)       // Remove toggle
passwordToggle.hideAllPasswords()          // Oculta todas as senhas visíveis
```

### 🎨 **CSS Automático**
O componente adiciona automaticamente os estilos necessários:
```css
.password-toggle-btn {
    z-index: 10 !important;
    border: none !important;
    background: none !important;
    color: #6c757d !important;
    transition: color 0.2s ease;
}

.password-toggle-btn:hover {
    color: var(--pli-azul-escuro, #003366) !important;
}
```

## Como Funciona

### 🔍 **Detecção Automática**
1. **DOM Ready**: Busca todos os campos `input[type="password"]` existentes
2. **MutationObserver**: Monitora novos campos adicionados dinamicamente
3. **Container Check**: Verifica se o campo está em um container apropriado
4. **Toggle Creation**: Cria botão de toggle se necessário

### 🎯 **Criação do Toggle**
1. **Botão**: Cria elemento `<button>` com classes apropriadas
2. **Ícone**: Adiciona ícone Font Awesome (`fas fa-eye`)
3. **Posicionamento**: Posiciona absolutamente no canto direito do campo
4. **Eventos**: Configura eventos de clique e funcionalidades

### ⚡ **Funcionalidade do Toggle**
1. **Clique**: Alterna entre `type="password"` e `type="text"`
2. **Ícone**: Muda entre `fa-eye` e `fa-eye-slash`
3. **Tooltip**: Atualiza texto de "Mostrar" para "Ocultar"
4. **Auto-Hide**: Agenda ocultação automática após 5 segundos
5. **Blur**: Oculta ao perder foco (com delay para hover)

## Integração com Páginas

### 📝 **Como Adicionar a Novas Páginas**

Simplesmente incluir o script antes dos scripts da página:
```html
<script src="/static/js/components/passwordToggle.js"></script>
```

### 🔧 **Containers Suportados**
O componente funciona automaticamente com:
- `.form-floating` (Bootstrap floating labels)
- `.input-group` (Bootstrap input groups)
- `.form-group` (Bootstrap form groups)
- `.mb-3` (Margin bottom utility class)
- `.password-field-container` (Container customizado)

### 🚫 **Requisitos do HTML**
Nenhum HTML especial é necessário. O componente:
- Detecta automaticamente campos `input[type="password"]`
- Adiciona `position: relative` ao container se necessário
- Ajusta `padding-right` do campo para acomodar o botão
- Cria e posiciona o botão automaticamente

## Exemplos de Uso

### 🔐 **Campo de Senha Simples**
```html
<div class="form-floating mb-3">
    <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
    <label for="senha">Senha</label>
</div>
<!-- Toggle será adicionado automaticamente -->
```

### 🔐 **Campo em Modal (Dinâmico)**
```html
<!-- Modal criado via JavaScript -->
<div class="modal-body">
    <div class="mb-3">
        <label for="novaSenha" class="form-label">Nova Senha</label>
        <input type="password" class="form-control" id="novaSenha" name="novaSenha">
    </div>
</div>
<!-- Toggle será detectado e adicionado via MutationObserver -->
```

## Benefícios

### 👥 **Para o Usuário**
- ✅ **Usabilidade**: Verificação visual da senha digitada
- ✅ **Segurança**: Auto-ocultação para evitar exposição prolongada
- ✅ **Acessibilidade**: Suporte a screen readers com `aria-label`
- ✅ **Responsividade**: Funciona em todos os dispositivos

### 🛠️ **Para Desenvolvimento**
- ✅ **Zero configuração**: Funciona automaticamente
- ✅ **Não invasivo**: Não interfere com validações existentes
- ✅ **Compatível**: Funciona com Bootstrap e componentes customizados
- ✅ **Manutenível**: Código centralizado em um componente

### 🎨 **Para Design**
- ✅ **Consistente**: Visual padronizado em todo o sistema
- ✅ **Intuitivo**: Ícones universalmente reconhecidos
- ✅ **Integrado**: Usa cores e estilos do tema PLI
- ✅ **Profissional**: Animações suaves e transições

## Configurações Avançadas

### ⚙️ **Personalização do Tempo de Auto-Ocultação**
```javascript
// Modificar timeout global (padrão: 5000ms)
PasswordToggle.prototype.autoHideDelay = 3000; // 3 segundos
```

### ⚙️ **Desabilitar Auto-Ocultação**
```javascript
// Desabilitar para campos específicos
document.getElementById('meuCampo').dataset.passwordToggleAutoHide = 'false';
```

### ⚙️ **Forçar Ocultação de Todas as Senhas**
```javascript
// Útil para logout ou mudança de contexto
window.passwordToggle.hideAllPasswords();
```

### ⚙️ **Verificar Estado de um Campo**
```javascript
// Verificar se senha está visível
const toggle = window.passwordToggle.toggles.get('meuCampoId');
console.log('Senha visível:', toggle?.isVisible);
```

## Compatibilidade

### 🌐 **Navegadores Suportados**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### 📚 **Frameworks Compatíveis**
- ✅ Bootstrap 5.x (form-floating, input-group)
- ✅ Vanilla HTML (sem framework)
- ✅ jQuery (não dependente, mas compatível)
- ✅ Modais dinâmicos (Bootstrap modals)

### 🔧 **APIs Utilizadas**
- `MutationObserver` (detecção dinâmica)
- `addEventListener` (eventos)
- `querySelector/querySelectorAll` (seleção de elementos)
- `classList` (manipulação de classes)
- `setAttribute/getAttribute` (acessibilidade)

## Troubleshooting

### ❓ **Problemas Comuns**

#### Toggle não aparece
- **Causa**: Campo não está em container apropriado
- **Solução**: Adicionar classe `.mb-3` ou `.form-group` ao container

#### Auto-ocultação não funciona
- **Causa**: JavaScript está sendo sobrescrito
- **Solução**: Verificar ordem dos scripts e conflitos

#### Ícone não carrega
- **Causa**: Font Awesome não carregado
- **Solução**: Verificar se Font Awesome está incluído na página

#### Conflito com validação
- **Causa**: Outros scripts modificando o campo
- **Solução**: Carregar passwordToggle.js após outros componentes

### 🔍 **Debug**
```javascript
// Verificar se componente está ativo
console.log('Password Toggle:', window.passwordToggle);

// Listar todos os toggles ativos
console.log('Toggles ativos:', window.passwordToggle.toggles);

// Verificar CSS aplicado
console.log('CSS carregado:', !!document.querySelector('#password-toggle-styles'));
```

---

**Funcionalidade implementada com sucesso em todo o sistema SIGMA-PLI!** 🎉

*Desenvolvido para melhorar a experiência do usuário mantendo os padrões de segurança e usabilidade.*
