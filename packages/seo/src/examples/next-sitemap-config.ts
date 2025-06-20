/**
 * Next.js Sitemap Configuration Example (next-sitemap)
 *
 * Demonstrates how to configure automatic sitemap generation using the next-sitemap
 * package with @repo/seo helpers. This approach is ideal for static site generation
 * and automatic sitemap updates during build time.
 *
 * Setup Instructions:
 * 1. Place this file as next-sitemap.config.js in your Next.js app root
 * 2. Install next-sitemap: npm install --save-dev next-sitemap
 * 3. Add to package.json scripts: "postbuild": "next-sitemap"
 *
 * Features Demonstrated:
 * - Automatic sitemap generation
 * - robots.txt generation
 * - Custom URL exclusions
 * - Dynamic path additions
 * - Transform functions for custom logic
 * - Environment-specific configuration
 *
 * Prerequisites:
 * - next-sitemap package installed
 * - @repo/seo package configured
 * - SITE_URL environment variable set
 *
 * Environment: Build-time (Node.js)
 *
 * @see https://github.com/iamvishnusankar/next-sitemap
 */

// Import the helper from @repo/seo
import { createSitemapConfig, NextSitemapConfig } from '@repo/seo/server/next';

const config: NextSitemapConfig = createSitemapConfig({
  siteUrl: process.env.SITE_URL || 'https://example.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://example.com/my-custom-sitemap-1.xml',
      'https://example.com/my-custom-sitemap-2.xml',
    ],
  },
  exclude: ['/secret', '/admin/*', '/api/*', '*/draft', '*/preview'],
  // Optional: Custom transform function
  transform: async (config, path: any) => {
    // Custom logic to transform the sitemap entry
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  // Optional: Additional paths function
  additionalPaths: async () => {
    // Add dynamic paths not caught by static export
    const result: Array<{
      loc: string;
      changefreq?: string;
      priority?: number;
      lastmod?: string;
    }> = [];

    // Example: Add product pages
    // const products = await getProducts();
    // products.forEach((product: any) => {
    //   result.push({
    //     loc: `/products/${product.slug}`,
    //     changefreq: 'daily',
    //     priority: 0.8,
    //     lastmod: product.updatedAt,
    //   });
    // });

    return result;
  },
});

module.exports = config;
