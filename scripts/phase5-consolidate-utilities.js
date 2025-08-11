#!/usr/bin/env node
// Fase 5: Consolidar utilities - detectar duplicações entre _utilities.css e _text-utilities.css
// Gera relatorio de classes duplicadas e plano de merge.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const UTIL_DIR = path.join(ROOT,'static','css','07-utilities');
const DOCS_DIR = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR,{recursive:true});

function parseClasses(file){
  const txt = fs.readFileSync(file,'utf8');
  const re = /(\.[a-z0-9-]+)\s*\{([^{}]+)\}/gi; let m; const map={};
  while((m=re.exec(txt))){
    const cls=m[1];
    const body=m[2].trim().split(/;\s*/).map(d=>d.trim()).filter(Boolean).sort().join(';');
    map[cls]=body;
  }
  return map;
}

const fileA = path.join(UTIL_DIR,'_utilities.css');
const fileB = path.join(UTIL_DIR,'_text-utilities.css');
const aMap = parseClasses(fileA);
const bMap = parseClasses(fileB);

const duplicates=[]; const onlyA=[]; const onlyB=[];
Object.keys(aMap).forEach(k=>{ if(bMap[k]){ if(aMap[k]===bMap[k]) duplicates.push(k); } else onlyA.push(k); });
Object.keys(bMap).forEach(k=>{ if(!aMap[k]) onlyB.push(k); });

const report={generatedAt:new Date().toISOString(), duplicates, onlyA:onlyA.slice(0,200), onlyB:onlyB.slice(0,200), counts:{utilities:Object.keys(aMap).length,text:Object.keys(bMap).length,duplicates:duplicates.length}};
fs.writeFileSync(path.join(DOCS_DIR,'fase5-utilities-relatorio.json'), JSON.stringify(report,null,2),'utf8');
console.log('[fase5] Relatório utilities gerado. Duplicadas:', duplicates.length);
