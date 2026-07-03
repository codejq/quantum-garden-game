export class FixedStepLoop {
  constructor({ tick = 1 / 60, maxFrameTime = 0.25, step }) {
    if (typeof step !== 'function') throw new Error('FixedStepLoop requires a step function');
    this.tick = tick;
    this.maxFrameTime = maxFrameTime;
    this.step = step;
    this.accumulator = 0;
    this.lastTime = null;
    this.running = false;
    this.frame = null;
  }

  advance(deltaSeconds) {
    this.accumulator += Math.min(deltaSeconds, this.maxFrameTime);
    let steps = 0;
    while (this.accumulator >= this.tick) {
      this.step(this.tick);
      this.accumulator -= this.tick;
      steps += 1;
    }
    return steps;
  }

  start(requestFrame = globalThis.requestAnimationFrame) {
    if (this.running) return;
    this.running = true;
    const run = (timeMs) => {
      if (!this.running) return;
      if (this.lastTime === null) this.lastTime = timeMs;
      const delta = (timeMs - this.lastTime) / 1000;
      this.lastTime = timeMs;
      this.advance(delta);
      this.frame = requestFrame(run);
    };
    this.frame = requestFrame(run);
  }

  stop(cancelFrame = globalThis.cancelAnimationFrame) {
    this.running = false;
    this.lastTime = null;
    if (this.frame !== null && cancelFrame) cancelFrame(this.frame);
    this.frame = null;
  }
}

