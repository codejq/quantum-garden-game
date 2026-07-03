import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const mainSource = readFileSync(new URL('../web/src/main.js', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const smokeSource = readFileSync(new URL('../scripts/localized-viewport-smoke.mjs', import.meta.url), 'utf8');

test('active game supports locale override for offline visual checks', () => {
  assert.match(mainSource, /new URLSearchParams\(location\.search\)\.get\('locale'\)/);
  assert.match(mainSource, /ACTIVE_I18N\[requestedLocale\]\?requestedLocale/);
});

test('offline build runs localized viewport smoke for all supported locales', () => {
  assert.match(packageJson.scripts['test:offline-build'], /localized-viewport-smoke\.mjs/);
  for (const locale of ['en', 'ar', 'es', 'fr']) {
    assert.match(smokeSource, new RegExp(`'${locale}'`));
  }
  assert.match(smokeSource, /mobile-portrait/);
  assert.match(smokeSource, /desktop/);
});
