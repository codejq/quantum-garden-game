export const PATCH_RADIUS = 2.2;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function plantNearestPatch(patches, playerPos) {
  const patch = patches.find((item) => !item.planted && distance(item.pos, playerPos) < PATCH_RADIUS);
  if (!patch) return null;
  patch.planted = true;
  return patch;
}

export function updatePatchGrowth(patches, dt) {
  for (const patch of patches) {
    if (patch.planted) patch.grow = Math.max(0, Math.min(1, patch.grow + dt * 0.9));
  }
}

