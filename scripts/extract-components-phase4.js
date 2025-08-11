#!/usr/bin/env node
// Fase 4: Extração de componentes - detectar padrões repetidos simples (cards/btn variants redundantes)
// Estratégia inicial: gerar relatório de possíveis combinações de propriedades repetidas.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const CSS_DIR = path.join(ROOT,'static','css');
const DOCS_DIR = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR,{recursive:true});

function walk(dir, list=[]) {
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full = path.join(dir,e.name);
    if(e.isDirectory()) walk(full,list); else if(e.name.endsWith('.css')) list.push(full);
  }
  return list;
}

// Collect selectors with their block content (simplistic, not full CSS parse)
const selectorMap = {}; // hash -> {selectors:Set, decls:string[]}
function normalizeDecls(block){
  return block
    .split(/;\s*/)
    .map(d=>d.trim())
    .filter(Boolean)
    .filter(d=>!d.startsWith('@'))
    .filter(d=>!/^(--pli-)/.test(d))
    .sort();
}

const files = walk(CSS_DIR).filter(f=>/\\(05-components|06-pages)\\/.test(f));
files.forEach(f=>{
  const txt = fs.readFileSync(f,'utf8');
  // naive match .selector { ... }
  const re = /(\.[a-z0-9-_. ]+?)\s*\{([^{}]+)\}/gi; let m;
  while((m=re.exec(txt))){
    const sel = m[1].trim();
    const body = m[2];
    if(sel.includes('@')||sel.includes(':root')||sel.includes('body')) continue;
    const decls = normalizeDecls(body);
    if(decls.length<3) continue; // ignore tiny sets
    const hash = decls.join('|');
    if(!selectorMap[hash]) selectorMap[hash]={selectors:new Set(), decls};
    selectorMap[hash].selectors.add(sel);
  }
});

const candidates = Object.entries(selectorMap)
  .filter(([_,v])=>v.selectors.size>2) // appear in >=3 selectors
  .map(([hash,v])=>({count:v.selectors.size, selectors:[...v.selectors].sort(), decls:v.decls}))
  .sort((a,b)=>b.count-a.count)
  .slice(0,50);

fs.writeFileSync(path.join(DOCS_DIR,'fase4-component-candidatos.json'), JSON.stringify({generatedAt:new Date().toISOString(), candidates},null,2),'utf8');
console.log('[fase4] Relatório de candidatos gerado:', candidates.length);
