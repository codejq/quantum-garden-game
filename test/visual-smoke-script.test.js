import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const scriptSource = readFileSync(new URL('../scripts/visual-viewport-smoke.mjs', import.meta.url), 'utf8');
const cameraScriptSource = readFileSync(new URL('../scripts/camera-view-smoke.mjs', import.meta.url), 'utf8');
const playabilityScriptSource = readFileSync(new URL('../scripts/playability-smoke.mjs', import.meta.url), 'utf8');
const baselineParitySource = readFileSync(new URL('../scripts/baseline-gameplay-parity.mjs', import.meta.url), 'utf8');

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
  assert.match(cameraScriptSource, /assertHudTargetsStayInViewport/);
  assert.match(cameraScriptSource, /Camera HUD targets left the viewport/);
  assert.match(cameraScriptSource, /ensureBuiltStylesApplied/);
  assert.match(cameraScriptSource, /page\.addStyleTag\(\{ path: builtCssPath \}\)/);
});

test('offline build verification proves active gameplay remains playable', () => {
  assert.match(packageJson.scripts['test:offline-build'], /playability-smoke\.mjs/);
  assert.match(playabilityScriptSource, /moveToNearestTrash/);
  assert.match(playabilityScriptSource, /plantNearest/);
  assert.match(playabilityScriptSource, /trashChanged/);
  assert.match(playabilityScriptSource, /treeChanged/);
});

test('baseline parity script covers the gameplay checklist', () => {
  assert.equal(packageJson.scripts['test:baseline-parity'], 'npm run build && node scripts/baseline-gameplay-parity.mjs');
  for (const label of [
    'Start screen appears',
    'Player moves with WASD',
    'Player moves with arrow keys',
    'Touch joystick appears on touch-capable viewport/device',
    'Player collects trash by walking over it',
    'Player can plant a tree when standing near a glowing patch',
    'Minion can be converted by touching it',
    'Boss appears after the initial delay',
    'Boss requires multiple touches before defeat',
    'Level-complete overlay appears after all objectives are complete',
    'Next-level button starts another level',
    'Sound toggle changes the sound icon',
  ]) {
    assert.match(baselineParitySource, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
