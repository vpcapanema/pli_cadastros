const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'static', 'css');
const pagesDir = path.join(base, 'pages');

function removeIfExists(p) {
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('[css:clean] Removido', path.relative(base, p));
  }
}

['core.min.css', 'main.css', 'main.min.css', 'pages.css', 'pages.min.css'].forEach((f) =>
  removeIfExists(path.join(base, f))
);

if (fs.existsSync(pagesDir)) {
  for (const f of fs.readdirSync(pagesDir)) {
    if (/\.min\.css$/.test(f) && !/\.min\.[a-f0-9]{10}\.css$/.test(f)) {
      removeIfExists(path.join(pagesDir, f));
    }
  }
}

console.log('[css:clean] Concluído.');
