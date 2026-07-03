import { level001 } from './level-001.js';

const levels = new Map([[level001.id, level001]]);

export function registerLevel(level) {
  if (!level?.id) throw new Error('Level must include an id');
  levels.set(level.id, level);
}

export function getLevel(id = level001.id) {
  const level = levels.get(id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}

export function listLevels() {
  return [...levels.values()];
}

