/**
 * Valida que os HTML em /views não usam mais caminhos hashed diretos
 * (/static/css/core.min.<hash>.css ou pages/*.min.<hash>.css) agora que existe
 * resolução dinâmica via server (cssPath + manifest). Se encontrar, sai com código 1.
 */
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..');
const views = path.join(base, 'views');
const pattern = /\/static\/css\/(?:core\.min\.[0-9a-f]{8,}\.css|pages\/[a-z0-9-]+\.min\.[0-9a-f]{8,}\.css)/gi;
let violations = [];

function scan(file){
  const html = fs.readFileSync(file,'utf8');
  let m; while((m = pattern.exec(html))){ violations.push({file, match:m[0]}); }
}
function walk(dir){
  for(const entry of fs.readdirSync(dir)){
    const full = path.join(dir, entry);
    const st = fs.statSync(full);
    if(st.isDirectory()) walk(full); else if(/\.html$/i.test(entry)) scan(full);
  }
}
walk(views);
if(violations.length){
  console.error('[validate-css-links] Referências hashed diretas encontradas:');
  for(const v of violations){
    console.error('-', path.relative(base, v.file), '→', v.match);
  }
  console.error('\nSubstitua por versão lógica (ex: /static/css/core.min.css ou /static/css/pages/<page>.min.css).');
  process.exit(1);
} else {
  console.log('[validate-css-links] OK - Nenhuma referência hashed direta restante.');
}
