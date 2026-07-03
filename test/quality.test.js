import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSave, saveGame } from '../web/src/core/storage.js';
import {
  applyRendererQuality,
  chooseDefaultQuality,
  getQualityPreset,
  isQualityName,
  prefersReducedMotion,
  readQualitySetting,
  writeQualitySetting,
} from '../web/src/settings/quality.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('quality defaults are conservative for mobile or high pixel ratio', () => {
  assert.equal(chooseDefaultQuality({ isMobile: true, devicePixelRatio: 1 }), 'low');
  assert.equal(chooseDefaultQuality({ isMobile: false, devicePixelRatio: 3 }), 'low');
  assert.equal(chooseDefaultQuality({ isMobile: false, devicePixelRatio: 1 }), 'high');
});

test('quality preset fallback returns high quality', () => {
  assert.equal(getQualityPreset('missing').maxPixelRatio, 2);
  assert.equal(isQualityName('low'), true);
  assert.equal(isQualityName('missing'), false);
});

test('applyRendererQuality updates pixel ratio and shadows', () => {
  const calls = [];
  const renderer = {
    shadowMap: { enabled: true },
    setPixelRatio: (value) => calls.push(value),
  };
  const preset = applyRendererQuality(renderer, 'low');
  assert.equal(preset.shadows, false);
  assert.equal(renderer.shadowMap.enabled, false);
  assert.equal(calls[0], 1);
});

test('prefersReducedMotion reads media query result', () => {
  assert.equal(prefersReducedMotion(() => ({ matches: true })), true);
  assert.equal(prefersReducedMotion(() => ({ matches: false })), false);
});

test('quality setting can be read, validated, and saved through local storage', () => {
  const storage = memoryStorage();
  assert.equal(readQualitySetting({ quality: 'low' }), 'low');
  assert.equal(readQualitySetting({ quality: 'tiny' }), 'high');

  const saved = writeQualitySetting(storage, 'low', { loadSave, saveGame });
  assert.equal(saved.quality, 'low');
  assert.equal(loadSave(storage).quality, 'low');
  assert.throws(() => writeQualitySetting(storage, 'tiny', { loadSave, saveGame }), /Unknown quality preset/);
});
