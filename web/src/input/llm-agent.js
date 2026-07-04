import { GameSession } from '../core/session.js';
import { SeededRandom } from '../core/random.js';
import { nearestReachableTarget } from '../levels/solvability.js';

const HUMAN_DEFAULTS = {
  minThinkMs: 450,
  maxThinkMs: 1600,
  maxStepMs: 900,
  actionMs: 280,
  stopDistance: 1.15,
  patchDistance: 2.05,
  wanderChance: 0.08,
  pauseChance: 0.035,
  hesitationChance: 0.06,
};

function compactEntity(entity) {
  return {
    id: entity.id,
    x: Number(entity.pos.x.toFixed(2)),
    z: Number(entity.pos.z.toFixed(2)),
  };
}

function distance(a, b) {
  return Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
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

function nearestEntity(attempt, type) {
  const target = nearestReachableTarget(attempt, type);
  return target ? findTarget(attempt, target.id) : null;
}

function unfinishedPatch(attempt) {
  return nearestEntity(attempt, 'patch');
}

function moveVectorTo(player, target, jitter = { x: 0, z: 0 }, speed = 1) {
  const dx = target.pos.x + jitter.x - player.pos.x;
  const dz = target.pos.z + jitter.z - player.pos.z;
  const magnitude = Math.hypot(dx, dz) || 1;
  return {
    x: (dx / magnitude) * speed,
    z: (dz / magnitude) * speed,
  };
}

export class QuantumGardenAgent {
  constructor({ session = new GameSession(), tick = 1 / 30 } = {}) {
    this.session = session;
    this.tick = tick;
    this.human = {
      enabled: false,
      rng: new SeededRandom('quantum-garden-human-agent'),
      opts: { ...HUMAN_DEFAULTS },
      plan: null,
      nextDecisionAt: 0,
      nowMs: 0,
      lastAction: null,
    };
  }

  reset({ mode = 'single-player', levelId = 1, seed = `level-${levelId}`, spawnRules = null } = {}) {
    const levelDefinition = spawnRules
      ? { id: String(levelId), difficulty: Number(levelId), spawnRules }
      : null;
    this.session = new GameSession({ mode, levelId, seed, levelDefinition });
    this.session.start();
    this.human.plan = null;
    this.human.nextDecisionAt = 0;
    this.human.nowMs = 0;
    this.human.lastAction = null;
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
    this.human.lastAction = action;
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
        this.reset({
          mode: this.session.mode,
          levelId: action.levelId ?? this.session.levelId,
          seed: action.seed ?? `level-${action.levelId ?? this.session.levelId}`,
          spawnRules: action.spawnRules ?? null,
        });
        break;
      case 'nextLevel':
        this.nextLevel({
          levelId: action.levelId,
          seed: action.seed,
          spawnRules: action.spawnRules ?? null,
        });
        break;
      default:
        break;
    }
    return this.observe();
  }

  step(action) {
    if (action) this.act(action);
    this.session.step(this.tick);
    this.human.nowMs += this.tick * 1000;
    return this.observe();
  }

  setHumanMode(options = {}) {
    this.human.enabled = options.enabled ?? true;
    this.human.opts = { ...this.human.opts, ...options };
    if (options.seed) this.human.rng = new SeededRandom(options.seed);
    this.human.plan = null;
    this.human.nextDecisionAt = this.human.nowMs;
    return this.humanStatus();
  }

  humanStatus() {
    return {
      enabled: this.human.enabled,
      plan: this.human.plan ? { ...this.human.plan } : null,
      nextDecisionInMs: Math.max(0, Math.round(this.human.nextDecisionAt - this.human.nowMs)),
      lastAction: this.human.lastAction,
    };
  }

  thinkDelay() {
    return this.human.rng.float(this.human.opts.minThinkMs, this.human.opts.maxThinkMs);
  }

  chooseHumanPlan() {
    const { rng, opts } = this.human;
    const attempt = this.session.attempt;

    if (attempt.status !== 'running') return { type: 'wait', ms: opts.actionMs };
    if (rng.next() < opts.pauseChance) return { type: 'wait', ms: this.thinkDelay() };
    if (rng.next() < opts.hesitationChance) return { type: 'move', x: 0, z: 0, ms: opts.actionMs };
    if (rng.next() < opts.wanderChance) {
      const angle = rng.float(0, Math.PI * 2);
      return {
        type: 'move',
        x: Math.cos(angle),
        z: Math.sin(angle),
        ms: rng.float(opts.actionMs, opts.actionMs * 2.5),
      };
    }

    const trash = nearestEntity(attempt, 'trash');
    if (trash) {
      return {
        type: 'target',
        targetId: trash.id,
        ms: opts.actionMs,
        jitter: { x: rng.float(-0.35, 0.35), z: rng.float(-0.35, 0.35) },
      };
    }

    const patch = unfinishedPatch(attempt);
    if (patch) {
      const nearPatch = distance(attempt.player, patch) <= opts.patchDistance;
      if (nearPatch) return { type: 'plant', ms: opts.actionMs };
      return {
        type: 'target',
        targetId: patch.id,
        ms: opts.actionMs,
        jitter: { x: rng.float(-0.25, 0.25), z: rng.float(-0.25, 0.25) },
      };
    }

    const villain = nearestEntity(attempt, 'villain') ?? attempt.boss;
    if (villain) {
      return {
        type: 'target',
        targetId: villain.id,
        ms: opts.actionMs,
        jitter: { x: rng.float(-0.4, 0.4), z: rng.float(-0.4, 0.4) },
      };
    }

    return { type: 'move', x: 0, z: 0, ms: opts.actionMs };
  }

  applyHumanPlan(plan) {
    const attempt = this.session.attempt;
    if (plan.type === 'target') {
      const target = findTarget(attempt, plan.targetId);
      if (!target) return this.act({ type: 'move', x: 0, z: 0 });
      const vector = moveVectorTo(attempt.player, target, plan.jitter);
      return this.act({ type: 'move', x: vector.x, z: vector.z });
    }
    if (plan.type === 'plant') return this.act({ type: 'plantNearest' });
    if (plan.type === 'move') return this.act({ type: 'move', x: plan.x, z: plan.z });
    return this.act({ type: 'move', x: 0, z: 0 });
  }

  humanStep({ maxMs = this.human.opts.maxStepMs } = {}) {
    if (!this.human.enabled) this.setHumanMode({ enabled: true });
    const endAt = this.human.nowMs + maxMs;
    let observation = this.observe();
    while (this.human.nowMs < endAt && observation.status === 'running') {
      if (!this.human.plan || this.human.nowMs >= this.human.nextDecisionAt) {
        this.human.plan = this.chooseHumanPlan();
        this.human.nextDecisionAt = this.human.nowMs + (this.human.plan.ms ?? this.thinkDelay());
      }
      this.applyHumanPlan(this.human.plan);
      observation = this.step();
      if (this.human.nowMs >= this.human.nextDecisionAt) this.human.plan = null;
    }
    return {
      observation,
      human: this.humanStatus(),
    };
  }

  playLikeHuman({ maxMs = 1000, untilComplete = false, maxTotalMs = 30000 } = {}) {
    if (!this.human.enabled) this.setHumanMode({ enabled: true });
    const startMs = this.human.nowMs;
    let result = this.humanStep({ maxMs });
    while (untilComplete && result.observation.status === 'running' && this.human.nowMs - startMs < maxTotalMs) {
      result = this.humanStep({ maxMs });
    }
    return result;
  }

  nextLevel({ levelId = Number(this.session.levelId || this.session.level || 1) + 1, seed = `level-${levelId}`, spawnRules = null } = {}) {
    return this.reset({
      mode: this.session.mode,
      levelId,
      seed,
      spawnRules,
    });
  }
}
