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
  console.log(JSON.stringify({ skipped: true, reason: 'No Chrome or Edge executable found' }, null, 2));
  process.exit(0);
}

const pageUrl = 'file:///' + resolve(root, 'web/index.html').replaceAll('\\', '/');
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

try {
  await page.goto(pageUrl, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.QuantumGardenAgent);

  const reset = await page.evaluate(() => window.QuantumGardenAgent.reset({ levelId: 1, seed: 'browser-agent-harness' }));
  const steps = [];

  for (let index = 0; index < 8; index += 1) {
    const result = await page.evaluate(() => window.QuantumGardenAgent.step({ type: 'moveToNearestTrash', frames: 4 }));
    steps.push({
      index,
      ok: result.ok,
      status: result.observation.running ? 'running' : 'stopped',
      trashLeft: result.observation.objective.trashLeft,
      player: result.observation.player.position,
    });
  }

  console.log(
    JSON.stringify(
      {
        harness: 'playwright-browser-agent',
        apiVersion: reset.observation.apiVersion,
        seed: reset.observation.seed,
        steps,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
