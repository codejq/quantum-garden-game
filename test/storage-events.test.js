import test from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../web/src/core/events.js';
import { createDefaultSave, loadSave, migrateSave, saveGame, STORAGE_SCHEMA_VERSION } from '../web/src/core/storage.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('EventBus emits events and supports unsubscribe', () => {
  const bus = new EventBus();
  const events = [];
  const off = bus.on('score', (payload) => events.push(payload));
  bus.emit('score', { value: 10 });
  off();
  bus.emit('score', { value: 20 });
  assert.deepEqual(events, [{ value: 10 }]);
});

test('default save includes schema version', () => {
  const save = createDefaultSave();
  assert.equal(save.schemaVersion, STORAGE_SCHEMA_VERSION);
  assert.equal(save.language, 'en');
});

test('storage migrates unversioned saves', () => {
  const save = migrateSave({ language: 'ar', settings: { sound: false } });
  assert.equal(save.schemaVersion, STORAGE_SCHEMA_VERSION);
  assert.equal(save.language, 'ar');
  assert.equal(save.settings.sound, false);
  assert.equal(save.settings.reducedMotion, false);
});

test('saveGame and loadSave round-trip through injected storage', () => {
  const storage = memoryStorage();
  saveGame(storage, { language: 'fr', bestTimes: { 'level-1': 42 } });
  const save = loadSave(storage);
  assert.equal(save.language, 'fr');
  assert.equal(save.bestTimes['level-1'], 42);
});

