import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraController, cameraPresets } from '../web/src/camera/camera-controller.js';

test('CameraController exposes follow, close, and top-down presets', () => {
  assert.deepEqual(cameraPresets(), ['follow', 'close', 'topDown']);
  const camera = new CameraController();
  assert.equal(camera.preset, 'follow');
  camera.setPreset('close');
  assert.equal(camera.preset, 'close');
  camera.setPreset('topDown');
  assert.equal(camera.preset, 'topDown');
});

test('CameraController rotates, zooms, and resets', () => {
  const camera = new CameraController();
  const start = { ...camera.state };
  camera.rotate(20, 10);
  camera.zoom(100);
  assert.notEqual(camera.state.yaw, start.yaw);
  assert.ok(camera.state.distance > start.distance);
  camera.reset();
  assert.deepEqual(camera.state, start);
});

test('CameraController applies position and lookAt to camera-like objects', () => {
  const controller = new CameraController();
  const calls = [];
  const camera = {
    position: {
      set: (...args) => calls.push(['set', ...args]),
    },
    lookAt: (...args) => calls.push(['lookAt', ...args]),
  };

  controller.apply(camera, { x: 1, y: 0, z: 2 });

  assert.equal(calls[0][0], 'set');
  assert.deepEqual(calls[1], ['lookAt', 1, 1.2, 2]);
});
