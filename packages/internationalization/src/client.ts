/**
 * Client-side internationalization exports
 * These functions are safe to use in browser environments
 * For React/Next.js components, use '@repo/internationalization/client/next' instead
 */

// Re-export core client utilities from next-intl
// Import routing for client utilities
import type { Locale } from './routing';
import { routing, locales as routingLocales } from './routing';

export {
  IntlProvider,
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useTranslations,
} from 'next-intl';

// Re-export types
export type { Locale } from './routing';

// Export locales for backward compatibility
export const locales = routingLocales;

// Browser-safe locale utilities
export function isValidLocale(locale: string): locale is Locale {
  return routingLocales.includes(locale as any);
}

export function getDefaultLocale(): Locale {
  return routing.defaultLocale;
}

// Browser-safe locale detection
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return getDefaultLocale();
  }

  const browserLang = navigator.language.split('-')[0];
  return isValidLocale(browserLang) ? (browserLang as Locale) : getDefaultLocale();
}
