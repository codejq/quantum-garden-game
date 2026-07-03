import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const scriptSource = readFileSync(new URL('../scripts/visual-viewport-smoke.mjs', import.meta.url), 'utf8');

test('offline build verification runs visual viewport smoke', () => {
  assert.match(packageJson.scripts['test:offline-build'], /visual-viewport-smoke\.mjs/);
});

test('visual viewport smoke covers desktop and mobile orientations offline', () => {
  assert.match(scriptSource, /host-resolver-rules=MAP \* 0\.0\.0\.0/);
  assert.match(scriptSource, /name: 'desktop'/);
  assert.match(scriptSource, /name: 'mobile-portrait'/);
  assert.match(scriptSource, /name: 'mobile-landscape'/);
  assert.match(scriptSource, /dist-\$\{viewport\.name\}\.png/);
});
