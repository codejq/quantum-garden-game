import test from 'node:test';
import assert from 'node:assert/strict';
import { createAttempt } from '../web/src/core/simulation.js';
import {
  assertSolvableAttempt,
  generateSolvableAttempt,
  layoutSnapshot,
  LayoutGenerationError,
  nearestReachableTarget,
  validateAttemptLayout,
} from '../web/src/levels/solvability.js';

test('generated attempts pass basic solvability checks', () => {
  const attempt = createAttempt({ level: 2, seed: 'solvable' });
  const result = validateAttemptLayout(attempt);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('solvability checks reject out-of-bounds objects', () => {
  const attempt = createAttempt({ level: 1, seed: 'bad-layout' });
  attempt.trash[0].pos = { x: 999, z: 999 };
  const result = validateAttemptLayout(attempt);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, 'object-out-of-bounds');
  assert.throws(() => assertSolvableAttempt(attempt), /Unsolvable layout/);
});

test('nearestReachableTarget returns stable target ids', () => {
  const attempt = createAttempt({ level: 1, seed: 'targets' });
  const target = nearestReachableTarget(attempt, 'trash');
  assert.equal(typeof target.id, 'string');
  assert.equal(Number.isFinite(target.distance), true);
});

test('generateSolvableAttempt retries rejected layouts', () => {
  let calls = 0;
  const attempt = generateSolvableAttempt(
    ({ level, seed }) => {
      calls += 1;
      const generated = createAttempt({ level, seed });
      if (calls === 1) generated.trash[0].pos = { x: 999, z: 999 };
      return generated;
    },
    { level: 1, seed: 'retry-layout', maxAttempts: 2 },
  );

  assert.equal(calls, 2);
  assert.equal(validateAttemptLayout(attempt).ok, true);
});

test('layoutSnapshot captures deterministic seed data for debugging', () => {
  const attempt = createAttempt({ level: 1, seed: 'snapshot-layout' });
  attempt.trash[0].pos = { x: 999, z: 999 };
  const snapshot = layoutSnapshot(attempt);

  assert.equal(snapshot.seed, 'snapshot-layout');
  assert.equal(snapshot.ok, false);
  assert.equal(snapshot.errors[0].code, 'object-out-of-bounds');
  assert.equal(snapshot.trash[0].id, attempt.trash[0].id);
  assert.equal(snapshot.trash[0].x, 999);
});

test('generateSolvableAttempt reports capped failures with layout snapshots', () => {
  assert.throws(
    () =>
      generateSolvableAttempt(
        ({ level, seed }) => {
          const generated = createAttempt({ level, seed });
          generated.patches[0].pos = { x: 999, z: 999 };
          return generated;
        },
        { level: 1, seed: 'never-solvable', maxAttempts: 3 },
      ),
    (error) => {
      assert.equal(error instanceof LayoutGenerationError, true);
      assert.equal(error.seed, 'never-solvable');
      assert.equal(error.maxAttempts, 3);
      assert.equal(error.attempts.length, 3);
      assert.deepEqual(
        error.attempts.map((attempt) => attempt.seed),
        ['never-solvable', 'never-solvable:retry-1', 'never-solvable:retry-2'],
      );
      assert.match(error.message, /Unable to generate solvable layout/);
      return true;
    },
  );
});
