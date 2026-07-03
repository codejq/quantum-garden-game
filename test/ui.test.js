import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanlinessPercent, meterGradient, missionRows, objectiveRows, renderMissionHtml } from '../web/src/ui/hud.js';
import { hide, levelSummary, setText, show } from '../web/src/ui/overlays.js';

test('missionRows and renderMissionHtml create localized mission output', () => {
  const rows = missionRows(
    { trashLeft: 0, treesDone: 1, treesTotal: 2, minionsDone: 0, minionsTotal: 1, bossDefeated: false },
    (key) => ({ trashLeft: 'Trash left', trees: 'Trees', minions: 'Minions', boss: 'Boss' })[key],
  );
  const html = renderMissionHtml(rows);
  assert.equal(rows[0].done, true);
  assert.match(html, /Trash left/);
  assert.match(html, /Trees: <b>1\/2<\/b>/);
});

test('objectiveRows renders mode-provided objective definitions', () => {
  const rows = objectiveRows(
    [
      {
        id: 'trash',
        labelKey: 'trashLeft',
        icon: '🗑️',
        completeIcon: '✅',
        value: (state) => String(state.trash.length),
        done: (state) => state.trash.length === 0,
      },
    ],
    { trash: [] },
    (key) => ({ trashLeft: 'Trash left' })[key],
  );

  assert.deepEqual(rows, [{ id: 'trash', done: true, icon: '✅', label: 'Trash left', value: '0' }]);
});

test('cleanliness meter helpers clamp and colorize values', () => {
  assert.equal(cleanlinessPercent(0), 100);
  assert.equal(cleanlinessPercent(100), 0);
  assert.equal(cleanlinessPercent(250), 0);
  assert.match(meterGradient(80), /51cf66/);
  assert.match(meterGradient(50), /ffd166/);
  assert.match(meterGradient(10), /a3742f/);
});

test('overlay helpers update element-like objects', () => {
  const element = { style: {}, textContent: '' };
  show(element);
  assert.equal(element.style.display, 'flex');
  hide(element);
  assert.equal(element.style.display, 'none');
  setText(element, 'Paused');
  assert.equal(element.textContent, 'Paused');
});

test('levelSummary identifies best times', () => {
  assert.equal(levelSummary({ elapsed: 10, bestTime: 12 }).isBest, true);
  assert.equal(levelSummary({ elapsed: 15, bestTime: 12 }).isBest, false);
});
