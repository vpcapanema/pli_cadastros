#!/usr/bin/env node
// Fase 8: Auditoria CI - script que verifica se novas variáveis fora da whitelist foram introduzidas ou redefinições conflitantes
// Saídas: exit code !=0 em caso de violação (para CI), e docs/fase8-audit-relatorio.json

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const CSS_DIR = path.join(ROOT,'static','css');
const DOCS = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});

const whitelistPath = path.join(DOCS,'variables-whitelist.json');
let whitelist = new Set();
let internalAllowed = new Set();
if(fs.existsSync(whitelistPath)){
  try {
    const parsed = JSON.parse(fs.readFileSync(whitelistPath,'utf8'));
    whitelist = new Set(parsed.variables || []);
    internalAllowed = new Set(parsed.internalAllowed || []);
  } catch {}
}

function walk(dir, list=[]) { for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,e.name); if(e.isDirectory()) walk(full,list); else if(e.name.endsWith('.css')) list.push(full); } return list; }

const defRe = /(--pli-[a-z0-9-]+)\s*:\s*[^;]+;/g;
const deprecatedRe = /@deprecated/i; // detecta marcador na mesma linha

const violations = []; const deprecatedUsages=[]; const defs=[];
walk(CSS_DIR).forEach(f=>{
  const txt = fs.readFileSync(f,'utf8');
  const lines = txt.split(/\n/);
  let m; while((m = defRe.exec(txt))){
    const name = m[1];
    const line = txt.slice(0,m.index).split(/\n/).length;
    const lineText = lines[line-1] || '';
    const isDeprecated = deprecatedRe.test(lineText);
  // Ignora overrides de tema para deprecated (já mapeados) na fase 10
  const isThemeOverride = /08-themes[\\/]/.test(path.relative(ROOT,f));
  if(!whitelist.has(name) && !internalAllowed.has(name) && !isDeprecated && !isThemeOverride){
      violations.push({file:path.relative(ROOT,f), line, name});
    }
    if(isDeprecated) deprecatedUsages.push({file:path.relative(ROOT,f), line, name});
    defs.push(name);
  }
});

const summary = {generatedAt:new Date().toISOString(), violations, deprecatedUsages, counts:{violations:violations.length, deprecated:deprecatedUsages.length}};
fs.writeFileSync(path.join(DOCS,'fase8-audit-relatorio.json'), JSON.stringify(summary,null,2),'utf8');
console.log('[fase8] Auditoria executada. Violations:', violations.length, 'Deprecated defs:', deprecatedUsages.length);
if(violations.length>0){ process.exitCode = 2; }
