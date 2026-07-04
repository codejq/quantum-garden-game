import { cleanupObjectives, levelCounts, levelWorld } from './templates.js';

export const level001 = {
  id: 'level-001',
  nameKey: 'levels.level001.name',
  difficulty: 1,
  world: levelWorld(1),
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

export const level002 = {
  ...level001,
  id: 'level-002',
  nameKey: 'levels.level002.name',
  difficulty: 2,
  world: levelWorld(2),
  spawnRules: levelCounts(2),
};

export const level003 = {
  ...level001,
  id: 'level-003',
  nameKey: 'levels.level003.name',
  difficulty: 3,
  world: levelWorld(3),
  spawnRules: levelCounts(3),
};
