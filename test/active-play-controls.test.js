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

test('active game preserves desktop and mobile play controls after the split', () => {
  assert.match(mainSource, /keys\[e\.code\]=true/);
  assert.match(mainSource, /KeyW|ArrowUp/);
  assert.match(mainSource, /\['Space','KeyE'\]\.includes\(e\.code\)/);
  assert.match(htmlSource, /id="joy"/);
  assert.match(htmlSource, /id="actBtn"/);
  assert.match(mainSource, /joyEl\.addEventListener\('touchstart'/);
  assert.match(mainSource, /\$\('actBtn'\)\.addEventListener\('touchstart'/);
  assert.match(mainSource, /\$\('actBtn'\)\.addEventListener\('click'/);
});
