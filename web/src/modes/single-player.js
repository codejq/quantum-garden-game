import { GameSession } from '../core/session.js';
import { getLevel } from '../levels/level-registry.js';

export const singlePlayerMode = {
  id: 'single-player',
  nameKey: 'modes.singlePlayer.name',

  setup({ levelId = 'level-001', seed = levelId } = {}) {
    const level = getLevel(levelId);
    return {
      level,
      session: new GameSession({
        mode: this.id,
        levelId: level.difficulty,
        seed,
      }),
    };
  },

  start(context) {
    context.session.start();
    return context;
  },

  update(context, dt) {
    context.session.step(dt);
    return context;
  },

  onObjectiveEvent(context) {
    return context.session.snapshot();
  },

  isComplete(context) {
    return context.session.attempt.status === 'complete';
  },

  getResults(context) {
    const snapshot = context.session.snapshot();
    return {
      mode: this.id,
      levelId: context.level.id,
      score: snapshot.score,
      elapsed: snapshot.elapsed,
      trashGot: snapshot.trashGot,
      trees: snapshot.treesLevel,
      complete: snapshot.status === 'complete',
    };
  },
};

