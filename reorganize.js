// Script para reorganizar a estrutura de diretórios do projeto PLI Cadastros
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();

// Criar nova estrutura de diretórios
const newDirs = [
  'src/controllers',
  'src/models',
  'views',
  'scripts/utils'
];

console.log('Criando nova estrutura de diretórios...');
newDirs.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Diretório criado: ${dir}`);
  }
});

// Mover arquivos do frontend para a nova estrutura
console.log('\nMovendo arquivos do frontend...');
if (fs.existsSync(path.join(rootDir, 'frontend', 'views'))) {
  // Mover arquivos HTML para views/
  const viewsFiles = fs.readdirSync(path.join(rootDir, 'frontend', 'views'));
  viewsFiles.forEach(file => {
    if (file !== 'components') {
      fs.copyFileSync(
        path.join(rootDir, 'frontend', 'views', file),
        path.join(rootDir, 'views', file)
      );
      console.log(`Arquivo movido: frontend/views/${file} -> views/${file}`);
    }
  });

  // Mover pasta components
  if (fs.existsSync(path.join(rootDir, 'frontend', 'views', 'components'))) {
    fs.mkdirSync(path.join(rootDir, 'views', 'components'), { recursive: true });
    const componentsFiles = fs.readdirSync(path.join(rootDir, 'frontend', 'views', 'components'));
    componentsFiles.forEach(file => {
      fs.copyFileSync(
        path.join(rootDir, 'frontend', 'views', 'components', file),
        path.join(rootDir, 'views', 'components', file)
      );
      console.log(`Arquivo movido: frontend/views/components/${file} -> views/components/${file}`);
    });
  }
}

// Consolidar arquivos CSS
console.log('\nConsolidando arquivos CSS...');
const cssFiles = [
  path.join(rootDir, 'frontend', 'assets', 'css', 'sistema_aplicacao_cores_pli.css'),
  path.join(rootDir, 'frontend', 'css', 'sistema_aplicacao_cores_pli.css'),
  path.join(rootDir, 'public', 'css', 'sistema_aplicacao_cores_pli.css')
];

// Verificar qual arquivo CSS existe e copiar para public/css/
for (const cssFile of cssFiles) {
  if (fs.existsSync(cssFile)) {
    if (!fs.existsSync(path.join(rootDir, 'public', 'css'))) {
      fs.mkdirSync(path.join(rootDir, 'public', 'css'), { recursive: true });
    }
    fs.copyFileSync(
      cssFile,
      path.join(rootDir, 'public', 'css', 'sistema_aplicacao_cores_pli.css')
    );
    console.log(`Arquivo CSS consolidado em: public/css/sistema_aplicacao_cores_pli.css`);
    break;
  }
}

// Mover arquivos do backend para src/
console.log('\nMovendo arquivos do backend...');
const backendDirs = ['config', 'middleware', 'routes', 'services'];
backendDirs.forEach(dir => {
  if (fs.existsSync(path.join(rootDir, 'src', dir))) {
    console.log(`Diretório já existe: src/${dir}`);
  } else if (fs.existsSync(path.join(rootDir, 'backend', 'src', dir))) {
    fs.mkdirSync(path.join(rootDir, 'src', dir), { recursive: true });
    const files = fs.readdirSync(path.join(rootDir, 'backend', 'src', dir));
    files.forEach(file => {
      fs.copyFileSync(
        path.join(rootDir, 'backend', 'src', dir, file),
        path.join(rootDir, 'src', dir, file)
      );
      console.log(`Arquivo movido: backend/src/${dir}/${file} -> src/${dir}/${file}`);
    });
  }
});

// Mover scripts para pasta scripts
console.log('\nMovendo scripts utilitários...');
const utilScripts = [
  'fix-pessoa-fisica-form.js',
  'fix-pessoa-juridica-form.js',
  'fix-usuarios-form.js',
  'form-table-validator.js',
  'listTables.js'
];

utilScripts.forEach(script => {
  if (fs.existsSync(path.join(rootDir, script))) {
    fs.copyFileSync(
      path.join(rootDir, script),
      path.join(rootDir, 'scripts', 'utils', script)
    );
    console.log(`Script movido: ${script} -> scripts/utils/${script}`);
  }
});

// Renomear script Python
if (fs.existsSync(path.join(rootDir, 'start_pli.py.py'))) {
  fs.copyFileSync(
    path.join(rootDir, 'start_pli.py.py'),
    path.join(rootDir, 'scripts', 'start_pli.py')
  );
  console.log('Script renomeado: start_pli.py.py -> scripts/start_pli.py');
}

console.log('\nReorganização concluída!');
console.log('\nATENÇÃO: Este script apenas copiou os arquivos para a nova estrutura.');
console.log('Após verificar que tudo está funcionando corretamente, você pode remover os diretórios e arquivos duplicados.');