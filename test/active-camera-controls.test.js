import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const htmlSource = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../web/styles/main.css', import.meta.url), 'utf8');

test('active HUD exposes camera view and reset controls', () => {
  assert.match(htmlSource, /id="viewBtn"/);
  assert.match(htmlSource, /id="resetViewBtn"/);
  assert.match(htmlSource, /<div class="hud-actions">[\s\S]*id="exitBtn"[\s\S]*id="pauseBtn"[\s\S]*id="viewBtn"[\s\S]*id="resetViewBtn"[\s\S]*<\/div>/);
  assert.match(cssSource, /\.hud-actions\{display:flex/);
  assert.match(cssSource, /#pauseBtn,#exitBtn,#viewBtn,#resetViewBtn\{position:static/);
  assert.match(mainSource, /\$\('viewBtn'\)\.onclick=\(\)=>toggleCameraView\(\)/);
  assert.match(mainSource, /\$\('resetViewBtn'\)\.onclick=\(\)=>resetCameraView\(\)/);
});

test('camera controls use compact mobile placement away from mission and touch controls', () => {
  assert.match(cssSource, /\.hud-top\{position:absolute;top:10px;inset-inline:10px;display:grid/);
  assert.match(cssSource, /\.hud-status\{display:flex/);
  assert.match(cssSource, /@media \(max-width:640px\) and \(orientation:portrait\)/);
  assert.match(cssSource, /\.hud-top\{grid-template-columns:1fr;gap:6px\}/);
  assert.match(cssSource, /\.hud-actions\{justify-content:flex-start;overflow-x:auto/);
  assert.match(cssSource, /#pauseBtn,#exitBtn,#viewBtn,#resetViewBtn\{font-size:12px;padding:4px 8px\}/);
  assert.match(cssSource, /#missionCard\{top:126px\}/);
  assert.match(cssSource, /@media \(max-height:480px\) and \(orientation:landscape\)/);
  assert.match(cssSource, /#missionCard\{top:58px;max-width:190px\}/);
});

test('active game supports mouse camera and click planting controls', () => {
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointerdown'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointermove'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('pointerup'/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('wheel'/);
  assert.match(mainSource, /else Game\.tryPlant\(\)/);
});

test('active game supports optional mouse click-to-move controls', () => {
  assert.match(mainSource, /const mouseMoveTarget=\{active:false,pos:new THREE\.Vector3\(\)\}/);
  assert.match(mainSource, /function setMouseMoveTarget\(e\)/);
  assert.match(mainSource, /groundRaycaster\.setFromCamera\(pointerNdc,camera\)/);
  assert.match(mainSource, /if\(e\.button===2\|\|e\.shiftKey\)setMouseMoveTarget\(e\)/);
  assert.match(mainSource, /renderer\.domElement\.addEventListener\('contextmenu',e=>e\.preventDefault\(\)\)/);
  assert.match(mainSource, /if\(ix\|\|iz\)mouseMoveTarget\.active=false/);
});

test('active camera supports persisted follow, close, and top-down views', () => {
  assert.match(mainSource, /localStorage\.getItem\('cleanGarden\.cameraMode'\)/);
  assert.match(mainSource, /const CAMERA_MODES=\['follow','close','top'\]/);
  assert.match(mainSource, /CAMERA_MODES\[\(index\+1\)%CAMERA_MODES\.length\]/);
  assert.match(mainSource, /if\(cameraState\.mode==='top'\)return cameraOffset\.set\(0,34\*cameraState\.zoom,\.01\)/);
  assert.match(mainSource, /const close=cameraState\.mode==='close'/);
  assert.match(mainSource, /Math\.sin\(cameraState\.yaw\)\*dist/);
});

test('active movement stays screen-relative when camera perspective changes', () => {
  assert.match(mainSource, /const yaw=cameraState\.mode==='top'\?0:cameraState\.yaw/);
  assert.match(mainSource, /worldX\+=ix\*Math\.cos\(yaw\)\+iz\*Math\.sin\(yaw\)/);
  assert.match(mainSource, /worldZ\+=-ix\*Math\.sin\(yaw\)\+iz\*Math\.cos\(yaw\)/);
  assert.match(mainSource, /worldX\+=agentInput\.x;worldZ\+=agentInput\.z/);
  assert.match(mainSource, /worldX\+=dx\/dist;worldZ\+=dz\/dist/);
});

test('browser agent observation exposes camera metadata and actions', () => {
  assert.match(mainSource, /camera:\{\s*mode:cameraState\.mode/);
  assert.match(mainSource, /actions:\['toggleCamera','resetCamera','setCamera'\]/);
  assert.match(mainSource, /else if\(type==='toggleCamera'\)toggleCameraView\(\)/);
  assert.match(mainSource, /else if\(type==='resetCamera'\)resetCameraView\(\)/);
  assert.match(mainSource, /else if\(type==='setCamera'\)/);
  assert.match(mainSource, /if\(CAMERA_MODES\.includes\(action\.mode\)\)cameraState\.mode=action\.mode/);
});
