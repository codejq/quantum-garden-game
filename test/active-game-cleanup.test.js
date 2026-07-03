import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active level start tears down previous gameplay objects', () => {
  assert.match(source, /function cleanupLevelAttempt\(\)/);
  assert.match(source, /trash\.forEach\(t=>removeAttemptObject\(t\.mesh\)\)/);
  assert.match(source, /villains\.forEach\(v=>removeAttemptObject\(v\.mesh\)\)/);
  assert.match(source, /patches\.forEach\(p=>\{\s*removeAttemptObject\(p\.tree\);\s*removeAttemptObject\(p\.mesh\);/);
  assert.match(source, /cleanupLevelAttempt\(\);\s*cleanupDecorativeWorld\(\);\s*buildDecorativeWorld\(\);\s*this\.level=n/);
});

test('active game keeps level tree count separate from lifetime count', () => {
  assert.match(source, /trees:0,lifetimeTrees:0/);
  assert.match(source, /this\.trees=0/);
  assert.match(source, /this\.trees\+\+;this\.lifetimeTrees\+\+/);
});

test('active trash spawns report cap failures explicitly', () => {
  assert.match(source, /if\(trash\.length>=45\)return \{ spawned:false, reason:'cap' \}/);
  assert.match(source, /return \{ spawned:true, mesh:m \}/);
  assert.match(source, /dropResult\.spawned/);
});
