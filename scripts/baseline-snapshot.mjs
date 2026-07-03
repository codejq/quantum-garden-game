import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const target = process.argv[2] || 'web/legacy/index.html';
const file = resolve(root, target);
const html = readFileSync(file, 'utf8');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).sort();
const externalScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const externalStyles = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]);

const snapshot = {
  file: relative(root, file).replaceAll('\\', '/'),
  sha256: createHash('sha256').update(html).digest('hex'),
  bytes: Buffer.byteLength(html),
  title: html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() || null,
  htmlLang: html.match(/<html[^>]+\blang="([^"]+)"/)?.[1] || null,
  htmlDir: html.match(/<html[^>]+\bdir="([^"]+)"/)?.[1] || null,
  inlineStyleBlocks: (html.match(/<style\b/g) || []).length,
  inlineScriptBlocks: (html.match(/<script(?![^>]+src=)/g) || []).length,
  externalScripts,
  externalStyles,
  importantIds: ids.filter((id) =>
    [
      'game',
      'hud',
      'uiScore',
      'uiTrees',
      'uiTrash',
      'uiLevel',
      'missionCard',
      'joy',
      'actBtn',
      'sndBtn',
      'startOverlay',
      'startBtn',
      'lvlOverlay',
      'nextBtn',
    ].includes(id),
  ),
};

const out = resolve(root, 'docs/baseline-snapshot.json');
writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${relative(root, out).replaceAll('\\', '/')}`);
