#!/usr/bin/env node
/**
 * Gera mapeamento de classes usadas em cada página HTML (views/public|app|admin)
 * Saída: docs/style-map-pages/<contexto>-<pagina>.html + index.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VIEWS_DIR = path.join(ROOT, 'views');
const TARGET_FOLDERS = ['public', 'app', 'admin'];
const STATIC_CSS_DIR = path.join(ROOT, 'static', 'css');
const VIEWS_ASSETS_CSS_DIR = path.join(VIEWS_DIR, 'assets', 'css');
const JS_DIRS = [path.join(ROOT, 'static', 'js'), path.join(VIEWS_DIR, 'assets', 'js')];
const OUTPUT_DIR = path.join(ROOT, 'docs', 'style-map-pages');

function escapeHtml(str){return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function extractCustomProperties(cssSnippet){
  const vars=[]; if(!cssSnippet) return vars;
  const lines = cssSnippet.split(/;\s*/);
  lines.forEach(l=>{const m = l.match(/(--[a-z0-9_-]+)\s*:\s*([^;}{]+)/i); if(m) vars.push({name:m[1].trim(), value:m[2].trim()});});
  return vars;
}

function walk(dir, matcher) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full, matcher));
    else if (!matcher || matcher(full)) out.push(full);
  }
  return out;
}

function extractClasses(html) {
  const classRegex = /class\s*=\s*"([^"]+)"/gim;
  const set = new Set();
  let m;
  while ((m = classRegex.exec(html))) {
    m[1]
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => set.add(c.trim()));
  }
  return Array.from(set).sort();
}

function loadFileSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function indexCSSSelectors(cssFiles, classes) {
  const map = new Map();
  const classPatterns = classes.map((c) => ({ c, re: new RegExp(`\\.${c}(?=[\n\r\t \.:#,{>])`, 'g') }));
  cssFiles.forEach((file) => {
    const content = loadFileSafe(file);
    classPatterns.forEach(({ c, re }) => {
      let match;
      while ((match = re.exec(content))) {
        const startBrace = content.indexOf('{', match.index);
        if (startBrace === -1) continue;
        let depth = 1, i = startBrace + 1;
        while (i < content.length && depth > 0) {
          if (content[i] === '{') depth++; else if (content[i] === '}') depth--; i++;
        }
        const block = content.slice(match.index, Math.min(i, match.index + 600));
        if (!map.has(c)) map.set(c, []);
  map.get(c).push({ file: path.relative(ROOT, file), snippet: block.trim() });
        break;
      }
    });
  });
  return map;
}

function indexJSUsage(jsFiles, classes) {
  const map = new Map();
  // Procurar ocorrências literais de 'classe' ou "classe" em JS
  const patterns = classes.map((c) => ({ c, re: new RegExp("['\"]" + c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + "['\"]", 'g') }));
  jsFiles.forEach((file) => {
    const content = loadFileSafe(file);
    const lines = content.split(/\r?\n/);
    patterns.forEach(({ c, re }) => {
      const refs = [];
      lines.forEach((line, idx) => { if (re.test(line)) refs.push({ n: idx + 1, line: line.trim().slice(0, 200) }); });
      if (refs.length) { if (!map.has(c)) map.set(c, []); map.get(c).push({ file: path.relative(ROOT, file), refs: refs.slice(0, 5) }); }
    });
  });
  return map;
}

