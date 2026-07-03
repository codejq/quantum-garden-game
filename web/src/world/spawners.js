export const WORLD_RADIUS = 42;

export function randomPoint(rng, minRadius, maxRadius) {
  const angle = rng.float(0, Math.PI * 2);
  const radius = rng.float(minRadius, maxRadius);
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  };
}

export function randomPlayerStart(rng) {
  return randomPoint(rng, 4, WORLD_RADIUS - 8);
}

export function makeId(prefix, n) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

