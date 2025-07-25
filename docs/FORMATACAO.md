# 📝 Regras de Formatação de Dados

Este documento descreve as regras de formatação aplicadas aos dados antes de serem inseridos no banco de dados do SIGMA-PLI | Módulo de Gerenciamento de Cadastros.

## 🎯 Objetivo

Garantir consistência e padronização dos dados armazenados no banco de dados, facilitando buscas, relatórios e integrações com outros sistemas.

## 📋 Regras Gerais

| Tipo de Campo | Regra de Formatação | Exemplo |
|---------------|---------------------|---------|
| Nome Completo | Título (primeira letra de cada palavra maiúscula) | "João da Silva" |
| Razão Social | CAIXA ALTA | "EMPRESA EXEMPLO LTDA" |
| Nome Fantasia | Título | "Empresa Exemplo" |
| CPF | Apenas números | "12345678901" |
| CNPJ | Apenas números | "12345678000199" |
| RG | CAIXA ALTA | "1234567 SSP/SP" |
| Email | Caixa baixa | "usuario@exemplo.com" |
| Telefone/Celular | Apenas números | "11987654321" |
| CEP | Apenas números | "01234567" |
| Endereço | Título | "Rua Exemplo" |
| Bairro | Título | "Centro" |
| Cidade | Título | "São Paulo" |
| Estado (UF) | CAIXA ALTA | "SP" |
| Nacionalidade | Capitalizado | "Brasileira" |
| Estado Civil | Capitalizado | "Casado" |
| Profissão | Capitalizado | "Engenheiro" |
| Username | Caixa baixa | "usuario123" |
| Tipo de Usuário | CAIXA ALTA | "ADMINISTRADOR" |
| Instituição | CAIXA ALTA | "PREFEITURA MUNICIPAL" |

## 🧩 Implementação

A formatação é aplicada através do módulo `formatUtils.js` localizado em `src/utils/`. Este módulo fornece funções para padronizar os dados antes da inserção no banco de dados.

### Funções Disponíveis

- `toUpperCase(text)`: Converte texto para CAIXA ALTA
- `toLowerCase(text)`: Converte texto para caixa baixa
- `capitalize(text)`: Capitaliza a primeira letra do texto
- `toTitleCase(text)`: Converte para formato de título (primeira letra de cada palavra maiúscula)
- `removeAccents(text)`: Remove acentos de um texto
- `formatCPF(cpf)`: Formata CPF (remove caracteres não numéricos)
- `formatCNPJ(cnpj)`: Formata CNPJ (remove caracteres não numéricos)
- `formatPhone(phone)`: Formata telefone (remove caracteres não numéricos)
- `formatCEP(cep)`: Formata CEP (remove caracteres não numéricos)
- `formatEmail(email)`: Formata email (converte para caixa baixa)
- `formatData(data, formatRules)`: Aplica regras de formatação a um objeto de dados

### Exemplo de Uso

```javascript
const { formatData, toUpperCase, toTitleCase, formatCPF } = require('../utils/formatUtils');

// Definir regras de formatação
const regrasFormatacao = {
  nome_completo: toTitleCase,
  cpf: formatCPF,
  cidade: toTitleCase,
  estado: toUpperCase
};

// Aplicar formatação aos dados
const dadosFormatados = formatData(dadosOriginais, regrasFormatacao);
```

## 🔄 Fluxo de Processamento

1. O cliente envia dados através da API
2. O controlador recebe os dados e valida
3. Após validação, o controlador aplica as regras de formatação
4. Os dados formatados são então enviados para o modelo para persistência no banco de dados

## ⚠️ Considerações Importantes

- A formatação é aplicada apenas no backend, antes da inserção no banco de dados
- Os dados são exibidos ao usuário conforme foram formatados
- Buscas no banco de dados devem considerar a formatação aplicada
- Ao atualizar registros, a formatação é reaplicada para manter a consistência

---

**Desenvolvido com ❤️ para o SIGMA-PLI | Módulo de Gerenciamento de Cadastros**