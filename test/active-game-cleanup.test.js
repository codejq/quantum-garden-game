import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active level start tears down previous gameplay objects', () => {
  assert.match(source, /function cleanupLevelAttempt\(\)/);
  assert.match(source, /Game.state\.trash\.forEach\(t=>removeAttemptObject\(trashMesh\(t\)\)\)/);
  assert.match(source, /Game.state\.villains\.forEach\(v=>removeAttemptObject\(villainView\(v\)\?\.mesh\)\)/);
  assert.match(source, /const view=patchView\(p\);\s*removeAttemptObject\(view\?\.tree\);\s*removeAttemptObject\(view\?\.mesh\);/);
  assert.match(source, /cleanupLevelAttempt\(\);\s*cleanupDecorativeWorld\(\);\s*buildDecorativeWorld\(\);\s*this\.level=n/);
});

test('active gameplay disposes collected and converted objects when they leave play', () => {
  assert.match(source, /removeTrashView\(t\);Game.state\.trash\.splice\(i,1\)/);
  assert.match(source, /removeVillainView\(v\);Game.state\.villains\.splice\(i,1\)/);
  assert.doesNotMatch(source, /scene\.remove\(trashMesh\(t\)\);Game.state\.trash\.splice\(i,1\)/);
  assert.doesNotMatch(source, /scene\.remove\(villainView\(v\)\?\.mesh\);Game.state\.villains\.splice\(i,1\)/);
});

test('active game keeps level tree count separate from lifetime count', () => {
  assert.match(source, /trees:0,lifetimeTrees:0/);
  assert.match(source, /this\.trees=0/);
  assert.match(source, /this\.trees\+\+;this\.lifetimeTrees\+\+/);
});

test('active trash spawns report cap failures explicitly', () => {
  assert.match(source, /if\(Game.state\.trash\.length>=45\)return \{ spawned:false, reason:'cap' \}/);
  assert.match(source, /return \{ spawned:true \}/);
  assert.match(source, /dropResult\.spawned/);
});

