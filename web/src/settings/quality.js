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

