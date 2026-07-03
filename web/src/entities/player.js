const PLAYER_SPEED = 8;
const WORLD_RADIUS = 42;
const CENTER_BLOCK_RADIUS = 2.6;
const MOVE_LAG = 0.06;
const STOP_LAG = 0.09;

function length(x, z) {
  return Math.hypot(x, z);
}

function advanceVelocity(current, target, lag, dt) {
  const safeLag = Math.max(lag, 0.0001);
  const t = 1 - Math.exp(-dt / safeLag);
  return {
    velocity: current + (target - current) * t,
    distance: target * dt + (current - target) * safeLag * t,
  };
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
  const lag = input.moveX || input.moveZ ? MOVE_LAG : STOP_LAG;
  const x = advanceVelocity(player.vel.x, input.moveX * PLAYER_SPEED, lag, dt);
  const z = advanceVelocity(player.vel.z, input.moveZ * PLAYER_SPEED, lag, dt);
  player.vel.x = x.velocity;
  player.vel.z = z.velocity;
  player.pos.x += x.distance;
  player.pos.z += z.distance;

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
