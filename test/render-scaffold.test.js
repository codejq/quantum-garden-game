import test from 'node:test';
import assert from 'node:assert/strict';
import { createMaterialCache } from '../web/src/render/materials.js';
import { EntityMeshSync } from '../web/src/render/sync.js';

test('material cache reuses and disposes materials', () => {
  const disposed = [];
  const THREE = {
    MeshStandardMaterial: class {
      constructor(options) {
        this.options = options;
      }
      dispose() {
        disposed.push(this.options.color);
      }
    },
  };
  const cache = createMaterialCache(THREE);
  assert.equal(cache.get(0xff0000), cache.get(0xff0000));
  assert.equal(cache.size(), 1);
  cache.clear();
  assert.deepEqual(disposed, [0xff0000]);
});

test('EntityMeshSync creates, updates, removes, and disposes meshes by id', () => {
  const added = [];
  const removed = [];
  const disposed = [];
  const scene = {
    add: (mesh) => added.push(mesh.id),
    remove: (mesh) => removed.push(mesh.id),
  };
  const sync = new EntityMeshSync({
    scene,
    createMesh: (entity) => ({ id: entity.id, x: 0 }),
    updateMesh: (mesh, entity) => {
      mesh.x = entity.x;
    },
    disposeMesh: (mesh) => disposed.push(mesh.id),
  });

  sync.sync([{ id: 'trash-1', x: 3 }]);
  sync.sync([{ id: 'trash-1', x: 5 }, { id: 'trash-2', x: 1 }]);
  sync.sync([{ id: 'trash-2', x: 2 }]);

  assert.deepEqual(added, ['trash-1', 'trash-2']);
  assert.deepEqual(removed, ['trash-1']);
  assert.deepEqual(disposed, ['trash-1']);
  assert.equal(sync.meshes.get('trash-2').x, 2);
});

