/**
 * Shared dictionary loading utility
 *
 * This utility provides type-safe dictionary loading with proper error handling
 * and fallback mechanisms. It eliminates code duplication between server.ts and index.ts.
 */

import languine from '../../languine.json';
import type en from '../dictionaries/en.json';

export const locales = [languine.locale.source, ...languine.locale.targets] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = typeof en;

// Type-safe error for dictionary loading
export interface DictionaryLoadError {
  locale: string;
  message: string;
  originalError: unknown;
}

/**
 * Creates a type-safe dictionary loader with proper error handling
 */
export function createDictionaryLoader() {
  const dictionaries: Record<Locale, () => Promise<Dictionary>> = Object.fromEntries(
    locales.map((locale) => [
      locale,
      async (): Promise<Dictionary> => {
        try {
          const mod = await import(`../dictionaries/${locale}.json`);
          return mod.default;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load dictionary for locale: ${locale}`, error);

          // Fallback to English dictionary
          const fallbackMod = await import('../dictionaries/en.json');
          return fallbackMod.default;
        }
      },
    ]) satisfies Array<[Locale, () => Promise<Dictionary>]>,
  ) as Record<Locale, () => Promise<Dictionary>>;

  return {
    /**
     * Loads a dictionary for the specified locale with proper type safety and fallbacks
     */
    async getDictionary(locale: string): Promise<Dictionary> {
      const normalizedLocale = locale.split('-')[0] as Locale;

      if (!locales.includes(normalizedLocale)) {
        // eslint-disable-next-line no-console
        console.warn(`Locale "${locale}" is not supported, defaulting to "en"`);
        return dictionaries.en!();
      }

      try {
        return await dictionaries[normalizedLocale]!();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Error loading dictionary for locale "${normalizedLocale}", falling back to "en"`,
          error,
        );
        return dictionaries.en!();
      }
    },

    /**
     * Get all available locales
     */
    getLocales: () => locales,

    /**
     * Check if a locale is supported
     */
    isLocaleSupported: (locale: string): boolean => {
      const normalizedLocale = locale.split('-')[0] as Locale;
      return locales.includes(normalizedLocale);
    },
  };
}
