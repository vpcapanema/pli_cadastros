/**
 * Purga arquivos e diretórios CSS não utilizados em runtime.
 * Mantém apenas:
 *  - css-manifest.json
 *  - core.min.<hash>.css referenciado
 *  - pages/*.min.<hash>.css referenciados nos HTML em /views
 * Remove:
 *  - Diretórios de origem (00-settings ... 07-utilities)
 *  - Arquivos .css não-hash (core.css, pages/*.css sem hash)
 *  - Arquivos de documentação (.md) e scripts auxiliares dentro de static/css
 */
const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', 'static', 'css');
const viewsDir = path.join(__dirname, '..', 'views');

function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...collectHtmlFiles(full));
    else if (/\.html$/i.test(entry)) out.push(full);
  }
  return out;
}

function extractCssRefs(html) {
  const refs = new Set();
  const regex = /href=["']\/static\/css\/([^"']+\.css)["']/g;
  let m;
  let count = 0;
  while ((m = regex.exec(html))) {
    refs.add(m[1]);
    count++;
  }
  return refs;
}

function main() {
  if (!fs.existsSync(cssDir)) {
    console.error('CSS dir não encontrado:', cssDir);
    return;
  }
  const keep = new Set(['css-manifest.json']);
  // Coletar referências de todos HTML
  const htmlFiles = collectHtmlFiles(viewsDir);
  htmlFiles.forEach((f) => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      extractCssRefs(content).forEach((r) => keep.add(r));
    } catch {}
  });

  // Log inicial
  console.log('Mantendo arquivos referenciados:', Array.from(keep));

  // Listar todos arquivos diretos
  function purgeDir(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = path.relative(cssDir, full).replace(/\\/g, '/');
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        // Se não for diretório "pages", remover inteiro (será reconstruído se necessário)
        if (rel === 'pages') {
          purgeDir(full);
          // Depois veremos se sobrou algo além dos mantidos
          if (fs.readdirSync(full).length === 0) {
            fs.rmdirSync(full);
            console.log('Removido diretório vazio pages');
          }
        } else {
          // Diretórios de layers (00-settings etc.) serão removidos recursivamente
          purgeDir(full);
          try {
            fs.rmdirSync(full);
            console.log('Removido diretório', rel);
          } catch {}
        }
      } else {
        if (keep.has(rel)) continue; // Mantém referenciados
        // Remover tudo que não está em keep
        try {
          fs.unlinkSync(full);
          console.log('Removido', rel);
        } catch (e) {
          console.warn('Falha ao remover', rel, e.message);
        }
      }
    }
  }

  purgeDir(cssDir);
  console.log('\nPurga concluída. Conteúdo final:');
  function tree(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      console.log(prefix + entry + (stat.isDirectory() ? '/' : ''));
      if (stat.isDirectory()) tree(full, prefix + '  ');
    }
  }
  tree(cssDir);
}

main();
