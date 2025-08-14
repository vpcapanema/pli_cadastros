/*
Refatoração automática de classes por página:
- Backup
- Mapear classes usadas no HTML
- Renomear classes em HTML+CSS adicionando referência do elemento (tag)
- Remover CSS não utilizado
- Atualizar css-manifest.json
- Gerar relatório

Uso:
node tools/refactor-classes.js --views views --css static/css/individual --backup backups --apply
*/

const path = require('path');
const fs = require('fs-extra');
const fg = require('fast-glob');
const minimist = require('minimist');
const cheerio = require('cheerio');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

const argv = minimist(process.argv.slice(2), {
    string: ['views', 'css', 'backup'],
    boolean: ['apply'],
    default: {
        views: 'views',
        css: 'static/css/individual',
        backup: 'backups',
        apply: true,
    },
});

const ROOT = process.cwd();
const VIEWS_DIR = path.resolve(ROOT, argv.views);
const CSS_DIR = path.resolve(ROOT, argv.css);
const BACKUPS_DIR = path.resolve(ROOT, argv.backup);
const REPORT_DIR = path.resolve(ROOT, 'reports');
const MANIFEST_FILE = path.resolve(ROOT, 'static/css/css-manifest.json');

// HTMLs que NÃO devem ser tocados
const HTML_EXCLUDE = new Set([
    path.normalize('views/templates/base.html'),
    path.normalize('views/components/navbar.html'),
    path.normalize('views/components/footer.html'),
]);

// CSS que não serão limpos por segurança
const CSS_EXCLUDE = new Set([
    path.normalize('static/css/individual/header.css'),
    path.normalize('static/css/individual/footer.css'),
]);

// Classes externas que nunca renomeamos (Bootstrap/utilitários comuns)
const EXTERNAL_CLASS_WHITELIST = [
    // bootstrap
    /^container(-fluid)?$/, /^row$/, /^col(-\w+)*$/, /^g-\d+$/, /^gy-\d+$/, /^gx-\d+$/,
    /^btn/, /^form-/, /^input-/, /^dropdown/, /^nav/, /^navbar/, /^card/, /^alert/,
    /^d-/, /^flex-/, /^justify-/, /^align-/, /^text-/, /^fw-/, /^lh-/, /^fs-/, /^m[bstlrxy]?-\d+$/, /^p[bstlrxy]?-\d+$/,
    /^shadow/, /^rounded/, /^position-/, /^top-/, /^start-/, /^end-/, /^bottom-/,
    // ícones/fontawesome e afins
    /^fa[srldb]?$/, /^fa-/,
    // utilidades comuns do projeto
    /^pli-?u-/, /^u-/
];

function isExternalClass(cls) {
    return EXTERNAL_CLASS_WHITELIST.some(rx => rx.test(cls));
}

