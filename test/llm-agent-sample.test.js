import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('LLM agent sample script observes and acts through the public agent API', () => {
  const output = execFileSync(process.execPath, [join(root, 'scripts/llm-agent-sample.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  const result = JSON.parse(output);

  assert.equal(result.sample, 'quantum-garden-llm-agent');
  assert.equal(result.seed, 'llm-sample');
  assert.equal(result.finalStatus, 'running');
  assert.equal(Array.isArray(result.steps), true);
  assert.equal(result.steps.length, 20);
  assert.ok(result.steps.some((step) => step.action === 'moveToNearestTrash'));
  assert.equal(typeof result.steps[0].player.x, 'number');
});
