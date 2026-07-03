export function createSceneRuntime(THREE, mount, { width = globalThis.innerWidth ?? 1024, height = globalThis.innerHeight ?? 768 } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setPixelRatio?.(Math.min(globalThis.devicePixelRatio ?? 1, 2));
  renderer.setSize(width, height);
  if (renderer.shadowMap) renderer.shadowMap.enabled = true;
  mount?.appendChild?.(renderer.domElement);

  return {
    scene,
    camera,
    renderer,
    resize(nextWidth, nextHeight) {
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix?.();
      renderer.setSize(nextWidth, nextHeight);
    },
    dispose() {
      renderer.dispose?.();
      renderer.domElement?.remove?.();
    },
  };
}

