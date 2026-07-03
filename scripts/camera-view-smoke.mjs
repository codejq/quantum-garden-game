import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
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
const distAssetsDir = resolve(root, 'dist/web/assets');
const builtCssPath = readdirSync(distAssetsDir)
  .filter((file) => file.endsWith('.css'))
  .map((file) => resolve(distAssetsDir, file))[0];

const pageUrl = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');
const cases = [
  { name: 'desktop-follow', viewport: { width: 1365, height: 768 }, mode: 'follow', minBytes: 20000 },
  { name: 'desktop-close', viewport: { width: 1365, height: 768 }, mode: 'close', minBytes: 20000 },
  { name: 'desktop-top', viewport: { width: 1365, height: 768 }, mode: 'top', minBytes: 20000 },
  { name: 'mobile-portrait-follow', viewport: { width: 390, height: 844 }, mode: 'follow', minBytes: 12000 },
  { name: 'mobile-portrait-close', viewport: { width: 390, height: 844 }, mode: 'close', minBytes: 12000 },
  { name: 'mobile-portrait-top', viewport: { width: 390, height: 844 }, mode: 'top', minBytes: 12000 },
  { name: 'mobile-landscape-follow', viewport: { width: 844, height: 390 }, mode: 'follow', minBytes: 12000 },
  { name: 'mobile-landscape-close', viewport: { width: 844, height: 390 }, mode: 'close', minBytes: 12000 },
  { name: 'mobile-landscape-top', viewport: { width: 844, height: 390 }, mode: 'top', minBytes: 12000 },
];

async function assertControlsDoNotOverlap(page, smokeName) {
  const result = await page.evaluate(() => {
    const ids = ['exitBtn', 'pauseBtn', 'viewBtn', 'resetViewBtn', 'missionCard', 'joy', 'actBtn'];
    const visibleRects = ids.flatMap((id) => {
      const element = document.getElementById(id);
      if (!element) return [];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        rect.width === 0 ||
        rect.height === 0
      ) {
        return [];
      }
      return [{ id, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }];
    });

    const pairs = [
      ['exitBtn', 'pauseBtn'],
      ['pauseBtn', 'viewBtn'],
      ['viewBtn', 'resetViewBtn'],
      ['exitBtn', 'missionCard'],
      ['pauseBtn', 'missionCard'],
      ['viewBtn', 'missionCard'],
      ['resetViewBtn', 'missionCard'],
      ['exitBtn', 'joy'],
      ['pauseBtn', 'joy'],
      ['viewBtn', 'joy'],
      ['resetViewBtn', 'joy'],
      ['exitBtn', 'actBtn'],
      ['pauseBtn', 'actBtn'],
      ['viewBtn', 'actBtn'],
      ['resetViewBtn', 'actBtn'],
    ];

    const byId = new Map(visibleRects.map((rect) => [rect.id, rect]));
    const overlaps = pairs.filter(([a, b]) => {
      const first = byId.get(a);
      const second = byId.get(b);
      if (!first || !second) return false;
      return !(
        first.right <= second.left ||
        second.right <= first.left ||
        first.bottom <= second.top ||
        second.bottom <= first.top
      );
    });

    return { ok: overlaps.length === 0, overlaps, visibleRects };
  });

  if (!result.ok) {
    throw new Error(
      `Camera controls overlap in ${smokeName}: ${JSON.stringify(result.overlaps)} ` +
        `with rects ${JSON.stringify(result.visibleRects)}`,
    );
  }
}

async function assertHudTargetsStayInViewport(page, smokeName) {
  const result = await page.evaluate(() => {
    document.getElementById('prompt').style.setProperty('display', 'block', 'important');
    const ids = ['missionCard', 'prompt'];
    const failures = [];
    const rects = ids.map((id) => {
      const element = document.getElementById(id);
      const rect = element.getBoundingClientRect();
      const visible =
        getComputedStyle(element).display !== 'none' &&
        rect.width > 0 &&
        rect.height > 0;
      const inside =
        visible &&
        rect.left >= 0 &&
        rect.top >= 0 &&
        rect.right <= window.innerWidth &&
        rect.bottom <= window.innerHeight;
      if (!inside) failures.push(id);
      return { id, visible, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    });
    return { ok: failures.length === 0, failures, rects, viewport: { width: window.innerWidth, height: window.innerHeight } };
  });

  if (!result.ok) {
    throw new Error(
      `Camera HUD targets left the viewport in ${smokeName}: ${JSON.stringify(result.failures)} ` +
        `with rects ${JSON.stringify(result.rects)} and viewport ${JSON.stringify(result.viewport)}`,
    );
  }
}

async function ensureBuiltStylesApplied(page) {
  const styled = await page.evaluate(() => getComputedStyle(document.getElementById('missionCard')).position === 'absolute');
  if (styled) return;
  await page.addStyleTag({ path: builtCssPath });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('missionCard')).position === 'absolute');
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const smoke of cases) {
    const page = await browser.newPage({ viewport: smoke.viewport });
    await page.goto(pageUrl, { waitUntil: 'load' });
    await ensureBuiltStylesApplied(page);
    await page.waitForFunction(() => !!window.QuantumGardenAgent);
    await page.evaluate((mode) => {
      window.QuantumGardenAgent.reset({ levelId: 1, seed: `camera-${mode}` });
      window.QuantumGardenAgent.act({ type: 'setCamera', mode });
      window.QuantumGardenAgent.step({ frames: 8 });
    }, smoke.mode);
    await assertControlsDoNotOverlap(page, smoke.name);
    await assertHudTargetsStayInViewport(page, smoke.name);
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
