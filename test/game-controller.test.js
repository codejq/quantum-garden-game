import test from 'node:test';
import assert from 'node:assert/strict';
import { GameController } from '../web/src/core/game.js';

test('GameController starts, updates, pauses, resumes, exits, and retries a mode session', () => {
  const game = new GameController({ modeId: 'single-player', levelId: 'level-001', seed: 'game-controller' });

  assert.equal(game.start().state.status, 'running');
  game.update(1 / 60);
  assert.equal(game.pause().state.status, 'paused');
  assert.equal(game.resume().state.status, 'running');
  assert.equal(game.exit().state.status, 'exited');

  const retried = game.retry('new-seed');
  assert.equal(retried.state.seed, 'new-seed');
  assert.equal(retried.state.status, 'ready');
});

