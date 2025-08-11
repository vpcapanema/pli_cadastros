// Arquivo: fix-pessoa-fisica-form.js

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Carregar o arquivo HTML
const htmlPath = path.join(__dirname, 'frontend/views/pessoa-fisica.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// 1. Corrigir nomes de campos para corresponder à tabela
// Mapeamento de nomes atuais para nomes da tabela
const fieldMappings = {
  nome_completo: 'nome_completo',
  cpf: 'cpf',
  // Adicione outros mapeamentos conforme necessário
};

// Aplicar mapeamentos
Object.entries(fieldMappings).forEach(([formField, dbField]) => {
  $(`[name="${formField}"]`).attr('name', dbField);
});

// 2. Marcar campos obrigatórios
const requiredFields = ['nome_completo', 'cpf'];
requiredFields.forEach((field) => {
  $(`[name="${field}"]`).attr('required', '');
});

// 3. Adicionar campos faltantes
// Exemplo: Se o campo 'naturalidade' estiver faltando, adicione-o
if ($('[name="naturalidade"]').length === 0) {
  // Encontrar um local apropriado para adicionar o campo (após nacionalidade)
  const nacionalidadeField = $('[name="nacionalidade"]').closest('.col-md-6');

  if (nacionalidadeField.length) {
    nacionalidadeField.after(`
      <div class="col-md-6">
        <label for="naturalidade" class="form-label">Naturalidade</label>
        <input type="text" class="form-control" id="naturalidade" name="naturalidade">
      </div>
    `);
  }
}

// Salvar as alterações
fs.writeFileSync(htmlPath, $.html());
console.log('Formulário de Pessoa Física atualizado com sucesso!');
