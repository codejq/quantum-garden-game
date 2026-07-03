export function cleanupObjectives({ trash = true, planting = true, minions = true, boss = true } = {}) {
  return {
    trash,
    planting,
    minions,
    boss,
  };
}

export function levelCounts(levelNumber) {
  return {
    trash: 9 + levelNumber * 3,
    patches: 2 + Math.min(levelNumber, 5),
    minionQuota: 1 + Math.min(levelNumber, 5),
  };
}

