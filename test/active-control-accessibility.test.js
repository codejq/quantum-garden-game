import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');

test('active browser shell labels every button control', () => {
  const buttons = [...htmlSource.matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);
  assert.ok(buttons.length > 0);
  for (const attrs of buttons) {
    assert.match(attrs, /\baria-label="/);
  }
});
