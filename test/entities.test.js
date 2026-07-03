import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayer, updatePlayer } from '../web/src/entities/player.js';
import { collectTrashItems } from '../web/src/entities/trash.js';
import { plantNearestPatch, updatePatchGrowth } from '../web/src/entities/patch.js';
import { hitVillain, moveVillainTowardTarget } from '../web/src/entities/villain.js';

test('player entity moves and updates yaw', () => {
  const player = createPlayer();
  updatePlayer(player, { moveX: 1, moveZ: 0 }, 1);
  assert.ok(player.pos.x > 6);
  assert.equal(Number(player.yaw.toFixed(3)), 1.571);
});

test('player entity preserves legacy smoothed acceleration and stopping', () => {
  const player = createPlayer({ x: 6, z: 6 });
  updatePlayer(player, { moveX: 1, moveZ: 0 }, 1 / 60);
  assert.ok(player.vel.x > 0);
  assert.ok(player.vel.x < 8);
  const movingVelocity = player.vel.x;

  updatePlayer(player, { moveX: 0, moveZ: 0 }, 1 / 60);
  assert.ok(player.vel.x > 0);
  assert.ok(player.vel.x < movingVelocity);
});

test('trash entity collection separates collected and remaining items', () => {
  const result = collectTrashItems(
    [
      { id: 'near', pos: { x: 0, z: 0 } },
      { id: 'far', pos: { x: 10, z: 10 } },
    ],
    { x: 0, z: 0 },
  );
  assert.deepEqual(result.collected.map((item) => item.id), ['near']);
  assert.deepEqual(result.remaining.map((item) => item.id), ['far']);
});

test('patch entity plants nearest patch and grows planted patches', () => {
  const patches = [{ id: 'patch-1', pos: { x: 0, z: 0 }, planted: false, grow: 0 }];
  assert.equal(plantNearestPatch(patches, { x: 0, z: 0 }).id, 'patch-1');
  updatePatchGrowth(patches, 1);
  assert.ok(patches[0].grow > 0);
});

test('villain entity moves and can be hit by player', () => {
  const villain = { id: 'v', boss: false, hp: 1, state: 'walk', pos: { x: 0, z: 0 }, target: { x: 10, z: 0 }, speed: 2 };
  assert.equal(moveVillainTowardTarget(villain, 1), true);
  assert.ok(villain.pos.x > 0);
  assert.equal(hitVillain(villain, villain.pos), true);
  assert.equal(villain.state, 'converted');
});
