import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');

test('active browser runtime applies low and high quality settings', () => {
  assert.match(mainSource, /const QUALITY_PRESETS=\{/);
  assert.match(mainSource, /low:\{shadows:false,maxPixelRatio:1,shadowSize:512\}/);
  assert.match(mainSource, /high:\{shadows:true,maxPixelRatio:2,shadowSize:1024\}/);
  assert.match(mainSource, /new URLSearchParams\(location\.search\)\.get\('quality'\)/);
  assert.match(mainSource, /localStorage\.getItem\('cleanGarden\.quality'\)/);
  assert.match(mainSource, /renderer\.setPixelRatio\(Math\.min\(devicePixelRatio,quality\.maxPixelRatio\)\)/);
  assert.match(mainSource, /renderer\.shadowMap\.enabled=quality\.shadows/);
  assert.match(mainSource, /sun\.castShadow=renderQuality\.shadows/);
  assert.match(mainSource, /sun\.shadow\.mapSize\.set\(renderQuality\.shadowSize,renderQuality\.shadowSize\)/);
  assert.match(mainSource, /document\.documentElement\.dataset\.quality=activeQuality/);
});
