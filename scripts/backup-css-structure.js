#!/usr/bin/env node
// Backup recursive da pasta static/css e documentos de tokens.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname + '/../';
const SRC_CSS = path.join(ROOT,'static','css');
const DOCS = path.join(ROOT,'docs');
const OUT_DIR = path.join(ROOT,'backups');
if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
const stamp = new Date().toISOString().replace(/[-:T]/g,'').replace(/\..+/, '');
const DEST = path.join(OUT_DIR, 'css-backup-'+stamp);
function copyDir(src,dst){
  if(!fs.existsSync(dst)) fs.mkdirSync(dst,{recursive:true});
  fs.readdirSync(src,{withFileTypes:true}).forEach(e=>{
    const s=path.join(src,e.name); const d=path.join(dst,e.name);
    if(e.isDirectory()) copyDir(s,d); else fs.copyFileSync(s,d);
  });
}
copyDir(SRC_CSS, path.join(DEST,'static','css'));
// copiar arquivos de tokens
['tokens-inventory.json','tokens-duplicatas.json','tokens-metricas.json','tokens-merge-candidatos.json','Fase2-Tokens-TABELA.md'].forEach(f=>{
  const sf = path.join(DOCS,f); if(fs.existsSync(sf)){
    const dd = path.join(DEST,'docs'); if(!fs.existsSync(dd)) fs.mkdirSync(dd,{recursive:true});
    fs.copyFileSync(sf, path.join(dd,f));
  }
});
console.log('Backup criado em', DEST);
