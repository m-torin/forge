/**
 * Sitemap Parser Workflow
 * Fetch and parse sitemaps from multiple brands for tracking in database
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepCircuitBreaker,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const SitemapParserInput = z.object({
  brands: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        domain: z.string().url(),
        sitemapPatterns: z.array(z.string()).optional(), // e.g., ['/sitemap.xml', '/sitemap-index.xml']
        sitemapUrls: z.array(z.string().url()).optional(),
      }),
    )
    .min(1),
  options: z
    .object({
      followSitemapIndex: z.boolean().default(true),
      maxDepth: z.number().min(1).max(5).default(3),
      maxUrlsPerSitemap: z.number().default(50000),
      respectRobotsTxt: z.boolean().default(true),
      // timeout: z.number().default(30000), // 30 seconds per sitemap
      userAgent: z.string().default('BackstageBot/1.0 (+https://example.com/bot)'),
    })
    .optional(),
  tracking: z
    .object({
      purposes: z.array(z.enum(['seo', 'inventory', 'monitoring', 'analytics'])).default(['seo']),
      updateFrequency: z.enum(['always', 'hourly', 'daily', 'weekly']).default('daily'),
    })
    .optional(),
});

// Sitemap entry schema
const SitemapEntry = z.object({
  changefreq: z
    .enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
    .optional(),
  images: z
    .array(
      z.object({
        caption: z.string().optional(),
        loc: z.string().url(),
        title: z.string().optional(),
      }),
    )
    .optional(),
  lastmod: z.string().optional(),
  loc: z.string().url(),
  priority: z.number().min(0).max(1).optional(),
});

// Step 1: Discover sitemap URLs
export const discoverSitemapsStep = compose(
  createStepWithValidation(
    'discover-sitemaps',
    async (input: z.infer<typeof SitemapParserInput>) => {
      const { brands, options } = input;
      const discoveredSitemaps = [];

      for (const brand of brands) {
        const sitemapUrls = [];

        // Use provided sitemap URLs
        if (brand.sitemapUrls && brand.sitemapUrls.length > 0) {
          sitemapUrls.push(...brand.sitemapUrls);
        } else {
          // Try common sitemap patterns
          const patterns = brand.sitemapPatterns || [
            '/sitemap.xml',
            '/sitemap_index.xml',
            '/sitemap-index.xml',
            '/sitemaps/sitemap.xml',
            '/sitemap/index.xml',
          ];

          for (const pattern of patterns) {
            const url = new URL(pattern, brand.domain).toString();

            // Simulate checking if sitemap exists
            const exists = Math.random() > 0.2; // 80% chance of existence
            if (exists) {
              sitemapUrls.push(url);
              break; // Use first found
            }
          }
        }

        // Check robots.txt if enabled
        if (options?.respectRobotsTxt) {
          const robotsTxtUrl = new URL('/robots.txt', brand.domain).toString();
          // Simulate parsing robots.txt for sitemap directives
          const robotsSitemaps =
            Math.random() > 0.5
              ? [
                  new URL('/sitemap-products.xml', brand.domain).toString(),
                  new URL('/sitemap-categories.xml', brand.domain).toString(),
                ]
              : [];
          sitemapUrls.push(...robotsSitemaps);
        }

        discoveredSitemaps.push({
          brandId: brand.id,
          brandName: brand.name,
          discoveredAt: new Date().toISOString(),
          domain: brand.domain,
          sitemapUrls: [...new Set(sitemapUrls)], // Remove duplicates
        });
      }

      return {
        ...input,
        discoveredSitemaps,
        totalBrands: brands.length,
        totalSitemapsFound: discoveredSitemaps.reduce((sum, b) => sum + b.sitemapUrls.length, 0),
      };
    },
    (input) => input.brands.length > 0,
    (output) => output.totalSitemapsFound > 0,
  ),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepRetry(step, { maxRetries: 2 }),
);

// Step 2: Fetch and parse sitemaps
export const fetchAndParseSitemapsStep = compose(
  createStep('fetch-parse-sitemaps', async (data: any) => {
    const { discoveredSitemaps, options } = data;
    const parsedSitemaps = [];

    for (const brand of discoveredSitemaps) {
      const brandResults = {
        brandId: brand.brandId,
        brandName: brand.brandName,
        errors: [] as any[],
        sitemaps: [] as any[],
        totalUrls: 0,
      };

      for (const sitemapUrl of brand.sitemapUrls) {
        try {
          // Simulate fetching sitemap
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Determine sitemap type
          const isSitemapIndex = sitemapUrl.includes('index') || Math.random() > 0.7;

          if (isSitemapIndex && options?.followSitemapIndex) {
            // Parse sitemap index
            const childSitemaps = Array.from(
              { length: Math.floor(Math.random() * 5) + 1 },
              (_, i) => ({
                lastmod: new Date(Date.now() - i * 86400000).toISOString(),
                loc: `${brand.domain}/sitemap-${i}.xml`,
              }),
            );

            // Recursively fetch child sitemaps
            for (const child of childSitemaps) {
              const entries = generateMockSitemapEntries(brand.domain, 100);
              brandResults.sitemaps.push({
                type: 'urlset',
                url: child.loc,
                entries: entries.slice(0, options?.maxUrlsPerSitemap || 50000),
                entryCount: entries.length,
                lastModified: child.lastmod,
              });
              brandResults.totalUrls += entries.length;
            }
          } else {
            // Parse regular sitemap
            const entries = generateMockSitemapEntries(brand.domain, 500);
            brandResults.sitemaps.push({
              type: 'urlset',
              url: sitemapUrl,
              entries: entries.slice(0, options?.maxUrlsPerSitemap || 50000),
              entryCount: entries.length,
              lastModified: new Date().toISOString(),
            });
            brandResults.totalUrls += entries.length;
          }
        } catch (error) {
          brandResults.errors.push({
            error: 'Failed to fetch sitemap',
            sitemapUrl,
            timestamp: new Date().toISOString(),
          });
        }
      }

      parsedSitemaps.push(brandResults);
    }

    return {
      ...data,
      parsedAt: new Date().toISOString(),
      parsedSitemaps,
      totalUrlsParsed: parsedSitemaps.reduce((sum, b) => sum + b.totalUrls, 0),
    };
  }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 5,
      resetTimeout: 60000,
      // timeout: 10000,
    }),
);

// Helper function to generate mock sitemap entries
function generateMockSitemapEntries(domain: string, count: number): z.infer<typeof SitemapEntry>[] {
  const categories = ['products', 'categories', 'brands', 'collections', 'blog'];
  const entries = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hasImages = category === 'products' && Math.random() > 0.3;

    entries.push({
      changefreq: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)] as any,
      images: hasImages
        ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
            caption: `High quality image of ${category} ${i}`,
            loc: `${domain}/images/${category}-${i}-${j}.jpg`,
            title: `${category} ${i} Image ${j}`,
          }))
        : undefined,
      lastmod: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      loc: `${domain}/${category}/${category}-${i}`,
      priority: Math.round((0.5 + Math.random() * 0.5) * 10) / 10,
    });
  }

  return entries;
}

// Step 3: Categorize and enrich URLs
export const categorizeUrlsStep = createStep('categorize-urls', async (data: any) => {
  const { parsedSitemaps } = data;
  const categorizedData = [];

  for (const brand of parsedSitemaps) {
    const categorizedUrls = {
      brandId: brand.brandId,
      brandName: brand.brandName,
      categories: {
        brands: [] as any[],
        categories: [] as any[],
        content: [] as any[],
        other: [] as any[],
        products: [] as any[],
      },
      stats: {
        avgPriority: 0,
        byCategory: {} as Record<string, number>,
        byChangeFreq: {} as Record<string, number>,
        total: 0,
      },
    };

    // Process all URLs from all sitemaps
    const allEntries = brand.sitemaps.flatMap((s: any) => s.entries);

    allEntries.forEach((entry: any) => {
      const url = new URL(entry.loc);
      const pathSegments = url.pathname.split('/').filter(Boolean);

      // Categorize based on URL pattern
      let category = 'other';
      if (pathSegments.includes('product') || pathSegments.includes('products')) {
        category = 'products';
      } else if (pathSegments.includes('category') || pathSegments.includes('categories')) {
        category = 'categories';
      } else if (pathSegments.includes('brand') || pathSegments.includes('brands')) {
        category = 'brands';
      } else if (
        pathSegments.includes('blog') ||
        pathSegments.includes('content') ||
        pathSegments.includes('about')
      ) {
        category = 'content';
      }

      const enrichedEntry = {
        ...entry,
        urlParts: {
          hostname: url.hostname,
          pathname: url.pathname,
          protocol: url.protocol,
          segments: pathSegments,
        },
        category,
        hasImages: !!entry.images && entry.images.length > 0,
        imageCount: entry.images?.length || 0,
        isProduct: category === 'products',
      };

      categorizedUrls.categories[category as keyof typeof categorizedUrls.categories].push(
        enrichedEntry,
      );
      categorizedUrls.stats.total++;
      categorizedUrls.stats.byCategory[category] =
        (categorizedUrls.stats.byCategory[category] || 0) + 1;
      if (entry.changefreq) {
        categorizedUrls.stats.byChangeFreq[entry.changefreq] =
          (categorizedUrls.stats.byChangeFreq[entry.changefreq] || 0) + 1;
      }
      categorizedUrls.stats.avgPriority += entry.priority || 0.5;
    });

    categorizedUrls.stats.avgPriority /= categorizedUrls.stats.total || 1;
    categorizedData.push(categorizedUrls);
  }

  return {
    ...data,
    categorizedAt: new Date().toISOString(),
    categorizedData,
  };
});

// Step 4: Prepare database records
export const prepareDatabaseRecordsStep = createStep('prepare-db-records', async (data: any) => {
  const { categorizedData, tracking } = data;
  const dbRecords = {
    urls: [] as any[],
    urlTracking: [] as any[],
    brands: [] as any[],
    sitemaps: [] as any[],
  };

  categorizedData.forEach((brand: any) => {
    // Brand record
    dbRecords.brands.push({
      id: brand.brandId,
      name: brand.brandName,
      lastCrawled: new Date().toISOString(),
      stats: brand.stats,
      totalUrls: brand.stats.total,
    });

    // URL records
    Object.entries(brand.categories).forEach(([category, urls]) => {
      (urls as any[]).forEach((url) => {
        const urlRecord = {
          id: `url_${Buffer.from(url.loc).toString('base64').substring(0, 20)}`,
          url: url.loc,
          brandId: brand.brandId,
          category,
          changefreq: url.changefreq,
          createdAt: new Date().toISOString(),
          hasImages: url.hasImages,
          imageCount: url.imageCount,
          lastmod: url.lastmod,
          metadata: {
            urlParts: url.urlParts,
            images: url.images,
          },
          priority: url.priority,
          updatedAt: new Date().toISOString(),
        };

        dbRecords.urls.push(urlRecord);

        // Tracking records for each purpose
        tracking?.purposes.forEach((purpose: any) => {
          dbRecords.urlTracking.push({
            id: `track_${urlRecord.id}_${purpose}`,
            urlId: urlRecord.id,
            frequency: tracking.updateFrequency,
            lastChecked: null,
            metrics: {
              changes: 0,
              checks: 0,
              errors: 0,
            },
            nextCheck: new Date(
              Date.now() + getFrequencyMs(tracking.updateFrequency),
            ).toISOString(),
            purpose,
            status: 'active',
          });
        });
      });
    });
  });

  return {
    ...data,
    dbRecords,
    totalRecords: {
      urls: dbRecords.urls.length,
      brands: dbRecords.brands.length,
      tracking: dbRecords.urlTracking.length,
    },
  };
});

// Helper function to get frequency in milliseconds
function getFrequencyMs(frequency: string): number {
  const map: Record<string, number> = {
    hourly: 3600000,
    always: 0,
    daily: 86400000,
    weekly: 604800000,
  };
  return map[frequency] || 86400000;
}

// Step 5: Store in database using Prisma
export const storeInDatabaseStep = compose(
  StepTemplates.database(
    'store-sitemap-data',
    'Store parsed sitemap data in PostgreSQL via Prisma',
  ),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
);

// Step 6: Generate parsing report
export const generateParsingReportStep = createStep('generate-report', async (data: any) => {
  const { categorizedData, dbRecords, parsedSitemaps } = data;

  const report = {
    urlDistribution: {
      byCategory: categorizedData.reduce((acc: any, brand: any) => {
        Object.entries(brand.stats.byCategory).forEach(([cat, count]) => {
          acc[cat] = (acc[cat] || 0) + (count as number);
        });
        return acc;
      }, {}),
      byChangeFreq: categorizedData.reduce((acc: any, brand: any) => {
        Object.entries(brand.stats.byChangeFreq).forEach(([freq, count]) => {
          acc[freq] = (acc[freq] || 0) + (count as number);
        });
        return acc;
      }, {}),
    },
    byBrand: parsedSitemaps.map((brand: any) => ({
      urlCount: brand.totalUrls,
      brandId: brand.brandId,
      brandName: brand.brandName,
      categories: categorizedData.find((c: any) => c.brandId === brand.brandId)?.stats.byCategory,
      errorCount: brand.errors.length,
      sitemapCount: brand.sitemaps.length,
    })),
    performance: {
      avgUrlsPerSecond: Math.floor(
        dbRecords.urls.length /
          ((Date.now() - new Date(data.discoveredSitemaps[0].discoveredAt).getTime()) / 1000),
      ),
      totalProcessingTime: Date.now() - new Date(data.discoveredSitemaps[0].discoveredAt).getTime(),
    },
    summary: {
      brandsProcessed: parsedSitemaps.length,
      totalErrors: parsedSitemaps.reduce((sum: number, b: any) => sum + b.errors.length, 0),
      totalSitemaps: parsedSitemaps.reduce((sum: number, b: any) => sum + b.sitemaps.length, 0),
      totalUrls: dbRecords.urls.length,
    },
    trackingSetup: {
      purposes: data.tracking?.purposes || [],
      totalTrackingRecords: dbRecords.urlTracking.length,
      updateFrequency: data.tracking?.updateFrequency || 'daily',
    },
  };

  return {
    ...data,
    report,
    workflowComplete: true,
  };
});

// Step 7: Schedule follow-up crawls
export const scheduleFollowUpStep = StepTemplates.conditional(
  'schedule-followup',
  (input: any) => input.enableFollowUp === true && input.tracking?.updateFrequency !== 'never',
  {
    trueStep: createStep('create-schedule', async (data: any) => {
      const { discoveredSitemaps, tracking } = data;
      const schedules: any[] = [];

      discoveredSitemaps.forEach((brand: any) => {
        schedules.push({
          brandId: brand.brandId,
          config: {
            sitemapUrls: brand.sitemapUrls,
            tracking,
          },
          jobId: `sitemap_crawl_${brand.brandId}`,
          nextRun: new Date(Date.now() + getFrequencyMs(tracking.updateFrequency)).toISOString(),
        });
      });

      return {
        ...data,
        scheduledJobs: schedules,
      };
    }),
  },
);

// Main workflow definition
export const sitemapParserWorkflow = {
  id: 'sitemap-parser',
  name: 'Sitemap Parser',
  config: {
    concurrency: {
      max: 10, // Process up to 10 brands in parallel
    },
    maxDuration: 1800000, // 30 minutes
    rateLimiting: {
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
    },
  },
  description: 'Fetch and parse sitemaps from multiple brands for database tracking',
  features: {
    urlCategorization: true,
    databaseIntegration: true,
    robotsTxtSupport: true,
    sitemapIndexSupport: true,
  },
  steps: [
    discoverSitemapsStep,
    fetchAndParseSitemapsStep,
    categorizeUrlsStep,
    prepareDatabaseRecordsStep,
    storeInDatabaseStep,
    generateParsingReportStep,
    scheduleFollowUpStep,
  ],
  version: '1.0.0',
};
