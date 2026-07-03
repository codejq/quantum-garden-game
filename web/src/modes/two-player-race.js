import { GameSession } from '../core/session.js';
import { getLevel } from '../levels/level-registry.js';

function createPlayerState(name, level, seed) {
  return {
    name,
    session: new GameSession({
      mode: 'two-player-race',
      levelId: level.id,
      levelDefinition: level,
      seed,
    }),
    result: null,
  };
}

export const twoPlayerRaceMode = {
  id: 'two-player-race',
  nameKey: 'modes.twoPlayerRace.name',

  setup({ levelId = 'level-001', seed = levelId, playerNames = ['Player 1', 'Player 2'] } = {}) {
    const level = getLevel(levelId);
    return {
      level,
      seed,
      activePlayerIndex: 0,
      handoff: false,
      players: [
        createPlayerState(playerNames[0] || 'Player 1', level, seed),
        createPlayerState(playerNames[1] || 'Player 2', level, seed),
      ],
    };
  },

  start(context) {
    context.players[context.activePlayerIndex].session.start();
    context.handoff = false;
    return context;
  },

  update(context, dt) {
    if (context.handoff) return context;
    const player = context.players[context.activePlayerIndex];
    player.session.step(dt);
    if (player.session.attempt.status === 'complete') {
      player.result = this.resultFor(player);
      if (context.activePlayerIndex === 0) {
        context.handoff = true;
      }
    }
    return context;
  },

  readyNextPlayer(context) {
    if (!context.handoff || context.activePlayerIndex !== 0) return context;
    context.activePlayerIndex = 1;
    context.handoff = false;
    context.players[1].session.start();
    return context;
  },

  onObjectiveEvent(context) {
    return context.players[context.activePlayerIndex].session.snapshot();
  },

  isComplete(context) {
    return context.players.every((player) => player.result);
  },

  resultFor(player) {
    const snapshot = player.session.snapshot();
    return {
      name: player.name,
      elapsed: snapshot.elapsed,
      score: snapshot.score,
      complete: snapshot.status === 'complete',
    };
  },

  getResults(context) {
    const results = context.players.map((player) => player.result ?? this.resultFor(player));
    const completeResults = results.filter((result) => result.complete);
    let winner = null;
    if (completeResults.length === 2) {
      winner = completeResults[0].elapsed <= completeResults[1].elapsed ? completeResults[0] : completeResults[1];
    }
    return {
      mode: this.id,
      levelId: context.level.id,
      seed: context.seed,
      handoff: context.handoff,
      activePlayerIndex: context.activePlayerIndex,
      players: results,
      winner,
      timeDifference: completeResults.length === 2 ? Math.abs(completeResults[0].elapsed - completeResults[1].elapsed) : null,
    };
  },
};
