const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'static', 'css');
const entry = path.join(baseDir, 'main.css');
const outFile = path.join(baseDir, 'main.min.css');

function inlineImports(content, visited = new Set()) {
  return content.replace(/@import\s+['"]([^'"\n]+)['"];?/g, (m, rel) => {
    const target = path.join(baseDir, rel);
    if (!fs.existsSync(target)) {
      console.warn('[build-css] Import não encontrado:', rel);
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

try {
  const raw = fs.readFileSync(entry, 'utf8');
  const inlined = inlineImports(raw);
  const min = minify(inlined);
  fs.writeFileSync(outFile, min, 'utf8');
  console.log('[build-css] Gerado', outFile, 'tamanho:', (min.length / 1024).toFixed(2) + 'KB');
} catch (e) {
  console.error('[build-css] Erro:', e.message);
  process.exit(1);
}
