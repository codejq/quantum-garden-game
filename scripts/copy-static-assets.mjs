import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const copies = [
  ['web/src/main.js', 'dist/web/src/main.js'],
  ['web/src/modes/browser-mode-registry.js', 'dist/web/src/modes/browser-mode-registry.js'],
  ['web/assets/vendor', 'dist/web/assets/vendor'],
];

for (const [from, to] of copies) {
  const source = resolve(root, from);
  const target = resolve(root, to);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

console.log('Copied static runtime assets');
