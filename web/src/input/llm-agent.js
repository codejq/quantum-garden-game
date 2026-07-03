import { GameSession } from '../core/session.js';
import { nearestReachableTarget } from '../levels/solvability.js';

function compactEntity(entity) {
  return {
    id: entity.id,
    x: Number(entity.pos.x.toFixed(2)),
    z: Number(entity.pos.z.toFixed(2)),
  };
}

function directionTo(player, target) {
  const dx = target.pos.x - player.pos.x;
  const dz = target.pos.z - player.pos.z;
  const distance = Math.hypot(dx, dz) || 1;
  return {
    x: dx / distance,
    z: dz / distance,
  };
}

function findTarget(attempt, targetId) {
  return [...attempt.trash, ...attempt.patches, ...attempt.villains, attempt.boss].filter(Boolean).find((item) => item.id === targetId);
}

export class QuantumGardenAgent {
  constructor({ session = new GameSession(), tick = 1 / 30 } = {}) {
    this.session = session;
    this.tick = tick;
  }

  reset({ mode = 'single-player', levelId = 1, seed = `level-${levelId}` } = {}) {
    this.session = new GameSession({ mode, levelId, seed });
    this.session.start();
    return this.observe();
  }

  observe() {
    const attempt = this.session.attempt;
    return {
      mode: this.session.mode,
      level: attempt.level,
      seed: attempt.seed,
      status: attempt.status,
      elapsed: Number(attempt.elapsed.toFixed(2)),
      score: attempt.score,
      objectives: {
        trashLeft: attempt.trash.length,
        trees: {
          done: attempt.treesLevel,
          total: attempt.patches.length,
        },
        minions: {
          done: attempt.converted,
          total: attempt.quota,
        },
        bossDefeated: attempt.bossSpawned && !attempt.boss,
      },
      player: {
        x: Number(attempt.player.pos.x.toFixed(2)),
        z: Number(attempt.player.pos.z.toFixed(2)),
        vx: Number(attempt.player.vel.x.toFixed(2)),
        vz: Number(attempt.player.vel.z.toFixed(2)),
        yaw: Number(attempt.player.yaw.toFixed(3)),
      },
      nearby: {
        trash: attempt.trash.slice(0, 10).map(compactEntity),
        patches: attempt.patches.filter((patch) => !patch.planted).slice(0, 10).map(compactEntity),
        villains: attempt.villains.slice(0, 10).map((villain) => ({
          ...compactEntity(villain),
          boss: villain.boss,
          hp: villain.hp,
        })),
      },
      boss: attempt.boss
        ? {
            ...compactEntity(attempt.boss),
            hp: attempt.boss.hp,
          }
        : null,
      camera: {
        availableActions: ['rotate', 'zoom', 'reset'],
      },
    };
  }

  act(action = {}) {
    const attempt = this.session.attempt;
    switch (action.type) {
      case 'move':
        this.session.setMove(action.x ?? 0, action.z ?? 0);
        break;
      case 'moveToward': {
        const target = findTarget(attempt, action.targetId);
        if (target) {
          const dir = directionTo(attempt.player, target);
          this.session.setMove(dir.x, dir.z);
        }
        break;
      }
      case 'moveToNearestTrash': {
        const target = nearestReachableTarget(attempt, 'trash');
        if (target) this.act({ type: 'moveToward', targetId: target.id });
        break;
      }
      case 'moveToNearestPatch': {
        const target = nearestReachableTarget(attempt, 'patch');
        if (target) this.act({ type: 'moveToward', targetId: target.id });
        break;
      }
      case 'collectNearest':
        this.act({ type: 'moveToNearestTrash' });
        break;
      case 'plant':
      case 'plantNearest':
        this.session.plant();
        break;
      case 'chaseNearestVillain': {
        const target = nearestReachableTarget(attempt, 'villain');
        if (target) this.act({ type: 'moveToward', targetId: target.id });
        break;
      }
      case 'attackBoss':
        if (attempt.boss) this.act({ type: 'moveToward', targetId: attempt.boss.id });
        break;
      case 'pause':
        this.session.pause();
        break;
      case 'resume':
        this.session.resume();
        break;
      case 'restart':
        this.reset({ mode: this.session.mode, levelId: this.session.levelId, seed: this.session.seed });
        break;
      case 'selectMode':
        this.reset({ mode: action.mode ?? this.session.mode, levelId: this.session.levelId, seed: this.session.seed });
        break;
      case 'selectLevel':
        this.reset({ mode: this.session.mode, levelId: action.levelId ?? this.session.levelId, seed: action.seed ?? `level-${action.levelId ?? this.session.levelId}` });
        break;
      default:
        break;
    }
    return this.observe();
  }

  step(action) {
    if (action) this.act(action);
    this.session.step(this.tick);
    return this.observe();
  }
}
