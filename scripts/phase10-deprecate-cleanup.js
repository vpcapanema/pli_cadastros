#!/usr/bin/env node
// Fase 10: Limpeza final de variáveis @deprecated em bundles minificados
// Estratégia: substituir ocorrências residuais de variáveis deprecated por suas canônicas e registrar diff

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'static', 'css');
const DOCS_DIR = path.join(ROOT, 'docs');
if(!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR,{recursive:true});

// Mapeamento de aliases (deprecated -> canonical)
const MAP = {
  '--pli-azul-medio': '--pli-info',
  '--pli-verde-principal': '--pli-success',
  '--pli-amarelo': '--pli-warning',
  '--pli-font-size-xl': '--pli-spacing-lg',
  '--pli-font-size-2xl': '--pli-spacing-xl',
  '--pli-glass-bg-color': '--pli-branco',
  '--pli-glass-border-color': '--pli-branco'
};

// Seleciona bundles minificados alvo
function walk(dir, list=[]) { for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,e.name); if(e.isDirectory()) walk(full,list); else if(e.name.endsWith('.css')) list.push(full);} return list; }
const TARGETS = walk(CSS_DIR).filter(f => /core\.min\..*\.css$/.test(f) || /pages[\\/]+login\.min\..*\.css$/.test(f));

const report = { generatedAt: new Date().toISOString(), processed: [], totalReplacements:0 };

function replaceAll(content, file){
  let changed = false; let replacements = [];
  for(const [deprecatedVar, canonical] of Object.entries(MAP)){
    if(content.includes(deprecatedVar)){
      const before = (content.match(new RegExp(deprecatedVar,'g'))||[]).length;
      content = content.split(deprecatedVar).join(canonical);
      const after = (content.match(new RegExp(deprecatedVar,'g'))||[]).length;
      const count = before - after;
      if(count>0){
        changed = true;
        report.totalReplacements += count;
        replacements.push({deprecated:deprecatedVar, canonical, count});
      }
    }
  }
  if(changed) report.processed.push({file: path.relative(ROOT,file), replacements});
  return content;
}

let touched = 0;
for(const file of TARGETS){
  try {
    const original = fs.readFileSync(file,'utf8');
    const updated = replaceAll(original,file);
    if(updated!==original){
      const backupDir = path.join(ROOT,'backups','fase10');
      if(!fs.existsSync(backupDir)) fs.mkdirSync(backupDir,{recursive:true});
      fs.writeFileSync(path.join(backupDir,path.basename(file)+'.bak'), original,'utf8');
      fs.writeFileSync(file, updated,'utf8');
      touched++;
    }
  } catch(e){
    report.processed.push({file: path.relative(ROOT,file), error: e.message});
  }
}

fs.writeFileSync(path.join(DOCS_DIR,'fase10-cleanup-report.json'), JSON.stringify(report,null,2),'utf8');
console.log(`[fase10] Limpeza concluída. Arquivos alterados: ${touched}. Replacements: ${report.totalReplacements}`);
