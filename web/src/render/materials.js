export function createMaterialCache(THREE) {
  const cache = new Map();

  return {
    get(hex, options = {}) {
      const key = `${hex}:${JSON.stringify(options)}`;
      if (!cache.has(key)) {
        cache.set(key, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...options }));
      }
      return cache.get(key);
    },
    clear() {
      for (const material of cache.values()) {
        material.dispose?.();
      }
      cache.clear();
    },
    size() {
      return cache.size;
    },
  };
}

