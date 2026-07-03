import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const browserModeRegistrySource = readFileSync(new URL('../web/src/modes/browser-mode-registry.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');
const roadmapSource = readFileSync(new URL('../docs/modular-offline-tauri-roadmap.md', import.meta.url), 'utf8');

test('active start overlay exposes a mode selector before starting the game', () => {
  assert.match(htmlSource, /id="modeSelect" role="radiogroup"/);
  assert.match(htmlSource, /id="singleModeBtn" data-mode="single-player"/);
  assert.match(htmlSource, /id="raceModeBtn" data-mode="two-player-race"/);
  assert.ok(htmlSource.indexOf('id="modeSelect"') < htmlSource.indexOf('id="startBtn"'));
});

test('active mode selector is localized, persisted, and reflected in browser agent observations', () => {
  assert.match(htmlSource, /<script src="src\/modes\/browser-mode-registry\.js"><\/script>/);
  assert.match(htmlSource, /<script src="src\/main\.js"><\/script>/);
  assert.match(browserModeRegistrySource, /window\.CleanGardenModes=/);
  assert.match(mainSource, /const ACTIVE_MODE_REGISTRY=window\.CleanGardenModes/);
  assert.match(mainSource, /const ACTIVE_MODE_DEFINITIONS=ACTIVE_MODE_REGISTRY\.listModes\(\)/);
  assert.match(mainSource, /mode:'Game mode'/);
  assert.match(mainSource, /singlePlayer:'Single Player'/);
  assert.match(mainSource, /twoPlayerRace:'Two Player Race'/);
  assert.match(mainSource, /let activeMode=normalizeActiveMode\(localStorage\.getItem\('cleanGarden\.mode'\)\)/);
  assert.match(mainSource, /function setActiveMode\(mode\)/);
  assert.doesNotMatch(mainSource, /mode==='two-player-race'\?'two-player-race':'single-player'/);
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

test('active browser gameplay reads objectives and scores from the selected mode', () => {
  assert.match(browserModeRegistrySource, /objectives:\[/);
  assert.match(browserModeRegistrySource, /scoring:\{/);
  assert.match(browserModeRegistrySource, /levelComplete:attempt=>50\+attempt\.level\*10/);
  assert.match(mainSource, /function currentActiveModeDefinition\(\)/);
  assert.match(mainSource, /function activeModeObjectives\(\)/);
  assert.match(mainSource, /function activeModeScore\(rule\)/);
  assert.match(mainSource, /activeObjectiveRows\(activeModeObjectives\(\),activeMissionState\(\)\)/);
  assert.match(mainSource, /this\.addScore\(activeModeScore\('levelComplete'\)\)/);
  assert.doesNotMatch(mainSource, /const activeObjectives=\[/);
  assert.doesNotMatch(mainSource, /this\.addScore\(25,plainToVector\(p\.pos,2\)\)/);
  assert.doesNotMatch(mainSource, /Game\.addScore\(10,plainToVector\(t\.pos,1\.4\)\)/);
});
