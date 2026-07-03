import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');

test('active start title is rendered through i18n instead of hard-coded HTML', () => {
  assert.match(htmlSource, /<title>Clean Garden<\/title>/);
  assert.match(htmlSource, /id="gameTitle">Clean Garden<\/h1>/);
  assert.doesNotMatch(htmlSource, /الحديقة النظيفة/);
  assert.match(mainSource, /document\.title=tr\('title'\)/);
  assert.match(mainSource, /\$\('gameTitle'\)\.textContent=tr\('title'\)/);
});

test('active gameplay notification lines are locale-aware', () => {
  assert.match(mainSource, /function line\(group\)/);
  assert.doesNotMatch(mainSource, /const LINES=/);
  for (const group of ['pickup', 'plant', 'minion', 'mtermishHit', 'mtermishDown', 'mtermishTaunt', 'quotes']) {
    assert.match(mainSource, new RegExp(`${group}:\\[`));
  }
  for (const call of [
    "line\\('pickup'\\)",
    "line\\('plant'\\)",
    "line\\('minion'\\)",
    "line\\('mtermishHit'\\)",
    "line\\('mtermishDown'\\)",
    "line\\('mtermishTaunt'\\)",
    "line\\('quotes'\\)",
  ]) {
    assert.match(mainSource, new RegExp(call));
  }
});
