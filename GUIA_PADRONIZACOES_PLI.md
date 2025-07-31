# GUIA DE PADRONIZAÇÕES - SISTEMA PLI

## 🎯 Padrões Adotados

### **1. Nomenclatura de IDs**
- **Padrão**: camelCase
- **Exemplos**:
  ```html
  <input id="nomeCompleto" name="nome_completo">
  <input id="emailInstitucional" name="email_institucional">
  <input id="telefoneInstitucional" name="telefone_institucional">
  <input id="ramalInstitucional" name="ramal_institucional">
  <input id="instituicaoNome" name="instituicao_nome">
  ```

### **2. Estrutura de Botões**
- **Padrão**: `btn btn-{tipo} btn-lg px-4`
- **Ícones**: `fas fa-{icon} me-2` + texto sem espaço inicial
- **Exemplos**:
  ```html
  <!-- Primário -->
  <button type="submit" class="btn btn-primary btn-lg px-4">
      <i class="fas fa-save me-2"></i>Salvar
  </button>
  
  <!-- Secundário -->
  <button type="button" class="btn btn-secondary btn-lg px-4">
      <i class="fas fa-times me-2"></i>Cancelar
  </button>
  
  <!-- Perigo -->
  <button type="button" class="btn btn-danger btn-lg px-4">
      <i class="fas fa-trash me-2"></i>Excluir
  </button>
  
  <!-- Aviso -->
  <button type="submit" class="btn btn-warning btn-lg px-4">
      <i class="fas fa-key me-2"></i>Alterar Senha
  </button>
  ```

### **3. Estrutura de Modais PLI**
```html
<div class="modal fade" id="modalName" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content pli-card">
            <div class="modal-header border-bottom border-pli-primary">
                <h5 class="modal-title text-pli-dark">
                    <i class="fas fa-icon me-2 text-pli-primary"></i>Título
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <!-- Conteúdo -->
            </div>
            <div class="modal-footer border-top border-pli-primary">
                <!-- Botões padrão -->
            </div>
        </div>
    </div>
</div>
```

### **4. Campos de Entrada Padronizados**
```html
<div class="col-md-6">
    <label for="campoId" class="form-label required-field">Campo Obrigatório</label>
    <input type="text" 
           class="form-control" 
           id="campoId" 
           name="campo_name" 
           required 
           placeholder="Texto de exemplo"
           data-validation="tipo"
           minlength="3"
           maxlength="100">
    <div class="invalid-feedback">Mensagem de erro específica e clara.</div>
    <div class="form-text">Texto de ajuda opcional.</div>
</div>
```

### **5. Validações Padrão**
- **HTML5**: `required`, `minlength`, `maxlength`, `pattern`
- **Custom**: `data-validation="tipo"`
- **Tipos disponíveis**: `required`, `email`, `telefone`, `cpf`, `cnpj`, `password-strength`, `confirm-password`, `pattern`

### **6. Máscaras de Input**
```javascript
// Documentos
$('#cpf').mask('000.000.000-00');
$('#cnpj').mask('00.000.000/0000-00');
$('#rg').mask('00.000.000-0');

// Contatos
$('#telefone').mask('(00) 00000-0000');
$('#cep').mask('00000-000');

// Financeiro
$('#valor').mask('#.##0,00', {reverse: true});
```

### **7. Classes CSS PLI Prioritárias**
```css
/* Use sempre que disponível */
.pli-card                /* ao invés de .card */
.pli-button-primary      /* ao invés de .btn-primary */
.pli-input              /* ao invés de .form-control */
.text-pli-dark          /* para textos principais */
.text-pli-primary       /* para destaques */
.border-pli-primary     /* para bordas */
```

### **8. Estrutura de Cards em Formulários**
```html
<div class="card mb-3">
    <div class="card-header">
        <h6 class="card-title mb-0">
            <i class="fas fa-icon"></i> Título da Seção
        </h6>
    </div>
    <div class="card-body">
        <div class="row g-3">
            <!-- Campos do formulário -->
        </div>
    </div>
</div>
```

### **9. Mensagens de Feedback**
```html
<!-- Sucesso -->
<div class="invalid-feedback">Mensagem específica do erro.</div>

<!-- Ajuda -->
<div class="form-text">Informação útil para o usuário.</div>

<!-- Alerta -->
<div class="alert alert-warning">
    <i class="fas fa-exclamation-triangle me-2"></i>
    <strong>Atenção:</strong> Mensagem importante.
</div>
```

### **10. Ícones Padronizados**
```html
<!-- Ações -->
<i class="fas fa-save me-2"></i>        <!-- Salvar -->
<i class="fas fa-times me-2"></i>       <!-- Cancelar -->
<i class="fas fa-trash me-2"></i>       <!-- Excluir -->
<i class="fas fa-edit me-2"></i>        <!-- Editar -->
<i class="fas fa-search me-2"></i>      <!-- Buscar -->
<i class="fas fa-plus me-2"></i>        <!-- Adicionar -->
<i class="fas fa-user-plus me-2"></i>   <!-- Novo usuário -->
<i class="fas fa-key me-2"></i>         <!-- Senha -->

<!-- Status -->
<i class="fas fa-check-circle text-success"></i>     <!-- Sucesso -->
<i class="fas fa-exclamation-triangle text-warning"></i> <!-- Aviso -->
<i class="fas fa-times-circle text-danger"></i>      <!-- Erro -->
<i class="fas fa-info-circle text-info"></i>         <!-- Info -->

<!-- Seções -->
<i class="fas fa-user"></i>            <!-- Dados pessoais -->
<i class="fas fa-building"></i>        <!-- Dados institucionais -->
<i class="fas fa-cog"></i>             <!-- Configurações -->
<i class="fas fa-shield-alt"></i>      <!-- Segurança -->
```

## ✅ Checklist de Verificação

### **Antes de implementar um novo formulário:**
- [ ] IDs em camelCase
- [ ] Names em snake_case
- [ ] Botões com padrão completo
- [ ] Modal com classes PLI
- [ ] Validações HTML5 + custom
- [ ] Mensagens de feedback específicas
- [ ] Máscaras aplicadas
- [ ] Ícones padronizados
- [ ] Classes CSS PLI quando disponível
- [ ] Estrutura de cards consistente

### **Antes de fazer deploy:**
- [ ] Testar todos os botões
- [ ] Verificar validações
- [ ] Confirmar máscaras funcionando
- [ ] Validar responsividade
- [ ] Checar JavaScript funcionando
- [ ] Confirmar classes PLI aplicadas

## 🚀 Próximos Passos

1. Implementar linting automático
2. Criar componente reutilizável para modais
3. Padronizar todas as páginas existentes
4. Documentar novos padrões conforme necessário
