export const STORAGE_SCHEMA_VERSION = 1;

export function createDefaultSave() {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    language: 'en',
    quality: 'high',
    cameraPreset: 'follow',
    bestTimes: {},
    settings: {
      sound: true,
      reducedMotion: false,
    },
  };
}

export function migrateSave(rawSave) {
  const defaults = createDefaultSave();
  if (!rawSave || typeof rawSave !== 'object') return defaults;

  if (!rawSave.schemaVersion) {
    return {
      ...defaults,
      language: rawSave.language ?? defaults.language,
      quality: rawSave.quality ?? defaults.quality,
      cameraPreset: rawSave.cameraPreset ?? defaults.cameraPreset,
      bestTimes: rawSave.bestTimes ?? defaults.bestTimes,
      settings: {
        ...defaults.settings,
        ...(rawSave.settings ?? {}),
      },
    };
  }

  if (rawSave.schemaVersion === STORAGE_SCHEMA_VERSION) {
    return {
      ...defaults,
      ...rawSave,
      settings: {
        ...defaults.settings,
        ...(rawSave.settings ?? {}),
      },
      schemaVersion: STORAGE_SCHEMA_VERSION,
    };
  }

  return defaults;
}

export function loadSave(storage, key = 'quantum-garden-save') {
  try {
    const raw = storage?.getItem(key);
    return migrateSave(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultSave();
  }
}

export function saveGame(storage, save, key = 'quantum-garden-save') {
  const migrated = migrateSave(save);
  storage?.setItem(key, JSON.stringify(migrated));
  return migrated;
}

