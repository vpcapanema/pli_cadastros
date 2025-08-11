#!/usr/bin/env node
// Script: generate-token-inventory.js
// Objetivo: inventário global de tokens CSS (--pli-*) gerando JSONs e tabela Markdown.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname + '/../';
const CSS_DIR = path.join(ROOT, 'static', 'css');
const DOCS_DIR = path.join(ROOT, 'docs');

if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

/** Utils **/
const isHashedMinFile = (file) => /\.min\.[a-f0-9]{6,}\.css$/i.test(file);
const cssFileFilter = (file) => file.endsWith('.css') && !isHashedMinFile(file);

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (cssFileFilter(e.name)) acc.push(full);
  }
  return acc;
}

function toHexColor(value) {
  // Attempts to normalize color strings: #RGB, #RRGGBB, rgb(a), hsl(a)
  value = value.trim();
  // Already hex
  if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) {
    // expand #abc → #aabbcc
    if (value.length === 4) {
      return '#' + [...value.slice(1)].map(c => c + c).join('').toLowerCase();
    }
    return value.toLowerCase();
  }
  // rgb/rgba
  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(p => p.trim()).slice(0,3);
    if (parts.length === 3 && parts.every(p => /^\d{1,3}$/.test(p))) {
      const [r,g,b] = parts.map(n => Math.max(0, Math.min(255, parseInt(n,10))));
      return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
    }
  }
  return value.toLowerCase().replace(/\s+/g,' ');
}

function normalizeValue(raw) {
  let v = raw.trim();
  // remove trailing semicolon if present
  v = v.replace(/;$/, '').trim();
  // collapse spaces
  v = v.replace(/\s+/g, ' ');
  // isolate color tokens inside (simple approach): if single token looks like color
  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\()/i.test(v)) return toHexColor(v);
  // split composite values and normalize colors inside
  v = v.replace(/(#([0-9a-f]{3}|[0-9a-f]{6}))/ig, m => toHexColor(m));
  return v.toLowerCase();
}

const tokenData = {}; // name -> {definitions:[], usage:[], values:Set}

function recordDefinition(name, file, line, value) {
  if (!tokenData[name]) tokenData[name] = { definitions: [], usage: [], values: new Set() };
  tokenData[name].definitions.push({ file: rel(file), line, value: value.trim() });
  tokenData[name].values.add(value.trim());
}
function recordUsage(name, file, line, context) {
  if (!tokenData[name]) tokenData[name] = { definitions: [], usage: [], values: new Set() };
  tokenData[name].usage.push({ file: rel(file), line, context });
}
const rel = (p) => path.relative(ROOT, p).replace(/\\/g,'/');

// Regex
const defRe = /--pli-[a-z0-9-]+\s*:\s*[^;]+;/ig; // definition lines
const nameValRe = /(--pli-[a-z0-9-]+)\s*:\s*([^;]+);/i;
const usageRe = /var\(\s*(--pli-[a-z0-9-]+)\s*(?:,[^)]+)?\)/ig;

const files = walk(CSS_DIR);

files.forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((lineText, idx) => {
    const lno = idx + 1;
    // definitions
    const defs = lineText.match(defRe);
    if (defs) {
      defs.forEach(d => {
        const m = d.match(nameValRe);
        if (m) recordDefinition(m[1], file, lno, m[2]);
      });
    }
    // usages
    let um;
    while ((um = usageRe.exec(lineText)) !== null) {
      recordUsage(um[1], file, lno, lineText.trim().slice(0, 240));
    }
  });
});

// Build duplication groups by normalized value of first value (or each distinct value?)
// We'll group each token value individually so a token with multiple conflicting values appears in multiple groups.
const valueGroups = {}; // normValue -> {rawValues:Set, tokens:Set, occurrences: number}
Object.entries(tokenData).forEach(([name, data]) => {
  data.values.forEach(v => {
    const norm = normalizeValue(v);
    if (!valueGroups[norm]) valueGroups[norm] = { rawValues: new Set(), tokens: new Set(), occurrences: 0 };
    valueGroups[norm].rawValues.add(v);
    valueGroups[norm].tokens.add(name);
    // approximate occurrences = definitions referencing this value
    const defCountForValue = data.definitions.filter(d => d.value.trim() === v.trim()).length;
    valueGroups[norm].occurrences += defCountForValue;
  });
});

