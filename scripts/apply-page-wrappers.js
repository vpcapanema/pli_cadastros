#!/usr/bin/env node
// Fase 3: Inserir wrappers body.pag-<slug> em arquivos de página (06-pages)
// Regras:
// - Detectar p-<slug> existente e adicionar linha: body.pag-<slug> { outline:0; }
// - Se já existir body.pag-<slug> pula
// - Gerar relatório docs/fase3-wrappers-relatorio.json

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const PAGES_DIR = path.join(ROOT,'static','css','06-pages');
const DOCS_DIR = path.join(ROOT,'docs');
if(!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR,{recursive:true});

function listPages(){
  return fs.readdirSync(PAGES_DIR).filter(f=>f.endsWith('.css'));
}

function slugFromClass(className){
  // className: p-login -> login
  return className.replace(/^p-/, '');
}

const result = [];

listPages().forEach(file=>{
  const full = path.join(PAGES_DIR,file);
  let content = fs.readFileSync(full,'utf8');
  const lines = content.split(/\n/);
  // coletar classes p-*
  const pageClasses = new Set();
  const classRe = /\.p-([a-z0-9-]+)/g; let m;
  while((m = classRe.exec(content))){ pageClasses.add('p-'+m[1]); }
  if(pageClasses.size===0){
    result.push({file, action:'skip-no-page-class'});
    return;
  }
  let modified = false;
  pageClasses.forEach(pc=>{
    const slug = slugFromClass(pc);
    const wrapperSelector = 'body.pag-'+slug;
    if(content.includes(wrapperSelector)){
      result.push({file, wrapper: wrapperSelector, action:'exists'});
    } else {
      // inserir antes do primeiro bloco de comentário ou no topo
      const insert = `${wrapperSelector} { outline:0; /* fase3 wrapper */ }\n`;
      content = insert + content;
      modified = true;
      result.push({file, wrapper: wrapperSelector, action:'added'});
    }
  });
  if(modified){ fs.writeFileSync(full, content,'utf8'); }
});

fs.writeFileSync(path.join(DOCS_DIR,'fase3-wrappers-relatorio.json'), JSON.stringify({generatedAt:new Date().toISOString(), result},null,2),'utf8');
console.log('[fase3] Wrappers aplicados. Total arquivos:', result.length);
