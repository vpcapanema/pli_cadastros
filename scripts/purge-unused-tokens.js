#!/usr/bin/env node
/**
 * purge-unused-tokens.js
 * Analisa tokens definidos (tokens.css e _root.css) e conta usos "var(--token)" no restante do CSS.
 * Gera docs/purge-unused-tokens-report.json com estatísticas e lista de tokens sem uso.
 * Exit code 3 se houver tokens SEM USO (para alerta, não necessariamente bloquear build).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname,'..');
const CSS_DIR = path.join(ROOT,'static','css');
const DOCS = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});

const SOURCE_FILES = [
  path.join(CSS_DIR,'00-configuracoes','tokens.css'),
  path.join(CSS_DIR,'00-settings','_root.css')
].filter(fs.existsSync);

// Captura definições --pli-xxx: valor;
const defRegex = /(--)pli-[a-z0-9-]+\s*:/ig; // inclusive prefixo completo
const useRegex = /var\((--pli-[a-z0-9-]+)\)/ig;

function collectTokens(files){
  const set = new Set();
  for(const f of files){
    const txt = fs.readFileSync(f,'utf8');
    let m; while((m = defRegex.exec(txt))){ set.add(m[0].replace(/\s*:/,'')); }
  }
  return [...set];
}

const tokens = collectTokens(SOURCE_FILES);
// Map token -> {definitions:[files], usageCount}
const meta = {};
for(const t of tokens){ meta[t] = {definitions:[], usageCount:0}; }
for(const f of SOURCE_FILES){
  const txt = fs.readFileSync(f,'utf8');
  for(const t of tokens){ if(new RegExp(t+'\s*:').test(txt)) meta[t].definitions.push(path.relative(ROOT,f)); }
}

// Varre todos CSS para usos var(--token)
function walk(dir, list=[]) { for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,e.name); if(e.isDirectory()) walk(full,list); else if(e.name.endsWith('.css')) list.push(full); } return list; }
const allCss = walk(CSS_DIR);
for(const file of allCss){
  const txt = fs.readFileSync(file,'utf8');
  let m; while((m = useRegex.exec(txt))){ const token = m[1]; if(meta[token]) meta[token].usageCount++; }
}

const unused = Object.entries(meta).filter(([_,info])=> info.usageCount===0).map(([name])=> name);
const report = {
  generatedAt: new Date().toISOString(),
  totalTokens: tokens.length,
  unusedCount: unused.length,
  unused,
  tokens: Object.entries(meta).map(([name,info])=> ({name,definitions:info.definitions,usageCount:info.usageCount}))
};
fs.writeFileSync(path.join(DOCS,'purge-unused-tokens-report.json'), JSON.stringify(report,null,2),'utf8');
console.log('[purge-unused] Relatório gerado. Tokens:', tokens.length, 'Unused:', unused.length);
if(unused.length>0) process.exitCode = 3;
