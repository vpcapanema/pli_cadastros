// form-table-validator.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const cheerio = require('cheerio');
require('dotenv').config();

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'pli-db.c6j00cu4izbw.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'semil2025*',
});

// Função para obter a estrutura da tabela do banco de dados
async function getTableStructure(schema, table) {
  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = $1 AND table_name = $2
    ORDER BY ordinal_position;
  `;

  const result = await pool.query(query, [schema, table]);
  return result.rows;
}

// Função para extrair campos do formulário HTML
function getFormFields(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const fields = [];
  $('input, select, textarea').each((i, el) => {
    const name = $(el).attr('name');
    if (name) {
      fields.push({
        name,
        type: $(el).attr('type') || $(el).prop('tagName').toLowerCase(),
        required: $(el).attr('required') !== undefined,
      });
    }
  });

  return fields;
}

// Função para comparar tabela e formulário
function compareTableAndForm(tableFields, formFields) {
  const tableFieldNames = tableFields.map((f) => f.column_name);
  const formFieldNames = formFields.map((f) => f.name);

  // Campos que existem na tabela mas não no formulário
  const missingInForm = tableFieldNames.filter(
    (field) =>
      !formFieldNames.includes(field) &&
      ![
        'id',
        'created_at',
        'updated_at',
        'data_criacao',
        'data_atualizacao',
        'data_exclusao',
      ].includes(field)
  );

  // Campos que existem no formulário mas não na tabela
  const missingInTable = formFieldNames.filter((field) => !tableFieldNames.includes(field));

  // Campos obrigatórios na tabela que não são obrigatórios no formulário
  const requiredMismatch = tableFields
    .filter((tf) => tf.is_nullable === 'NO')
    .filter((tf) => {
      const formField = formFields.find((ff) => ff.name === tf.column_name);
      return formField && !formField.required;
    })
    .map((tf) => tf.column_name);

  return {
    missingInForm,
    missingInTable,
    requiredMismatch,
  };
}

// Função principal
async function validateForms() {
  try {
    // Configuração das tabelas e formulários para validar
    const validations = [
      {
        schema: 'cadastro',
        table: 'pessoa_fisica',
        formPath: path.join(__dirname, 'frontend/views/pessoa-fisica.html'),
      },
      {
        schema: 'cadastro',
        table: 'pessoa_juridica',
        formPath: path.join(__dirname, 'frontend/views/pessoa-juridica.html'),
      },
      {
        schema: 'usuarios',
        table: 'usuario_sistema',
        formPath: path.join(__dirname, 'frontend/views/usuarios.html'),
      },
    ];

    for (const validation of validations) {
      console.log(`\n=== Validando ${validation.schema}.${validation.table} ===`);

      // Obter estrutura da tabela
      const tableFields = await getTableStructure(validation.schema, validation.table);
      console.log(`Tabela: ${tableFields.length} campos encontrados`);

      // Obter campos do formulário
      const formFields = getFormFields(validation.formPath);
      console.log(`Formulário: ${formFields.length} campos encontrados`);

      // Comparar
      const comparison = compareTableAndForm(tableFields, formFields);

      // Exibir resultados
      if (comparison.missingInForm.length > 0) {
        console.log('\nCampos da tabela ausentes no formulário:');
        comparison.missingInForm.forEach((field) => console.log(`- ${field}`));
      }

      if (comparison.missingInTable.length > 0) {
        console.log('\nCampos do formulário ausentes na tabela:');
        comparison.missingInTable.forEach((field) => console.log(`- ${field}`));
      }

      if (comparison.requiredMismatch.length > 0) {
        console.log('\nCampos obrigatórios na tabela mas não no formulário:');
        comparison.requiredMismatch.forEach((field) => console.log(`- ${field}`));
      }

      if (
        comparison.missingInForm.length === 0 &&
        comparison.missingInTable.length === 0 &&
        comparison.requiredMismatch.length === 0
      ) {
        console.log('\n✅ Formulário e tabela estão alinhados!');
      }
    }
  } catch (error) {
    console.error('Erro ao validar formulários:', error);
  } finally {
    await pool.end();
  }
}

// Executar validação
validateForms();
