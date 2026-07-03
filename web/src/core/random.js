export function hashSeed(value) {
  const text = String(value ?? 'quantum-garden');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class SeededRandom {
  constructor(seed = 'quantum-garden') {
    this.initialSeed = seed;
    this.state = hashSeed(seed) || 1;
  }

  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }

  pick(items) {
    if (!items.length) return undefined;
    return items[this.int(0, items.length - 1)];
  }
}

