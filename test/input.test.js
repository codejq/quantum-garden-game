import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlantKey, keyboardVector } from '../web/src/input/keyboard.js';
import { createMouseInput } from '../web/src/input/mouse.js';
import { joystickVector } from '../web/src/input/touch.js';

function target() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) {
      listeners.set(type, fn);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    emit(type, event = {}) {
      listeners.get(type)?.(event);
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

test('keyboardVector maps WASD and arrows to normalized movement', () => {
  assert.deepEqual(keyboardVector({ KeyW: true }), { x: 0, z: -1 });
  const diagonal = keyboardVector({ KeyW: true, KeyD: true });
  assert.equal(Number(diagonal.x.toFixed(3)), 0.707);
  assert.equal(Number(diagonal.z.toFixed(3)), -0.707);
  assert.equal(isPlantKey('Space'), true);
  assert.equal(isPlantKey('KeyE'), true);
});

test('mouse input emits camera and interaction actions', () => {
  const el = target();
  const events = [];
  const dispose = createMouseInput(el, {
    cameraRotate: (event) => events.push(['rotate', event.dx, event.dy]),
    cameraZoom: (event) => events.push(['zoom', event.delta]),
    interact: (event) => events.push(['interact', event.x, event.y]),
  });

  el.emit('pointerdown', { clientX: 10, clientY: 20 });
  el.emit('pointermove', { clientX: 13, clientY: 25 });
  el.emit('wheel', { deltaY: 100 });
  el.emit('click', { clientX: 4, clientY: 5 });
  dispose();

  assert.deepEqual(events, [
    ['rotate', 3, 5],
    ['zoom', 100],
    ['interact', 4, 5],
  ]);
  assert.equal(el.listenerCount(), 0);
});

test('joystickVector clamps touch position inside joystick bounds', () => {
  const vector = joystickVector({ clientX: 200, clientY: 50 }, { left: 0, top: 0, width: 100, height: 100 });
  assert.ok(vector.x <= 1);
  assert.equal(Number(Math.hypot(vector.x, vector.z).toFixed(3)), 1);
});

