import {
  createAttempt,
  pauseAttempt,
  requestPlant,
  resumeAttempt,
  runFixedSteps,
  serializeAttempt,
  setMoveInput,
  startAttempt,
  stepAttempt,
  teardownAttempt,
} from './simulation.js';

export class GameSession {
  constructor({ mode = 'single-player', level = 1, levelId = level, seed = `level-${levelId}` } = {}) {
    this.mode = mode;
    this.level = Number(levelId);
    this.levelId = levelId;
    this.seed = seed;
    this.attempt = createAttempt({ level: this.level, seed });
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
    this.attempt = createAttempt({ level: this.level, seed });
    return this.attempt;
  }
}
