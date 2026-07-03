import { cleanupObjectives, levelCounts } from './templates.js';

export const level001 = {
  id: 'level-001',
  nameKey: 'levels.level001.name',
  difficulty: 1,
  world: {
    radius: 42,
  },
  objectives: cleanupObjectives(),
  spawnRules: levelCounts(1),
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
  },
};

