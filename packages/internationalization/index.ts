import 'server-only';

import languine from './languine.json';

import type en from './dictionaries/en.json';

export const locales = [languine.locale.source, ...languine.locale.targets] as const;

export type Dictionary = typeof en;

const dictionaries: Record<string, () => Promise<Dictionary>> = Object.fromEntries(
  locales.map((locale) => [
    locale,
    async () => {
      try {
        const mod = await import(`./dictionaries/${locale}.json`);
        return mod.default;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load dictionary for locale: ${locale}`, err);
        const fallbackMod = await import('./dictionaries/en.json');
        return fallbackMod.default;
      }
    },
  ]),
);

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split('-')[0];

  if (!locales.includes(normalizedLocale as any)) {
    // eslint-disable-next-line no-console
    console.warn(`Locale "${locale}" is not supported, defaulting to "en"`);
    return dictionaries['en']();
  }

  try {
    return await dictionaries[normalizedLocale]();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Error loading dictionary for locale "${normalizedLocale}", falling back to "en"`,
      error,
    );
    return dictionaries['en']();
  }
};