test('active trash gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const trashPos=plainPos\(\)/);
  assert.match(source, /const trashMeshes=new WeakMap\(\)/);
  assert.match(source, /function setTrashMesh\(item,mesh\)\{trashMeshes\.set\(item,mesh\);return item;\}/);
  assert.match(source, /const item=\{pos:trashPos,spin:random\(\)\*Math\.PI\*2\}/);
  assert.match(source, /createTrashView\(item\)/);
  assert.match(source, /if\(plainDistance\(t\.pos,Game.state\.player\.pos\)<1\.35\)/);
  assert.match(source, /burst\(plainToVector\(t\.pos,\s*\.6\)/);
  assert.match(source, /Game\.addScore\(10,plainToVector\(t\.pos,1\.4\)\)/);
  assert.match(source, /trash:nearestList\(Game.state\.trash,'trash',t=>t\.pos/);
});

test('active patch gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const patchPos=plainPos\(Math\.cos\(a\)\*r,0,Math\.sin\(a\)\*r\)/);
  assert.match(source, /const patch=\{pos:patchPos,planted:false,grow:0\}/);
  assert.match(source, /createPatchView\(patch\)/);
  assert.match(source, /Game.state\.patches\.push\(patch\)/);
  assert.match(source, /function plantPatchView\(patch\)\{/);
  assert.match(source, /plantPatchView\(p\)/);
  assert.match(source, /setObjectPosition\(view\.tree,p\.pos\)/);
  assert.match(source, /this\.addScore\(25,plainToVector\(p\.pos,2\)\)/);
  assert.match(source, /burst\(plainToVector\(p\.pos,1\),0x9ef01a/);
  assert.match(source, /setObjectPosition\(view\.mesh,p\.pos\)/);
  assert.match(source, /if\(plainDistance\(p\.pos,Game.state\.player\.pos\)<2\.2\)Game\.nearPatch=p/);
  assert.match(source, /patches:nearestList\(Game.state\.patches,'patch',p=>p\.pos/);
});

test('active villain gameplay reads plain position data instead of mesh-owned state', () => {
  assert.match(source, /const villainPos=plainPos\(Math\.cos\(a\)\*r,0,Math\.sin\(a\)\*r\)/);
  assert.match(source, /const villainViews=new WeakMap\(\)/);
  assert.match(source, /function setVillainView\(villain,view\)\{villainViews\.set\(villain,view\);return villain;\}/);
  assert.match(source, /const v=\{pos:villainPos,boss,hp:boss\?3:1,state:'walk'/);
  assert.match(source, /createVillainView\(v\)/);
  assert.match(source, /const toPlayerX=Game.state\.player\.pos\.x-v\.pos\.x,toPlayerZ=Game.state\.player\.pos\.z-v\.pos\.z/);
  assert.match(source, /const dirX=v\.target\.x-v\.pos\.x,dirZ=v\.target\.z-v\.pos\.z/);
  assert.match(source, /v\.pos\.x\+=nx\*v\.speed\*dt;v\.pos\.z\+=nz\*v\.speed\*dt/);
  assert.match(source, /setObjectPosition\(mesh,v\.pos\)/);
  assert.match(source, /const dropResult=inD<WORLD_R\?spawnTrash\(v\.pos\)/);
  assert.match(source, /const dist=plainDistance\(v\.pos,Game.state\.player\.pos\)/);
  assert.match(source, /burst\(plainToVector\(v\.pos,1\.2\)/);
  assert.match(source, /Game\.addScore\(100,plainToVector\(v\.pos,2\.5\)\)/);
  assert.match(source, /v\.target\.x=v\.pos\.x\+\(awayX\/awayLen\)\*9/);
  assert.match(source, /villains:nearestList\(Game.state\.villains,'villain',v=>v\.pos/);
});

test('active browser does not keep authoritative interaction positions only on meshes', () => {
  assert.match(source, /function createActiveGameplayState\(\)/);
  assert.match(source, /player:\{pos:plainPos\(6,0,6\),vel:plainPos\(0,0,0\),yaw:0,anim:0\}/);
  assert.match(source, /const Game=createActiveGameRuntime\(createActiveGameplayState\(\)\)/);
  assert.doesNotMatch(source, /\bconst player=\{/);
  assert.doesNotMatch(source, /\bconst trash=\[\]/);
  assert.doesNotMatch(source, /\bconst patches=\[\]/);
  assert.doesNotMatch(source, /\bconst villains=\[\]/);
  assert.doesNotMatch(source, /\blet mtermish=/);
  assert.doesNotMatch(source, /Game\.state\.[^\n]*(new THREE\.Vector3|\.clone\(|\.distanceTo\(|\.copy\(|\.set\(|addScaledVector|normalize\()/);
  assert.match(source, /const playerMesh=buildNaqi\(\)/);
  assert.doesNotMatch(source, /player=\{[^}]*mesh/);
  assert.match(source, /Game.state\.trash\.push\(item\)/);
  assert.doesNotMatch(source, /trash\.push\(\{[^}]*mesh/);
  assert.match(source, /Game.state\.patches\.push\(patch\)/);
  assert.doesNotMatch(source, /patches\.push\(\{[^}]*mesh/);
  assert.match(source, /Game.state\.villains\.push\(v\)/);
  assert.doesNotMatch(source, /const v=\{[^}]*mesh/);
  assert.doesNotMatch(source, /villains\.push\(\{[^}]*mesh/);
  assert.doesNotMatch(source, /t\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /p\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /v\.mesh\.position\.distanceTo\(player\.pos\)/);
  assert.doesNotMatch(source, /nearestList\(trash,'trash',t=>t\.mesh\.position/);
  assert.doesNotMatch(source, /nearestList\(patches,'patch',p=>p\.mesh\.position/);
  assert.doesNotMatch(source, /nearestList\(villains,'villain',v=>v\.mesh\.position/);
});

test('active browser creates Three.js meshes through render view helpers', () => {
  assert.match(source, /function createTrashView\(item\)\{/);
  assert.match(source, /function createPatchView\(patch\)\{/);
  assert.match(source, /function createVillainView\(villain\)\{/);
  assert.match(source, /function removeTrashView\(item\)\{/);
  assert.match(source, /function removeVillainView\(villain\)\{/);
  assert.match(source, /function convertVillainView\(villain\)\{/);
  const spawnTrashSource = source.slice(source.indexOf('function spawnTrash'), source.indexOf('function spawnPatch'));
  const spawnPatchSource = source.slice(source.indexOf('function spawnPatch'), source.indexOf('function spawnVillain'));
  const spawnVillainSource = source.slice(source.indexOf('function spawnVillain'), source.indexOf('function newTarget'));

  assert.doesNotMatch(spawnTrashSource, /new THREE\.(Mesh|Group|Geometry|Material)/);
  assert.doesNotMatch(spawnTrashSource, /scene\.add/);
  assert.match(spawnTrashSource, /createTrashView\(item\)/);

  assert.doesNotMatch(spawnPatchSource, /new THREE\.(Mesh|Group|Geometry|Material)/);
  assert.doesNotMatch(spawnPatchSource, /scene\.add/);
  assert.match(spawnPatchSource, /createPatchView\(patch\)/);

  assert.doesNotMatch(spawnVillainSource, /buildMtermish|buildMinion|scene\.add/);
  assert.match(spawnVillainSource, /createVillainView\(v\)/);
});

test('active browser treats runtime state as gameplay source of truth', () => {
  const playerUpdateSource = source.slice(source.indexOf('function playerUpdate'), source.indexOf('function villainsUpdate'));
  const villainsUpdateSource = source.slice(source.indexOf('function villainsUpdate'), source.indexOf('function trashUpdate'));
  const trashUpdateSource = source.slice(source.indexOf('function trashUpdate'), source.indexOf('function patchesUpdate'));
  const patchesUpdateSource = source.slice(source.indexOf('function patchesUpdate'), source.indexOf('function syncGameplayMeshes'));
  const missionSource = source.slice(source.indexOf('function activeMissionState'), source.indexOf('function activeObjectiveRows'));

  assert.match(source, /const Game=createActiveGameRuntime\(createActiveGameplayState\(\)\)/);
  assert.match(source, /activeMissionState\(\)\{\s*return \{\s*trash:Game.state\.trash,\s*patches:Game.state\.patches/);
  assert.match(source, /if\(plainDistance\(t\.pos,Game.state\.player\.pos\)<1\.35\)/);
  assert.match(source, /if\(plainDistance\(p\.pos,Game.state\.player\.pos\)<2\.2\)Game\.nearPatch=p/);
  assert.match(source, /const dist=plainDistance\(v\.pos,Game.state\.player\.pos\)/);
  assert.match(source, /syncGameplayMeshes\(dt,time\)/);
  for (const section of [playerUpdateSource, villainsUpdateSource, trashUpdateSource, patchesUpdateSource, missionSource]) {
    assert.doesNotMatch(section, /(trashMesh|patchView|villainView|scene\.|new THREE\.(Mesh|Group|Geometry|Material))/);
  }
});

test('active browser runtime is created from an instantiable state owner', () => {
  assert.match(source, /function createActiveGameRuntime\(state\)\{/);
  assert.match(source, /return \{\s*state,status:'menu',running:false/);
  assert.match(source, /const Game=createActiveGameRuntime\(createActiveGameplayState\(\)\)/);
  assert.doesNotMatch(source, /const Game=\{/);
  assert.match(source, /setPlainPos\(this\.state\.player\.pos,6,0,6\)/);
  assert.match(source, /const total=this\.state\.trash\.length\*3\+this\.state\.villains\.length\*9\+this\.state\.patches\.filter/);
  assert.match(source, /bossDefeated\(\)\{return this\.spawnedBoss&&\(!this\.state\.mtermish\);\}/);
  assert.match(source, /if\(this\.state\.trash\.length===0&&this\.state\.patches\.every/);
});

test('active browser syncs mesh transforms from gameplay data in one render step', () => {
  const syncSource = source.slice(source.indexOf('function syncGameplayMeshes'));
  const playerUpdateSource = source.slice(source.indexOf('function playerUpdate'), source.indexOf('function villainsUpdate'));
  const tryPlantSource = source.slice(source.indexOf('  tryPlant(){'), source.indexOf('  addScore(v,pos)'));
  const villainsUpdateSource = source.slice(source.indexOf('function villainsUpdate'), source.indexOf('function trashUpdate'));
  const trashUpdateSource = source.slice(source.indexOf('function trashUpdate'), source.indexOf('function patchesUpdate'));
  const patchesUpdateSource = source.slice(source.indexOf('function patchesUpdate'), source.indexOf('function syncGameplayMeshes'));

  assert.match(syncSource, /setObjectPosition\(playerMesh,Game.state\.player\.pos\)/);
  assert.match(syncSource, /const view=villainView\(v\)/);
  assert.match(syncSource, /setObjectPosition\(mesh,v\.pos\)/);
  assert.match(syncSource, /const mesh=trashMesh\(t\)/);
  assert.match(syncSource, /setObjectPosition\(mesh,t\.pos\)/);
  assert.match(syncSource, /const view=patchView\(p\)/);
  assert.match(syncSource, /setObjectPosition\(view\.mesh,p\.pos\)/);
  assert.match(source, /tickGameplay\(dt,time\);\s*syncGameplayMeshes\(dt,time\);/);

  assert.doesNotMatch(playerUpdateSource, /player\.mesh\.position\.copy/);
  assert.doesNotMatch(tryPlantSource, /makeTree\(\)/);
  assert.doesNotMatch(tryPlantSource, /scene\.add/);
  assert.doesNotMatch(villainsUpdateSource, /v\.mesh\.position\.copy/);
  assert.doesNotMatch(trashUpdateSource, /t\.mesh\.position\.copy/);
  assert.doesNotMatch(patchesUpdateSource, /p\.mesh\.position\.copy/);
});

