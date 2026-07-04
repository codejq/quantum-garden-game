import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const contextSource = readFileSync(new URL('../docs/project-context.md', import.meta.url), 'utf8');

test('active start menu exposes saved score and avatar customization controls', () => {
  assert.match(htmlSource, /id="genderSelect"/);
  assert.match(htmlSource, /id="clothesSelect"/);
  assert.match(htmlSource, /id="savedScore"/);
  assert.match(cssSource, /\.avatarPick\{display:grid/);
  assert.match(cssSource, /\.savedScore\{/);
});

test('active runtime persists score memory and avatar settings', () => {
  assert.match(mainSource, /cleanGarden\.score\.last/);
  assert.match(mainSource, /cleanGarden\.score\.best/);
  assert.match(mainSource, /cleanGarden\.score\.total/);
  assert.match(mainSource, /function rememberScore\(score\)/);
  assert.match(mainSource, /rememberScore\(this\.score\)/);
  assert.match(mainSource, /cleanGarden\.avatar\.gender/);
  assert.match(mainSource, /cleanGarden\.avatar\.clothes/);
  assert.match(mainSource, /function applyAvatarStyle\(g,settings=avatarSettings\)/);
  assert.match(mainSource, /applyAvatarStyle\(playerMesh,avatarSettings\)/);
});

test('project context documents the current handoff surface', () => {
  assert.match(contextSource, /Clean Garden Project Context/);
  assert.match(contextSource, /Quantum Billing LLC/);
  assert.match(contextSource, /https:\/\/qb-solutions\.us\//);
  assert.match(contextSource, /com\.quantumbilling\.cleangarding/);
  assert.match(contextSource, /Score memory/);
  assert.match(contextSource, /Avatar customization/);
  assert.match(contextSource, /window\.QuantumGardenAgent/);
});
