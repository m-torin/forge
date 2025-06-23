import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/account/',
          '/*/account-*',
          '/*/checkout',
          '/*/cart',
          '/*/orders/',
          '/test-*',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/*/account/', '/*/checkout', '/*/cart'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
