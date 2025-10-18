// Build all samples into ./site, preserving relative structure with slugified paths.
import { globby } from 'globby';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'samples');
const OUT = path.join(ROOT, 'site');

const slugify = (s) =>
  s.toLowerCase()
    .replace(/[^a-z0-9/_ -]+/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/, '/')
    .replace(/^\/+|\/+$/g, '');

await fs.emptyDir(OUT);

const indexes = await globby('samples/**/index.html');
if (indexes.length === 0) {
  console.warn('No samples found under samples/**/index.html');
  process.exit(0);
}

// Base index
const cards = [];
for (const indexFile of indexes.sort()) {
  const sampleDir = path.dirname(indexFile);
  const rel = path.relative(SRC, sampleDir);
  const slugRel = slugify(rel);
  const destDir = path.join(OUT, slugRel);

  await fs.ensureDir(destDir);

  // Build with Vite (TS support via root tsconfig)
  // We'll run: vite build --config vite.config.ts --root <sampleDir> --base ./ --outDir <destDir>
  console.log(`Building: ${rel} -> ${path.relative(ROOT, destDir)}`);
  await execa('npx', [
    'vite',
    'build',
    '--config',
    path.join(ROOT, 'vite.config.ts'),
    '--base',
    './',
    '--outDir',
    destDir
  ], {
    stdio: 'inherit',
    cwd: sampleDir
  });

  const category = rel.split(path.sep)[0] || 'samples';
  cards.push({ title: path.basename(sampleDir), rel, slugRel, category });
}

// Write homepage
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>ThreeRex.js — Samples</title>
  <style>
    :root { color-scheme: light; }
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;padding:24px;max-width:1100px}
    h1{margin:0 0 8px}
    p.note{color:#6b7280;margin:0 0 20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
    a.card{display:block;padding:14px;border:1px solid #e5e7eb;border-radius:12px;text-decoration:none;color:inherit}
    a.card:hover{background:#f9fafb}
    .path{color:#6b7280;font-size:12px}
    .tag{display:inline-block;font-size:12px;background:#eef2ff;border:1px solid #e0e7ff;border-radius:999px;padding:2px 8px;margin-left:8px}
  </style>
</head>
<body>
  <h1>ThreeRex.js — Samples</h1>
  <p class="note">Все найденные семплы из <code>samples/</code> (TS + Vite). Кликайте карточки.</p>
  <div class="grid">
    ${cards.map(c => `
      <a class="card" href="./${c.slugRel}/">
        <strong>${c.title}</strong>
        <span class="tag">${c.category}</span>
        <div class="path">samples/${c.rel}</div>
      </a>`).join('')}
  </div>
</body>
</html>`;
await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8');
console.log('Site assembled at ./site');
