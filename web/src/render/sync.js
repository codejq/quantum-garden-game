export class EntityMeshSync {
  constructor({ scene, createMesh, updateMesh, disposeMesh }) {
    this.scene = scene;
    this.createMesh = createMesh;
    this.updateMesh = updateMesh;
    this.disposeMesh = disposeMesh;
    this.meshes = new Map();
  }

  sync(entities) {
    const seen = new Set();
    for (const entity of entities) {
      seen.add(entity.id);
      let mesh = this.meshes.get(entity.id);
      if (!mesh) {
        mesh = this.createMesh(entity);
        this.meshes.set(entity.id, mesh);
        this.scene?.add?.(mesh);
      }
      this.updateMesh(mesh, entity);
    }

    for (const [id, mesh] of this.meshes) {
      if (!seen.has(id)) {
        this.scene?.remove?.(mesh);
        this.disposeMesh?.(mesh);
        this.meshes.delete(id);
      }
    }
  }

  clear() {
    for (const mesh of this.meshes.values()) {
      this.scene?.remove?.(mesh);
      this.disposeMesh?.(mesh);
    }
    this.meshes.clear();
  }
}

