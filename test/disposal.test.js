import test from 'node:test';
import assert from 'node:assert/strict';
import { disposeObject3D, removeAndDispose } from '../web/src/core/disposal.js';

function disposable() {
  return {
    disposed: false,
    dispose() {
      this.disposed = true;
    },
  };
}

function objectWithChildren(children) {
  return {
    children,
    traverse(visitor) {
      visitor(this);
      for (const child of children) visitor(child);
    },
  };
}

test('disposeObject3D disposes child geometry and material', () => {
  const geometry = disposable();
  const material = disposable();
  const object = objectWithChildren([{ geometry, material }]);

  const result = disposeObject3D(object);

  assert.equal(result.geometries, 1);
  assert.equal(result.materials, 1);
  assert.equal(geometry.disposed, true);
  assert.equal(material.disposed, true);
});

test('removeAndDispose removes object from scene before disposal', () => {
  const removed = [];
  const scene = { remove: (object) => removed.push(object) };
  const object = objectWithChildren([{ geometry: disposable(), material: [disposable(), disposable()] }]);

  const result = removeAndDispose(scene, object);

  assert.equal(removed[0], object);
  assert.equal(result.geometries, 1);
  assert.equal(result.materials, 2);
});

