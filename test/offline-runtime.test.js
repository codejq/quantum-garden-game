import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const checkedRoots = ['web/index.html', 'web/styles', 'web/src'];
const remotePattern = /https?:\/\/|fetch\s*\(|XMLHttpRequest|WebSocket\s*\(/;
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
    assert.doesNotMatch(readFileSync(file, 'utf8'), remotePattern, file);
  }
});

test('active audio remains generated with WebAudio instead of bundled media files', () => {
  const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
  assert.match(mainSource, /AudioContext/);
  assert.match(mainSource, /createOscillator/);
  for (const file of activeRuntimeFiles()) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), audioAssetPattern, file);
  }
});
