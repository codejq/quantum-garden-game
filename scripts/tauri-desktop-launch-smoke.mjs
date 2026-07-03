import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const executable = resolve(root, 'src-tauri/target/release/clean-garden.exe');

if (!existsSync(executable)) {
  throw new Error(`Tauri executable not found. Run npm run tauri:build first: ${executable}`);
}

const child = spawn(executable, [], {
  cwd: root,
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
  throw new Error(`Tauri desktop launch exited early: ${JSON.stringify(exitInfo)}`);
}

child.kill();
await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));

console.log('Tauri desktop launch smoke passed');
