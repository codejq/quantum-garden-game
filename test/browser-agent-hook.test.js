import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active browser game exposes QuantumGardenAgent hook', () => {
  assert.match(source, /window\.QuantumGardenAgent\s*=\s*Object\.freeze/);
  for (const method of ['observe', 'act', 'reset', 'step']) {
    assert.match(source, new RegExp(`${method}\\s*:`));
  }
});

test('browser agent hook is scoped to gameplay and reports demo determinism limits', () => {
  assert.match(source, /deterministic:false/);
  assert.doesNotMatch(source, /__TAURI__|invoke\(|fs\.|child_process/);
  assert.match(source, /rate_limited/);
});
