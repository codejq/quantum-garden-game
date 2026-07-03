import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const smokeRoot = resolve(root, 'src-tauri/target/install-smoke');
const installDir = resolve(smokeRoot, 'CleanGarden');
const nsisDir = resolve(root, 'src-tauri/target/release/bundle/nsis');

function assertInsideSmokeRoot(path) {
  const normalizedRoot = `${smokeRoot.toLowerCase()}\\`;
  const normalizedPath = `${resolve(path).toLowerCase()}\\`;
  if (!normalizedPath.startsWith(normalizedRoot)) {
    throw new Error(`Refusing to touch path outside install smoke root: ${path}`);
  }
}

function findFile(dir, predicate) {
  if (!existsSync(dir)) return null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(path, predicate);
      if (found) return found;
    } else if (predicate(entry.name, path)) return path;
  }
  return null;
}

const installer = findFile(nsisDir, (name) => /setup\.exe$/i.test(name));
if (!installer) {
  throw new Error(`NSIS installer not found. Run npm run tauri:build first: ${nsisDir}`);
}

mkdirSync(smokeRoot, { recursive: true });
assertInsideSmokeRoot(installDir);
if (existsSync(installDir)) rmSync(installDir, { recursive: true, force: true });

const install = spawnSync(installer, ['/S', `/D=${installDir}`], {
  cwd: root,
  encoding: 'utf8',
  timeout: 60000,
});

if (install.status !== 0) {
  throw new Error(`NSIS silent install failed: ${install.stderr || install.stdout}`);
}

const executable = findFile(installDir, (name) => /^clean-garden\.exe$/i.test(name));
if (!executable) {
  throw new Error(`Installed executable not found under ${installDir}`);
}

const child = spawn(executable, [], {
  cwd: installDir,
  windowsHide: true,
  stdio: 'ignore',
});

let exited = false;
let exitInfo = null;
child.once('exit', (code, signal) => {
  exited = true;
  exitInfo = { code, signal };
});

await new Promise((resolveDelay) => setTimeout(resolveDelay, 6000));

if (exited) {
  throw new Error(`Installed Tauri app exited early: ${JSON.stringify(exitInfo)}`);
}

child.kill();
await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));

const uninstaller = findFile(installDir, (name) => /^uninstall.*\.exe$/i.test(name));
if (uninstaller) {
  const uninstall = spawnSync(uninstaller, ['/S'], {
    cwd: installDir,
    encoding: 'utf8',
    timeout: 60000,
  });
  if (uninstall.status !== 0) {
    throw new Error(`NSIS silent uninstall failed: ${uninstall.stderr || uninstall.stdout}`);
  }
}

assertInsideSmokeRoot(installDir);
if (existsSync(installDir)) rmSync(installDir, { recursive: true, force: true });

console.log('Tauri Windows install smoke passed');