function normalizePageId(htmlFile) {
    const base = path.basename(htmlFile).replace(/\.(html|htm|ejs)$/i, '');
    // exemplo: login, admin-login, pessoa-fisica
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function guessCssForPage(pageId) {
    // tenta achar {pageId}.css em static/css/individual
    const candidates = [
        path.join(CSS_DIR, `${pageId}.css`),
        path.join(CSS_DIR, `${pageId}.min.css`),
    ];
    for (const f of candidates) {
        if (fs.existsSync(f)) return f;
    }
    return null;
}

async function backupFiles(files, backupRoot) {
    const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const destRoot = path.join(backupRoot, `class-refactor-${stamp}`);
    for (const f of files) {
        const src = path.resolve(ROOT, f);
        const dest = path.join(destRoot, f);
        await fs.ensureDir(path.dirname(dest));
        if (await fs.pathExists(src)) {
            await fs.copy(src, dest);
        }
    }
    return destRoot;
}

function collectHtmlFiles() {
    const patterns = [`${VIEWS_DIR.replace(/\\/g, '/')}/**/*.html`];
    const all = fg.sync(patterns, { dot: false });
    // excluir base/footer/navbar
    return all.filter(p => !HTML_EXCLUDE.has(path.normalize(path.relative(ROOT, p))));
}

function readHtmlClasses(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const classMap = new Map(); // elem -> Set(classes)
    $('[class]').each((_, el) => {
        const classes = ($(el).attr('class') || '').trim().split(/\s+/).filter(Boolean);
        if (!classes.length) return;
        const tag = el.tagName?.toLowerCase() || 'div';
        classMap.set(el, { classes, tag });
    });
    return { $, classMap };
}

function buildRenameMap($, classMap, pageId, cssClassSet) {
    const rename = new Map(); // old -> new
    for (const { classes, tag } of classMap.values()) {
        for (const cls of classes) {
            if (isExternalClass(cls)) continue;
            if (!cssClassSet.has(cls)) continue; // só renomeia classes definidas no CSS da página
            const base = cls.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
            const newName = `${pageId}__${base}--${tag}`;
            rename.set(cls, newName);
        }
    }
    return rename;
}

async function parseCssClasses(cssFile) {
    const css = await fs.readFile(cssFile, 'utf8');
    const root = postcss.parse(css, { from: cssFile });
    const classes = new Set();
    root.walkRules(rule => {
        selectorParser(selectors => {
            selectors.walkClasses(c => classes.add(c.value));
        }).processSync(rule.selector);
    });
    return { css, classes };
}

function rewriteHtml($, classMap, renameMap) {
    $('[class]').each((_, el) => {
        const cl = ($(el).attr('class') || '').trim().split(/\s+/).filter(Boolean);
        if (!cl.length) return;
        const updated = cl.map(c => renameMap.get(c) || c);
        $(el).attr('class', Array.from(new Set(updated)).join(' '));
    });
    return $.html();
}

function rewriteCss(css, renameMap, usedClassSetAfterRename) {
    const root = postcss.parse(css);
    // renomeia seletores
    root.walkRules(rule => {
        const newSelector = selectorParser(sel => {
            sel.walkClasses(node => {
                const old = node.value;
                if (renameMap.has(old)) {
                    node.value = renameMap.get(old);
                }
            });
        }).processSync(rule.selector);
        rule.selector = newSelector;
    });

    // remove regras não usadas (classes que não aparecem mais no HTML da página)
    root.walkRules(rule => {
        let keep = false;
        selectorParser(sel => {
            sel.walkClasses(node => {
                if (usedClassSetAfterRename.has(node.value)) {
                    keep = true;
                }
            });
        }).processSync(rule.selector);
        if (!keep) {
            // se o seletor não tem nenhuma classe (tag/attr apenas), mantemos por segurança
            const hasClass = /(\.[_a-zA-Z])/.test(rule.selector);
            if (hasClass) rule.remove();
        }
    });

    return root.toString();
}

async function main() {
    const htmlFiles = collectHtmlFiles();
    const filesToBackup = new Set(htmlFiles.map(f => path.relative(ROOT, f)));

    // também considere CSS correspondentes
    const pageToCss = {};
    for (const htmlPath of htmlFiles) {
        const rel = path.relative(ROOT, htmlPath);
        const pageId = normalizePageId(rel);
        const guess = guessCssForPage(pageId);
        if (guess) {
            pageToCss[rel] = path.relative(ROOT, guess);
            filesToBackup.add(path.relative(ROOT, guess));
        }
    }

    // backup
    const backupRoot = await backupFiles(Array.from(filesToBackup), BACKUPS_DIR);

    const report = {
        startedAt: new Date().toISOString(),
        backupDir: backupRoot,
        pagesProcessed: [],
        totals: {
            pages: 0,
            cssFiles: 0,
            classesRenamed: 0,
            cssRulesRemoved: 0,
            unusedClassesRemoved: 0,
            filesWritten: 0,
        },
    };

    // processar cada página
    for (const htmlAbs of htmlFiles) {
        const relHtml = path.relative(ROOT, htmlAbs);
        // pular base/footer/navbar (já filtrado), e qualquer HTML de componentes
        if (/views[\\/](templates|components)[\\/]/i.test(relHtml)) continue;

        const pageId = normalizePageId(relHtml);
        const cssRel = pageToCss[relHtml] || null;
        if (!cssRel) continue;

        const cssAbs = path.resolve(ROOT, cssRel);
        if (CSS_EXCLUDE.has(path.normalize(cssRel))) continue; // segurança

        const html = await fs.readFile(htmlAbs, 'utf8');
        const { $, classMap } = readHtmlClasses(html);

        // classes definidas no CSS
        const { css, classes: cssClassSet } = await parseCssClasses(cssAbs);

        // mapa de renomeação
        const renameMap = buildRenameMap($, classMap, pageId, cssClassSet);

        // reescrever HTML
        const newHtml = rewriteHtml($, classMap, renameMap);

        // coletar classes usadas após renomear
        const $u = cheerio.load(newHtml);
        const usedAfter = new Set();
        $u('[class]').each((_, el) => {
            ($u(el).attr('class') || '').split(/\s+/).forEach(c => { if (c) usedAfter.add(c); });
        });

        // reescrever CSS e limpar regras
        const beforeCssLen = css.length;
        const newCss = rewriteCss(css, renameMap, usedAfter);
        const removedRulesApprox = Math.max(0, Math.round((beforeCssLen - newCss.length) / 40)); // estimativa

        if (argv.apply) {
            await fs.writeFile(htmlAbs, newHtml, 'utf8');
            await fs.writeFile(cssAbs, newCss, 'utf8');
        }

        report.pagesProcessed.push({
            page: relHtml,
            css: cssRel,
            pageId,
            classesRenamed: Array.from(renameMap.entries()).map(([from, to]) => ({ from, to })),
            removedRulesApprox,
        });

        report.totals.pages += 1;
        report.totals.cssFiles += 1;
        report.totals.classesRenamed += renameMap.size;
        report.totals.cssRulesRemoved += removedRulesApprox;
        report.totals.filesWritten += 2;
    }

    // atualizar manifest
    const manifest = {};
    for (const [htmlRel, cssRel] of Object.entries(pageToCss)) {
        const pageId = normalizePageId(htmlRel);
        manifest[pageId] = {
            html: htmlRel.replace(/\\/g, '/'),
            css: cssRel.replace(/\\/g, '/'),
        };
    }
    await fs.ensureFile(MANIFEST_FILE);
    await fs.writeJson(MANIFEST_FILE, manifest, { spaces: 2 });

    // salvar relatório
    await fs.ensureDir(REPORT_DIR);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeJson(path.join(REPORT_DIR, `class-refactor-report-${stamp}.json`), report, { spaces: 2 });

    const md = [];
    md.push(`# Relatório de Refatoração de Classes - ${stamp}`);
    md.push(`Backup: ${path.relative(ROOT, report.backupDir)}`);
    md.push(`- Páginas processadas: ${report.totals.pages}`);
    md.push(`- Arquivos CSS processados: ${report.totals.cssFiles}`);
    md.push(`- Classes renomeadas: ${report.totals.classesRenamed}`);
    md.push(`- Regras CSS removidas (aprox.): ${report.totals.cssRulesRemoved}`);
    md.push('');
    for (const p of report.pagesProcessed) {
        md.push(`## ${p.pageId}`);
        md.push(`HTML: ${p.page}`);
        md.push(`CSS: ${p.css}`);
        md.push(`Classes renomeadas: ${p.classesRenamed.length}`);
        if (p.classesRenomeadas && p.classesRenomeadas.length) {
            md.push(p.classesRenomeadas.map(c => `- ${c.from} → ${c.to}`).join('\n'));
        }
        md.push(`Regras removidas (aprox.): ${p.removedRulesApprox}`);
        md.push('');
    }
    await fs.writeFile(path.join(REPORT_DIR, `class-refactor-report-${stamp}.md`), md.join('\n'), 'utf8');

    console.log('Refatoração concluída. Backup em:', report.backupDir);
    console.log('Manifest atualizado em:', path.relative(ROOT, MANIFEST_FILE));
    console.log('Relatórios em:', path.relative(ROOT, REPORT_DIR));
}

main().catch(err => {
    console.error('Erro na refatoração:', err);
    process.exit(1);
});
