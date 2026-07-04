import { level001, level002, level003 } from './level-001.js';
import { cleanupObjectives, levelCounts, levelWorld } from './templates.js';

const levels = new Map([
  [level001.id, level001],
  [level002.id, level002],
  [level003.id, level003],
]);

export function registerLevel(level) {
  if (!level?.id) throw new Error('Level must include an id');
  levels.set(level.id, level);
}

export function getLevel(id = level001.id) {
  const level = levels.get(id);
  if (!level) {
    const generated = generatedLevel(id);
    if (generated) return generated;
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

export function listLevels() {
  return [...levels.values()];
}

export function generatedLevel(id) {
  const match = /^level-(\d+)$/.exec(id);
  if (!match) return null;
  const difficulty = Number(match[1]);
  if (!Number.isInteger(difficulty) || difficulty <= 3) return null;

  return {
    id,
    nameKey: 'levels.generated.name',
    difficulty,
    world: levelWorld(difficulty),
    objectives: cleanupObjectives(),
    spawnRules: levelCounts(difficulty),
    timer: {
      type: 'elapsed',
    },
    boss: {
      enabled: true,
      spawnDelay: 4,
      hp: 3,
    },
    randomization: {
      seeded: true,
      randomizeGameplay: true,
      randomizeDecor: true,
      generated: true,
    },
  };
}
