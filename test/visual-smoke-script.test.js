import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const scriptSource = readFileSync(new URL('../scripts/visual-viewport-smoke.mjs', import.meta.url), 'utf8');
const cameraScriptSource = readFileSync(new URL('../scripts/camera-view-smoke.mjs', import.meta.url), 'utf8');

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

test('visual viewport smoke covers quality tiers', () => {
  assert.match(scriptSource, /name: 'quality-high-desktop'/);
  assert.match(scriptSource, /query: '\?quality=high'/);
  assert.match(scriptSource, /name: 'quality-low-mobile-portrait'/);
  assert.match(scriptSource, /name: 'quality-low-mobile-landscape'/);
  assert.match(scriptSource, /query: '\?quality=low'/);
});

test('offline build verification runs camera view smoke across viewports', () => {
  assert.match(packageJson.scripts['test:offline-build'], /camera-view-smoke\.mjs/);
  assert.match(cameraScriptSource, /desktop-follow/);
  assert.match(cameraScriptSource, /desktop-close/);
  assert.match(cameraScriptSource, /desktop-top/);
  assert.match(cameraScriptSource, /mobile-portrait-follow/);
  assert.match(cameraScriptSource, /mobile-portrait-close/);
  assert.match(cameraScriptSource, /mobile-portrait-top/);
  assert.match(cameraScriptSource, /mobile-landscape-follow/);
  assert.match(cameraScriptSource, /mobile-landscape-close/);
  assert.match(cameraScriptSource, /mobile-landscape-top/);
  assert.match(cameraScriptSource, /QuantumGardenAgent\.act\(\{ type: 'setCamera', mode \}\)/);
  assert.match(cameraScriptSource, /assertControlsDoNotOverlap/);
  assert.match(cameraScriptSource, /Camera controls overlap/);
});
