import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active decorative world is built through a reusable lifecycle', () => {
  assert.match(source, /const worldObjects=\[\]/);
  assert.match(source, /function buildDecorativeWorld\(\)/);
  assert.match(source, /worldObjects\.push\(\.\.\.scatter\(14/);
  assert.match(source, /worldObjects\.push\(\.\.\.scatter\(70,makeFlower/);
  assert.match(source, /clouds\.push\(g\);worldObjects\.push\(g\)/);
  assert.match(source, /worldObjects\.push\(landmark\)/);
});

test('active level start rebuilds and disposes decorative world objects', () => {
  assert.match(source, /function cleanupDecorativeWorld\(\)/);
  assert.match(source, /worldObjects\.forEach\(removeAttemptObject\)/);
  assert.match(source, /flowers\.length=0;\s*clouds\.length=0/);
  assert.match(source, /cleanupDecorativeWorld\(\);\s*buildDecorativeWorld\(\);\s*this\.level=n/);
});
