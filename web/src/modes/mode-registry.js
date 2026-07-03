import { singlePlayerMode } from './single-player.js';

const modes = new Map([[singlePlayerMode.id, singlePlayerMode]]);

export function registerMode(mode) {
  if (!mode?.id) throw new Error('Mode must include an id');
  modes.set(mode.id, mode);
}

export function getMode(id = singlePlayerMode.id) {
  const mode = modes.get(id);
  if (!mode) throw new Error(`Unknown mode: ${id}`);
  return mode;
}

export function listModes() {
  return [...modes.values()];
}

