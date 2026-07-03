import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../web/src/core/session.js';
import { createAttempt, serializeAttempt, startAttempt, stepAttempt, teardownAttempt } from '../web/src/core/simulation.js';

test('same seed creates the same attempt layout', () => {
  const a = serializeAttempt(createAttempt({ level: 2, seed: 'garden-1' }));
  const b = serializeAttempt(createAttempt({ level: 2, seed: 'garden-1' }));
  assert.deepEqual(a.trash, b.trash);
  assert.deepEqual(a.patches, b.patches);
  assert.deepEqual(a.decor, b.decor);
});

test('different seeds create different attempt layouts', () => {
  const a = serializeAttempt(createAttempt({ level: 2, seed: 'garden-1' }));
  const b = serializeAttempt(createAttempt({ level: 2, seed: 'garden-2' }));
  assert.notDeepEqual(a.trash, b.trash);
  assert.notDeepEqual(a.patches, b.patches);
});

test('simulation can step without DOM, canvas, or WebGL', () => {
  const session = new GameSession({ level: 1, seed: 'headless' });
  session.start();
  session.setMove(1, 0);
  session.run(1);
  const snapshot = session.snapshot();
  assert.equal(snapshot.status, 'running');
  assert.ok(snapshot.player.x > 6);
});

test('fixed total time produces the same result with different frame slices', () => {
  const oneTick = createAttempt({ level: 1, seed: 'frame-rate' });
  const twoTicks = createAttempt({ level: 1, seed: 'frame-rate' });
  startAttempt(oneTick);
  startAttempt(twoTicks);
  oneTick.input.moveX = 1;
  twoTicks.input.moveX = 1;

  for (let i = 0; i < 60; i += 1) stepAttempt(oneTick, 1 / 60);
  for (let i = 0; i < 30; i += 1) stepAttempt(twoTicks, 1 / 30);

  assert.equal(serializeAttempt(oneTick).player.x, serializeAttempt(twoTicks).player.x);
  assert.equal(serializeAttempt(oneTick).player.z, serializeAttempt(twoTicks).player.z);
});

test('teardown removes attempt-owned objects and marks the attempt disposed', () => {
  const attempt = createAttempt({ level: 1, seed: 'dispose-me' });
  const before = attempt.trash.length + attempt.patches.length + attempt.decor.length;
  const removed = teardownAttempt(attempt);
  assert.equal(attempt.status, 'disposed');
  assert.equal(attempt.trash.length, 0);
  assert.equal(attempt.patches.length, 0);
  assert.equal(attempt.decor.length, 0);
  assert.equal(removed.length, before);
});

test('GameSession supports levelId and retrying from a new seed', () => {
  const session = new GameSession({ levelId: 3, seed: 'first' });
  const first = session.snapshot();
  session.retry('second');
  const second = session.snapshot();

  assert.equal(session.levelId, 3);
  assert.equal(second.level, 3);
  assert.notDeepEqual(first.trash, second.trash);
});
