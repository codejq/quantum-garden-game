const PLAYER_SPEED = 8;
const WORLD_RADIUS = 42;
const CENTER_BLOCK_RADIUS = 2.6;

function length(x, z) {
  return Math.hypot(x, z);
}

export function createPlayer(pos = { x: 6, z: 6 }) {
  return {
    id: 'player-001',
    pos: { x: pos.x, z: pos.z },
    vel: { x: 0, z: 0 },
    yaw: 0,
  };
}

export function updatePlayer(player, input, dt) {
  player.vel.x = input.moveX * PLAYER_SPEED;
  player.vel.z = input.moveZ * PLAYER_SPEED;
  player.pos.x += player.vel.x * dt;
  player.pos.z += player.vel.z * dt;

  const outerDistance = length(player.pos.x, player.pos.z);
  if (outerDistance > WORLD_RADIUS + 6) {
    const scale = (WORLD_RADIUS + 6) / outerDistance;
    player.pos.x *= scale;
    player.pos.z *= scale;
  }

  const centerDistance = length(player.pos.x, player.pos.z);
  if (centerDistance < CENTER_BLOCK_RADIUS) {
    const scale = CENTER_BLOCK_RADIUS / Math.max(centerDistance, 0.001);
    player.pos.x *= scale;
    player.pos.z *= scale;
  }

  if (length(player.vel.x, player.vel.z) > 0.1) {
    player.yaw = Math.atan2(player.vel.x, player.vel.z);
  }
}
