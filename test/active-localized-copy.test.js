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

test('active browser defines translation keys for visible UI strings', () => {
  assert.match(mainSource, /const ACTIVE_I18N_KEYS=\[/);
  assert.match(mainSource, /const ACTIVE_I18N_LINE_KEYS=\[/);
  assert.match(mainSource, /prompt:'🌱 Press E to plant a tree!'/);
  assert.match(mainSource, /promptTouch:'🌱 Tap the plant button to plant a tree!'/);
  assert.match(mainSource, /function plantPromptText\(\)\{return tr\(hasTouchInput\(\)\?'promptTouch':'prompt'\);\}/);
  assert.match(mainSource, /\$\('prompt'\)\.textContent=plantPromptText\(\)/);
  assert.match(mainSource, /\$\('actBtn'\)\.setAttribute\('aria-label',tr\('promptTouch'\)\)/);
  assert.match(mainSource, /sound:'Sound'/);
  assert.match(mainSource, /sound:'الصوت'/);
  assert.match(mainSource, /sound:'Sonido'/);
  assert.match(mainSource, /sound:'Son'/);
  assert.match(mainSource, /\$\('sndBtn'\)\.setAttribute\('aria-label',tr\('sound'\)\)/);
});
