import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');

test('active stylesheet uses logical inline positioning for localized layouts', () => {
  assert.doesNotMatch(cssSource, /(?:^|[;\s])(?:left|right)\s*:/);
  assert.doesNotMatch(cssSource, /(?:margin|padding|border)-(?:left|right)\b/);
  assert.doesNotMatch(cssSource, /text-align\s*:\s*(?:left|right)/);
  assert.match(cssSource, /inset-inline/);
  assert.match(cssSource, /text-align:start/);
});
