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
import { Dictionary } from './server';

// Re-export all server functionality
export * from './server';

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
const locales = [languine.locale.source, ...languine.locale.targets];

const I18nMiddleware = createI18nMiddleware({
  defaultLocale: 'en',
  locales,
  resolveLocaleFromRequest: (request: any) => {
    const headers = Object.fromEntries(request.headers.entries());
    const negotiator = new Negotiator({ headers });
    const acceptedLanguages = negotiator.languages();

    const matchedLocale = matchLocale(acceptedLanguages, locales, 'en');

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
