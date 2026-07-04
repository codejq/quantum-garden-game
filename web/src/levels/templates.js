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
    minionQuota: Math.min(18, 1 + levelNumber * 2),
  };
}

export function levelWorld(levelNumber) {
  const themes = ['meadow', 'pine-forest', 'flower-coast', 'rocky-grove', 'moon-garden'];
  return {
    radius: 42,
    theme: themes[(Math.max(1, levelNumber) - 1) % themes.length],
    decorScale: Math.min(1.7, 1 + levelNumber * 0.08),
  };
}
