import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active boss spawn is driven by gameplay time instead of setTimeout', () => {
  assert.doesNotMatch(source, /bossTimer/);
  assert.doesNotMatch(source, /setTimeout\(\(\)=>\{this\.bossTimer/);
  assert.match(source, /bossDelay:0/);
  assert.match(source, /this\.bossDelay=4/);
  assert.match(source, /updateTimers\(dt\)/);
  assert.match(source, /Game\.updateTimers\(dt\);\s*playerUpdate\(dt\)/);
});

test('active elapsed and best time are recorded on completion', () => {
  assert.match(source, /function formatTime\(seconds\)/);
  assert.match(source, /cleanGarden\.best\.single\.level/);
  assert.match(source, /function recordBestTime\(level,seconds\)/);
  assert.match(source, /this\.elapsed\+=dt/);
  assert.match(source, /recordBestTime\(this\.level,this\.elapsed\)/);
  assert.match(source, /\$\('stTime'\)\.textContent=formatTime\(this\.elapsed\)/);
  assert.match(source, /\$\('stBest'\)\.textContent=formatTime\(result\.best\)/);
});
