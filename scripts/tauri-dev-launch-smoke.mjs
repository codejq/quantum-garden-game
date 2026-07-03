import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args = process.platform === 'win32' ? ['/c', 'npm', 'run', 'tauri:dev'] : ['run', 'tauri:dev'];
const child = spawn(command, args, {
  cwd: root,
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let exited = false;
let exitInfo = null;

function append(chunk) {
  output += chunk.toString();
  if (output.length > 12000) output = output.slice(-12000);
}

child.stdout.on('data', append);
child.stderr.on('data', append);
child.once('exit', (code, signal) => {
  exited = true;
  exitInfo = { code, signal };
});

function killTree() {
  if (child.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

try {
  const deadline = Date.now() + 45000;
  let ready = false;

  while (Date.now() < deadline) {
    if (exited) {
      throw new Error(`Tauri dev launch exited early: ${JSON.stringify(exitInfo)}\n${output}`);
    }
    if (/Finished `dev` profile|Running DevCommand|http:\/\/127\.0\.0\.1:5173|Local:/i.test(output)) {
      ready = true;
      break;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
  }

  if (!ready) {
    throw new Error(`Tauri dev launch did not report readiness before timeout.\n${output}`);
  }

  await new Promise((resolveDelay) => setTimeout(resolveDelay, 5000));
  if (exited) {
    throw new Error(`Tauri dev launch exited after readiness: ${JSON.stringify(exitInfo)}\n${output}`);
  }
} finally {
  killTree();
}

console.log('Tauri dev launch smoke passed');
