/**
 * Audit de cobertura de CSS: lista classes usadas em cada página HTML
 * que não possuem definição em nenhum CSS carregado (core + page bundle).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const viewsDir = path.join(root, 'views');
const cssDir = path.join(root, 'static', 'css');

function listHtmlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...listHtmlFiles(full));
    else if (e.endsWith('.html')) out.push(full);
  }
  return out;
}

function extractClassesFromHtml(html) {
  const set = new Set();
  // class="a b c"
  const regex = /class=["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(html))) {
    m[1].split(/\s+/).forEach((c) => {
      if (c && !c.startsWith('fa-') && !c.startsWith('bi-')) set.add(c.trim());
    });
  }
  return set;
}

function extractDefinedClasses(css) {
  const set = new Set();
  // simplistic: .className{ or .className, or .className: pseudo
  const regex = /\.([a-zA-Z0-9_-]+)[\s:{,]/g;
  let m;
  while ((m = regex.exec(css))) {
    set.add(m[1]);
  }
  return set;
}

function loadCssFiles() {
  const cssFiles = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir)) {
      const full = path.join(dir, e);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (e.endsWith('.css')) cssFiles.push(full);
    }
  }
  walk(cssDir);
  const map = {};
  cssFiles.forEach((f) => {
    map[f] = fs.readFileSync(f, 'utf8');
  });
  return map;
}

function main() {
  if (!fs.existsSync(viewsDir)) {
    console.error('Views dir não encontrado');
    process.exit(1);
  }
  const cssContents = loadCssFiles();
  const allCssCombined = Object.values(cssContents).join('\n');
  const defined = extractDefinedClasses(allCssCombined);

  const htmlFiles = listHtmlFiles(viewsDir);
  const report = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const used = extractClassesFromHtml(html);
    const missing = [];
    used.forEach((c) => {
      if (!defined.has(c)) missing.push(c);
    });
    if (missing.length) {
      report.push({ file: path.relative(root, file), missing: missing.sort() });
    }
  }

  // Agrupar contagem de ocorrências de classes faltantes
  const freq = {};
  report.forEach((r) => r.missing.forEach((c) => (freq[c] = (freq[c] || 0) + 1)));

  console.log('=== CLASSES SEM DEFINIÇÃO (por arquivo) ===');
  report.forEach((r) => {
    console.log('\n[' + r.file + ']');
    console.log(r.missing.join(' '));
  });
  console.log('\n=== TOP CLASSES NÃO DEFINIDAS ===');
  Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .forEach(([c, n]) => console.log(c, '=>', n));

  const outputPath = path.join(root, 'static', 'css', 'RELATORIO-AUDITORIA-CLASSES.txt');
  const serialized = report.map((r) => `[${r.file}]\n${r.missing.join(' ')}\n`).join('\n');
  fs.writeFileSync(outputPath, serialized, 'utf8');
  console.log('\nRelatório salvo em', outputPath);
}

main();
