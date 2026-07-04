import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const checkedRoots = ['web/index.html', 'web/styles', 'web/src'];
const remotePattern = /https?:\/\/|fetch\s*\(|XMLHttpRequest|WebSocket\s*\(/;
const allowedCreditLinkPattern = /href="https:\/\/qb-solutions\.us\/"/g;
const audioAssetPattern = /\.(?:mp3|wav|ogg|m4a)\b|<audio\b|new Audio\s*\(/;

function filesUnder(path) {
  const abs = join(root, path);
  const stats = statSync(abs);
  if (stats.isFile()) return [abs];
  return readdirSync(abs)
    .flatMap((entry) => filesUnder(join(path, entry)))
    .filter((file) => /\.(?:html|css|js)$/.test(file));
}

function activeRuntimeFiles() {
  return checkedRoots.flatMap(filesUnder);
}

test('active runtime source does not introduce gameplay network calls', () => {
  for (const file of activeRuntimeFiles()) {
    const source = readFileSync(file, 'utf8').replace(allowedCreditLinkPattern, 'href=""');
    assert.doesNotMatch(source, remotePattern, file);
  }
});

test('offline build verifier allows only the approved credit link', () => {
  const verifierSource = readFileSync(new URL('../scripts/verify-offline-build.mjs', import.meta.url), 'utf8');
  assert.match(verifierSource, /href="https:\\\/\\\/qb-solutions\\.us\\\/"/);
  assert.match(verifierSource, /External runtime reference found/);
});

test('active audio remains generated with WebAudio instead of bundled media files', () => {
  const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
  assert.match(mainSource, /AudioContext/);
  assert.match(mainSource, /createOscillator/);
  assert.equal(existsSync(join(root, 'web/assets/audio')), false);
  for (const file of activeRuntimeFiles()) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), audioAssetPattern, file);
  }
});

test('static runtime copy includes browser mode registry bridge', () => {
  const copyScript = readFileSync(new URL('../scripts/copy-static-assets.mjs', import.meta.url), 'utf8');
  assert.match(copyScript, /web\/src\/main\.js/);
  assert.match(copyScript, /web\/src\/modes\/browser-mode-registry\.js/);
  assert.match(copyScript, /dist\/web\/src\/modes\/browser-mode-registry\.js/);
});

test('Three.js remains vendored r128 instead of upgraded through npm', () => {
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(existsSync(join(root, 'web/assets/vendor/three.r128.min.js')), true);
  assert.equal(packageJson.dependencies?.three, undefined);
  assert.equal(packageJson.devDependencies?.three, undefined);
});
