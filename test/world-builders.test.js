import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../web/src/world/builders.js', import.meta.url), 'utf8');

test('world builders module exports mesh builders for gameplay and decorative objects', () => {
  assert.match(source, /export function buildTreeMesh/);
  assert.match(source, /export function buildFlowerMesh/);
  assert.match(source, /export function buildRockMesh/);
  assert.match(source, /export function buildTrashMesh/);
  assert.match(source, /export function buildPatchMesh/);
  assert.match(source, /export function buildPlayerMesh/);
  assert.match(source, /export function buildVillainMesh/);
  assert.match(source, /export function buildCloudMesh/);
  assert.match(source, /export function createWorldBuilders/);
});

test('world builders are Three-injected and avoid global browser state', () => {
  assert.doesNotMatch(source, /window\./);
  assert.doesNotMatch(source, /document\./);
  assert.doesNotMatch(source, /globalThis\.THREE/);
  assert.match(source, /createWorldBuilders\(THREE, materials\)/);
  assert.match(source, /tree: \(options\) => buildTreeMesh\(THREE, materials, options\)/);
});
