import test from 'node:test';
import assert from 'node:assert/strict';
import { getMode } from '../web/src/modes/mode-registry.js';

function forceComplete(session, elapsed) {
  session.attempt.elapsed = elapsed;
  session.attempt.status = 'complete';
  session.attempt.score = Math.round(1000 / elapsed);
}

test('two-player race uses the same seed for both players and starts with handoff disabled', () => {
  const mode = getMode('two-player-race');
  const context = mode.setup({ levelId: 'level-001', seed: 'race-seed', playerNames: ['A', 'B'] });

  assert.equal(context.players[0].session.seed, 'race-seed');
  assert.equal(context.players[1].session.seed, 'race-seed');
  assert.equal(context.players[0].name, 'A');
  assert.equal(context.players[1].name, 'B');
  assert.equal(mode.start(context).handoff, false);
});

test('two-player race handoff hides route until the second player is ready', () => {
  const mode = getMode('two-player-race');
  const context = mode.setup({ seed: 'handoff-seed' });
  mode.start(context);
  forceComplete(context.players[0].session, 20);
  mode.update(context, 1 / 60);

  assert.equal(context.handoff, true);
  assert.equal(context.activePlayerIndex, 0);

  mode.readyNextPlayer(context);
  assert.equal(context.handoff, false);
  assert.equal(context.activePlayerIndex, 1);
  assert.equal(context.players[1].session.attempt.status, 'running');
});

test('two-player race compares completion times and reports winner', () => {
  const mode = getMode('two-player-race');
  const context = mode.setup({ seed: 'winner-seed', playerNames: ['Fast', 'Slow'] });
  mode.start(context);
  forceComplete(context.players[0].session, 12);
  context.players[0].result = mode.resultFor(context.players[0]);
  context.handoff = true;
  mode.readyNextPlayer(context);
  forceComplete(context.players[1].session, 20);
  context.players[1].result = mode.resultFor(context.players[1]);

  const results = mode.getResults(context);
  assert.equal(mode.isComplete(context), true);
  assert.equal(results.winner.name, 'Fast');
  assert.equal(results.timeDifference, 8);
});
