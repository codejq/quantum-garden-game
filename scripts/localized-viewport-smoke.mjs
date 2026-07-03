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
  console.log('Skipping localized viewport smoke: no Chrome or Edge executable found');
  process.exit(0);
}

const outDir = resolve(root, 'docs/smoke-screenshots/locales');
mkdirSync(outDir, { recursive: true });

const baseUrl = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');
const locales = ['en', 'ar', 'es', 'fr'];
const viewports = [
  { name: 'desktop', size: '1365,768', minBytes: 20000 },
  { name: 'mobile-portrait', size: '390,844', minBytes: 12000 },
];

for (const locale of locales) {
  for (const viewport of viewports) {
    const screenshot = resolve(outDir, `dist-${locale}-${viewport.name}.png`);
    const result = spawnSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--host-resolver-rules=MAP * 0.0.0.0',
        `--window-size=${viewport.size}`,
        `--screenshot=${screenshot}`,
        `${baseUrl}?locale=${locale}`,
      ],
      { encoding: 'utf8' },
    );

    if (result.status !== 0) {
      throw new Error(`Localized viewport smoke failed for ${locale}/${viewport.name}: ${result.stderr || result.stdout}`);
    }

    if (!existsSync(screenshot) || statSync(screenshot).size < viewport.minBytes) {
      throw new Error(`Localized viewport smoke produced an invalid ${locale}/${viewport.name} screenshot`);
    }
  }
}

console.log('Localized viewport smoke passed');
