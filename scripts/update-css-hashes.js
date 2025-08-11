const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..');
const cssDir = path.join(base, 'static', 'css');
const manifestPath = path.join(cssDir, 'css-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('[update-css-hashes] Manifest não encontrado. Rode build-css-multi.js antes.');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const map = Object.fromEntries(
  Object.entries(manifest).map(([k, v]) => [k.replace(/\\/g, '/'), v.hashed])
);

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const original in map) {
    const hashed = map[original];
    const relPath = '/static/css/' + original;
    const hashedPath = '/static/css/' + hashed;
    if (content.includes(relPath)) {
      content = content.split(relPath).join(hashedPath);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('[update-css-hashes] Atualizado', path.relative(base, file));
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (entry.endsWith('.html')) replaceInFile(full);
  }
}

walk(path.join(base, 'views'));
walk(base);
console.log('[update-css-hashes] Concluído.');
