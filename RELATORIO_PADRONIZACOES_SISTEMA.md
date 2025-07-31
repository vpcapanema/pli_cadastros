# RELATÓRIO DE PADRONIZAÇÕES - SISTEMA PLI

## ❌ INCONSISTÊNCIAS IDENTIFICADAS

### 1. **Nomenclatura de Botões**
- ❌ `btn btn-primary btn-lg px-4` vs `btn btn-primary`  
- ❌ `btn-lg px-4` vs `btn-lg px-5`
- ❌ Mistura de classes de tamanho: `btn-lg`, sem classe de tamanho
- ⚠️ **IMPACTO**: Interface inconsistente

### 2. **IDs e Classes de Formulários**
- ❌ `pessoaFisicaModal` vs `pessoa-fisica-modal`
- ❌ `nomeCompleto` vs `nome_completo` vs `nome-completo`
- ❌ `emailSecundario` vs `email_secundario`
- ❌ `telefonePrincipal` vs `telefone_principal`
- ⚠️ **IMPACTO**: JavaScript quebrado, manutenção difícil

### 3. **Estrutura de Validação**
- ❌ `required-field` vs `required`
- ❌ `is-invalid` aplicado inconsistentemente
- ❌ `invalid-feedback` às vezes ausente
- ❌ Validações JS diferentes por formulário
- ⚠️ **IMPACTO**: UX inconsistente

### 4. **Classes CSS Personalizadas**
- ❌ `pli-button-primary` vs `btn btn-primary`
- ❌ `pli-card-primary` vs `card`
- ❌ `form-section` vs `card mb-3`
- ⚠️ **IMPACTO**: Estilos não aplicados

### 5. **Formatação de Máscaras**
- ❌ Telefone: `(00) 00000-0000` vs `(00) 0000-0000`
- ❌ CPF: `000.000.000-00` vs formato livre
- ❌ CNPJ: `00.000.000/0000-00` vs formato livre
- ⚠️ **IMPACTO**: Dados inconsistentes

### 6. **Estrutura de Modais**
- ❌ `modal-header` com/sem classes PLI
- ❌ `btn-close` vs `button.btn-close`
- ❌ Footer com classes diferentes
- ⚠️ **IMPACTO**: Visual inconsistente

### 7. **Nomenclatura de Arquivos**
- ❌ `pessoa-fisica.html` vs `cadastro-pessoa-fisica.html`
- ❌ `form-validator.js` vs `form-validation-enhanced.js`
- ⚠️ **IMPACTO**: Arquivos duplicados

## ✅ PADRONIZAÇÕES NECESSÁRIAS

### 1. **Botões Padrão PLI**
```html
<!-- PRIMÁRIO -->
<button type="submit" class="btn btn-primary btn-lg px-4">
    <i class="fas fa-save me-2"></i>Salvar
</button>

<!-- SECUNDÁRIO -->
<button type="button" class="btn btn-secondary btn-lg px-4">
    <i class="fas fa-times me-2"></i>Cancelar
</button>

<!-- PERIGO -->
<button type="button" class="btn btn-danger btn-lg px-4">
    <i class="fas fa-trash me-2"></i>Excluir
</button>
```

### 2. **Nomenclatura de IDs (camelCase)**
```html
<!-- PADRÃO ADOTADO: camelCase -->
<input id="nomeCompleto" name="nome_completo">
<input id="emailPrincipal" name="email_principal">
<input id="telefonePrincipal" name="telefone_principal">
<input id="dataFundacao" name="data_fundacao">
```

### 3. **Estrutura de Modal Padrão**
```html
<div class="modal fade" id="modalName" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content pli-card">
            <div class="modal-header border-bottom border-pli-primary">
                <h5 class="modal-title text-pli-dark">
                    <i class="fas fa-icon me-2"></i>Título
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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

### 4. **Validação Padrão**
```html
<input type="text" 
       class="form-control" 
       id="campo" 
       name="campo" 
       required 
       data-validation="required"
       minlength="3"
       maxlength="100">
<div class="invalid-feedback">Mensagem de erro específica</div>
```

### 5. **Máscaras Padronizadas**
```javascript
// DOCUMENTOS
$('#cpf').mask('000.000.000-00');
$('#cnpj').mask('00.000.000/0000-00');
$('#rg').mask('00.000.000-0');

// CONTATOS
$('#telefone').mask('(00) 00000-0000');
$('#cep').mask('00000-000');

// FINANCEIRO
$('#valor').mask('#.##0,00', {reverse: true});
```

### 6. **Classes CSS PLI**
```css
/* Usar sempre classes PLI quando disponíveis */
.pli-button-primary    /* ao invés de btn btn-primary */
.pli-card-primary      /* ao invés de card */
.pli-input            /* ao invés de form-control */
.pli-modal            /* ao invés de modal */
```

## 🔧 AÇÕES CORRETIVAS PRIORITÁRIAS

### **PRIORIDADE ALTA**
1. ✅ Padronizar todos os botões (tamanhos e classes)
2. ✅ Corrigir IDs inconsistentes nos formulários
3. ✅ Unificar estrutura de validação
4. ✅ Aplicar máscaras padronizadas

### **PRIORIDADE MÉDIA**
5. ✅ Padronizar estrutura de modais
6. ✅ Unificar classes CSS personalizadas
7. ✅ Corrigir nomenclatura de arquivos

### **PRIORIDADE BAIXA**
8. ✅ Documentar padrões adotados
9. ✅ Criar guia de estilo
10. ✅ Implementar linting

## 📊 IMPACTO ESPERADO

- **UX**: Interface mais consistente e profissional
- **DEV**: Código mais fácil de manter
- **QA**: Menos bugs por inconsistências
- **PERF**: CSS mais otimizado

## 🎯 PRÓXIMOS PASSOS

1. Implementar correções por prioridade
2. Testar todas as funcionalidades
3. Atualizar documentação
4. Criar checklist de padrões
