import test from 'node:test';
import assert from 'node:assert/strict';
import { FixedStepLoop } from '../web/src/core/loop.js';

test('FixedStepLoop advances using a deterministic accumulator', () => {
  const deltas = [];
  const loop = new FixedStepLoop({ tick: 0.1, maxFrameTime: 1, step: (dt) => deltas.push(dt) });

  assert.equal(loop.advance(0.05), 0);
  assert.equal(loop.advance(0.05), 1);
  assert.equal(loop.advance(0.35), 3);
  assert.deepEqual(deltas, [0.1, 0.1, 0.1, 0.1]);
});

test('FixedStepLoop clamps large frame times', () => {
  let steps = 0;
  const loop = new FixedStepLoop({ tick: 0.1, maxFrameTime: 0.25, step: () => { steps += 1; } });

  assert.equal(loop.advance(2), 2);
  assert.equal(steps, 2);
});
