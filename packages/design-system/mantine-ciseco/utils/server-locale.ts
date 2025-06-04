/**
 * Server-side locale utilities for Next.js 15
 * These functions work on both server and client side without requiring React hooks
 */

/**
 * Localizes a path with the given locale
 * @param path - The path to localize
 * @param locale - The locale to use (e.g., 'en', 'fr', 'es')
 * @returns The localized path
 */
export function localizeHref(path: string, locale: string): string {
  if (!path || path === '#' || path === '/#') {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Return localized path
  return `/${locale}/${cleanPath}`;
}

/**
 * Extracts locale from a URL pathname
 * @param pathname - The pathname to extract locale from
 * @returns The locale or 'en' as default
 */
export function extractLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // Check if first segment is a valid locale (you can extend this list)
  const validLocales = ['en', 'fr', 'es', 'pt', 'de'];

  if (validLocales.includes(firstSegment)) {
    return firstSegment;
  }

  return 'en'; // default locale
}

/**
 * Creates a localized href function bound to a specific locale
 * @param locale - The locale to bind to
 * @returns A function that localizes hrefs with the bound locale
 */
export function createLocalizedHrefFunction(locale: string) {
  return (path: string) => localizeHref(path, locale);
}
