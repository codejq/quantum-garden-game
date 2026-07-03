const DEFAULT_WORLD_RADIUS = 42;
const DEFAULT_CENTER_BLOCK_RADIUS = 2.6;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function withinPlayableRing(pos, { worldRadius = DEFAULT_WORLD_RADIUS, centerBlockRadius = DEFAULT_CENTER_BLOCK_RADIUS } = {}) {
  const fromCenter = Math.hypot(pos.x, pos.z);
  return fromCenter >= centerBlockRadius && fromCenter <= worldRadius + 6;
}

function uniqueIds(items) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

export function validateAttemptLayout(attempt, options = {}) {
  const errors = [];
  const playerPos = attempt.player?.pos;
  if (!playerPos || !withinPlayableRing(playerPos, options)) {
    errors.push({ code: 'player-out-of-bounds', id: attempt.player?.id ?? 'player' });
  }

  const interactive = [...attempt.trash, ...attempt.patches, ...attempt.villains];
  if (attempt.boss) interactive.push(attempt.boss);

  if (!uniqueIds(interactive)) {
    errors.push({ code: 'duplicate-id' });
  }

  for (const item of interactive) {
    if (!withinPlayableRing(item.pos, options)) {
      errors.push({ code: 'object-out-of-bounds', id: item.id });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function nearestReachableTarget(attempt, type) {
  const playerPos = attempt.player.pos;
  const targets = {
    trash: attempt.trash,
    patch: attempt.patches.filter((patch) => !patch.planted),
    villain: attempt.villains,
  }[type] ?? [];

  return targets
    .filter((target) => withinPlayableRing(target.pos))
    .map((target) => ({ id: target.id, distance: distance(playerPos, target.pos) }))
    .sort((a, b) => a.distance - b.distance)[0] ?? null;
}

export function assertSolvableAttempt(attempt, options = {}) {
  const result = validateAttemptLayout(attempt, options);
  if (!result.ok) {
    const codes = result.errors.map((error) => `${error.code}${error.id ? `:${error.id}` : ''}`).join(', ');
    throw new Error(`Unsolvable layout: ${codes}`);
  }
  return attempt;
}

export function layoutSnapshot(attempt, validation = validateAttemptLayout(attempt)) {
  const point = (item) => ({
    id: item.id,
    x: Number(item.pos.x.toFixed(3)),
    z: Number(item.pos.z.toFixed(3)),
  });

  return {
    level: attempt.level,
    seed: attempt.seed,
    ok: validation.ok,
    errors: validation.errors.map((error) => ({ ...error })),
    player: {
      id: attempt.player?.id ?? 'player',
      x: Number(attempt.player.pos.x.toFixed(3)),
      z: Number(attempt.player.pos.z.toFixed(3)),
    },
    trash: attempt.trash.map(point),
    patches: attempt.patches.map(point),
    villains: attempt.villains.map(point),
    boss: attempt.boss ? point(attempt.boss) : null,
  };
}

export class LayoutGenerationError extends Error {
  constructor({ seed, level, maxAttempts, attempts }) {
    const codes = attempts.at(-1)?.errors.map((error) => error.code).join(', ') || 'unknown';
    super(`Unable to generate solvable layout for seed "${seed}" after ${maxAttempts} attempts: ${codes}`);
    this.name = 'LayoutGenerationError';
    this.seed = seed;
    this.level = level;
    this.maxAttempts = maxAttempts;
    this.attempts = attempts;
  }
}

export function generateSolvableAttempt(createAttempt, { level, seed, maxAttempts = 10 } = {}) {
  const attempts = [];
  for (let index = 0; index < maxAttempts; index += 1) {
    const attemptSeed = index === 0 ? seed : `${seed}:retry-${index}`;
    const attempt = createAttempt({ level, seed: attemptSeed });
    const result = validateAttemptLayout(attempt);
    if (result.ok) return attempt;
    attempts.push(layoutSnapshot(attempt, result));
  }

  throw new LayoutGenerationError({ seed, level, maxAttempts, attempts });
}
