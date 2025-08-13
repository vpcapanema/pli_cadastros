#!/usr/bin/env node
/**
 * Limpa CSS obsoletos (static/css/pages e static/css/06-pages) após backup.
 * Uso: node scripts/cleanup-obsolete-css.js
 */
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        ensureDir(dest);
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
    }
}

function removeContents(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
        const p = path.join(dir, entry);
        fs.rmSync(p, { recursive: true, force: true });
    }
}

(function main() {
    const root = __dirname.endsWith('scripts') ? path.resolve(__dirname, '..') : process.cwd();
    const ts = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 14);
    const backupDir = path.join(root, 'backups', `css-backup-${ts}`);
    ensureDir(backupDir);

    const targets = [
        path.join(root, 'static', 'css', 'pages'),
        path.join(root, 'static', 'css', '06-pages'),
    ];

    for (const t of targets) {
        if (fs.existsSync(t)) {
            const dest = path.join(backupDir, path.relative(path.join(root, 'static', 'css'), t));
            copyRecursive(t, dest);
            removeContents(t);
            console.log(`OK: Backup -> ${dest}`);
            console.log(`OK: Limpeza -> ${t}`);
        } else {
            console.log(`SKIP: Diretório não existe -> ${t}`);
        }
    }
    console.log(`Backup completo em: ${backupDir}`);
})();
