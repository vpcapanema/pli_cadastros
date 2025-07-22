// Arquivo: fix-usuarios-form.js

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Carregar o arquivo HTML
const htmlPath = path.join(__dirname, 'frontend/views/usuarios.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// 1. Corrigir nomes de campos para corresponder à tabela
// Mapeamento de nomes atuais para nomes da tabela
const fieldMappings = {
  'username': 'username',
  'password': 'password',
  'email': 'email',
  // Adicione outros mapeamentos conforme necessário
};

// Aplicar mapeamentos
Object.entries(fieldMappings).forEach(([formField, dbField]) => {
  $(`[name="${formField}"]`).attr('name', dbField);
});

// 2. Marcar campos obrigatórios
const requiredFields = ['username', 'password'];
requiredFields.forEach(field => {
  $(`[name="${field}"]`).attr('required', '');
});

// 3. Adicionar campos faltantes
// Exemplo: Se o campo 'tipo_usuario' estiver faltando, adicione-o
if ($('[name="tipo_usuario"]').length === 0) {
  // Encontrar um local apropriado para adicionar o campo
  const emailField = $('[name="email"]').closest('.col-md-6');
  
  if (emailField.length) {
    emailField.after(`
      <div class="col-md-6">
        <label for="tipo_usuario" class="form-label">Tipo de Usuário *</label>
        <select class="form-select" id="tipo_usuario" name="tipo_usuario" required>
          <option value="">Selecione</option>
          <option value="ADMIN">Administrador</option>
          <option value="GESTOR">Gestor</option>
          <option value="ANALISTA">Analista</option>
          <option value="OPERADOR">Operador</option>
          <option value="VISUALIZADOR">Visualizador</option>
        </select>
        <div class="invalid-feedback"></div>
      </div>
    `);
  }
}

// Salvar as alterações
fs.writeFileSync(htmlPath, $.html());
console.log('Formulário de Usuários atualizado com sucesso!');
