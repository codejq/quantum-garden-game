import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');

test('touch controls use safe-area-aware responsive placement', () => {
  assert.match(cssSource, /#joy\{position:fixed;bottom:max\(26px,env\(safe-area-inset-bottom\)\)/);
  assert.match(cssSource, /#actBtn\{position:fixed;bottom:max\(44px,calc\(env\(safe-area-inset-bottom\) \+ 18px\)\)/);
  assert.match(cssSource, /@media \(max-width:640px\) and \(orientation:portrait\)/);
  assert.match(cssSource, /@media \(max-height:480px\) and \(orientation:landscape\)/);
  assert.match(cssSource, /#prompt\{bottom:132px\}/);
  assert.match(cssSource, /#prompt\{bottom:112px\}/);
});
