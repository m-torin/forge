'use client';

import { useParams } from 'next/navigation';

import { useLocaleContext } from '../contexts/LocaleContext';

/**
 * Hook to get the current locale from Next.js params or context
 * Falls back to 'en' if no locale is found
 */
export function useLocale(): string {
  // Try to get locale from params first (for pages)
  const params = useParams();
  const urlLocale = params?.locale as string;

  // If no URL locale, try context (for components wrapped in LocaleProvider)
  const { locale: contextLocale } = useLocaleContext();

  return urlLocale || contextLocale || 'en';
}

/**
 * Helper function to prefix a path with the current locale
 * @param path - The path to localize (e.g., '/products/item')
 * @param locale - The locale to use (e.g., 'en')
 * @returns Localized path (e.g., '/en/products/item')
 */
export function localizeHref(path: string, locale: string): string {
  if (!path || path === '#' || path === '/#') {
    return path;
  }

  // Remove leading slash if present, then add locale prefix
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${cleanPath}`;
}

/**
 * Hook that returns a function to localize href paths
 */
export function useLocalizeHref() {
  const locale = useLocale();

  return (path: string) => localizeHref(path, locale);
}
