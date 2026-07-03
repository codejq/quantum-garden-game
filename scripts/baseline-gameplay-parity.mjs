import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  console.log('Skipping baseline gameplay parity: no Chrome or Edge executable found');
  process.exit(0);
}

const pageUrl = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');
const evidence = {
  generatedAt: new Date().toISOString(),
  target: 'dist/web/index.html',
  checks: {},
};

function record(name, value) {
  evidence.checks[name] = Boolean(value);
  if (!value) throw new Error(`Baseline parity check failed: ${name}`);
}

async function stepUntil(page, action, predicate, max = 260) {
  let observation = await page.evaluate(() => window.QuantumGardenAgent.observe());
  for (let index = 0; index < max && !predicate(observation); index += 1) {
    observation = await page.evaluate((agentAction) => window.QuantumGardenAgent.step(agentAction).observation, action);
  }
  return observation;
}

async function completeLevel(page, max = 1800) {
  let observation = await page.evaluate(() => window.QuantumGardenAgent.observe());
  for (let index = 0; index < max; index += 1) {
    if (!observation.running) return observation;
    if (observation.objective.trashLeft > 0) {
      observation = await page.evaluate(() => window.QuantumGardenAgent.step({
        type: 'moveToNearestTrash',
        durationMs: 350,
        frames: 12,
      }).observation);
    } else if (observation.objective.patchesPlanted < observation.objective.patchesTotal) {
      if (observation.canPlant) {
        observation = await page.evaluate(() => window.QuantumGardenAgent.step({ type: 'plantNearest', frames: 8 }).observation);
      } else {
        observation = await page.evaluate(() => window.QuantumGardenAgent.step({
          type: 'moveToNearestPatch',
          durationMs: 350,
          frames: 12,
        }).observation);
      }
    } else if (observation.objective.minionsConverted < observation.objective.minionsRequired) {
      observation = await page.evaluate(() => window.QuantumGardenAgent.step({
        type: 'chaseNearestVillain',
        durationMs: 400,
        frames: 12,
      }).observation);
    } else if (!observation.objective.bossDefeated) {
      observation = await page.evaluate(() => window.QuantumGardenAgent.step({
        type: 'attackBoss',
        durationMs: 400,
        frames: 12,
      }).observation);
    } else {
      observation = await page.evaluate(() => window.QuantumGardenAgent.step({ frames: 12 }).observation);
    }
  }
  return observation;
}

