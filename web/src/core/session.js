import {
  createAttempt,
  exitAttempt,
  pauseAttempt,
  requestPlant,
  resumeAttempt,
  runFixedSteps,
  serializeAttempt,
  setMoveInput,
  startAttempt,
  stepAttempt,
  teardownAttempt,
  completeAttempt,
} from './simulation.js';

export class GameSession {
  constructor({ mode = 'single-player', level = 1, levelId = level, levelDefinition = null, seed = `level-${levelId}`, scoring = undefined } = {}) {
    this.mode = mode;
    this.levelDefinition = levelDefinition;
    this.level = levelDefinition?.difficulty ?? Number(levelId);
    this.levelId = levelId;
    this.seed = seed;
    this.scoring = scoring;
    this.attempt = createAttempt({ level: this.level, seed, spawnRules: levelDefinition?.spawnRules, scoring });
  }

  start() {
    startAttempt(this.attempt);
  }

  pause() {
    pauseAttempt(this.attempt);
  }

  resume() {
    resumeAttempt(this.attempt);
  }

  complete() {
    completeAttempt(this.attempt);
  }

  exit() {
    exitAttempt(this.attempt);
  }

  setMove(x, z) {
    setMoveInput(this.attempt, x, z);
  }

  plant() {
    requestPlant(this.attempt);
  }

  step(dt = 1 / 60) {
    stepAttempt(this.attempt, dt);
  }

  run(seconds, tick = 1 / 60) {
    runFixedSteps(this.attempt, seconds, tick);
  }

  snapshot() {
    return serializeAttempt(this.attempt);
  }

  teardown() {
    return teardownAttempt(this.attempt);
  }

  retry(seed = this.seed) {
    this.teardown();
    this.seed = seed;
    this.attempt = createAttempt({ level: this.level, seed, spawnRules: this.levelDefinition?.spawnRules, scoring: this.scoring });
    return this.attempt;
  }
}
