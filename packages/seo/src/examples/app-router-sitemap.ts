/**
 * Next.js App Router Sitemap Example
 *
 * Demonstrates how to create dynamic sitemaps using Next.js 15 App Router's built-in
 * sitemap support with @repo/seo helpers. This approach provides maximum flexibility
 * for dynamic content and real-time sitemap generation.
 *
 * Setup Instructions:
 * 1. Place this file as app/sitemap.ts in your Next.js app
 * 2. No additional packages required - uses Next.js built-in support
 * 3. Sitemap available at /sitemap.xml
 *
 * Features Demonstrated:
 * - Dynamic sitemap generation at runtime
 * - Static and dynamic route handling
 * - Database-driven content inclusion
 * - Type-safe sitemap objects
 * - Custom metadata for each URL
 * - robots.txt integration
 *
 * Prerequisites:
 * - Next.js 15+ with App Router
 * - @repo/seo package configured
 * - NEXT_PUBLIC_URL environment variable set
 *
 * Environment: Next.js App Router (Server-Side)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';

import { generateSitemapObject, type DynamicSitemapRoute } from '@repo/seo/server/next';

// Example function to get your dynamic content
async function getProducts() {
  // Replace with your actual data fetching
  return [
    { slug: 'product-1', updatedAt: new Date('2024-01-01') },
    { slug: 'product-2', updatedAt: new Date('2024-01-02') },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';

  // Static routes
  const staticRoutes: DynamicSitemapRoute[] = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic routes (e.g., products)
  const products = await getProducts();
  const productRoutes: DynamicSitemapRoute[] = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Combine all routes
  const allRoutes = [...staticRoutes, ...productRoutes];

  // Use the helper to generate proper sitemap objects
  return generateSitemapObject(allRoutes);
}

// Optional: robots.txt using App Router
// Create app/robots.ts
// Note: This function should be in a separate app/robots.ts file
/*
export async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
*/