// Metrics
const metrics = {
  totalTokens: Object.keys(tokenData).length,
  tokensWithoutDefinition: Object.values(tokenData).filter(t => t.definitions.length === 0).length,
  tokensWithoutUsage: Object.values(tokenData).filter(t => t.usage.length === 0).length,
  tokensWithConflictingValues: Object.values(tokenData).filter(t => t.values.size > 1).length,
  duplicateValueGroups: Object.values(valueGroups).filter(g => g.tokens.size > 1).length,
  totalValueGroups: Object.keys(valueGroups).length,
};
metrics.percentageTokensConflicting = metrics.totalTokens ? +(metrics.tokensWithConflictingValues / metrics.totalTokens * 100).toFixed(2) : 0;
metrics.percentageDuplicateValueGroups = metrics.totalValueGroups ? +(metrics.duplicateValueGroups / metrics.totalValueGroups * 100).toFixed(2) : 0;

// Potential merge candidates: value groups with >1 tokens and none of those tokens have >1 value (safer merges)
const mergeCandidates = [];
Object.entries(valueGroups).forEach(([norm, g]) => {
  if (g.tokens.size > 1) {
    const tokensArr = [...g.tokens];
    const anyConflict = tokensArr.some(t => tokenData[t].values.size > 1);
    if (!anyConflict) {
      mergeCandidates.push({ value: norm, tokens: tokensArr.sort() });
    }
  }
});
metrics.mergeCandidateGroups = mergeCandidates.length;

// Serialize structures
const inventoryOut = {};
Object.entries(tokenData).forEach(([name, data]) => {
  inventoryOut[name] = {
    definitionCount: data.definitions.length,
    usageCount: data.usage.length,
    values: [...data.values],
    conflicting: data.values.size > 1,
    definitions: data.definitions,
    usage: data.usage.slice(0, 2000) // safety cap
  };
});

const dupOut = [];
Object.entries(valueGroups).forEach(([norm, g]) => {
  dupOut.push({
    normalizedValue: norm,
    tokens: [...g.tokens].sort(),
    rawValues: [...g.rawValues],
    occurrences: g.occurrences,
    duplicate: g.tokens.size > 1
  });
});

dupOut.sort((a,b) => b.tokens.length - a.tokens.length || b.occurrences - a.occurrences);

// Write files
fs.writeFileSync(path.join(DOCS_DIR, 'tokens-inventory.json'), JSON.stringify(inventoryOut, null, 2), 'utf8');
fs.writeFileSync(path.join(DOCS_DIR, 'tokens-duplicatas.json'), JSON.stringify(dupOut, null, 2), 'utf8');
fs.writeFileSync(path.join(DOCS_DIR, 'tokens-metricas.json'), JSON.stringify(metrics, null, 2), 'utf8');
fs.writeFileSync(path.join(DOCS_DIR, 'tokens-merge-candidatos.json'), JSON.stringify(mergeCandidates, null, 2), 'utf8');

// Markdown summary
const lines = [];
lines.push('# Inventário de Tokens CSS (Fase 2)');
lines.push('');
lines.push('Gerado em: ' + new Date().toISOString());
lines.push('');
lines.push('## Métricas');
Object.entries(metrics).forEach(([k,v]) => lines.push('- ' + k + ': ' + v));
lines.push('');
lines.push('## Tokens (resumo)');
lines.push('| Token | Definições | Usos | Valores | Conflito |');
lines.push('|-------|------------|------|---------|----------|');
Object.entries(inventoryOut)
  .sort((a,b)=> a[0].localeCompare(b[0]))
  .forEach(([name, info]) => {
    lines.push(`| ${name} | ${info.definitionCount} | ${info.usageCount} | ${info.values.length} | ${info.conflicting ? '⚠️' : ''} |`);
  });
lines.push('');
lines.push('## Grupos de Valor Duplicado (top 30)');
lines.push('| Valor Normalizado | Qtde Tokens | Tokens |');
lines.push('|-------------------|-------------|--------|');
dupOut.slice(0,30).filter(d => d.duplicate).forEach(d => {
  lines.push(`| \
${d.normalizedValue.replace(/\|/g,'\\|')} | ${d.tokens.length} | ${d.tokens.join(', ')} |`);
});
lines.push('');
lines.push('## Candidatos a Merge');
mergeCandidates.slice(0,50).forEach(c => {
  lines.push(`- Valor: ${c.value} → Tokens: ${c.tokens.join(', ')}`);
});

fs.writeFileSync(path.join(DOCS_DIR, 'Fase2-Tokens-TABELA.md'), lines.join('\n'), 'utf8');

console.log('[tokens] Inventário gerado.');
console.log('[tokens] Métricas:', metrics);
console.log('[tokens] Arquivos escritos em docs/.');
