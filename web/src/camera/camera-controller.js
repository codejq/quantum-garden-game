const PRESETS = {
  follow: { yaw: 0, pitch: 0.72, distance: 20, height: 3 },
  topDown: { yaw: 0, pitch: 1.45, distance: 30, height: 0 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class CameraController {
  constructor({ preset = 'follow' } = {}) {
    this.preset = preset;
    this.state = { ...PRESETS[preset] };
  }

  setPreset(preset) {
    if (!PRESETS[preset]) throw new Error(`Unknown camera preset: ${preset}`);
    this.preset = preset;
    this.state = { ...PRESETS[preset] };
  }

  rotate(dx, dy) {
    this.state.yaw += dx * 0.005;
    this.state.pitch = clamp(this.state.pitch + dy * 0.003, 0.35, 1.5);
  }

  zoom(delta) {
    this.state.distance = clamp(this.state.distance + delta * 0.02, 10, 42);
  }

  reset() {
    this.setPreset(this.preset);
  }

  positionFor(target) {
    const horizontal = Math.cos(this.state.pitch) * this.state.distance;
    return {
      x: target.x + Math.sin(this.state.yaw) * horizontal,
      y: target.y + this.state.height + Math.sin(this.state.pitch) * this.state.distance,
      z: target.z + Math.cos(this.state.yaw) * horizontal,
    };
  }

  apply(camera, target) {
    const pos = this.positionFor(target);
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(target.x, target.y + 1.2, target.z);
  }
}

export function cameraPresets() {
  return Object.keys(PRESETS);
}

