import { getMode } from '../modes/mode-registry.js';

export class GameController {
  constructor({ modeId = 'single-player', levelId = 'level-001', seed = levelId } = {}) {
    this.modeId = modeId;
    this.levelId = levelId;
    this.seed = seed;
    this.mode = getMode(modeId);
    this.context = this.mode.setup({ levelId, seed });
  }

  start() {
    this.mode.start(this.context);
    return this.snapshot();
  }

  update(dt) {
    this.mode.update(this.context, dt);
    return this.snapshot();
  }

  pause() {
    this.context.session.pause();
    return this.snapshot();
  }

  resume() {
    this.context.session.resume();
    return this.snapshot();
  }

  exit() {
    this.context.session.exit();
    return this.snapshot();
  }

  retry(seed = this.seed) {
    this.seed = seed;
    this.context.session.retry(seed);
    return this.snapshot();
  }

  snapshot() {
    return {
      modeId: this.modeId,
      levelId: this.levelId,
      complete: this.mode.isComplete(this.context),
      result: this.mode.getResults(this.context),
      state: this.context.session.snapshot(),
    };
  }
}

