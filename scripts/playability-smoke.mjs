import { existsSync } from 'node:fs';
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
  console.log('Skipping playability smoke: no Chrome or Edge executable found');
  process.exit(0);
}

const pageUrl = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
  await page.goto(pageUrl, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.QuantumGardenAgent);

  const result = await page.evaluate(async () => {
    const delay = () => new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
    let observation = window.QuantumGardenAgent.reset({ levelId: 1, seed: 'playability-smoke' }).observation;
    const initialTrash = observation.objective.trashLeft;
    const initialTrees = observation.objective.patchesPlanted;

    for (let i = 0; i < 180 && observation.objective.trashLeft >= initialTrash; i += 1) {
      await delay();
      observation = window.QuantumGardenAgent.step({
        type: 'moveToNearestTrash',
        durationMs: 350,
        frames: 12,
      }).observation;
    }

    for (let i = 0; i < 220 && observation.objective.patchesPlanted <= initialTrees; i += 1) {
      await delay();
      observation = window.QuantumGardenAgent.step({
        type: 'moveToNearestPatch',
        durationMs: 350,
        frames: 12,
      }).observation;
      if (observation.canPlant) {
        await delay();
        observation = window.QuantumGardenAgent.step({ type: 'plantNearest', frames: 4 }).observation;
      }
    }

    return {
      running: observation.running,
      trashChanged: observation.objective.trashLeft < initialTrash,
      treeChanged: observation.objective.patchesPlanted > initialTrees,
      objective: observation.objective,
      player: observation.player,
    };
  });

  await page.close();

  if (!result.running || !result.trashChanged || !result.treeChanged) {
    throw new Error(`Playability smoke failed: ${JSON.stringify(result)}`);
  }
} finally {
  await browser.close();
}

console.log('Playability smoke passed');
