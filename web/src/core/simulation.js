import { SeededRandom } from './random.js';

const WORLD_RADIUS = 42;
const PLAYER_SPEED = 8;
const TRASH_RADIUS = 1.35;
const PATCH_RADIUS = 2.2;
const VILLAIN_RADIUS = 1.5;
const BOSS_RADIUS = 2.2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function len2(x, z) {
  return Math.hypot(x, z);
}

function pointFrom(rng, minRadius, maxRadius) {
  const angle = rng.float(0, Math.PI * 2);
  const radius = rng.float(minRadius, maxRadius);
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  };
}

function targetFrom(rng) {
  return pointFrom(rng, 5, WORLD_RADIUS - 3);
}

function makeId(prefix, n) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

export function createAttempt({ level = 1, seed = `level-${level}` } = {}) {
  const rng = new SeededRandom(`${seed}:attempt`);
  const trashCount = 9 + level * 3;
  const patchCount = 2 + Math.min(level, 5);
  const quota = 1 + Math.min(level, 5);
  const trash = [];
  const patches = [];
  const decor = [];

  for (let i = 0; i < trashCount; i += 1) {
    trash.push({
      id: makeId('trash', i + 1),
      pos: pointFrom(rng, 4, WORLD_RADIUS - 2),
      kind: rng.pick(['can', 'wrapper', 'paper', 'bottle', 'slice']),
      collected: false,
    });
  }

  for (let i = 0; i < patchCount; i += 1) {
    patches.push({
      id: makeId('patch', i + 1),
      pos: pointFrom(rng, 7, WORLD_RADIUS - 6),
      planted: false,
      grow: 0,
    });
  }

  for (let i = 0; i < 70; i += 1) {
    decor.push({
      id: makeId('flower', i + 1),
      type: 'flower',
      pos: pointFrom(rng, 5, WORLD_RADIUS + 4),
      color: rng.pick(['pink', 'yellow', 'orange', 'purple', 'white', 'blue']),
    });
  }

  return {
    level,
    seed,
    rng,
    status: 'ready',
    elapsed: 0,
    score: 0,
    trashGot: 0,
    treesLevel: 0,
    treesTotal: 0,
    converted: 0,
    spawned: 0,
    quota,
    bossSpawned: false,
    bossSpawnTimer: 4,
    spawnTimer: 2,
    player: {
      id: 'player-001',
      pos: { x: 6, z: 6 },
      vel: { x: 0, z: 0 },
      yaw: 0,
    },
    input: {
      moveX: 0,
      moveZ: 0,
      plant: false,
    },
    trash,
    patches,
    villains: [],
    boss: null,
    decor,
    removed: [],
  };
}

export const buildAttempt = createAttempt;

export function serializeAttempt(attempt) {
  return {
    level: attempt.level,
    seed: attempt.seed,
    status: attempt.status,
    elapsed: Number(attempt.elapsed.toFixed(4)),
    score: attempt.score,
    trashGot: attempt.trashGot,
    treesLevel: attempt.treesLevel,
    converted: attempt.converted,
    spawned: attempt.spawned,
    bossSpawned: attempt.bossSpawned,
    player: {
      x: Number(attempt.player.pos.x.toFixed(3)),
      z: Number(attempt.player.pos.z.toFixed(3)),
    },
    trash: attempt.trash.map((item) => ({
      id: item.id,
      x: Number(item.pos.x.toFixed(3)),
      z: Number(item.pos.z.toFixed(3)),
      kind: item.kind,
      collected: item.collected,
    })),
    patches: attempt.patches.map((patch) => ({
      id: patch.id,
      x: Number(patch.pos.x.toFixed(3)),
      z: Number(patch.pos.z.toFixed(3)),
      planted: patch.planted,
    })),
    villains: attempt.villains.map((villain) => ({
      id: villain.id,
      x: Number(villain.pos.x.toFixed(3)),
      z: Number(villain.pos.z.toFixed(3)),
      boss: villain.boss,
      hp: villain.hp,
      state: villain.state,
    })),
    decor: attempt.decor.map((item) => ({
      id: item.id,
      type: item.type,
      x: Number(item.pos.x.toFixed(3)),
      z: Number(item.pos.z.toFixed(3)),
      color: item.color,
    })),
  };
}

export function startAttempt(attempt) {
  attempt.status = 'running';
}

export function pauseAttempt(attempt) {
  if (attempt.status === 'running') attempt.status = 'paused';
}

export function resumeAttempt(attempt) {
  if (attempt.status === 'paused') attempt.status = 'running';
}

export function completeAttempt(attempt) {
  attempt.status = 'complete';
}

export function exitAttempt(attempt) {
  attempt.status = 'exited';
  attempt.input.moveX = 0;
  attempt.input.moveZ = 0;
  attempt.input.plant = false;
}

export function teardownAttempt(attempt) {
  const removed = [
    ...attempt.trash.map((item) => item.id),
    ...attempt.patches.map((item) => item.id),
    ...attempt.villains.map((item) => item.id),
    ...attempt.decor.map((item) => item.id),
  ];
  if (attempt.boss) removed.push(attempt.boss.id);
  attempt.status = 'disposed';
  attempt.trash = [];
  attempt.patches = [];
  attempt.villains = [];
  attempt.decor = [];
  attempt.boss = null;
  attempt.removed.push(...removed);
  return removed;
}

export function setMoveInput(attempt, moveX, moveZ) {
  const length = Math.hypot(moveX, moveZ);
  attempt.input.moveX = length > 1 ? moveX / length : moveX;
  attempt.input.moveZ = length > 1 ? moveZ / length : moveZ;
}

