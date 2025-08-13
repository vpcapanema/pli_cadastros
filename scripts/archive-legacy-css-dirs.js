#!/usr/bin/env node
/**
 * Arquiva diretórios CSS legados para backups/css-legacy-<timestamp>
 * Mantém apenas: static/css/individual, static/css/utilities (temporariamente), static/css/08-themes
 */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'static', 'css');
const BACKUP_DIR = path.join(ROOT, 'backups', `css-legacy-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`);

// Pastas/arquivos a arquivar (se existirem)
const LEGACY_ITEMS = [
    '00-configuracoes', '00-settings',
    '01-ferramentas', '01-generic',
    '02-genericos',
    '03-elementos', '03-elements',
    '04-estruturas', '04-layout',
    '05-componentes', '05-components',
    '06-pages', '06-utilitarios',
    '07-paginas', '07-utilities',
    '08-experimentos',
    '99-depreciados',
    'auto',
    'pages',
    // Arquivos soltos
    'core.css', 'login-fixes.css'
];

async function ensureDir(p) {
    await fsp.mkdir(p, { recursive: true });
}

async function exists(p) {
    try { await fsp.stat(p); return true; } catch { return false; }
}

async function copyRecursive(src, dest) {
    const st = await fsp.stat(src);
    if (st.isDirectory()) {
        await ensureDir(dest);
        const entries = await fsp.readdir(src);
        for (const e of entries) {
            await copyRecursive(path.join(src, e), path.join(dest, e));
        }
    } else {
        await ensureDir(path.dirname(dest));
        await fsp.copyFile(src, dest);
    }
}

async function rmRecursive(target) {
    await fsp.rm(target, { recursive: true, force: true });
}

async function main() {
    await ensureDir(BACKUP_DIR);
    const report = [];

    for (const item of LEGACY_ITEMS) {
        const src = path.join(CSS_DIR, item);
        if (!(await exists(src))) {
            report.push(`SKIP (não existe): ${path.relative(ROOT, src)}`);
            continue;
        }
        // Pule se diretório existe mas está vazio
        if ((await fsp.stat(src)).isDirectory()) {
            const entries = await fsp.readdir(src);
            if (entries.length === 0) {
                await rmRecursive(src);
                report.push(`REMOVIDO (vazio): ${path.relative(ROOT, src)}`);
                continue;
            }
        }

        const dest = path.join(BACKUP_DIR, item);
        await copyRecursive(src, dest);
        await rmRecursive(src);
        report.push(`ARQUIVADO -> ${path.relative(ROOT, src)} => ${path.relative(ROOT, dest)}`);
    }

    // Criar um README resumo
    const readme = [
        '# Arquivo de Backup - CSS Legacy',
        '',
        `Data: ${new Date().toISOString()}`,
        '',
        'Itens arquivados:',
        ...report.map(r => `- ${r}`),
        '',
        'Pastas mantidas em static/css:',
        '- individual/ (estilos por página)',
        '- utilities/ (transição; migrar para individual futuramente)',
        '- 08-themes/ (theme-dark.css em uso no base.ejs)'
    ].join('\n');
    await ensureDir(BACKUP_DIR);
    await fsp.writeFile(path.join(BACKUP_DIR, 'README.md'), readme, 'utf8');

    console.log('OK: Arquivamento concluído. Veja:', path.relative(ROOT, BACKUP_DIR));
    for (const line of report) console.log(' -', line);
}

main().catch(err => { console.error('ERRO no arquivamento:', err); process.exit(1); });
