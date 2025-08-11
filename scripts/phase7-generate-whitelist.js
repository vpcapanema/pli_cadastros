#!/usr/bin/env node
// Fase 7: Gerar whitelist de variáveis CSS editáveis (exclui @deprecated)
// Saída: docs/variables-whitelist.json

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const TOKENS_FILES = [
  path.join(ROOT,'static','css','00-configuracoes','tokens.css'),
  path.join(ROOT,'static','css','00-settings','_root.css')
];
const DOCS = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});

const whitelist = new Set();
const deprecated = new Set();
const varDefRe = /(\/\*[^*]*\*+([^/*][^*]*\*+)*\/)?\s*(--pli-[a-z0-9-]+)\s*:\s*([^;]+);/gi;

TOKENS_FILES.forEach(f=>{
  if(!fs.existsSync(f)) return;
  const txt = fs.readFileSync(f,'utf8');
  let m;
  while((m = varDefRe.exec(txt))){
    const full = m[0];
    const name = m[3];
    if(/@deprecated/i.test(full)){ deprecated.add(name); continue; }
    whitelist.add(name);
  }
});

const out = { generatedAt: new Date().toISOString(), count: whitelist.size, deprecated: [...deprecated].sort(), variables: [...whitelist].sort() };
fs.writeFileSync(path.join(DOCS,'variables-whitelist.json'), JSON.stringify(out,null,2),'utf8');
console.log('[fase7] Whitelist gerada:', out.count, 'variáveis. Deprecated:', deprecated.size);