export function requestPlant(attempt) {
  attempt.input.plant = true;
}

function addScore(attempt, value) {
  attempt.score += value;
}

function spawnVillain(attempt, boss = false) {
  const pos = pointFrom(attempt.rng, WORLD_RADIUS + 4, WORLD_RADIUS + 4);
  const villain = {
    id: boss ? 'boss-001' : makeId('villain', attempt.spawned + 1),
    boss,
    hp: boss ? 3 : 1,
    pos,
    target: targetFrom(attempt.rng),
    dropTimer: attempt.rng.float(boss ? 2 : 3.5, boss ? 3.5 : 6.5),
    speed: boss ? 3.4 : attempt.rng.float(1.8, 2.6),
    state: 'walk',
  };
  if (boss) {
    attempt.boss = villain;
    attempt.bossSpawned = true;
  } else {
    attempt.spawned += 1;
  }
  attempt.villains.push(villain);
}

function collectTrash(attempt) {
  for (const item of attempt.trash) {
    if (!item.collected && len2(item.pos.x - attempt.player.pos.x, item.pos.z - attempt.player.pos.z) < TRASH_RADIUS) {
      item.collected = true;
      attempt.trashGot += 1;
      addScore(attempt, 10);
    }
  }
  attempt.trash = attempt.trash.filter((item) => !item.collected);
}

function plantNearPatch(attempt) {
  if (!attempt.input.plant) return;
  attempt.input.plant = false;
  const patch = attempt.patches.find(
    (item) => !item.planted && len2(item.pos.x - attempt.player.pos.x, item.pos.z - attempt.player.pos.z) < PATCH_RADIUS,
  );
  if (!patch) return;
  patch.planted = true;
  attempt.treesLevel += 1;
  attempt.treesTotal += 1;
  addScore(attempt, 25);
}

function updatePlayer(attempt, dt) {
  const player = attempt.player;
  player.vel.x = attempt.input.moveX * PLAYER_SPEED;
  player.vel.z = attempt.input.moveZ * PLAYER_SPEED;
  player.pos.x += player.vel.x * dt;
  player.pos.z += player.vel.z * dt;
  const distance = len2(player.pos.x, player.pos.z);
  if (distance > WORLD_RADIUS + 6) {
    const scale = (WORLD_RADIUS + 6) / distance;
    player.pos.x *= scale;
    player.pos.z *= scale;
  }
  const centerDistance = len2(player.pos.x, player.pos.z);
  if (centerDistance < 2.6) {
    const scale = 2.6 / Math.max(centerDistance, 0.001);
    player.pos.x *= scale;
    player.pos.z *= scale;
  }
  if (len2(player.vel.x, player.vel.z) > 0.1) {
    player.yaw = Math.atan2(player.vel.x, player.vel.z);
  }
}

function updateVillains(attempt, dt) {
  if (!attempt.bossSpawned) {
    attempt.bossSpawnTimer -= dt;
    if (attempt.bossSpawnTimer <= 0) spawnVillain(attempt, true);
  }

  if (attempt.spawned < attempt.quota) {
    attempt.spawnTimer -= dt;
    if (attempt.spawnTimer <= 0) {
      spawnVillain(attempt, false);
      attempt.spawnTimer = attempt.rng.float(5, 8);
    }
  }

  for (const villain of attempt.villains) {
    if (villain.state !== 'walk') continue;
    const dx = villain.target.x - villain.pos.x;
    const dz = villain.target.z - villain.pos.z;
    const distance = len2(dx, dz);
    if (distance < 1) {
      villain.target = targetFrom(attempt.rng);
    } else {
      villain.pos.x += (dx / distance) * villain.speed * dt;
      villain.pos.z += (dz / distance) * villain.speed * dt;
    }

    const hitRadius = villain.boss ? BOSS_RADIUS : VILLAIN_RADIUS;
    if (len2(villain.pos.x - attempt.player.pos.x, villain.pos.z - attempt.player.pos.z) < hitRadius) {
      villain.hp -= 1;
      if (villain.hp <= 0) {
        villain.state = 'converted';
        if (villain.boss) addScore(attempt, 100);
        else {
          attempt.converted += 1;
          addScore(attempt, 30);
        }
      } else {
        addScore(attempt, 15);
        villain.target = targetFrom(attempt.rng);
      }
    }
  }

  attempt.villains = attempt.villains.filter((villain) => {
    const keep = villain.state !== 'converted';
    if (!keep && villain.boss) attempt.boss = null;
    return keep;
  });
}

function updatePatches(attempt, dt) {
  for (const patch of attempt.patches) {
    if (patch.planted) patch.grow = clamp(patch.grow + dt * 0.9, 0, 1);
  }
}

function updateWin(attempt) {
  const complete =
    attempt.trash.length === 0 &&
    attempt.patches.every((patch) => patch.planted) &&
    attempt.converted >= attempt.quota &&
    attempt.spawned >= attempt.quota &&
    attempt.bossSpawned &&
    !attempt.boss;
  if (complete) {
    attempt.status = 'complete';
    addScore(attempt, 50 + attempt.level * 10);
  }
}

export function stepAttempt(attempt, dt = 1 / 60) {
  if (attempt.status !== 'running') return;
  attempt.elapsed += dt;
  updatePlayer(attempt, dt);
  collectTrash(attempt);
  plantNearPatch(attempt);
  updatePatches(attempt, dt);
  updateVillains(attempt, dt);
  updateWin(attempt);
}

export function runFixedSteps(attempt, seconds, tick = 1 / 60) {
  const steps = Math.round(seconds / tick);
  for (let i = 0; i < steps; i += 1) stepAttempt(attempt, tick);
}
