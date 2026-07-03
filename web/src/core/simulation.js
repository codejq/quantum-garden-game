import { SeededRandom } from './random.js';
import { createPlayer, updatePlayer as updatePlayerEntity } from '../entities/player.js';
import { collectTrashItems, spawnTrashItem } from '../entities/trash.js';
import { plantNearestPatch, updatePatchGrowth } from '../entities/patch.js';
import { hitVillain, moveVillainTowardTarget } from '../entities/villain.js';
import { WORLD_RADIUS, makeId, randomPlayerStart, randomPoint } from '../world/spawners.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function len2(x, z) {
  return Math.hypot(x, z);
}

function targetFrom(rng) {
  return randomPoint(rng, 5, WORLD_RADIUS - 3);
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
      ...spawnTrashItem({
        id: makeId('trash', i + 1),
        pos: randomPoint(rng, 4, WORLD_RADIUS - 2),
        kind: rng.pick(['can', 'wrapper', 'paper', 'bottle', 'slice']),
      }),
    });
  }

  for (let i = 0; i < patchCount; i += 1) {
    patches.push({
      id: makeId('patch', i + 1),
      pos: randomPoint(rng, 7, WORLD_RADIUS - 6),
      planted: false,
      grow: 0,
    });
  }

  for (let i = 0; i < 70; i += 1) {
    decor.push({
      id: makeId('flower', i + 1),
      type: 'flower',
      pos: randomPoint(rng, 5, WORLD_RADIUS + 4),
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
    player: createPlayer(randomPlayerStart(rng)),
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
  const pos = randomPoint(attempt.rng, WORLD_RADIUS + 4, WORLD_RADIUS + 4);
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
  const result = collectTrashItems(attempt.trash, attempt.player.pos);
  attempt.trash = result.remaining;
  attempt.trashGot += result.collected.length;
  addScore(attempt, result.collected.length * 10);
}

function plantNearPatch(attempt) {
  if (!attempt.input.plant) return;
  attempt.input.plant = false;
  const patch = plantNearestPatch(attempt.patches, attempt.player.pos);
  if (!patch) return;
  attempt.treesLevel += 1;
  attempt.treesTotal += 1;
  addScore(attempt, 25);
}

function updatePlayer(attempt, dt) {
  updatePlayerEntity(attempt.player, attempt.input, dt);
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
    } else moveVillainTowardTarget(villain, dt);

    if (hitVillain(villain, attempt.player.pos)) {
      if (villain.hp <= 0) {
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
  updatePatchGrowth(attempt.patches, dt);
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
