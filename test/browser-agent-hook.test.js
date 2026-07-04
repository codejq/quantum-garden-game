import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const agentSource = source.slice(source.indexOf('function observeAgent()'));

test('active browser game exposes QuantumGardenAgent hook', () => {
  assert.match(source, /window\.QuantumGardenAgent\s*=\s*Object\.freeze/);
  for (const method of ['observe', 'act', 'reset', 'step', 'nextLevel', 'startHumanPlayer', 'stopHumanPlayer', 'humanStatus']) {
    assert.match(source, new RegExp(`${method}\\s*:`));
  }
});

test('browser agent hook is scoped to gameplay and reports demo determinism limits', () => {
  assert.match(agentSource, /deterministic:false/);
  assert.doesNotMatch(agentSource, /__TAURI__|invoke\(|fs\.|child_process/);
  assert.match(agentSource, /rate_limited/);
});

test('browser agent fixed-frame step bypasses wall-clock action rate limit', () => {
  assert.match(source, /function actAgent\(action=\{\},options=\{\}\)/);
  assert.match(source, /if\(!options\.skipRateLimit\)/);
  assert.match(source, /actAgent\(action,\{ skipRateLimit:true \}\)/);
});

test('browser agent hook includes human-like autoplayer controls', () => {
  assert.match(agentSource, /function startHumanPlayer\(options=\{\}\)/);
  assert.match(agentSource, /function stopHumanPlayer\(\)/);
  assert.match(agentSource, /function chooseHumanAction\(obs\)/);
  assert.match(agentSource, /status:Game\.status/);
  assert.match(agentSource, /type:'nextLevel'/);
});
