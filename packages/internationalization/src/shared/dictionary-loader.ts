/**
 * Shared dictionary loading utility
 *
 * This utility provides type-safe dictionary loading with proper error handling
 * and fallback mechanisms. It eliminates code duplication between server.ts and index.ts.
 */

import { logError, logWarn } from '@repo/observability/server';
import languine from '../../languine.json';
import type en from '../dictionaries/en.json';

const locales = [languine.locale.source, ...languine.locale.targets] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = typeof en;

// Type-safe error for dictionary loading
interface _DictionaryLoadError {
  locale: string;
  message: string;
  originalError: unknown;
}

/**
 * Creates a type-safe dictionary loader with proper error handling
 */
export function createDictionaryLoader() {
  const dictionaries: Record<Locale, () => Promise<Dictionary>> = Object.fromEntries(
    locales.map(locale => [
      locale,
      async (): Promise<Dictionary> => {
        try {
          const mod = await import(`../dictionaries/${locale}.json`);
          return mod.default;
        } catch (error) {
          logError(`Failed to load dictionary for locale: ${locale}`, {
            error: error instanceof Error ? error.message : String(error),
          });

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
        logWarn(`Locale "${locale}" is not supported, defaulting to "en"`);
        return dictionaries.en?.() ?? Promise.resolve({} as Dictionary);
      }

      try {
        return await (dictionaries[normalizedLocale]?.() ?? Promise.resolve({} as Dictionary));
      } catch (error) {
        logError(
          `Error loading dictionary for locale "${normalizedLocale}", falling back to "en"`,
          { error: error instanceof Error ? error.message : String(error) },
        );
        return dictionaries.en?.() ?? Promise.resolve({} as Dictionary);
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
