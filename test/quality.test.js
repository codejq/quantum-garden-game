import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRendererQuality, chooseDefaultQuality, getQualityPreset, prefersReducedMotion } from '../web/src/settings/quality.js';

test('quality defaults are conservative for mobile or high pixel ratio', () => {
  assert.equal(chooseDefaultQuality({ isMobile: true, devicePixelRatio: 1 }), 'low');
  assert.equal(chooseDefaultQuality({ isMobile: false, devicePixelRatio: 3 }), 'low');
  assert.equal(chooseDefaultQuality({ isMobile: false, devicePixelRatio: 1 }), 'high');
});

test('quality preset fallback returns high quality', () => {
  assert.equal(getQualityPreset('missing').maxPixelRatio, 2);
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

