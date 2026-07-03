import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const riskDoc = readFileSync(new URL('../docs/determinism-risk-controls.md', import.meta.url), 'utf8');
const roadmap = readFileSync(new URL('../docs/modular-offline-tauri-roadmap.md', import.meta.url), 'utf8');
const ci = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const simulationTests = readFileSync(new URL('./simulation.test.js', import.meta.url), 'utf8');
const llmAgentTests = readFileSync(new URL('./llm-agent.test.js', import.meta.url), 'utf8');

test('determinism is documented as the highest-risk refactor control', () => {
  assert.match(riskDoc, /highest-risk part of the refactor/);
  assert.match(riskDoc, /headlessly without DOM, canvas, or WebGL/);
  assert.match(riskDoc, /Same seed must reproduce/);
  assert.match(riskDoc, /Fixed total simulation time/);
  assert.match(roadmap, /\[x\] Treat deterministic simulation as the highest-risk part/);
});

test('determinism risk controls are backed by tests and CI', () => {
  assert.match(simulationTests, /same seed creates the same attempt layout/);
  assert.match(simulationTests, /different seeds create different attempt layouts/);
  assert.match(simulationTests, /fixed total time produces the same result/);
  assert.match(simulationTests, /level attempt can build, play, teardown, dispose, and rebuild/);
  assert.match(llmAgentTests, /LLM agent can complete basic objectives without DOM or WebGL control/);
  assert.match(ci, /npm test/);
  assert.match(ci, /npm run test:offline-build/);
});
