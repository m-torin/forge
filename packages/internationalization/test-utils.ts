import languine from "./languine.json";

/**
 * Test utilities for internationalization
 * This file provides test-friendly versions of internationalization utilities
 * that can be used in tests without the 'server-only' restriction
 */
import type en from "./dictionaries/en.json";

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof en;
type Dictionaries = Record<keyof typeof locales, () => Promise<Dictionary>>;

const dictionaries = locales.reduce<Dictionaries>((acc, locale) => {
  acc[locale as keyof typeof locales] = () =>
    import(`./dictionaries/${locale}.json`).then((mod) => mod.default);
  return acc;
}, {} as Dictionaries);

export const getDictionary = async (locale: string) => {
  const dictionary = await dictionaries[locale as keyof typeof locales]();
  return dictionary;
};
