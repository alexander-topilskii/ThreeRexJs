// Build all samples into ./site, preserving relative structure with slugified paths
// and generating a rich homepage that links to every category.
import { globby } from 'globby';
import fs from 'fs-extra';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { build as viteBuild } from 'vite';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'samples');
const OUT = path.join(ROOT, 'site');

const toPosix = (value) => value.split(path.sep).join('/');

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');

const humanize = (value) =>
  value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

await fs.emptyDir(OUT);

const indexes = (await globby('samples/**/index.html')).sort();
if (indexes.length === 0) {
  console.warn('No samples found under samples/**/index.html');
  process.exit(0);
}

const entries = [];
for (const indexFile of indexes) {
  const sampleDir = path.dirname(indexFile);
  const rel = toPosix(path.relative(SRC, sampleDir));
  const slugRel = slugify(rel);
  const category = rel.split('/')[0] || 'samples';

  const htmlSource = await fs.readFile(indexFile, 'utf8');
  const titleMatch = htmlSource.match(/<title>(.*?)<\/title>/i);
  const descriptionMatch = htmlSource.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);

  const rawTitle = titleMatch ? titleMatch[1].trim() : path.basename(sampleDir);
  const cleanedTitle = rawTitle.replace(/\s+—\s*ThreeRex\.js/i, '').trim();
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : `Пример из каталога samples/${rel}`;

  entries.push({
    rel,
    slugRel,
    category,
    title: cleanedTitle || rawTitle,
    rawTitle,
    description,
    sampleDir,
  });
}

const categoriesMap = new Map();
for (const entry of entries) {
  const list = categoriesMap.get(entry.category) ?? [];
  list.push(entry);
  categoriesMap.set(entry.category, list);
}

const categories = Array.from(categoriesMap.entries())
  .map(([id, items]) => ({
    id,
    label: humanize(id),
    items: items
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      .map((item) => ({
        slug: item.slugRel,
        href: `./${item.slugRel}/`,
        rel: item.rel,
        title: item.title,
        fullTitle: item.rawTitle,
        description: item.description,
      })),
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'ru'));

const packageJson = await fs.readJson(path.join(ROOT, 'package.json'));
const version = packageJson.version ?? '0.0.0';

let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
} catch (error) {
  console.warn('Не удалось получить хеш коммита:', error.message);
}

const navHtml = categories
  .map((category) => `<a class="nav-link" href="#${category.id}">${escapeHtml(category.label)}</a>`)
  .join('\n            ');

const sectionsHtml = categories
  .map((category) => {
    const itemsHtml = category.items
      .map(
        (item) => `
            <a class="sample-button" href="${item.href}">
              <span class="sample-title">${escapeHtml(item.title)}</span>
              <span class="sample-desc">${escapeHtml(item.description)}</span>
              <span class="sample-path">samples/${escapeHtml(item.rel)}</span>
            </a>`
      )
      .join('\n            ');

    return `
        <section id="${category.id}" class="category">
          <h2>${escapeHtml(category.label)} <span class="badge">${category.items.length}</span></h2>
          <div class="sample-grid">
            ${itemsHtml}
          </div>
        </section>`;
  })
  .join('\n');

const homepageHtml = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ThreeRex.js — коллекция примеров</title>
    <meta name="description" content="Коллекция минималистичных демо на Three.js." />
    <style>
      :root {
        color-scheme: light;
        font-family: "Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }

      body {
        margin: 0;
        background: inherit;
        color: inherit;
      }

      .layout {
        max-width: 1120px;
        margin: 0 auto;
        padding: 40px 20px 80px;
      }

      header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
      }

      header h1 {
        font-size: clamp(32px, 5vw, 48px);
        margin: 0;
        line-height: 1.05;
      }

      header p.lead {
        margin: 0;
        font-size: 18px;
        color: #475569;
        max-width: 640px;
      }

      nav.categories-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      nav.categories-nav a.nav-link {
        text-decoration: none;
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(15, 118, 110, 0.08);
        color: #0f766e;
        border: 1px solid rgba(13, 148, 136, 0.2);
      }

      nav.categories-nav a.nav-link:hover {
        background: rgba(13, 148, 136, 0.12);
      }

      section.category {
        margin-top: 44px;
      }

      section.category h2 {
        font-size: 22px;
        margin: 0 0 16px;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      section.category h2 .badge {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
      }

      .sample-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      .sample-button {
        text-decoration: none;
        background: #fff;
        border-radius: 16px;
        padding: 18px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        color: inherit;
      }

      .sample-button:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.1);
        border-color: rgba(59, 130, 246, 0.4);
      }

      .sample-title {
        font-size: 18px;
        font-weight: 600;
      }

      .sample-desc {
        font-size: 14px;
        color: #475569;
      }

      .sample-path {
        font-size: 12px;
        color: #64748b;
        font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }

      footer.build-meta {
        margin-top: 64px;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
      }

      @media (max-width: 640px) {
        .layout {
          padding: 28px 16px 48px;
        }

        header h1 {
          font-size: 32px;
        }
      }
    </style>
  </head>
  <body>
    <main class="layout">
      <header>
        <h1>ThreeRex.js</h1>
        <p class="lead">Коллекция минималистичных демо на Three.js. Выбирайте раздел и открывайте примеры.</p>
        ${navHtml ? `<nav class="categories-nav">\n            ${navHtml}\n          </nav>` : ''}
      </header>
      ${sectionsHtml || '<p>Примеры не найдены.</p>'}
      <footer class="build-meta">Сборка ${escapeHtml(version)} · Коммит ${escapeHtml(commitHash)}</footer>
    </main>
  </body>
</html>\n`;

await fs.writeFile(path.join(OUT, 'index.html'), homepageHtml, 'utf8');
console.log('Homepage -> site/index.html');

// Build samples
for (const entry of entries) {
  const sampleDir = path.join(SRC, entry.rel);
  const destDir = path.join(OUT, entry.slugRel);

  await fs.ensureDir(destDir);

  console.log(`Building: ${entry.rel} -> ${path.relative(ROOT, destDir)}`);
  await viteBuild({
    configFile: path.join(ROOT, 'vite.config.ts'),
    root: sampleDir,
    base: './',
    logLevel: 'info',
    build: {
      outDir: destDir,
      emptyOutDir: true,
    },
  });
}

console.log('Site assembled at ./site');
