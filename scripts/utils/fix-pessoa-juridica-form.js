// Arquivo: fix-pessoa-juridica-form.js

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Carregar o arquivo HTML
const htmlPath = path.join(__dirname, 'frontend/views/pessoa-juridica.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// 1. Corrigir nomes de campos para corresponder à tabela
// Mapeamento de nomes atuais para nomes da tabela
const fieldMappings = {
  razao_social: 'razao_social',
  cnpj: 'cnpj',
  // Adicione outros mapeamentos conforme necessário
};

// Aplicar mapeamentos
Object.entries(fieldMappings).forEach(([formField, dbField]) => {
  $(`[name="${formField}"]`).attr('name', dbField);
});

// 2. Marcar campos obrigatórios
const requiredFields = ['razao_social', 'cnpj'];
requiredFields.forEach((field) => {
  $(`[name="${field}"]`).attr('required', '');
});

// 3. Adicionar campos faltantes
// Exemplo: Se o campo 'situacao_receita' estiver faltando, adicione-o
if ($('[name="situacao_receita"]').length === 0) {
  // Encontrar um local apropriado para adicionar o campo
  const porteEmpresaField = $('[name="porte_empresa"]').closest('.col-md-4');

  if (porteEmpresaField.length) {
    porteEmpresaField.after(`
      <div class="col-md-4">
        <label for="situacao_receita" class="form-label">Situação na Receita</label>
        <select class="form-select" id="situacao_receita" name="situacao_receita">
          <option value="ATIVA" selected>Ativa</option>
          <option value="INATIVA">Inativa</option>
          <option value="SUSPENSA">Suspensa</option>
          <option value="BAIXADA">Baixada</option>
        </select>
      </div>
    `);
  }
}

// Salvar as alterações
fs.writeFileSync(htmlPath, $.html());
console.log('Formulário de Pessoa Jurídica atualizado com sucesso!');
