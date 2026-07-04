import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const requiredFiles = [
  'dist/web/index.html',
  'dist/web/src/main.js',
  'dist/web/assets/vendor/three.r128.min.js',
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) {
    throw new Error(`Missing build artifact: ${file}`);
  }
}

const filesToScan = [
  'dist/web/index.html',
  'dist/web/src/main.js',
  ...process.argv.slice(2),
];

for (const file of filesToScan) {
  const text = readFileSync(resolve(root, file), 'utf8')
    .replace(/href="https:\/\/qb-solutions\.us\/"/g, 'href=""');
  if (/https?:\/\/|fonts\.googleapis|fonts\.gstatic|cdnjs/i.test(text)) {
    throw new Error(`External runtime reference found in ${file}`);
  }
}

console.log('Offline build verification passed');
