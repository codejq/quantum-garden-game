function mat(materials, color, options) {
  return materials?.get ? materials.get(color, options) : { color, ...options };
}

function mesh(THREE, geometry, material, { castShadow = true, receiveShadow = false } = {}) {
  const item = new THREE.Mesh(geometry, material);
  item.castShadow = castShadow;
  item.receiveShadow = receiveShadow;
  return item;
}

export function buildTreeMesh(THREE, materials, { type = 'round' } = {}) {
  const group = new THREE.Group();
  const trunk = mesh(
    THREE,
    new THREE.CylinderGeometry(0.22, 0.28, 1.6, 8),
    mat(materials, 0x7a4b2a),
  );
  trunk.position.y = 0.8;
  group.add(trunk);

  if (type === 'pine') {
    for (let i = 0; i < 3; i += 1) {
      const leaves = mesh(
        THREE,
        new THREE.ConeGeometry(1.05 - i * 0.18, 1.25, 8),
        mat(materials, 0x2f9e44),
      );
      leaves.position.y = 1.65 + i * 0.55;
      group.add(leaves);
    }
  } else {
    const leaves = mesh(
      THREE,
      new THREE.SphereGeometry(1.0, 12, 10),
      mat(materials, 0x51cf66),
    );
    leaves.position.y = 2.0;
    group.add(leaves);
  }

  group.userData.kind = 'tree';
  return group;
}

export function buildFlowerMesh(THREE, materials, { petalColor = 0xff6b9a } = {}) {
  const group = new THREE.Group();
  const stem = mesh(
    THREE,
    new THREE.CylinderGeometry(0.025, 0.025, 0.45, 5),
    mat(materials, 0x2f9e44),
  );
  stem.position.y = 0.22;
  group.add(stem);

  for (let i = 0; i < 6; i += 1) {
    const petal = mesh(
      THREE,
      new THREE.SphereGeometry(0.1, 6, 4),
      mat(materials, petalColor),
    );
    const angle = (i / 6) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.14, 0.48, Math.sin(angle) * 0.14);
    group.add(petal);
  }

  const center = mesh(
    THREE,
    new THREE.SphereGeometry(0.08, 6, 4),
    mat(materials, 0xffd166),
  );
  center.position.y = 0.48;
  group.add(center);
  group.userData.kind = 'flower';
  return group;
}

export function buildRockMesh(THREE, materials) {
  const rock = mesh(
    THREE,
    new THREE.DodecahedronGeometry(0.45, 0),
    mat(materials, 0x8d99ae),
    { receiveShadow: true },
  );
  rock.scale.set(1.2, 0.55, 0.85);
  rock.userData.kind = 'rock';
  return rock;
}

export function buildTrashMesh(THREE, materials, { color = 0xffd166 } = {}) {
  const trash = mesh(
    THREE,
    new THREE.BoxGeometry(0.45, 0.24, 0.32),
    mat(materials, color),
  );
  trash.position.y = 0.22;
  trash.userData.kind = 'trash';
  return trash;
}

export function buildPatchMesh(THREE, materials) {
  const patch = mesh(
    THREE,
    new THREE.CylinderGeometry(0.85, 0.95, 0.05, 24),
    mat(materials, 0x8ce99a),
    { castShadow: false, receiveShadow: true },
  );
  patch.position.y = 0.03;
  patch.userData.kind = 'patch';
  return patch;
}

export function buildPlayerMesh(THREE, materials) {
  const group = new THREE.Group();
  const body = mesh(
    THREE,
    new THREE.CapsuleGeometry(0.45, 0.85, 6, 10),
    mat(materials, 0x4dabf7),
  );
  body.position.y = 1.0;
  group.add(body);

  const head = mesh(
    THREE,
    new THREE.SphereGeometry(0.34, 12, 10),
    mat(materials, 0xffd8a8),
  );
  head.position.y = 1.75;
  group.add(head);
  group.userData.kind = 'player';
  return group;
}

export function buildVillainMesh(THREE, materials, { boss = false } = {}) {
  const group = new THREE.Group();
  const body = mesh(
    THREE,
    new THREE.CapsuleGeometry(boss ? 0.62 : 0.42, boss ? 1.1 : 0.75, 6, 10),
    mat(materials, boss ? 0x7b2cbf : 0xe03131),
  );
  body.position.y = boss ? 1.25 : 0.95;
  group.add(body);

  const hat = mesh(
    THREE,
    new THREE.CylinderGeometry(boss ? 0.48 : 0.34, boss ? 0.48 : 0.34, 0.18, 16),
    mat(materials, 0x252422),
  );
  hat.position.y = boss ? 2.05 : 1.58;
  group.add(hat);
  group.userData.kind = boss ? 'boss' : 'villain';
  return group;
}

export function buildCloudMesh(THREE, materials) {
  const group = new THREE.Group();
  for (const [x, scale] of [[-0.55, 0.8], [0, 1.05], [0.6, 0.75]]) {
    const puff = mesh(
      THREE,
      new THREE.SphereGeometry(scale, 10, 8),
      mat(materials, 0xffffff, { roughness: 1 }),
      { castShadow: false },
    );
    puff.position.x = x;
    group.add(puff);
  }
  group.userData.kind = 'cloud';
  return group;
}

export function createWorldBuilders(THREE, materials) {
  return {
    tree: (options) => buildTreeMesh(THREE, materials, options),
    flower: (options) => buildFlowerMesh(THREE, materials, options),
    rock: (options) => buildRockMesh(THREE, materials, options),
    trash: (options) => buildTrashMesh(THREE, materials, options),
    patch: (options) => buildPatchMesh(THREE, materials, options),
    player: (options) => buildPlayerMesh(THREE, materials, options),
    villain: (options) => buildVillainMesh(THREE, materials, options),
    cloud: (options) => buildCloudMesh(THREE, materials, options),
  };
}
