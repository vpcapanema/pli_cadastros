const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.join(__dirname, '..', 'static', 'css');
// Entradas fixas (core e legado)
const outputs = [
  { entry: 'core.css', out: 'core.min.css' },
  // legados removidos
];

// Descobrir dinamicamente cada bundle de página (static/css/pages/*.css)
const pagesDir = path.join(baseDir, 'pages');
if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir).filter(f => {
    if (!f.endsWith('.css')) return false;
    // Ignorar qualquer arquivo que contenha .min. (hashes ou cadeias duplicadas)
    if (f.includes('.min.')) return false;
    // Ignorar arquivos já gerados minificados (nome termina exatamente em .min.css)
    if (f.endsWith('.min.css')) return false;
    return true;
  });
  for (const f of pageFiles) {
    outputs.push({ entry: 'pages/' + f, out: 'pages/' + f.replace(/\.css$/, '.min.css') });
  }
}

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

const manifest = {};

function writeBundle(cfg) {
  const entryPath = path.join(baseDir, cfg.entry);
  const raw = fs.readFileSync(entryPath, 'utf8');
  const inlined = inlineImports(raw);
  const min = minify(inlined);
  // Agora geramos SOMENTE arquivo com hash (sem fallback não-hash)
  const hash = crypto.createHash('md5').update(min).digest('hex').slice(0, 10);
  const hashedName = cfg.out.replace(/\.css$/, `.${hash}.css`);
  const hashedPath = path.join(baseDir, hashedName);
  fs.writeFileSync(hashedPath, min, 'utf8');
  // Limpar versões antigas do mesmo prefixo (root)
  const prefix = cfg.out.replace(/\.css$/, '.'); // ex: core.min.
  if (!hashedName.startsWith('pages/')) {
    for (const f of fs.readdirSync(baseDir)) {
      if (f.startsWith(prefix) && f.endsWith('.css') && f !== hashedName) {
        try { fs.unlinkSync(path.join(baseDir, f)); } catch {}
      }
    }
  } else {
    // Limpeza específica para páginas dentro de /pages
    const pageBase = path.basename(cfg.out, '.min.css'); // login
    const pagePrefix = pageBase + '.min.'; // login.min.
    const pageDirFull = path.join(baseDir, 'pages');
    for (const f of fs.readdirSync(pageDirFull)) {
      if (!f.endsWith('.css')) continue;
      if (!f.startsWith(pageBase + '.min.')) continue;
      // Apagar qualquer versão diferente da recém-gerada
      if ('pages/' + f !== hashedName) {
        try { fs.unlinkSync(path.join(pageDirFull, f)); } catch {}
      }
      // Apagar cadeias repetidas (ex: login.min.xxx.min.xxx.css)
      if ((f.match(/\.min\./g) || []).length > 1) {
        try { fs.unlinkSync(path.join(pageDirFull, f)); } catch {}
      }
    }
  }
  manifest[cfg.out] = { hashed: hashedName, hash };
  console.log('[build-css-multi] Gerado', hashedName, 'tamanho:', (min.length/1024).toFixed(2)+'KB');
}

for (const cfg of outputs) {
  try { writeBundle(cfg); } catch (e) { console.error('[build-css-multi] Erro processando', cfg.entry, e.message); }
}

// Bundles de páginas (estão em outputs também)

// Salvar manifest
try { fs.writeFileSync(path.join(baseDir, 'css-manifest.json'), JSON.stringify(manifest, null, 2)); }
catch (e) { console.error('[build-css-multi] Falha ao salvar manifest:', e.message); }
