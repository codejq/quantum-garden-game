import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');

test('active HUD exposes camera view and reset controls', () => {
  assert.match(htmlSource, /id="viewBtn"/);
  assert.match(htmlSource, /id="resetViewBtn"/);
  assert.match(cssSource, /#pauseBtn,#exitBtn,#viewBtn,#resetViewBtn/);
  assert.match(mainSource, /\$\('viewBtn'\)\.onclick=\(\)=>toggleCameraView\(\)/);
  assert.match(mainSource, /\$\('resetViewBtn'\)\.onclick=\(\)=>resetCameraView\(\)/);
});

test('camera controls use compact mobile placement away from mission and touch controls', () => {
  assert.match(cssSource, /@media \(max-width:640px\) and \(orientation:portrait\)/);
  assert.match(cssSource, /#pauseBtn,#exitBtn,#viewBtn,#resetViewBtn\{font-size:12px;padding:4px 8px\}/);
  assert.match(cssSource, /#resetViewBtn\{inset-inline-start:176px\}/);
  assert.match(cssSource, /#missionCard\{top:96px\}/);
  assert.match(cssSource, /@media \(max-height:480px\) and \(orientation:landscape\)/);
  assert.match(cssSource, /#missionCard\{top:54px;max-width:190px\}/);
});

test('active game supports mouse camera and click planting controls', () => {
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointerdown'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointermove'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointerup'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('wheel'/);
  assert.match(mainSource, /if\(!cameraState\.moved\)Game\.tryPlant\(\)/);
});

test('active camera supports persisted follow and top-down views', () => {
  assert.match(mainSource, /localStorage\.getItem\('cleanGarden\.cameraMode'\)/);
  assert.match(mainSource, /cameraState\.mode=cameraState\.mode==='follow'\?'top':'follow'/);
  assert.match(mainSource, /if\(cameraState\.mode==='top'\)return cameraOffset\.set\(0,34\*cameraState\.zoom,\.01\)/);
  assert.match(mainSource, /Math\.sin\(cameraState\.yaw\)\*dist/);
});

test('browser agent observation exposes camera metadata and actions', () => {
  assert.match(mainSource, /camera:\{\s*mode:cameraState\.mode/);
  assert.match(mainSource, /actions:\['toggleCamera','resetCamera','setCamera'\]/);
  assert.match(mainSource, /else if\(type==='toggleCamera'\)toggleCameraView\(\)/);
  assert.match(mainSource, /else if\(type==='resetCamera'\)resetCameraView\(\)/);
  assert.match(mainSource, /else if\(type==='setCamera'\)/);
});
