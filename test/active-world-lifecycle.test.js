import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active decorative world is built through a reusable lifecycle', () => {
  assert.match(source, /const worldObjects=\[\]/);
  assert.match(source, /const WORLD_THEMES=\[/);
  assert.match(source, /function worldThemeForLevel\(level\)/);
  assert.match(source, /function buildDecorativeWorld\(level=1\)/);
  assert.match(source, /applyWorldTheme\(theme\)/);
  assert.match(source, /worldObjects\.push\(\.\.\.scatter\(Math\.round\(14\*decorScale\)/);
  assert.match(source, /worldObjects\.push\(\.\.\.scatter\(Math\.round\(theme\.flowers\*decorScale\),makeFlower/);
  assert.match(source, /worldObjects\.push\(\.\.\.scatter\(Math\.round\(theme\.trees\*decorScale\),\(\)=>themedTree\(theme\)/);
  assert.match(source, /clouds\.push\(g\);worldObjects\.push\(g\)/);
  assert.match(source, /worldObjects\.push\(landmark\)/);
});

test('active level start rebuilds and disposes decorative world objects', () => {
  assert.match(source, /function cleanupDecorativeWorld\(\)/);
  assert.match(source, /worldObjects\.forEach\(removeAttemptObject\)/);
  assert.match(source, /flowers\.length=0;\s*clouds\.length=0/);
  assert.match(source, /cleanupDecorativeWorld\(\);\s*buildDecorativeWorld\(n\);\s*this\.level=n/);
});

test('active levels increase ghost pressure as level number rises', () => {
  assert.match(source, /this\.quota=Math\.min\(18,1\+n\*2\)/);
  assert.match(source, /Game\.spawnTimer=rand\(Math\.max\(2\.5,5-Game\.level\*\.2\),Math\.max\(3\.6,8-Game\.level\*\.28\)\)/);
});
