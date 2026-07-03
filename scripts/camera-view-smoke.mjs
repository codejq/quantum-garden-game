import { existsSync, mkdirSync, statSync } from 'node:fs';
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
  console.log('Skipping camera view smoke: no Chrome or Edge executable found');
  process.exit(0);
}

const outDir = resolve(root, 'docs/smoke-screenshots/camera');
mkdirSync(outDir, { recursive: true });

const pageUrl = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');
const cases = [
  { name: 'desktop-follow', viewport: { width: 1365, height: 768 }, mode: 'follow', minBytes: 20000 },
  { name: 'desktop-top', viewport: { width: 1365, height: 768 }, mode: 'top', minBytes: 20000 },
  { name: 'mobile-portrait-follow', viewport: { width: 390, height: 844 }, mode: 'follow', minBytes: 12000 },
  { name: 'mobile-portrait-top', viewport: { width: 390, height: 844 }, mode: 'top', minBytes: 12000 },
  { name: 'mobile-landscape-follow', viewport: { width: 844, height: 390 }, mode: 'follow', minBytes: 12000 },
  { name: 'mobile-landscape-top', viewport: { width: 844, height: 390 }, mode: 'top', minBytes: 12000 },
];

const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const smoke of cases) {
    const page = await browser.newPage({ viewport: smoke.viewport });
    await page.goto(pageUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.QuantumGardenAgent);
    await page.evaluate((mode) => {
      window.QuantumGardenAgent.reset({ levelId: 1, seed: `camera-${mode}` });
      window.QuantumGardenAgent.act({ type: 'setCamera', mode });
      window.QuantumGardenAgent.step({ frames: 8 });
    }, smoke.mode);
    const screenshot = resolve(outDir, `${smoke.name}.png`);
    await page.screenshot({ path: screenshot });
    await page.close();
    if (!existsSync(screenshot) || statSync(screenshot).size < smoke.minBytes) {
      throw new Error(`Camera view smoke produced an invalid screenshot for ${smoke.name}`);
    }
  }
} finally {
  await browser.close();
}

console.log('Camera view smoke passed');
