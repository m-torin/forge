/**
 * Server-side internationalization exports for Next.js
 *
 * This file provides server-side internationalization functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js-specific features.
 *
 * For non-Next.js applications, use '@repo/internationalization/server' instead.
 */

// Re-export all server-side functions from next-intl
// Import hasLocale from the main package
import { hasLocale } from 'next-intl';

// Import shared functionality for dictionary loading
import type { Dictionary } from './shared/dictionary-loader';
import { createDictionaryLoader } from './shared/dictionary-loader';

export {
  getFormatter,
  getTranslations as getI18n,
  getLocale,
  getMessages,
  getNow,
  getTimeZone,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';
export { hasLocale };

// Re-export routing configuration
export { locales, routing, type Locale } from './routing';

// Re-export navigation utilities
export { getPathname, Link, permanentRedirect, redirect } from './navigation';

// Re-export middleware functionality
export { config, internationalizationMiddleware } from './middleware';

// Create dictionary loader instance for compatibility
const dictionaryLoader = createDictionaryLoader();

// Export dictionary-related functions for backward compatibility
export const getDictionary = dictionaryLoader.getDictionary;
export const isLocaleSupported = dictionaryLoader.isLocaleSupported;

// Re-export Dictionary type
export type { Dictionary };

// Re-export extend functionality for backward compatibility
export type ExtendedDictionary<T extends Record<string, any>> = Dictionary & T;

export function createDictionary<T extends Record<string, any>>(
  getBaseDictionary: (locale: string) => Promise<Dictionary>,
  getAppDictionary: (locale: string) => Promise<T>,
) {
  return async (locale: string): Promise<ExtendedDictionary<T>> => {
    const [baseDictionary, appDictionary] = await Promise.all([
      getBaseDictionary(locale),
      getAppDictionary(locale),
    ]);

    return {
      ...baseDictionary,
      ...appDictionary,
    };
  };
}
