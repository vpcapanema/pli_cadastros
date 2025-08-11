#!/usr/bin/env node
/**
 * Dry-run de merges de tokens.
 * Usa tokens-merge-candidatos.json e gera:
 *  - docs/tokens-merge-dry-run.json (ocorrencias por token)
 *  - docs/tokens-merge-substituicoes.md (tabela para revisão)
 * NÃO altera arquivos.
 */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname + '/../';
const DOCS = path.join(ROOT,'docs');
const CSS_DIR = path.join(ROOT,'static','css');
const mergeFile = path.join(DOCS,'tokens-merge-candidatos.json');
if(!fs.existsSync(mergeFile)){
  console.error('Arquivo de candidatos não encontrado');
  process.exit(1);
}
const candidates = JSON.parse(fs.readFileSync(mergeFile,'utf8'));
// Heurística: escolher token canônico = aquele cujo nome parece mais semântico (ordem de preferência de prefixos)
const preference = ['--pli-success','--pli-warning','--pli-error','--pli-info'];
function chooseCanonical(arr){
  for(const p of preference){ if(arr.includes(p)) return p; }
  // caso contrário o mais curto
  return arr.slice().sort((a,b)=> a.length - b.length || a.localeCompare(b))[0];
}
// Map de merges: tokenAntigo -> tokenCanonical
const mergePlan = {};
const groups = candidates.map(g=>{
  const canonical = chooseCanonical(g.tokens);
  const others = g.tokens.filter(t=> t!==canonical);
  others.forEach(o=> mergePlan[o] = canonical);
  return { value: g.value, canonical, aliases: others };
});
// varrer arquivos css (incluindo hashed? ignorar min hashed para não tocar build) – apenas para contagem de ocorrências
function walk(dir,acc=[]){
  fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{
    const full=path.join(dir,e.name);
    if(e.isDirectory()) walk(full,acc); else if(e.name.endsWith('.css')) acc.push(full);
  });
  return acc;
}
const files = walk(CSS_DIR).filter(f=> !/\.min\.[a-f0-9]{6,}\.css$/i.test(f));
const occurrences = {}; Object.keys(mergePlan).forEach(t=> occurrences[t]=[]);
files.forEach(f=>{
  const content = fs.readFileSync(f,'utf8');
  Object.keys(mergePlan).forEach(oldTok=>{
    const re = new RegExp(oldTok.replace(/[-]/g,'[-]'),'g');
    let m; while((m = re.exec(content)) !== null){
      occurrences[oldTok].push({ file: path.relative(ROOT,f).replace(/\\/g,'/'), index: m.index });
    }
  });
});
// Saídas
if(!fs.existsSync(DOCS)) fs.mkdirSync(DOCS,{recursive:true});
fs.writeFileSync(path.join(DOCS,'tokens-merge-dry-run.json'), JSON.stringify({ plan: groups, occurrences }, null,2),'utf8');
const lines = [];
lines.push('# Dry-Run Merge de Tokens');
lines.push('Gerado em '+ new Date().toISOString());
lines.push('');
lines.push('| Valor | Canônico | Aliases | Ocorrências (total) |');
lines.push('|-------|----------|---------|---------------------|');
groups.forEach(g=>{
  const occTotal = g.aliases.reduce((sum,a)=> sum + (occurrences[a]?.length||0),0);
  lines.push(`| ${g.value} | ${g.canonical} | ${g.aliases.join(', ')} | ${occTotal} |`);
});
lines.push('\n## Observações');
lines.push('- Substituição proposta: aliases -> canônico; tokens canônicos permanecem.');
fs.writeFileSync(path.join(DOCS,'tokens-merge-substituicoes.md'), lines.join('\n'),'utf8');
console.log('Dry-run concluído.');
