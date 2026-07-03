import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active browser game routes random generation through seeded helpers', () => {
  assert.match(source, /function hashSeed\(seed\)/);
  assert.match(source, /function setActiveSeed\(seed\)/);
  assert.match(source, /function random\(\)/);
  assert.doesNotMatch(source, /Math\.random/);
  assert.match(source, /const rand=\(a,b\)=>a\+random\(\)\*\(b-a\)/);
  assert.match(source, /const pick=a=>a\[Math\.floor\(random\(\)\*a\.length\)\]/);
});

test('active level attempts store and expose replay seed', () => {
  assert.match(source, /seed:activeSeed/);
  assert.match(source, /const seed=setActiveSeed\(options\.seed\|\|makeAttemptSeed\(n\)\)/);
  assert.match(source, /this\.seed=seed/);
  assert.match(source, /console\.info\(`\[CleanGarden\] level \$\{n\} seed: \$\{seed\}`\)/);
  assert.match(source, /seed:Game\.seed/);
  assert.match(source, /Game\.startLevel\(Number\.isFinite\(levelId\)&&levelId>0\?levelId:1,\{ seed:options\.seed \}\)/);
  assert.match(source, /seedApplied:!!options\.seed/);
});
