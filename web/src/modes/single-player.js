import { GameSession } from '../core/session.js';
import { getLevel } from '../levels/level-registry.js';

export const singlePlayerMode = {
  id: 'single-player',
  nameKey: 'modes.singlePlayer.name',

  getObjectives() {
    return [
      {
        id: 'trash',
        labelKey: 'trashLeft',
        icon: '🗑️',
        completeIcon: '✅',
        value: (state) => String(state.trash.length),
        done: (state) => state.trash.length === 0,
      },
      {
        id: 'trees',
        labelKey: 'trees',
        icon: '🌱',
        completeIcon: '✅',
        value: (state) => `${state.treesLevel}/${state.patches.length}`,
        done: (state) => state.patches.every((patch) => patch.planted),
      },
      {
        id: 'minions',
        labelKey: 'minions',
        icon: '😈',
        completeIcon: '✅',
        value: (state) => `${state.converted}/${state.quota}`,
        done: (state) => state.converted >= state.quota,
      },
      {
        id: 'boss',
        labelKey: 'boss',
        icon: '🎩',
        completeIcon: '✅',
        value: () => '',
        done: (state) => state.bossSpawned && !state.boss,
      },
    ];
  },

  setup({ levelId = 'level-001', seed = levelId } = {}) {
    const level = getLevel(levelId);
    return {
      level,
      objectives: this.getObjectives(),
      session: new GameSession({
        mode: this.id,
        levelId: level.id,
        levelDefinition: level,
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
