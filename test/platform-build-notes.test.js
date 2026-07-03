import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const tauriConfig = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const notes = readFileSync(new URL('../docs/platform-build-notes.md', import.meta.url), 'utf8');

test('platform notes document desktop and mobile build commands', () => {
  assert.equal(packageJson.scripts['tauri:android:dev'], 'tauri android dev');
  assert.equal(packageJson.scripts['tauri:android:build'], 'tauri android build');
  assert.equal(packageJson.scripts['tauri:ios:dev'], 'tauri ios dev');
  assert.equal(packageJson.scripts['tauri:ios:build'], 'tauri ios build');
  assert.match(notes, /Development command: `npm run tauri:android:dev`/);
  assert.match(notes, /Release command: `npm run tauri:android:build`/);
  assert.match(notes, /Development command: `npm run tauri:ios:dev`/);
  assert.match(notes, /Release command: `npm run tauri:ios:build`/);
});

test('Tauri identifier defines Android package id and iOS bundle id', () => {
  assert.equal(tauriConfig.identifier, 'com.quantumgarden.clean');
  assert.match(notes, /Tauri identifier `com\.quantumgarden\.clean` is the shared Android package id and iOS bundle id/);
});

test('Apple platform work remains gated until hardware and account access exist', () => {
  assert.match(notes, /macOS and iOS builds require macOS and Xcode/);
  assert.match(notes, /Apple Developer enrollment/);
  assert.match(notes, /Do not mark macOS or iOS release tasks complete until Mac hardware, Xcode, signing certificates, and Apple Developer access are available/);
});