function buildPageReport(context, htmlPath, cssFiles, jsFiles) {
  const html = loadFileSafe(htmlPath);
  const classes = extractClasses(html);
  const cssIdx = indexCSSSelectors(cssFiles, classes);
  const jsIdx = indexJSUsage(jsFiles, classes);
  const originalName = path.basename(htmlPath);
  const baseName = originalName.endsWith('.html') ? originalName.slice(0, -5) : originalName; // remove extensão .html
  let rows = '';
  let orphanCssCount=0, orphanJsCount=0, conflictCssCount=0;
  let anyVars=false;
  classes.forEach((cls) => {
    const cssEntries = cssIdx.get(cls) || [];
    const jsEntries = jsIdx.get(cls) || [];
    const cssHtml = cssEntries.map((e, i) => {
      // Exibir nome lógico sem hash para bundles, preservando arquivo real no data-file
      const displayFile = (() => {
        const coreRegex = /core\.min\.[a-f0-9]{6,}\.css$/i;
        const pageRegex = /pages[\\/].+?\.min\.[a-f0-9]{6,}\.css$/i;
        if (coreRegex.test(e.file)) return e.file.replace(/core\.min\.[a-f0-9]{6,}\.css$/i, 'core.min.css');
        if (pageRegex.test(e.file)) return e.file.replace(/(pages[\\/].+?\.min)\.[a-f0-9]{6,}\.css$/i, '$1.css');
        return e.file;
      })();
      const vars = extractCustomProperties(e.snippet);
      if(vars.length) anyVars=true;
      const varsData = encodeURIComponent(JSON.stringify(vars));
      return `<details class="css-entry"><summary>${i + 1}. <code title="${escapeHtml(e.file)}">${escapeHtml(displayFile)}</code></summary><div class="css-block" data-file="${escapeHtml(e.file)}" data-class="${cls}" data-vars="${varsData}"><pre><code>${escapeHtml(e.snippet)}</code></pre></div></details>`;
    }).join('') || '<em>—</em>';
    const jsHtml = jsEntries.map((e) => `<details><summary><code>${e.file}</code></summary><ul>${e.refs.map(r => `<li>L${r.n}: <code>${escapeHtml(r.line)}</code></li>`).join('')}</ul></details>`).join('') || '<em>—</em>';
    const orphanCss = cssEntries.length===0; if(orphanCss) orphanCssCount++;
    const orphanJs = jsEntries.length===0; if(orphanJs) orphanJsCount++;
    const conflictCss = cssEntries.length>1; if(conflictCss) conflictCssCount++;
    const rowClasses=[orphanCss?'orphan-css':'', orphanJs?'orphan-js':'', conflictCss?'conflict-css':''].filter(Boolean).join(' ');
    rows += `<tr class="${rowClasses}"><td><code>.${cls}</code></td><td>${cssEntries.length}</td><td>${jsEntries.length}</td><td>${cssHtml}</td><td>${jsHtml}</td></tr>`;
  });
  const relPath = path.relative(ROOT, htmlPath).replace(/\\/g,'/');
  const fullPath = htmlPath;
  const legend = `<div class="legend"><strong>Legenda:</strong> <span class="lg orf-css">Sem CSS</span> <span class="lg orf-js">Sem JS</span> <span class="lg conf-css">Conflito CSS (multi-arquivo)</span></div>`;
  const stats = `<div class="counts">Total classes: <strong>${classes.length}</strong> | Órfãs CSS: <strong>${orphanCssCount}</strong> | Órfãs JS: <strong>${orphanJsCount}</strong> | Conflitos CSS: <strong>${conflictCssCount}</strong></div>`;
  const editNotice = anyVars ? `<p class="edit-hint">Variáveis CSS detectadas — edite valores e clique em "Salvar vars". (Atualiza arquivos reais.)</p>` : '';
  const htmlOut = `<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\" /><title>Style Map | ${context}/${baseName}.html</title><style>
  body{font-family:Arial,Helvetica,sans-serif;margin:20px;background:#f7f9fb;color:#222}
  h1{margin-top:0;font-size:1.4rem}
  table{width:100%;border-collapse:collapse;font-size:0.8rem}
  th,td{border:1px solid #ccc;padding:6px;vertical-align:top}
  th{background:#244b72;color:#fff;position:sticky;top:0}
  code,pre{font-family:Consolas,monospace;font-size:0.7rem}
  pre{background:#0f203e;color:#e3f2fd;padding:8px;border-radius:4px;overflow:auto;max-height:260px}
  details summary{cursor:pointer}
  .counts{margin:10px 0;padding:8px;background:#e8f4ff;border:1px solid #b5d6f2;border-radius:4px}
  tr.orphan-css{background:#fff4f4}
  tr.orphan-js{background:#fef9e6}
  tr.conflict-css{outline:2px solid #d9534f}
  .legend{margin:8px 0;font-size:0.7rem}
  .legend .lg{display:inline-block;margin-right:10px;padding:2px 6px;border-radius:4px;background:#eee}
  .legend .orf-css{background:#ffd6d6}
  .legend .orf-js{background:#ffe8ae}
  .legend .conf-css{background:#ffc0c0;border:1px solid #d9534f}
  .var-editor{margin:6px 0 4px;padding:6px;background:#eef5ff;border:1px solid #b7d2f3;border-radius:4px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}
  .var-editor label{display:flex;flex-direction:column;font-size:0.65rem;color:#123}
  .var-editor input{font-size:0.65rem;padding:2px 4px;width:130px}
  .var-editor button{font-size:0.65rem;padding:4px 8px;cursor:pointer;background:#244b72;color:#fff;border:0;border-radius:4px}
  .var-editor button.ok{background:#2e7d32}
  .edit-hint{font-size:0.7rem;color:#244b72}
  </style></head><body><h1>Mapa de Estilos: ${context}/${baseName}.html</h1>
  <p><strong>Caminho relativo:</strong> <code>${escapeHtml(relPath)}</code><br><strong>Caminho absoluto:</strong> <code>${escapeHtml(fullPath)}</code></p>
  ${legend}
  ${stats}
  ${editNotice}
  <table><thead><tr><th>Classe</th><th>#CSS</th><th>#JS</th><th>Declarações CSS</th><th>Referências JS</th></tr></thead><tbody>${rows}</tbody></table><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p><p><a href=\"index.html\">← Voltar ao índice</a></p>
  ${anyVars ? `<script>(function(){document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.css-block').forEach(block=>{const raw=block.getAttribute('data-vars');if(!raw) return;let vars=[];try{vars=JSON.parse(decodeURIComponent(raw));}catch{};if(!vars.length) return;const form=document.createElement('form');form.className='var-editor';vars.forEach(v=>{const lab=document.createElement('label');lab.innerHTML='<span>'+v.name+'</span><input name="'+v.name+'" value="'+v.value+'" />';form.appendChild(lab);});const preview=document.createElement('button');preview.type='button';preview.textContent='Pré-visualizar';const save=document.createElement('button');save.type='button';save.textContent='Salvar vars';save.style.marginLeft='4px';const diffBox=document.createElement('div');diffBox.style.display='none';diffBox.style.width='100%';diffBox.style.background='#fff';diffBox.style.border='1px solid #ccd';diffBox.style.padding='6px';diffBox.style.marginTop='6px';diffBox.style.fontSize='0.6rem';diffBox.style.whiteSpace='pre-wrap';diffBox.style.maxHeight='140px';diffBox.style.overflow='auto';function buildDiff(){const updates={};vars.forEach(v=>{updates[v.name]=form.querySelector('input[name="'+v.name+'"]').value;});let out='';Object.entries(updates).forEach(([k,val])=>{const original=(vars.find(v=>v.name===k)||{}).value;const changed=original.trim()!==val.trim();out+= (changed? '• ':'  ')+k+': '+original+' => '+val+(changed?' *':'')+'\n';});return out;}preview.addEventListener('click',()=>{diffBox.textContent=buildDiff();diffBox.style.display='block';});save.addEventListener('click',async ()=>{if(!confirm('ATENÇÃO: todas as ocorrências destas variáveis no arquivo '+block.dataset.file+' serão substituídas. Deseja continuar?')) return;save.disabled=true;preview.disabled=true;const updates={};vars.forEach(v=>{updates[v.name]=form.querySelector('input[name="'+v.name+'"]').value;});const payload={file:block.dataset.file,className:block.dataset.class,updates};try{const r=await fetch('/api/stylemap/update-css',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(r.ok){save.textContent='Salvo ✔';save.classList.add('ok');}else{save.textContent='Erro';}}catch(e){save.textContent='Falha';}setTimeout(()=>{save.disabled=false;preview.disabled=false;save.textContent='Salvar vars';save.classList.remove('ok');},3000);});form.appendChild(preview);form.appendChild(save);form.appendChild(diffBox);block.appendChild(form);});});})();</script>`:''}
  </body></html>`;
  return { fileName: `${context}-${baseName}.html`, html: htmlOut, classCount: classes.length };
}

// escapeHtml já definido acima

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  // Limpar diretório para evitar arquivos obsoletos (incluindo .html.html antigos)
  fs.readdirSync(OUTPUT_DIR).forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
  const cssFiles = [...walk(STATIC_CSS_DIR, f=>f.endsWith('.css')),...walk(VIEWS_ASSETS_CSS_DIR,f=>f.endsWith('.css'))];
  const jsFiles = []; JS_DIRS.forEach(dir=> jsFiles.push(...walk(dir,f=>f.endsWith('.js'))));
  const reports = [];
  TARGET_FOLDERS.forEach(folder=>{
    const base = path.join(VIEWS_DIR, folder); if(!fs.existsSync(base)) return;
    walk(base,f=>f.endsWith('.html')).forEach(htmlPath=>{
      try { const rep = buildPageReport(folder, htmlPath, cssFiles, jsFiles); fs.writeFileSync(path.join(OUTPUT_DIR, rep.fileName), rep.html,'utf8'); reports.push(rep);} catch(e){console.error('Falha ao processar', htmlPath, e.message);} });
  });
  const indexHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" /><title>Style Map Index</title><style>body{font-family:Arial;margin:20px}ul{columns:3;-webkit-columns:3;-moz-columns:3}a{display:block;padding:4px 0;text-decoration:none;color:#244b72}a:hover{text-decoration:underline}</style></head><body><h1>Índice - Mapa de Estilos</h1><p>Total de páginas: ${reports.length}</p><ul>${reports.sort((a,b)=>a.fileName.localeCompare(b.fileName)).map(r=>`<li><a href="${r.fileName}">${r.fileName}</a> <small>(${r.classCount} classes)</small></li>`).join('')}</ul><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p></body></html>`;
  fs.writeFileSync(path.join(OUTPUT_DIR,'index.html'), indexHtml,'utf8');
  console.log(`✅ Relatórios gerados em ${path.relative(ROOT, OUTPUT_DIR)}`);
}

if (require.main === module) main();
