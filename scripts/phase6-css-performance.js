#!/usr/bin/env node
// Fase 6: Performance CSS - análise de tamanhos, minificação simples e extração de critical CSS
// Saídas:
//  - docs/fase6-performance-relatorio.json (tamanhos brutos vs minificados)
//  - docs/critical-login.css, docs/critical-dashboard.css (heurístico)
//  - docs/fase6-critical-manifest.json

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const CSS_ROOT = path.join(ROOT,'static','css');
const DOCS = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});

function walk(dir, list=[]) {
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full = path.join(dir,e.name);
    if(e.isDirectory()) walk(full,list); else if(e.name.endsWith('.css')) list.push(full);
  }
  return list;
}

function minify(css){
  return css
    .replace(/\/\*[\s\S]*?\*\//g,'') // comments
    .replace(/\s+/g,' ') // collapse space
    .replace(/\s*{\s*/g,'{')
    .replace(/\s*}\s*/g,'}')
    .replace(/\s*;\s*/g,';')
    .replace(/;}/g,'}')
    .trim();
}

const files = walk(CSS_ROOT);
const report = [];
let totalRaw=0,totalMin=0;
files.forEach(f=>{
  const raw = fs.readFileSync(f,'utf8');
  const min = minify(raw);
  const rawSize = Buffer.byteLength(raw,'utf8');
  const minSize = Buffer.byteLength(min,'utf8');
  totalRaw += rawSize; totalMin += minSize;
  report.push({file:path.relative(ROOT,f).replace(/\\/g,'/'), rawSize, minSize, savingBytes: rawSize-minSize, savingPct: +(100-(minSize/rawSize*100)).toFixed(2)});
});

report.sort((a,b)=>b.rawSize-a.rawSize);

// Critical CSS heurístico: Seletores usados acima da dobra para login e dashboard
// Estratégia: pegar classes & ids presentes na primeira metade do HTML e extrair regras que comecem com esses seletores.
function extractCritical(pageName, htmlPath){
  if(!fs.existsSync(htmlPath)) return null;
  const html = fs.readFileSync(htmlPath,'utf8');
  const snippet = html.slice(0, Math.min(8000, html.length));
  const classMatches = [...snippet.matchAll(/class="([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/));
  const idMatches = [...snippet.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
  const want = new Set([...classMatches.filter(Boolean).map(c=>'.'+c), ...idMatches.filter(Boolean).map(i=>'#'+i)]);
  const criticalRules = [];
  files.forEach(f=>{
    const css = fs.readFileSync(f,'utf8');
    // simple rule split
    css.split(/}/).forEach(rule=>{
      const parts = rule.split('{');
      if(parts.length!==2) return;
      const sel = parts[0].trim();
      const body = parts[1];
      if(!sel || !body) return;
      // check if any simple selector in set
      for(const w of want){
        if(sel.split(/,\s*/).some(s=>s.startsWith(w+' ') || s===w || s.startsWith(w+':') )){ criticalRules.push(sel+'{'+body+'}'); break; }
      }
    });
  });
  const merged = criticalRules.join('\n');
  const min = minify(merged);
  const outFile = path.join(DOCS,'critical-'+pageName+'.css');
  fs.writeFileSync(outFile, min,'utf8');
  return {page:pageName, selectorsApprox: want.size, rules: criticalRules.length, size: Buffer.byteLength(min,'utf8'), file: path.relative(ROOT,outFile).replace(/\\/g,'/')};
}

const critical = [];
critical.push(extractCritical('login', path.join(ROOT,'views','public','login.html')));
critical.push(extractCritical('dashboard', path.join(ROOT,'views','app','dashboard.html')));

const summary = {
  generatedAt: new Date().toISOString(),
  totalFiles: files.length,
  totalRawBytes: totalRaw,
  totalMinBytes: totalMin,
  totalSavingBytes: totalRaw-totalMin,
  totalSavingPct: +(100-(totalMin/totalRaw*100)).toFixed(2),
  topLargest: report.slice(0,15),
  critical: critical.filter(Boolean)
};

fs.writeFileSync(path.join(DOCS,'fase6-performance-relatorio.json'), JSON.stringify(summary,null,2),'utf8');
fs.writeFileSync(path.join(DOCS,'fase6-performance-arquivos.json'), JSON.stringify(report,null,2),'utf8');
fs.writeFileSync(path.join(DOCS,'fase6-critical-manifest.json'), JSON.stringify(summary.critical,null,2),'utf8');
console.log('[fase6] Performance relatório gerado. Economia total:', summary.totalSavingPct+'%');
