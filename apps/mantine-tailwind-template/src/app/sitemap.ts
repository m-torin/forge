/**
 * Dynamic sitemap generation
 *
 * Generates SEO-friendly sitemap with locale support and authentication awareness
 */

import type { Locale } from '#/lib/i18n';
import { env } from '#/root/env';
import { MetadataRoute } from 'next';

// Supported locales based on available dictionaries
const supportedLocales: Locale[] = ['en', 'es', 'de', 'fr', 'pt'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currentDate = new Date();

  // Base routes that should be indexed
  const publicRoutes = [
    '', // Home page
  ];

  // Auth-protected routes (lower priority, no lastModified to indicate dynamic content)
  const protectedRoutes = ['profile', 'settings'];

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add public routes for each locale
  for (const locale of supportedLocales) {
    for (const route of publicRoutes) {
      const url = route ? `${baseUrl}/${locale}/${route}` : `${baseUrl}/${locale}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: locale === 'en' ? 1.0 : 0.8, // English gets highest priority
        alternates: {
          languages: Object.fromEntries(
            supportedLocales.map((loc: Locale) => [
              loc,
              route ? `${baseUrl}/${loc}/${route}` : `${baseUrl}/${loc}`,
            ]),
          ),
        },
      });
    }

    // Add protected routes with lower priority and no alternates
    for (const route of protectedRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${route}`,
        changeFrequency: 'weekly',
        priority: 0.3, // Lower priority for protected content
        // No lastModified for dynamic/protected content
      });
    }
  }

  // Add special pages
  sitemapEntries.push(
    // Login page (public but lower priority)
    ...supportedLocales.map((locale: Locale) => ({
      url: `${baseUrl}/${locale}/login`,
      changeFrequency: 'monthly' as const,
      priority: 0.2,
    })),
  );

  return sitemapEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Generate sitemap index for large sites (optional, for future expansion)
 */
export function generateSitemapIndex(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    },
  ];
}
