const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'static', 'css');
const outputs = [
  { entry: 'core.css', out: 'core.min.css' },
  { entry: 'pages.css', out: 'pages.min.css' },
  { entry: 'main.css', out: 'main.min.css' } // manter legado enquanto migração
];

function inlineImports(content, visited = new Set()) {
  return content.replace(/@import\s+['\"]([^'\"\n]+)['\"];?/g, (m, rel) => {
    const target = path.join(baseDir, rel);
    if (!fs.existsSync(target)) {
      console.warn('[build-css-multi] Import não encontrado:', rel);
      return '';
    }
    if (visited.has(target)) return '';
    visited.add(target);
    const imported = fs.readFileSync(target, 'utf8');
    return '\n/* >>> Inlined: ' + rel + ' */\n' + inlineImports(imported, visited);
  });
}

function minify(css) {
  return css
    .replace(/\/\*[^!*][\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([:;{},>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

for (const cfg of outputs) {
  try {
    const entryPath = path.join(baseDir, cfg.entry);
    const raw = fs.readFileSync(entryPath, 'utf8');
    const inlined = inlineImports(raw);
    const min = minify(inlined);
    const outPath = path.join(baseDir, cfg.out);
    fs.writeFileSync(outPath, min, 'utf8');
    console.log('[build-css-multi] Gerado', cfg.out, 'tamanho:', (min.length/1024).toFixed(2)+'KB');
  } catch (e) {
    console.error('[build-css-multi] Erro processando', cfg.entry, e.message);
  }
}
