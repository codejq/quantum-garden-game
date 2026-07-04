import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');

test('active game exposes fullscreen play and exit controls', () => {
  assert.match(htmlSource, /id="exitBtn"/);
  assert.match(htmlSource, /id="pauseBtn"/);
  assert.match(mainSource, /function requestFullscreen\(\)/);
  assert.match(mainSource, /requestFullscreen\(\)/);
  assert.match(mainSource, /document\.exitFullscreen/);
  assert.match(mainSource, /\$\('exitBtn'\)\.onclick=\(\)=>exitGame\(\)/);
  assert.match(cssSource, /#game\{position:fixed;inset:0\}/);
  assert.match(cssSource, /html,body\{width:100%;height:100%;overflow:hidden/);
});

test('active game can close the Tauri desktop window after confirmation', () => {
  assert.match(mainSource, /function tauriInvoke\(\)/);
  assert.match(mainSource, /window\.__TAURI__\?\.core\?\.invoke/);
  assert.match(mainSource, /async function closeTauriWindowAfterConfirm\(\)/);
  assert.match(mainSource, /window\.confirm\(`\$\{tr\('exit'\)\}\?`\)/);
  assert.match(mainSource, /await invoke\('close_window'\)/);
  assert.match(mainSource, /if\(await closeTauriWindowAfterConfirm\(\)\)return/);
});

test('active web and mobile exit returns to the main menu fallback', () => {
  assert.match(mainSource, /function showMenu\(\)/);
  assert.match(mainSource, /\$\('startOverlay'\)\.style\.display='flex'/);
  assert.match(mainSource, /\$\('joy'\)\.style\.display='none'/);
  assert.match(mainSource, /\$\('actBtn'\)\.style\.display='none'/);
  assert.match(mainSource, /showMenu\(\)/);
});

test('exit and pause controls live in the top HUD away from bottom touch controls', () => {
  assert.match(htmlSource, /<div class="hud-actions">[\s\S]*id="exitBtn"[\s\S]*id="pauseBtn"[\s\S]*id="viewBtn"[\s\S]*id="resetViewBtn"[\s\S]*<\/div>/);
  assert.match(cssSource, /\.hud-top\{position:absolute;top:10px;inset-inline:10px;display:grid/);
  assert.match(cssSource, /\.hud-actions\{display:flex/);
  assert.match(cssSource, /#pauseBtn,#exitBtn,#viewBtn,#resetViewBtn\{position:static/);
  assert.match(cssSource, /#joy\{position:fixed;bottom:max/);
  assert.match(cssSource, /#actBtn\{position:fixed;bottom:max/);
});

test('active game preserves desktop and mobile play controls after the split', () => {
  assert.match(mainSource, /keys\[e\.code\]=true/);
  assert.match(mainSource, /KeyW|ArrowUp/);
  assert.match(mainSource, /e\.code==='Space'\|\|\(!Game\.isRace\(\)&&e\.code==='KeyE'\)/);
  assert.match(mainSource, /\['Enter','NumpadEnter'\]\.includes\(e\.code\)/);
  assert.match(htmlSource, /id="joy"/);
  assert.match(htmlSource, /id="actBtn"/);
  assert.match(mainSource, /joyEl\.addEventListener\('touchstart'/);
  assert.match(mainSource, /\$\('actBtn'\)\.addEventListener\('touchstart'/);
  assert.match(mainSource, /\$\('actBtn'\)\.addEventListener\('click'/);
});
