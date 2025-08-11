#!/usr/bin/env node
// Classificar variáveis fora da whitelist (fase8-audit-relatorio.json)
// Categorias: breakpoints, container, layout-dimension, responsive-spacing, responsive-typography,
// login-auth, layout-mode, opacity, deprecated-known, outros

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const DOCS = path.join(ROOT,'docs');
const auditFile = path.join(DOCS,'fase8-audit-relatorio.json');
if(!fs.existsSync(auditFile)){
  console.error('Arquivo de auditoria não encontrado:', auditFile);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(auditFile,'utf8'));

const categories = {
  'breakpoints': v=>/--pli-breakpoint-/.test(v),
  'container-size': v=>/--pli-container-(max-width|xs|sm|md|lg|xl|2xl|ultrawide)/.test(v),
  'layout-dimension': v=>/--pli-(header-height|footer-height)(-mobile)?$/.test(v),
  'responsive-spacing': v=>/--pli-spacing-responsive-/.test(v),
  'responsive-typography': v=>/--pli-font-size-responsive-/.test(v),
  'login-auth': v=>/--pli-(login|auth)-/.test(v),
  'layout-mode': v=>/--pli-layout-mode/.test(v),
  'opacity': v=>/--pli-bg-opacity/.test(v),
  'deprecated-known': v=>/--pli-(azul-medio|verde-principal|amarelo|font-size-(xl|2xl)|glass-(bg-color|border-color))/.test(v),
};

function classify(name){
  for(const [cat, fn] of Object.entries(categories)){
    if(fn(name)) return cat;
  }
  return 'outros';
}

const grouped = {};
const byVar = {};
(data.violations||[]).forEach(v=>{
  const cat = classify(v.name);
  if(!grouped[cat]) grouped[cat]=[];
  grouped[cat].push(v);
  byVar[v.name] = byVar[v.name] || { name:v.name, cat, occurrences:0, files:new Set() };
  byVar[v.name].occurrences++;
  byVar[v.name].files.add(v.file);
});

const summary = Object.keys(grouped).sort().map(cat=>({category:cat, variables:[...new Set(grouped[cat].map(x=>x.name))].sort(), count:grouped[cat].length}));

const exportList = {
  generatedAt: new Date().toISOString(),
  totalViolations: data.counts?.violations || 0,
  categories: summary,
  recommendation: {
    addToWhitelist: summary.filter(s=>['breakpoints','container-size','layout-dimension','responsive-spacing','responsive-typography'].includes(s.category)).flatMap(s=>s.variables).sort(),
    keepInternal: summary.filter(s=>['login-auth','layout-mode','opacity'].includes(s.category)).flatMap(s=>s.variables).sort(),
    deprecated: summary.filter(s=>s.category==='deprecated-known').flatMap(s=>s.variables).sort(),
    review: summary.filter(s=>s.category==='outros').flatMap(s=>s.variables).sort()
  },
  variables: Object.values(byVar).map(v=>({name:v.name, category:v.cat, occurrences:v.occurrences, files:[...v.files].sort()})).sort((a,b)=>a.name.localeCompare(b.name))
};

fs.writeFileSync(path.join(DOCS,'fase8-violations-classified.json'), JSON.stringify(exportList,null,2),'utf8');
console.log('[fase8] Classificação concluída. Categorias:', summary.length);
