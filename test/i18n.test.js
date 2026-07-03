import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createI18n, DEFAULT_LOCALE, LOCALE_DIRECTIONS, SUPPORTED_LOCALES } from '../web/src/i18n/index.js';

function readLocale(locale) {
  return JSON.parse(readFileSync(resolve('web/src/i18n/locales', `${locale}.json`), 'utf8'));
}

const resources = Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, readLocale(locale)]));

test('English is the default locale', () => {
  const i18n = createI18n(resources);
  assert.equal(DEFAULT_LOCALE, 'en');
  assert.equal(i18n.locale, 'en');
  assert.equal(i18n.t('app.title'), 'Clean Garden');
});

test('all locales contain the same keys as English', () => {
  const englishKeys = Object.keys(resources.en).sort();
  for (const locale of SUPPORTED_LOCALES) {
    assert.deepEqual(Object.keys(resources[locale]).sort(), englishKeys, locale);
  }
});

test('Arabic is RTL and other supported locales are LTR', () => {
  assert.equal(LOCALE_DIRECTIONS.ar, 'rtl');
  assert.equal(LOCALE_DIRECTIONS.en, 'ltr');
  assert.equal(LOCALE_DIRECTIONS.es, 'ltr');
  assert.equal(LOCALE_DIRECTIONS.fr, 'ltr');
});

test('translator falls back to English for missing keys and locales', () => {
  const i18n = createI18n({ en: resources.en, fr: {} }, 'fr');
  assert.equal(i18n.t('actions.start'), 'Start Adventure');
  assert.equal(i18n.setLocale('unknown'), 'en');
});

test('translator interpolates values', () => {
  const i18n = createI18n(resources, 'en');
  assert.equal(i18n.t('mission.trees', { done: 1, total: 3 }), 'Trees: 1/3');
});

