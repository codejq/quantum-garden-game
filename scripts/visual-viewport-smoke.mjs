import { existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chrome) {
  console.log('Skipping visual viewport smoke: no Chrome or Edge executable found');
  process.exit(0);
}

const outDir = resolve(root, 'docs/smoke-screenshots');
mkdirSync(outDir, { recursive: true });

const url = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');
const viewports = [
  { name: 'desktop', size: '1365,768', minBytes: 20000 },
  { name: 'mobile-portrait', size: '390,844', minBytes: 12000 },
  { name: 'mobile-landscape', size: '844,390', minBytes: 12000 },
  { name: 'quality-high-desktop', size: '1365,768', minBytes: 20000, query: '?quality=high' },
  { name: 'quality-low-mobile-portrait', size: '390,844', minBytes: 12000, query: '?quality=low' },
  { name: 'quality-low-mobile-landscape', size: '844,390', minBytes: 12000, query: '?quality=low' },
];

for (const viewport of viewports) {
  const screenshot = resolve(outDir, `dist-${viewport.name}.png`);
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--host-resolver-rules=MAP * 0.0.0.0',
      `--window-size=${viewport.size}`,
      `--screenshot=${screenshot}`,
      `${url}${viewport.query ?? ''}`,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(`Visual viewport smoke failed for ${viewport.name}: ${result.stderr || result.stdout}`);
  }

  if (!existsSync(screenshot) || statSync(screenshot).size < viewport.minBytes) {
    throw new Error(`Visual viewport smoke produced an invalid ${viewport.name} screenshot`);
  }
}

console.log('Visual viewport smoke passed');
