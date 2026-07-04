import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('Playwright browser harness can call the in-page LLM agent API', () => {
  const output = execFileSync(process.execPath, [join(root, 'scripts/llm-browser-harness.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  const result = JSON.parse(output);

  if (result.skipped) {
    assert.equal(result.reason, 'No Chrome or Edge executable found');
    return;
  }

  assert.equal(result.harness, 'playwright-browser-agent');
  assert.equal(result.apiVersion, 1);
  assert.equal(result.seed, 'browser-agent-harness');
  assert.equal(result.steps.length, 8);
  assert.ok(result.steps.every((step) => step.ok), JSON.stringify(result.steps, null, 2));
  assert.equal(typeof result.steps[0].player.x, 'number');
});
