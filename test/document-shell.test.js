import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const indexHtml = readFileSync(join(root, 'web/index.html'), 'utf8');

test('web index is a document shell with external style and script references', () => {
  assert.equal(existsSync(join(root, 'web/styles/main.css')), true);
  assert.equal(existsSync(join(root, 'web/src/main.js')), true);
  assert.match(indexHtml, /<link\s+[^>]*href="styles\/main\.css"/);
  assert.match(indexHtml, /<script\s+[^>]*src="src\/main\.js"/);
  assert.doesNotMatch(indexHtml, /<style\b/i);
  assert.doesNotMatch(indexHtml, /<script(?!\s+[^>]*\bsrc=)[^>]*>/i);
});
