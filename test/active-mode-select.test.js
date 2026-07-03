import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');
const roadmapSource = readFileSync(new URL('../docs/modular-offline-tauri-roadmap.md', import.meta.url), 'utf8');

test('active start overlay exposes a mode selector before starting the game', () => {
  assert.match(htmlSource, /id="modeSelect" role="radiogroup"/);
  assert.match(htmlSource, /id="singleModeBtn" data-mode="single-player"/);
  assert.match(htmlSource, /id="raceModeBtn" data-mode="two-player-race"/);
  assert.ok(htmlSource.indexOf('id="modeSelect"') < htmlSource.indexOf('id="startBtn"'));
});

test('active mode selector is localized, persisted, and reflected in browser agent observations', () => {
  assert.match(mainSource, /mode:'Game mode'/);
  assert.match(mainSource, /singlePlayer:'Single Player'/);
  assert.match(mainSource, /twoPlayerRace:'Two Player Race'/);
  assert.match(mainSource, /let activeMode=localStorage\.getItem\('cleanGarden\.mode'\)\|\|'single-player'/);
  assert.match(mainSource, /function setActiveMode\(mode\)/);
  assert.match(mainSource, /localStorage\.setItem\('cleanGarden\.mode',activeMode\)/);
  assert.match(mainSource, /btn\.setAttribute\('aria-pressed',String\(selected\)\)/);
  assert.match(mainSource, /mode:activeMode/);
});

test('mode selector has compact button styling and the roadmap task is marked complete', () => {
  assert.match(cssSource, /\.modePick\{display:flex/);
  assert.match(cssSource, /\.modeOption\.active/);
  assert.match(cssSource, /\.modeOption\[aria-disabled="true"\]/);
  assert.match(roadmapSource, /- \[x\] Add a mode select screen before starting the game\./);
});
