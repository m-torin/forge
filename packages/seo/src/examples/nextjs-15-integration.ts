/**
 * @fileoverview Next.js 15 + next-sitemap Integration Example
 * @module @repo/seo/examples/nextjs-15-integration
 *
 * This example demonstrates how to integrate Next.js 15's native sitemap
 * functionality with next-sitemap for the best of both worlds.
 *
 * Benefits of this approach:
 * - Use Next.js 15's app directory for dynamic sitemaps
 * - Use next-sitemap for static generation and advanced features
 * - Automatic sitemap index generation for large sites
 * - Unified robots.txt generation
 *
 * Prerequisites:
 * - Next.js 15.0.0 or later
 * - next-sitemap 4.0.0 or later (optional)
 * - @repo/seo package
 *
 * @example
 * // 1. Create app directory sitemaps for dynamic content
 * // 2. Use next-sitemap for static pages and sitemap index
 * // 3. Combine both in robots.txt
 */

// ============================================
// STEP 1: App Directory Dynamic Sitemaps
// ============================================

// ============================================
// STEP 5: Helper for Hybrid Approach
// ============================================
import { MetadataRoute } from 'next';

// app/sitemaps/products/sitemap.ts
import {
  convertToNextSitemap,
  createIntegratedSitemapConfig,
  generateSitemapObject,
  type DynamicSitemapRoute,
} from '@repo/seo/server/next';

/**
 * Dynamic product sitemap using Next.js 15 native support
 * This will be available at /sitemaps/products/sitemap.xml
 */
export async function generateProductSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';

  // Fetch your products
  const products = await fetch(`${baseUrl}/api/products`).then((res: any) => res.json());

  const routes: DynamicSitemapRoute[] = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
    // Next.js 15 supports images in sitemaps!
    images: product.images?.map((img: any) => ({
      url: img.url,
      title: img.alt,
      caption: product.name,
    })),
  }));

  return generateSitemapObject(routes);
}

// app/sitemaps/blog/sitemap.ts
/**
 * Dynamic blog sitemap
 * This will be available at /sitemaps/blog/sitemap.xml
 */
export async function generateBlogSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';

  const posts = await fetch(`${baseUrl}/api/posts`).then((res: any) => res.json());

  const routes: DynamicSitemapRoute[] = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return generateSitemapObject(routes);
}

const config = createIntegratedSitemapConfig({
  siteUrl: process.env.SITE_URL || 'https://example.com',
  generateRobotsTxt: true,

  // Tell next-sitemap about your app directory sitemaps
  appDirSitemaps: ['/sitemaps/products/sitemap.xml', '/sitemaps/blog/sitemap.xml'],

  // Handle static pages with next-sitemap
  exclude: [
    '/api/*',
    '/admin/*',
    // Exclude dynamic routes handled by app directory
    '/products/*',
    '/blog/*',
  ],

  // Merge additional static routes
  additionalPaths: async (_config: any) => {
    return [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.8 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.7 },
    ];
  },

  // Advanced: Transform function for static pages
  transform: async (config, path: any) => {
    // Custom logic for specific paths
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    };
  },
});

export default config;

// ============================================
// STEP 3: Unified Robots.txt
// ============================================

// app/robots.ts
/**
 * Unified robots.txt that references all sitemaps
 * Both from next-sitemap and app directory
 */
export function robots(): MetadataRoute.Robots {
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
    // Reference all sitemaps
    sitemap: [
      `${baseUrl}/sitemap.xml`, // Main sitemap from next-sitemap
      `${baseUrl}/sitemap-0.xml`, // Additional sitemaps from next-sitemap
      `${baseUrl}/sitemaps/products/sitemap.xml`, // App directory sitemap
      `${baseUrl}/sitemaps/blog/sitemap.xml`, // App directory sitemap
    ],
  };
}

// ============================================
// STEP 4: Sitemap Index (Optional)
// ============================================

// app/sitemap.ts
/**
 * Main sitemap index that combines all sitemaps
 * This creates a sitemap index for very large sites
 */
export function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://example.com';

  // Return sitemap index entries
  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemaps/products/sitemap.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemaps/blog/sitemap.xml`,
      lastModified: new Date(),
    },
  ];
}

/**
 * Utility to fetch and merge sitemaps from different sources
 */
export async function mergeSitemaps(sources: string[]): Promise<MetadataRoute.Sitemap> {
  const allRoutes: MetadataRoute.Sitemap = [];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      const data = await response.json();
      allRoutes.push(...data);
    } catch (error: any) {
      console.error(`Failed to fetch sitemap from ${source}: `, error);
    }
  }

  return allRoutes;
}

/**
 * Convert between Next.js and next-sitemap formats
 */
export function convertSitemapFormats(
  nextjsSitemap: Array<{
    url: string;
    lastModified?: Date;
    changeFrequency?: string;
    priority?: number;
  }>,
) {
  return convertToNextSitemap(nextjsSitemap);
}
