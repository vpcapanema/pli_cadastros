#!/usr/bin/env node
// Aplica merges de tokens conforme tokens-merge-dry-run.json
// Passos:
// 1. Lê plano de merges (plan[].canonical + aliases[])
// 2. Faz backup incremental (recomendado rodar backup-css-structure.js antes)
// 3. Substitui usos de aliases por canônico em arquivos CSS não minificados + não hashed
// 4. Converte definição original do alias em declaração @deprecated apontando para var(--canonical)
// 5. Gera relatório docs/tokens-merge-aplicado.json e diff simplificado docs/tokens-merge-diff.md
// 6. NÃO toca arquivos *.min.[hash].css

const fs = require('fs');
const path = require('path');
const ROOT = __dirname + '/../';
const DOCS = path.join(ROOT,'docs');
const CSS_DIR = path.join(ROOT,'static','css');
const PLAN_FILE = path.join(DOCS,'tokens-merge-dry-run.json');
if(!fs.existsSync(PLAN_FILE)){
  console.error('Plano não encontrado:', PLAN_FILE);
  process.exit(1);
}
const planData = JSON.parse(fs.readFileSync(PLAN_FILE,'utf8'));
const plan = planData.plan || [];
// Map alias -> canonical
const aliasMap = {};
plan.forEach(g=> g.aliases.forEach(a=> aliasMap[a] = g.canonical));

// Helpers
const isHashedMin = f => /\.min\.[a-f0-9]{6,}\.css$/i.test(f);
function walk(dir, acc=[]) {
  fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{
    const full = path.join(dir,e.name);
    if(e.isDirectory()) walk(full,acc); else if(full.endsWith('.css') && !isHashedMin(full)) acc.push(full);
  });
  return acc;
}

const files = walk(CSS_DIR);
const fileChanges = []; // {file, beforeBytes, afterBytes, replacements:[{alias,canonical,count}]}

function escapeForRegex(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
}
function replaceAll(content, alias, canonical){
  let count = 0;
  // Substituir forma var(--alias ...)
  // Procurar 'var(--alias' seguido de ) ou ,
  const usageRe = new RegExp('var\\(\\s*'+escapeForRegex(alias)+'(?=\\s*(?:[,)]))','g');
  content = content.replace(usageRe, (m) => { count++; return m.replace(alias, canonical); });
  return { content, count };
}

function deprecateDefinitionLines(text, alias, canonical){
  // Replace definition "--alias: value;" with comment + pointer
  const defRe = new RegExp('(^|\\s)('+alias.replace(/[-]/g,'[-]')+')\\s*:\\s*([^;]+);','g');
  return text.replace(defRe, (full, pre, name, val) => {
    if(val.includes('var('+canonical)) return full; // já adaptado
    return `${pre}/* @deprecated merged -> ${canonical} (original ${val.trim()}) */ ${name}: var(${canonical});`;
  });
}

files.forEach(file => {
  let original = fs.readFileSync(file,'utf8');
  let modified = original;
  const replacements=[];
  Object.entries(aliasMap).forEach(([alias, canonical])=>{
    const r1 = replaceAll(modified, alias, canonical); modified = r1.content; if(r1.count) replacements.push({alias, canonical, usageReplacements:r1.count});
    const afterDep = deprecateDefinitionLines(modified, alias, canonical); if(afterDep !== modified){ modified = afterDep; const exists = replacements.find(r=>r.alias===alias); if(exists) exists.definitionDeprecated = true; else replacements.push({alias,canonical,usageReplacements:0,definitionDeprecated:true}); }
  });
  if(modified !== original){
    fs.writeFileSync(file, modified,'utf8');
    fileChanges.push({file: path.relative(ROOT,file).replace(/\\/g,'/'), beforeBytes: original.length, afterBytes: modified.length, replacements});
  }
});

// Relatórios
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});
fs.writeFileSync(path.join(DOCS,'tokens-merge-aplicado.json'), JSON.stringify({ timestamp:new Date().toISOString(), changes:fileChanges }, null,2),'utf8');

const diffLines=[];
diffLines.push('# Diff Simplificado - Merges de Tokens Aplicados');
diffLines.push('Gerado em '+new Date().toISOString());
fileChanges.forEach(c=>{
  diffLines.push(`\n## ${c.file}`);
  c.replacements.forEach(r=>{
    diffLines.push(`- ${r.alias} -> ${r.canonical} (usos alterados: ${r.usageReplacements||0}${r.definitionDeprecated?'; definição marcada @deprecated':''})`);
  });
});
fs.writeFileSync(path.join(DOCS,'tokens-merge-diff.md'), diffLines.join('\n'),'utf8');

console.log('Merges aplicados. Arquivos modificados:', fileChanges.length);
