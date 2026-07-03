import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
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

test('Tauri bundle declares platform icon assets', () => {
  assert.deepEqual(config.bundle.icon, ['icons/icon.png', 'icons/icon.ico']);
});

test('Tauri desktop launch smoke script is available', () => {
  assert.equal(packageJson.scripts['test:tauri-dev'], 'node scripts/tauri-dev-launch-smoke.mjs');
  assert.equal(packageJson.scripts['test:tauri-launch'], 'node scripts/tauri-desktop-launch-smoke.mjs');
  const devSmokeSource = readFileSync(join(root, 'scripts/tauri-dev-launch-smoke.mjs'), 'utf8');

  assert.match(devSmokeSource, /cmd\.exe/);
  assert.match(devSmokeSource, /\['\/c', 'npm', 'run', 'tauri:dev'\]/);
  assert.match(devSmokeSource, /taskkill/);
  assert.match(devSmokeSource, /\/T/);
  assert.match(devSmokeSource, /tauri:dev/);
});

test('Tauri Windows install smoke script is available and scoped to target temp files', () => {
  assert.equal(packageJson.scripts['test:tauri-install'], 'node scripts/tauri-windows-install-smoke.mjs');
  const installSmokeSource = readFileSync(join(root, 'scripts/tauri-windows-install-smoke.mjs'), 'utf8');

  assert.match(installSmokeSource, /src-tauri\/target\/install-smoke/);
  assert.match(installSmokeSource, /function assertInsideSmokeRoot/);
  assert.match(installSmokeSource, /rmSync\(installDir, \{ recursive: true, force: true \}\)/);
  assert.match(installSmokeSource, /\/D=\$\{installDir\}/);
});

test('Tauri exposes a native close command for desktop exit', () => {
  assert.match(tauriLibSource, /fn close_window\(window: tauri::Window\) -> Result<\(\), String>/);
  assert.match(tauriLibSource, /window\.close\(\)/);
  assert.match(tauriLibSource, /generate_handler!\[platform_info, close_window\]/);
});
