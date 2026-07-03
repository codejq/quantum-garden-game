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
  console.log('Skipping offline load smoke: no Chrome or Edge executable found');
  process.exit(0);
}

const outDir = resolve(root, 'docs/smoke-screenshots');
mkdirSync(outDir, { recursive: true });
const screenshot = resolve(outDir, 'dist-offline-load-1024x768.png');
const url = 'file:///' + resolve(root, 'dist/web/index.html').replaceAll('\\', '/');

const result = spawnSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--host-resolver-rules=MAP * 0.0.0.0',
    '--window-size=1024,768',
    `--screenshot=${screenshot}`,
    url,
  ],
  { encoding: 'utf8' },
);

if (result.status !== 0) {
  throw new Error(`Offline browser smoke failed: ${result.stderr || result.stdout}`);
}

if (!existsSync(screenshot) || statSync(screenshot).size < 1000) {
  throw new Error('Offline browser smoke did not produce a valid screenshot');
}

console.log('Offline browser load smoke passed');