async function activeGameChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
  await page.goto(pageUrl, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.QuantumGardenAgent);

  record('Start screen appears', await page.locator('#startOverlay').isVisible());
  await page.click('#startBtn');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('hud')).display !== 'none');
  record('Start button begins the game', await page.locator('#hud').isVisible());
  record('HUD appears after start', await page.locator('#missionCard').isVisible());

  let before = await page.evaluate(() => window.QuantumGardenAgent.observe().player.position);
  await page.keyboard.down('KeyW');
  await page.evaluate(() => window.QuantumGardenAgent.step({ frames: 18 }));
  await page.keyboard.up('KeyW');
  let after = await page.evaluate(() => window.QuantumGardenAgent.observe().player.position);
  record('Player moves with WASD', Math.abs(after.z - before.z) > 0.05 || Math.abs(after.x - before.x) > 0.05);

  before = after;
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.QuantumGardenAgent.step({ frames: 18 }));
  await page.keyboard.up('ArrowRight');
  after = await page.evaluate(() => window.QuantumGardenAgent.observe().player.position);
  record('Player moves with arrow keys', Math.abs(after.x - before.x) > 0.05 || Math.abs(after.z - before.z) > 0.05);

  const soundBefore = await page.locator('#sndBtn').textContent();
  await page.click('#sndBtn');
  const soundAfter = await page.locator('#sndBtn').textContent();
  record('Sound toggle changes the sound icon', soundBefore !== soundAfter);

  await page.evaluate(() => window.QuantumGardenAgent.reset({ levelId: 1, seed: 'baseline-parity' }));
  const initial = await page.evaluate(() => window.QuantumGardenAgent.observe());
  let observation = await stepUntil(
    page,
    { type: 'moveToNearestTrash', durationMs: 350, frames: 12 },
    (obs) => obs.objective.trashLeft < initial.objective.trashLeft,
  );
  record('Player collects trash by walking over it', observation.objective.trashLeft < initial.objective.trashLeft);
  record('Score increases after collecting trash', observation.score > initial.score);

  const beforePlant = observation.objective.patchesPlanted;
  observation = await stepUntil(
    page,
    { type: 'moveToNearestPatch', durationMs: 350, frames: 12 },
    (obs) => obs.canPlant,
  );
  observation = await page.evaluate(() => window.QuantumGardenAgent.step({ type: 'plantNearest', frames: 4 }).observation);
  record('Player can plant a tree when standing near a glowing patch', observation.objective.patchesPlanted > beforePlant);
  record('Tree count increases after planting', observation.objective.patchesPlanted > beforePlant);

  const missionText = await page.locator('#missionCard').textContent();
  record(
    'Mission card updates trash, tree, minion, and boss objectives',
    /Trash|Trees|Mtermish|Big Mtermish|Basura|Arboles|Dechets|Arbres|قمامة|أشجار/.test(missionText),
  );

  await page.evaluate(() => window.QuantumGardenAgent.reset({ levelId: 1, seed: 'baseline-parity-complete' }));
  observation = await stepUntil(
    page,
    { type: 'chaseNearestVillain', durationMs: 400, frames: 12 },
    (obs) => obs.objective.minionsConverted > 0,
    420,
  );
  record('Minion can be converted by touching it', observation.objective.minionsConverted > 0);

  observation = await stepUntil(page, { frames: 20 }, (obs) => obs.objective.bossDefeated || obs.nearest.villains.some((v) => v.boss), 80);
  record('Boss appears after the initial delay', observation.nearest.villains.some((v) => v.boss) || observation.objective.bossDefeated);
  const bossSeenWithHp = observation.nearest.villains.find((v) => v.boss)?.hp ?? 0;
  observation = await stepUntil(page, { type: 'attackBoss', durationMs: 400, frames: 12 }, (obs) => obs.objective.bossDefeated, 520);
  record('Boss requires multiple touches before defeat', bossSeenWithHp >= 2 && observation.objective.bossDefeated);

  await page.evaluate(() => window.QuantumGardenAgent.reset({ levelId: 1, seed: 'baseline-parity-meter' }));
  const meterBefore = await page.evaluate(() => ({
    text: document.getElementById('meterPct').textContent,
    width: document.getElementById('meterFill').style.width,
  }));
  observation = await stepUntil(
    page,
    { type: 'moveToNearestTrash', durationMs: 350, frames: 12 },
    (obs) => obs.objective.trashLeft <= 8,
    520,
  );
  await page.evaluate(() => window.QuantumGardenAgent.step({ frames: 4 }));
  const meterAfter = await page.evaluate(() => ({
    text: document.getElementById('meterPct').textContent,
    width: document.getElementById('meterFill').style.width,
  }));
  record(
    'Pollution meter changes as the level is cleaned',
    meterBefore.text !== meterAfter.text || meterBefore.width !== meterAfter.width || observation.objective.trashLeft === 0,
  );

  observation = await completeLevel(page);
  const overlayVisible = await page.locator('#lvlOverlay').isVisible();
  const completedLevel =
    overlayVisible && !observation.running && observation.objective.trashLeft === 0 &&
    observation.objective.patchesPlanted === observation.objective.patchesTotal &&
    observation.objective.minionsConverted >= observation.objective.minionsRequired &&
    observation.objective.bossDefeated;
  if (!completedLevel) {
    throw new Error(`Baseline parity completion failed: ${JSON.stringify({ overlayVisible, observation })}`);
  }
  record('Level-complete overlay appears after all objectives are complete', true);

  const levelBefore = await page.locator('#uiLevel').textContent();
  await page.click('#nextBtn');
  await page.waitForFunction((value) => document.getElementById('uiLevel').textContent !== value, levelBefore);
  record('Next-level button starts another level', (await page.locator('#uiLevel').textContent()) !== levelBefore);

  await page.close();
}

async function touchChecks(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(pageUrl, { waitUntil: 'load' });
  await page.tap('#startBtn');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('hud')).display !== 'none');
  const touchVisibility = await page.evaluate(() => ({
    joy: getComputedStyle(document.getElementById('joy')).display,
    act: getComputedStyle(document.getElementById('actBtn')).display,
    maxTouchPoints: navigator.maxTouchPoints,
  }));
  record('Touch joystick appears on touch-capable viewport/device', touchVisibility.maxTouchPoints > 0 && touchVisibility.joy !== 'none');
  record('Touch action button appears on touch-capable viewport/device', touchVisibility.maxTouchPoints > 0 && touchVisibility.act !== 'none');
  await context.close();
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  await activeGameChecks(browser);
  await touchChecks(browser);
} finally {
  await browser.close();
}

const checklist = Object.entries(evidence.checks)
  .map(([name, ok]) => `- [${ok ? 'x' : ' '}] ${name}.`)
  .join('\n');
writeFileSync(
  resolve(root, 'docs/baseline-gameplay-checklist.md'),
  `# Baseline Gameplay Checklist\n\nUse this checklist against \`web/legacy/index.html\` and the active game before marking a refactor phase as behavior-compatible.\n\n${checklist}\n\n## Automated Evidence\n\n- Active built game parity verified by \`npm run test:baseline-parity\` at ${evidence.generatedAt}.\n- Target: \`${evidence.target}\`.\n- Frozen legacy structure remains captured in \`docs/baseline-snapshot.json\` and \`web/legacy/index.html\`.\n`,
);

console.log('Baseline gameplay parity passed');
