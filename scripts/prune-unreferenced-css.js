const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..');
const cssDir = path.join(base, 'static', 'css');
const pagesDir = path.join(cssDir, 'pages');

function collectHtml() {
  const htmlFiles = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir)) {
      const f = path.join(dir, e);
      const st = fs.statSync(f);
      if (st.isDirectory()) walk(f); else if (e.endsWith('.html')) htmlFiles.push(f);
    }
  }
  walk(path.join(base, 'views'));
  walk(base); // raiz (mapa-de-rotas etc)
  return htmlFiles;
}

function buildReferenceSet(htmlFiles) {
  const set = new Set();
  for (const file of htmlFiles) {
    const c = fs.readFileSync(file, 'utf8');
    // captura /static/css/..." ou ')
    const regex = /\/static\/css\/([A-Za-z0-9_\-\/\.]+\.css)/g;
    let m; while ((m = regex.exec(c))) { set.add(m[1]); }
  }
  return set;
}

function listCssFiles() {
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir)) {
      const f = path.join(dir, e);
      const st = fs.statSync(f);
      if (st.isDirectory()) walk(f); else if (e.endsWith('.css')) files.push(f);
    }
  }
  walk(cssDir);
  return files;
}

function prune() {
  const htmlFiles = collectHtml();
  const referenced = buildReferenceSet(htmlFiles);
  const cssFiles = listCssFiles();
  const removed = [];
  for (const f of cssFiles) {
    const rel = path.relative(cssDir, f).replace(/\\/g,'/');
    if (!referenced.has(rel)) {
      // manter core.min.css e pages/*.min.css originais como fallback? se nenhuma ref existe, pode remover.
      // Critério: se existir versão hashed referenciada, podemos remover a não-hashed.
      if (/\.min\.[a-f0-9]{10}\.css$/.test(path.basename(f))) {
        // hashed não referenciado -> remove
        fs.unlinkSync(f); removed.push(rel); continue;
      }
      // se for não hashed e houver hashed correspondente referenciado, remove
      const baseName = path.basename(f);
      const hashedCandidate = cssFiles.find(other => other.startsWith(path.join(path.dirname(f))) && other.includes(baseName + '.')); // simplista
      if (hashedCandidate) {
        fs.unlinkSync(f); removed.push(rel); continue;
      }
    }
  }
  if (removed.length) {
    console.log('[prune-unreferenced-css] Removidos:', removed.length);
    removed.forEach(r=>console.log(' -', r));
  } else {
    console.log('[prune-unreferenced-css] Nenhum arquivo removido');
  }
}

prune();
