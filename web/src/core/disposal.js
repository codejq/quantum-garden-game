function disposeMaterial(material) {
  if (Array.isArray(material)) {
    for (const item of material) disposeMaterial(item);
    return;
  }
  if (!material) return;

  for (const value of Object.values(material)) {
    if (value && typeof value.dispose === 'function' && value.isTexture) {
      value.dispose();
    }
  }
  if (typeof material.dispose === 'function') material.dispose();
}

export function disposeObject3D(object) {
  if (!object) return { geometries: 0, materials: 0 };

  let geometries = 0;
  let materials = 0;

  object.traverse?.((child) => {
    if (child.geometry && typeof child.geometry.dispose === 'function') {
      child.geometry.dispose();
      geometries += 1;
    }

    if (child.material) {
      const count = Array.isArray(child.material) ? child.material.length : 1;
      disposeMaterial(child.material);
      materials += count;
    }
  });

  return { geometries, materials };
}

export function removeAndDispose(scene, object) {
  if (!object) return { geometries: 0, materials: 0 };
  scene?.remove?.(object);
  return disposeObject3D(object);
}

