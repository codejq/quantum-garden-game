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

test('active patch gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const patchPos=new THREE\.Vector3\(Math\.cos\(a\)\*r,0,Math\.sin\(a\)\*r\)/);
  assert.match(source, /scene\.add\(g\);patches\.push\(\{pos:patchPos,mesh:g,ring,planted:false,tree:null,grow:0\}\)/);
  assert.match(source, /p\.tree\.position\.copy\(p\.pos\)/);
  assert.match(source, /this\.addScore\(25,p\.pos\.clone\(\)\.add\(new THREE\.Vector3\(0,2,0\)\)\)/);
  assert.match(source, /burst\(p\.pos\.clone\(\)\.setY\(1\),0x9ef01a/);
  assert.match(source, /p\.mesh\.position\.copy\(p\.pos\)/);
  assert.match(source, /if\(p\.pos\.distanceTo\(player\.pos\)<2\.2\)Game\.nearPatch=p/);
  assert.match(source, /patches:nearestList\(patches,'patch',p=>p\.pos/);
});

test('active villain gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const villainPos=new THREE\.Vector3\(Math\.cos\(a\)\*r,0,Math\.sin\(a\)\*r\)/);
  assert.match(source, /const v=\{pos:villainPos,mesh:m,boss,hp:boss\?3:1,state:'walk'/);
  assert.match(source, /const toP=player\.pos\.clone\(\)\.sub\(v\.pos\)/);
  assert.match(source, /const dir=v\.target\.clone\(\)\.sub\(v\.pos\);dir\.y=0/);
  assert.match(source, /v\.pos\.addScaledVector\(dir,v\.speed\*dt\)/);
  assert.match(source, /v\.mesh\.position\.copy\(v\.pos\)/);
  assert.match(source, /const dropResult=inD<WORLD_R\?spawnTrash\(v\.pos\)/);
  assert.match(source, /const dist=v\.pos\.distanceTo\(player\.pos\)/);
  assert.match(source, /burst\(v\.pos\.clone\(\)\.setY\(1\.2\)/);
  assert.match(source, /Game\.addScore\(100,v\.pos\.clone\(\)\.setY\(2\.5\)\)/);
  assert.match(source, /v\.target\.copy\(v\.pos\)\.add\(away\)/);
  assert.match(source, /villains:nearestList\(villains,'villain',v=>v\.pos/);
});

test('active browser does not keep authoritative interaction positions only on meshes', () => {
  assert.match(source, /player=\{mesh:buildNaqi\(\),pos:new THREE\.Vector3/);
  assert.match(source, /trash\.push\(\{pos:trashPos,mesh:m\}\)/);
  assert.match(source, /patches\.push\(\{pos:patchPos,mesh:g/);
  assert.match(source, /const v=\{pos:villainPos,mesh:m/);
  assert.doesNotMatch(source, /t\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /p\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /v\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /nearestList\(trash,'trash',t=>t\.mesh\.position/);
  assert.doesNotMatch(source, /nearestList\(patches,'patch',p=>p\.mesh\.position/);
  assert.doesNotMatch(source, /nearestList\(villains,'villain',v=>v\.mesh\.position/);
});

test('active browser syncs mesh transforms from gameplay data in one render step', () => {
  const syncSource = source.slice(source.indexOf('function syncGameplayMeshes'));
  const playerUpdateSource = source.slice(source.indexOf('function playerUpdate'), source.indexOf('function villainsUpdate'));
  const villainsUpdateSource = source.slice(source.indexOf('function villainsUpdate'), source.indexOf('function trashUpdate'));
  const trashUpdateSource = source.slice(source.indexOf('function trashUpdate'), source.indexOf('function patchesUpdate'));
  const patchesUpdateSource = source.slice(source.indexOf('function patchesUpdate'), source.indexOf('function syncGameplayMeshes'));

  assert.match(syncSource, /player\.mesh\.position\.copy\(player\.pos\)/);
  assert.match(syncSource, /v\.mesh\.position\.copy\(v\.pos\)/);
  assert.match(syncSource, /t\.mesh\.position\.copy\(t\.pos\)/);
  assert.match(syncSource, /p\.mesh\.position\.copy\(p\.pos\)/);
  assert.match(source, /tickGameplay\(dt,time\);\s*syncGameplayMeshes\(dt,time\);/);

  assert.doesNotMatch(playerUpdateSource, /player\.mesh\.position\.copy/);
  assert.doesNotMatch(villainsUpdateSource, /v\.mesh\.position\.copy/);
  assert.doesNotMatch(trashUpdateSource, /t\.mesh\.position\.copy/);
  assert.doesNotMatch(patchesUpdateSource, /p\.mesh\.position\.copy/);
});
