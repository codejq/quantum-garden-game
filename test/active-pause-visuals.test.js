import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const roadmapSource = readFileSync(new URL('../docs/modular-offline-tauri-roadmap.md', import.meta.url), 'utf8');

test('active browser intentionally allows visual-only animation during pause', () => {
  assert.match(mainSource, /const ALLOW_PAUSED_VISUAL_ANIMATION=true/);
  assert.match(mainSource, /if\(Game\.running\|\|ALLOW_PAUSED_VISUAL_ANIMATION\)envUpdate\(dt,time\)/);
  assert.match(roadmapSource, /\[x\] Ensure visual-only animations can continue during pause only if intentionally allowed\./);
});
