/**
 * Centralized routing configuration for next-intl
 * Defines supported locales and routing behavior
 */

import { defineRouting } from 'next-intl/routing';
import languine from '../languine.json';

// Extract locales from languine configuration
export const locales = [languine.locale.source, ...languine.locale.targets] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  // All supported locales
  locales,

  // Default locale when no match is found
  defaultLocale: languine.locale.source,

  // Use 'as-needed' to avoid prefix for default locale (en)
  // This means /about for English, /es/about for Spanish, etc.
  localePrefix: 'as-needed',

  // Locale detection based on accept-language header and cookies
  localeDetection: true,

  // Generate alternate links for SEO (hreflang)
  alternateLinks: true,

  // Optional: Define localized pathnames
  // Uncomment and configure if you need different URLs per locale
  // pathnames: {
  //   '/': '/',
  //   '/about': {
  //     en: '/about',
  //     es: '/acerca',
  //     de: '/uber-uns',
  //     fr: '/a-propos',
  //     pt: '/sobre'
  //   }
  // },

  // Optional: Configure domain-based routing
  // Uncomment and configure for multi-domain deployments
  // domains: [
  //   {
  //     domain: 'example.com',
  //     defaultLocale: 'en',
  //     locales: ['en']
  //   },
  //   {
  //     domain: 'example.es',
  //     defaultLocale: 'es',
  //     locales: ['es']
  //   }
  // ]
});
