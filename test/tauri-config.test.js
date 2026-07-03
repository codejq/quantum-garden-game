import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const tauriLibSource = readFileSync(join(root, 'src-tauri/src/lib.rs'), 'utf8');

test('Tauri packages the local offline web bundle', () => {
  assert.equal(config.build.beforeBuildCommand, 'npm run build');
  assert.equal(config.build.frontendDist, '../dist/web');
  assert.doesNotMatch(config.build.frontendDist, /^https?:\/\//);
});

test('Tauri desktop window launches fullscreen for gameplay', () => {
  assert.equal(config.app.windows[0].fullscreen, true);
  assert.equal(config.app.windows[0].resizable, true);
});

test('Tauri exposes a native close command for desktop exit', () => {
  assert.match(tauriLibSource, /fn close_window\(window: tauri::Window\) -> Result<\(\), String>/);
  assert.match(tauriLibSource, /window\.close\(\)/);
  assert.match(tauriLibSource, /generate_handler!\[platform_info, close_window\]/);
});
