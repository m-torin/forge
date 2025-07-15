/**
 * Dynamic robots.txt generation
 *
 * Generates SEO-friendly robots.txt with locale support
 */

import { env } from '#/root/env';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en/', '/es/', '/fr/', '/de/', '/ja/'],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dev/',
          '/login',
          '/profile',
          '/signup',
          '/*.json',
        ],
      },
      // Allow search engines to crawl public pages
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
