export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'ar', 'es', 'fr'];
export const LOCALE_DIRECTIONS = {
  en: 'ltr',
  ar: 'rtl',
  es: 'ltr',
  fr: 'ltr',
};

export function interpolate(message, values = {}) {
  return message.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function createI18n(resources, initialLocale = DEFAULT_LOCALE) {
  let locale = SUPPORTED_LOCALES.includes(initialLocale) ? initialLocale : DEFAULT_LOCALE;

  function t(key, values) {
    const message = resources[locale]?.[key] ?? resources[DEFAULT_LOCALE]?.[key] ?? key;
    return interpolate(message, values);
  }

  return {
    t,
    get locale() {
      return locale;
    },
    setLocale(nextLocale) {
      locale = SUPPORTED_LOCALES.includes(nextLocale) ? nextLocale : DEFAULT_LOCALE;
      return locale;
    },
    dir(nextLocale = locale) {
      return LOCALE_DIRECTIONS[nextLocale] ?? LOCALE_DIRECTIONS[DEFAULT_LOCALE];
    },
  };
}

