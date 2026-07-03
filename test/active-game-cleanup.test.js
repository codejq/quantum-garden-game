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

test('active trash gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const trashPos=new THREE\.Vector3\(\)/);
  assert.match(source, /scene\.add\(m\);trash\.push\(\{pos:trashPos,mesh:m\}\)/);
  assert.match(source, /t\.mesh\.position\.copy\(t\.pos\)/);
  assert.match(source, /if\(t\.pos\.distanceTo\(player\.pos\)<1\.35\)/);
  assert.match(source, /burst\(t\.pos\.clone\(\)\.setY\(\.6\)/);
  assert.match(source, /Game\.addScore\(10,t\.pos\.clone\(\)\.setY\(1\.4\)\)/);
  assert.match(source, /trash:nearestList\(trash,'trash',t=>t\.pos/);
});
