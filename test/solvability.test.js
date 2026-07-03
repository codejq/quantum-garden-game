import test from 'node:test';
import assert from 'node:assert/strict';
import { createAttempt } from '../web/src/core/simulation.js';
import {
  assertSolvableAttempt,
  generateSolvableAttempt,
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
