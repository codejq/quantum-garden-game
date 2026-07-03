export const TRASH_RADIUS = 1.35;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function collectTrashItems(trash, playerPos) {
  const collected = [];
  const remaining = [];

  for (const item of trash) {
    if (!item.collected && distance(item.pos, playerPos) < TRASH_RADIUS) {
      collected.push({ ...item, collected: true });
    } else {
      remaining.push(item);
    }
  }

  return { collected, remaining };
}

export function spawnTrashItem({ id, pos, kind }) {
  return {
    id,
    pos,
    kind,
    collected: false,
  };
}

