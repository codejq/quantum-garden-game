export const QUALITY_PRESETS = {
  low: {
    shadows: false,
    maxPixelRatio: 1,
    flowerMultiplier: 0.45,
    particleMultiplier: 0.5,
    cloudMultiplier: 0.6,
  },
  high: {
    shadows: true,
    maxPixelRatio: 2,
    flowerMultiplier: 1,
    particleMultiplier: 1,
    cloudMultiplier: 1,
  },
};

export function isQualityName(name) {
  return Object.hasOwn(QUALITY_PRESETS, name);
}

export function chooseDefaultQuality({ isMobile = false, devicePixelRatio = 1 } = {}) {
  return isMobile || devicePixelRatio > 2 ? 'low' : 'high';
}

export function getQualityPreset(name = 'high') {
  return QUALITY_PRESETS[name] ?? QUALITY_PRESETS.high;
}

export function applyRendererQuality(renderer, qualityName) {
  const quality = getQualityPreset(qualityName);
  renderer.setPixelRatio?.(Math.min(globalThis.devicePixelRatio ?? 1, quality.maxPixelRatio));
  if (renderer.shadowMap) renderer.shadowMap.enabled = quality.shadows;
  return quality;
}

export function prefersReducedMotion(matchMedia = globalThis.matchMedia) {
  return Boolean(matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

export function readQualitySetting(save, fallback = 'high') {
  return isQualityName(save?.quality) ? save.quality : fallback;
}

export function writeQualitySetting(storage, qualityName, { loadSave, saveGame } = {}) {
  if (!isQualityName(qualityName)) throw new Error(`Unknown quality preset: ${qualityName}`);
  if (typeof loadSave !== 'function' || typeof saveGame !== 'function') {
    throw new Error('writeQualitySetting requires loadSave and saveGame helpers');
  }
  const save = loadSave(storage);
  return saveGame(storage, { ...save, quality: qualityName });
}
