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

export function generateSolvableAttempt(createAttempt, { level, seed, maxAttempts = 10 } = {}) {
  let lastResult = null;
  for (let index = 0; index < maxAttempts; index += 1) {
    const attemptSeed = index === 0 ? seed : `${seed}:retry-${index}`;
    const attempt = createAttempt({ level, seed: attemptSeed });
    const result = validateAttemptLayout(attempt);
    if (result.ok) return attempt;
    lastResult = result;
  }

  const codes = lastResult?.errors.map((error) => error.code).join(', ') || 'unknown';
  throw new Error(`Unable to generate solvable layout after ${maxAttempts} attempts: ${codes}`);
}
