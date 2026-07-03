export const VILLAIN_RADIUS = 1.5;
export const BOSS_RADIUS = 2.2;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function hitVillain(villain, playerPos) {
  const hitRadius = villain.boss ? BOSS_RADIUS : VILLAIN_RADIUS;
  if (distance(villain.pos, playerPos) >= hitRadius) return false;
  villain.hp -= 1;
  if (villain.hp <= 0) villain.state = 'converted';
  return true;
}

export function moveVillainTowardTarget(villain, dt) {
  const dx = villain.target.x - villain.pos.x;
  const dz = villain.target.z - villain.pos.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 1) return false;
  villain.pos.x += (dx / dist) * villain.speed * dt;
  villain.pos.z += (dz / dist) * villain.speed * dt;
  return true;
}

