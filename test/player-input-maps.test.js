import test from 'node:test';
import assert from 'node:assert/strict';
import { inputMapFor, inputVector, isPlantInput, PLAYER_INPUT_MAPS } from '../web/src/input/player-maps.js';

test('future real-time race defines separate input maps for two players', () => {
  assert.deepEqual(PLAYER_INPUT_MAPS.player1.moveUp, ['KeyW', 'ArrowUp']);
  assert.deepEqual(PLAYER_INPUT_MAPS.player1.plant, ['Space', 'KeyE']);
  assert.deepEqual(PLAYER_INPUT_MAPS.player2.moveUp, ['KeyI', 'Numpad8']);
  assert.deepEqual(PLAYER_INPUT_MAPS.player2.plant, ['Enter', 'Numpad0']);
});

test('player input maps produce independent movement vectors', () => {
  assert.deepEqual(inputVector({ KeyW: true }, inputMapFor('player1')), { x: 0, z: -1 });
  assert.deepEqual(inputVector({ KeyI: true }, inputMapFor('player2')), { x: 0, z: -1 });
  assert.deepEqual(inputVector({ KeyW: true }, inputMapFor('player2')), { x: 0, z: 0 });
  assert.deepEqual(inputVector({ KeyI: true }, inputMapFor('player1')), { x: 0, z: 0 });
});

test('player input maps keep planting actions separate', () => {
  assert.equal(isPlantInput('Space', inputMapFor('player1')), true);
  assert.equal(isPlantInput('Enter', inputMapFor('player1')), false);
  assert.equal(isPlantInput('Enter', inputMapFor('player2')), true);
  assert.equal(isPlantInput('Space', inputMapFor('player2')), false);
});
