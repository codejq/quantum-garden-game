import test from 'node:test';
import assert from 'node:assert/strict';
import { generatedLevel, getLevel, listLevels, registerLevel } from '../web/src/levels/level-registry.js';
import { getMode, listModes, registerMode } from '../web/src/modes/mode-registry.js';

test('level registry exposes the first level and supports registration', () => {
  assert.equal(getLevel('level-001').id, 'level-001');
  assert.deepEqual(
    listLevels()
      .filter((level) => level.id.startsWith('level-'))
      .map((level) => level.id),
    ['level-001', 'level-002', 'level-003'],
  );
  assert.deepEqual(getLevel('level-003').spawnRules, { trash: 18, patches: 5, minionQuota: 4 });
  registerLevel({ id: 'test-level', difficulty: 99 });
  assert.equal(getLevel('test-level').difficulty, 99);
  assert.ok(listLevels().some((level) => level.id === 'level-001'));
});

test('level registry generates levels after authored levels', () => {
  const generated = getLevel('level-004');

  assert.equal(generated.id, 'level-004');
  assert.equal(generated.difficulty, 4);
  assert.equal(generated.randomization.generated, true);
  assert.deepEqual(generated.spawnRules, { trash: 21, patches: 6, minionQuota: 5 });
  assert.equal(generatedLevel('level-003'), null);
  assert.throws(() => getLevel('bonus-stage'), /Unknown level/);
});

test('mode registry exposes single-player and supports registration', () => {
  assert.equal(getMode('single-player').id, 'single-player');
  registerMode({ id: 'test-mode' });
  assert.equal(getMode('test-mode').id, 'test-mode');
  assert.ok(listModes().some((mode) => mode.id === 'single-player'));
});

test('single-player mode can setup and start a headless session', () => {
  const mode = getMode('single-player');
  const context = mode.setup({ levelId: 'level-001', seed: 'mode-seed' });
  mode.start(context);
  mode.update(context, 1 / 60);
  const results = mode.getResults(context);

  assert.equal(context.level.id, 'level-001');
  assert.equal(context.session.levelId, 'level-001');
  assert.equal(context.session.level, context.level.difficulty);
  assert.equal(context.session.attempt.trash.length, context.level.spawnRules.trash);
  assert.equal(context.session.mode, 'single-player');
  assert.equal(results.mode, 'single-player');
  assert.equal(results.complete, false);
});

test('single-player mode declares the current cleanup objective set', () => {
  const mode = getMode('single-player');
  const context = mode.setup({ levelId: 'level-001', seed: 'objective-seed' });
  const objectiveIds = context.objectives.map((objective) => objective.id);

  assert.deepEqual(objectiveIds, ['trash', 'trees', 'minions', 'boss']);
  assert.ok(context.objectives.every((objective) => typeof objective.done === 'function'));
  assert.ok(context.objectives.every((objective) => typeof objective.value === 'function'));
});

test('single-player mode completes when all cleanup objectives are satisfied', () => {
  const mode = getMode('single-player');
  const context = mode.setup({ levelId: 'level-001', seed: 'single-player-win' });
  mode.start(context);
  const attempt = context.session.attempt;
  const scoreBeforeCompletion = attempt.score;

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

  mode.update(context, 1 / 60);
  const results = mode.getResults(context);

  assert.equal(mode.isComplete(context), true);
  assert.equal(results.complete, true);
  assert.equal(results.trees, attempt.patches.length);
  assert.ok(results.score > scoreBeforeCompletion);
});
