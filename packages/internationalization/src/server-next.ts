/**
 * Server-side internationalization exports for Next.js
 *
 * This file provides server-side internationalization functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js-specific features.
 *
 * For non-Next.js applications, use '@repo/internationalization/server' instead.
 */

import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { createI18nMiddleware } from 'next-international/middleware';
import { NextRequest } from 'next/server';

import languine from '../languine.json';
import type { Dictionary } from './shared/dictionary-loader';

// Import shared functionality instead of re-exporting from server
import { createDictionaryLoader } from './shared/dictionary-loader';

// Create dictionary loader instance
const dictionaryLoader = createDictionaryLoader();

// Re-export types and utilities from shared loader
export type { Dictionary, Locale } from './shared/dictionary-loader';
export const locales = dictionaryLoader.getLocales();
export const getDictionary = dictionaryLoader.getDictionary;
export const isLocaleSupported = dictionaryLoader.isLocaleSupported;

// Re-export extend functionality
export type ExtendedDictionary<T extends Record<string, any>> = Dictionary & T;

export function createDictionary<T extends Record<string, any>>(
  getDictionary: (locale: string) => Promise<Dictionary>,
  getAppDictionary: (locale: string) => Promise<T>,
) {
  return async (locale: string): Promise<ExtendedDictionary<T>> => {
    const [baseDictionary, appDictionary] = await Promise.all([
      getDictionary(locale),
      getAppDictionary(locale),
    ]);

    return {
      ...baseDictionary,
      ...appDictionary,
    };
  };
}

// Next.js middleware functionality
const middlewareLocales = [languine.locale.source, ...languine.locale.targets];

const I18nMiddleware = createI18nMiddleware({
  defaultLocale: 'en',
  locales: middlewareLocales,
  resolveLocaleFromRequest: (request: any) => {
    const headers = Object.fromEntries(request.headers.entries());
    const negotiator = new Negotiator({ headers });
    const acceptedLanguages = negotiator.languages();

    // Filter out invalid locale identifiers that might cause Intl.getCanonicalLocales to throw
    const validLanguages = acceptedLanguages.filter((lang: string) => {
      try {
        Intl.getCanonicalLocales(lang);
        return true;
      } catch {
        return false;
      }
    });

    const matchedLocale = matchLocale(
      validLanguages.length > 0 ? validLanguages : ['en'],
      middlewareLocales,
      'en',
    );

    return matchedLocale;
  },
  urlMappingStrategy: 'rewriteDefault',
});

export function internationalizationMiddleware(request: NextRequest): any {
  return I18nMiddleware(request as any);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
