import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../web/src/core/random.js';
import { makeId, randomPlayerStart, randomPoint, WORLD_RADIUS } from '../web/src/world/spawners.js';

test('randomPoint produces deterministic points inside requested ring', () => {
  const a = randomPoint(new SeededRandom('spawn'), 4, 8);
  const b = randomPoint(new SeededRandom('spawn'), 4, 8);
  const radius = Math.hypot(a.x, a.z);
  assert.deepEqual(a, b);
  assert.ok(radius >= 4);
  assert.ok(radius <= 8);
});

test('randomPlayerStart stays inside playable world', () => {
  const start = randomPlayerStart(new SeededRandom('player-start'));
  const radius = Math.hypot(start.x, start.z);
  assert.ok(radius >= 4);
  assert.ok(radius <= WORLD_RADIUS - 8);
});

test('makeId creates stable padded ids', () => {
  assert.equal(makeId('trash', 3), 'trash-003');
});

