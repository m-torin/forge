import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { createI18nMiddleware } from 'next-international/middleware';

import languine from '../languine.json';

import type { NextRequest } from 'next/server';

const locales = [languine.locale.source, ...languine.locale.targets];

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: 'rewriteDefault',
  defaultLocale: 'en',
  locales,
  resolveLocaleFromRequest: (request: any) => {
    const headers = Object.fromEntries(request.headers.entries());
    const negotiator = new Negotiator({ headers });
    const acceptedLanguages = negotiator.languages();

    const matchedLocale = matchLocale(acceptedLanguages, locales, 'en');

    return matchedLocale;
  },
});

export function internationalizationMiddleware(request: NextRequest): any {
  return I18nMiddleware(request as any);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

//https://nextjs.org/docs/app/building-your-application/routing/internationalization
//https://github.com/vercel/next.js/tree/canary/examples/i18n-routing
//https://github.com/QuiiBz/next-international
//https://next-international.vercel.app/docs/app-middleware-configuration
