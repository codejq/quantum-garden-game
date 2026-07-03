import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../web/src/core/session.js';
import {
  buildAttempt,
  createAttempt,
  exitAttempt,
  pauseAttempt,
  resumeAttempt,
  serializeAttempt,
  setMoveInput,
  startAttempt,
  stepAttempt,
  teardownAttempt,
} from '../web/src/core/simulation.js';

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

test('createAttempt can use authored level spawn rules', () => {
  const attempt = createAttempt({
    level: 99,
    seed: 'authored-rules',
    spawnRules: { trash: 2, patches: 1, minionQuota: 7 },
  });

  assert.equal(attempt.trash.length, 2);
  assert.equal(attempt.patches.length, 1);
  assert.equal(attempt.quota, 7);
});

test('interactive simulation objects expose stable ids', () => {
  const attempt = createAttempt({ level: 1, seed: 'stable-ids', spawnRules: { trash: 2, patches: 2, minionQuota: 1 } });
  startAttempt(attempt);
  attempt.bossSpawnTimer = 0;
  attempt.spawnTimer = 0;
  stepAttempt(attempt, 1 / 60);
  const snapshot = serializeAttempt(attempt);

  assert.equal(snapshot.player.id, 'player-001');
  assert.deepEqual(
    snapshot.trash.map((item) => item.id),
    ['trash-001', 'trash-002'],
  );
  assert.deepEqual(
    snapshot.patches.map((patch) => patch.id),
    ['patch-001', 'patch-002'],
  );
  assert.ok(snapshot.villains.some((villain) => villain.id === 'boss-001' && villain.boss));
  assert.ok(snapshot.villains.some((villain) => villain.id === 'villain-001' && !villain.boss));
});

test('same seed preserves serialized interactive ids', () => {
  const a = serializeAttempt(createAttempt({ level: 2, seed: 'id-replay' }));
  const b = serializeAttempt(createAttempt({ level: 2, seed: 'id-replay' }));

  assert.equal(a.player.id, b.player.id);
  assert.deepEqual(
    a.trash.map((item) => item.id),
    b.trash.map((item) => item.id),
  );
  assert.deepEqual(
    a.patches.map((patch) => patch.id),
    b.patches.map((patch) => patch.id),
  );
});

test('attempt lifecycle records spawn, update, complete, remove, and dispose events', () => {
  const attempt = createAttempt({ level: 1, seed: 'lifecycle-events', spawnRules: { trash: 1, patches: 1, minionQuota: 1 } });
  const liveEvents = [];
  attempt.events.on('spawn', (event) => liveEvents.push(event));
  attempt.events.on('update', (event) => liveEvents.push(event));
  attempt.events.on('complete', (event) => liveEvents.push(event));

  assert.ok(attempt.lifecycle.some((event) => event.type === 'spawn' && event.id === 'player-001'));
  assert.ok(attempt.lifecycle.some((event) => event.type === 'spawn' && event.id === 'trash-001'));

  startAttempt(attempt);
  attempt.bossSpawnTimer = 0;
  attempt.spawnTimer = 0;
  attempt.player.pos.x = attempt.trash[0].pos.x;
  attempt.player.pos.z = attempt.trash[0].pos.z;
  stepAttempt(attempt, 1 / 60);

  assert.ok(liveEvents.some((event) => event.type === 'spawn' && event.id === 'boss-001'));
  assert.ok(liveEvents.some((event) => event.type === 'spawn' && event.id === 'villain-001'));
  assert.ok(liveEvents.some((event) => event.type === 'update' && event.id === 'player-001'));
  assert.ok(attempt.lifecycle.some((event) => event.type === 'remove' && event.id === 'trash-001'));

  attempt.trash = [];
  attempt.patches.forEach((patch) => {
    patch.planted = true;
  });
  attempt.treesLevel = attempt.patches.length;
  attempt.converted = attempt.quota;
  attempt.spawned = attempt.quota;
  attempt.bossSpawned = true;
  attempt.boss = null;
  attempt.villains = [];
  stepAttempt(attempt, 1 / 60);

  assert.equal(attempt.status, 'complete');
  assert.ok(attempt.lifecycle.some((event) => event.type === 'complete' && event.kind === 'attempt'));

  const removed = teardownAttempt(attempt);
  assert.ok(removed.includes('patch-001'));
  assert.ok(attempt.lifecycle.some((event) => event.type === 'dispose' && event.id === 'patch-001'));
});

test('simulation can step without DOM, canvas, or WebGL', () => {
  const session = new GameSession({ level: 1, seed: 'headless' });
  session.start();
  const before = session.snapshot().player.x;
  session.setMove(1, 0);
  session.run(1);
  const snapshot = session.snapshot();
  assert.equal(snapshot.status, 'running');
  assert.ok(snapshot.player.x > before);
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

test('level attempt can build, play, teardown, dispose, and rebuild from a seed', () => {
  const first = createAttempt({ level: 2, seed: 'full-lifecycle' });
  const firstLayout = serializeAttempt(first);
  startAttempt(first);
  setMoveInput(first, 1, 0);
  stepAttempt(first, 1 / 60);
  const played = serializeAttempt(first);
  assert.equal(played.status, 'running');
  assert.notEqual(played.elapsed, firstLayout.elapsed);

  const removed = teardownAttempt(first);
  assert.equal(first.status, 'disposed');
  assert.ok(removed.length > 0);

  const rebuilt = createAttempt({ level: 2, seed: 'full-lifecycle' });
  const rebuiltLayout = serializeAttempt(rebuilt);
  assert.deepEqual(rebuiltLayout.trash, firstLayout.trash);
  assert.deepEqual(rebuiltLayout.patches, firstLayout.patches);
  assert.deepEqual(rebuiltLayout.decor, firstLayout.decor);
});

test('completed run can be replayed from the same seed and action script', () => {
  const spawnRules = { trash: 1, patches: 1, minionQuota: 0, bossRequired: false };
  const playScript = (attempt) => {
    startAttempt(attempt);

    attempt.player.pos.x = attempt.trash[0].pos.x;
    attempt.player.pos.z = attempt.trash[0].pos.z;
    stepAttempt(attempt, 1 / 60);

    attempt.player.pos.x = attempt.patches[0].pos.x;
    attempt.player.pos.z = attempt.patches[0].pos.z;
    attempt.input.plant = true;
    stepAttempt(attempt, 1 / 60);

    return serializeAttempt(attempt);
  };

  const first = createAttempt({ level: 1, seed: 'completed-replay', spawnRules });
  const replay = createAttempt({ level: 1, seed: 'completed-replay', spawnRules });
  const firstResult = playScript(first);
  const replayResult = playScript(replay);

  assert.equal(firstResult.status, 'complete');
  assert.deepEqual(replayResult, firstResult);
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

test('attempt lifecycle hooks start, pause, resume, exit, and teardown', () => {
  const attempt = buildAttempt({ level: 1, seed: 'lifecycle' });
  startAttempt(attempt);
  assert.equal(attempt.status, 'running');
  pauseAttempt(attempt);
  assert.equal(attempt.status, 'paused');
  resumeAttempt(attempt);
  assert.equal(attempt.status, 'running');
  attempt.input.moveX = 1;
  exitAttempt(attempt);
  assert.equal(attempt.status, 'exited');
  assert.equal(attempt.input.moveX, 0);
  teardownAttempt(attempt);
  assert.equal(attempt.status, 'disposed');
});
