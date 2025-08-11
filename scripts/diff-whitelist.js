#!/usr/bin/env node
/**
 * diff-whitelist.js
 * Verifica diferenças entre a whitelist atual e um snapshot anterior.
 * - Falha (exit code 2) se houver remoção de variável não justificada.
 * - Uso: node scripts/diff-whitelist.js            (apenas checa)
 *        node scripts/diff-whitelist.js --update   (atualiza snapshot)
 * Snapshot: docs/variables-whitelist.snapshot.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname,'..');
const DOCS = path.join(ROOT,'docs');
const CURRENT_PATH = path.join(DOCS,'variables-whitelist.json');
const SNAPSHOT_PATH = path.join(DOCS,'variables-whitelist.snapshot.json');
const REPORT_PATH = path.join(DOCS,'whitelist-diff-report.json');

if(!fs.existsSync(CURRENT_PATH)){
  console.error('[whitelist-diff] Arquivo atual não encontrado:', CURRENT_PATH);
  process.exit(1);
}
const current = JSON.parse(fs.readFileSync(CURRENT_PATH,'utf8'));
const currentVars = new Set(current.variables || []);
const currentDeprecated = new Set(current.deprecated || []);

let snapshot = { variables: [], deprecated: [] };
if(fs.existsSync(SNAPSHOT_PATH)){
  try { snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH,'utf8')); } catch (e){ console.warn('[whitelist-diff] Falha ao ler snapshot:', e.message); }
}

const snapshotVars = new Set(snapshot.variables || []);
const removed = [...snapshotVars].filter(v => !currentVars.has(v));
const added = [...currentVars].filter(v => !snapshotVars.has(v));

// Remoções justificadas: aquelas que agora aparecem em deprecated
const unjustifiedRemovals = removed.filter(v => !currentDeprecated.has(v));

const report = {
  generatedAt: new Date().toISOString(),
  snapshotExists: fs.existsSync(SNAPSHOT_PATH),
  snapshotCount: snapshotVars.size,
  currentCount: currentVars.size,
  added,
  removed,
  unjustifiedRemovals
};

fs.writeFileSync(REPORT_PATH, JSON.stringify(report,null,2),'utf8');
console.log('[whitelist-diff] Relatório gerado:', path.relative(ROOT, REPORT_PATH));

if(process.argv.includes('--update')){
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    variables: [...currentVars].sort(),
    deprecated: [...currentDeprecated].sort()
  },null,2),'utf8');
  console.log('[whitelist-diff] Snapshot atualizado.');
  process.exit(0);
}

if(unjustifiedRemovals.length){
  console.error('[whitelist-diff] Falha: remoções não justificadas detectadas:', unjustifiedRemovals.length);
  process.exitCode = 2;
} else {
  console.log('[whitelist-diff] OK: nenhuma remoção não justificada.');
}
