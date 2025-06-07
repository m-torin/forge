/**
 * Sitemap Parser Workflow
 * Fetch and parse sitemaps from multiple brands for tracking in database
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepTimeout,
  withStepCircuitBreaker,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';
import type { Prisma } from '@repo/database';

// Input schemas
const SitemapParserInput = z.object({
  brands: z.array(z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string().url(),
    sitemapUrls: z.array(z.string().url()).optional(),
    sitemapPatterns: z.array(z.string()).optional(), // e.g., ['/sitemap.xml', '/sitemap-index.xml']
  })).min(1),
  options: z.object({
    followSitemapIndex: z.boolean().default(true),
    maxDepth: z.number().min(1).max(5).default(3),
    maxUrlsPerSitemap: z.number().default(50000),
    respectRobotsTxt: z.boolean().default(true),
    userAgent: z.string().default('BackstageBot/1.0 (+https://example.com/bot)'),
    timeout: z.number().default(30000), // 30 seconds per sitemap
  }).optional(),
  tracking: z.object({
    purposes: z.array(z.enum(['seo', 'inventory', 'monitoring', 'analytics'])).default(['seo']),
    updateFrequency: z.enum(['always', 'hourly', 'daily', 'weekly']).default('daily'),
  }).optional(),
});

// Sitemap entry schema
const SitemapEntry = z.object({
  loc: z.string().url(),
  lastmod: z.string().optional(),
  changefreq: z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).optional(),
  priority: z.number().min(0).max(1).optional(),
  images: z.array(z.object({
    loc: z.string().url(),
    title: z.string().optional(),
    caption: z.string().optional(),
  })).optional(),
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
          const robotsSitemaps = Math.random() > 0.5 ? [
            new URL('/sitemap-products.xml', brand.domain).toString(),
            new URL('/sitemap-categories.xml', brand.domain).toString(),
          ] : [];
          sitemapUrls.push(...robotsSitemaps);
        }
        
        discoveredSitemaps.push({
          brandId: brand.id,
          brandName: brand.name,
          domain: brand.domain,
          sitemapUrls: [...new Set(sitemapUrls)], // Remove duplicates
          discoveredAt: new Date().toISOString(),
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
    (output) => output.totalSitemapsFound > 0
  ),
  (step) => withStepTimeout(step, { execution: 60000 }),
  (step) => withStepRetry(step, { maxAttempts: 2 })
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
        sitemaps: [] as any[],
        totalUrls: 0,
        errors: [] as any[],
      };
      
      for (const sitemapUrl of brand.sitemapUrls) {
        try {
          // Simulate fetching sitemap
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Determine sitemap type
          const isSitemapIndex = sitemapUrl.includes('index') || Math.random() > 0.7;
          
          if (isSitemapIndex && options?.followSitemapIndex) {
            // Parse sitemap index
            const childSitemaps = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
              loc: `${brand.domain}/sitemap-${i}.xml`,
              lastmod: new Date(Date.now() - i * 86400000).toISOString(),
            }));
            
            // Recursively fetch child sitemaps
            for (const child of childSitemaps) {
              const entries = generateMockSitemapEntries(brand.domain, 100);
              brandResults.sitemaps.push({
                url: child.loc,
                type: 'urlset',
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
              url: sitemapUrl,
              type: 'urlset',
              entries: entries.slice(0, options?.maxUrlsPerSitemap || 50000),
              entryCount: entries.length,
              lastModified: new Date().toISOString(),
            });
            brandResults.totalUrls += entries.length;
          }
        } catch (error) {
          brandResults.errors.push({
            sitemapUrl,
            error: 'Failed to fetch sitemap',
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      parsedSitemaps.push(brandResults);
    }
    
    return {
      ...data,
      parsedSitemaps,
      totalUrlsParsed: parsedSitemaps.reduce((sum, b) => sum + b.totalUrls, 0),
      parsedAt: new Date().toISOString(),
    };
  }),
  (step) => withStepCircuitBreaker(step, {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
  })
);

// Helper function to generate mock sitemap entries
function generateMockSitemapEntries(domain: string, count: number): z.infer<typeof SitemapEntry>[] {
  const categories = ['products', 'categories', 'brands', 'collections', 'blog'];
  const entries = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hasImages = category === 'products' && Math.random() > 0.3;
    
    entries.push({
      loc: `${domain}/${category}/${category}-${i}`,
      lastmod: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      changefreq: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)] as any,
      priority: Math.round((0.5 + Math.random() * 0.5) * 10) / 10,
      images: hasImages ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        loc: `${domain}/images/${category}-${i}-${j}.jpg`,
        title: `${category} ${i} Image ${j}`,
        caption: `High quality image of ${category} ${i}`,
      })) : undefined,
    });
  }
  
  return entries;
}

// Step 3: Categorize and enrich URLs
export const categorizeUrlsStep = createStep(
  'categorize-urls',
  async (data: any) => {
    const { parsedSitemaps } = data;
    const categorizedData = [];
    
    for (const brand of parsedSitemaps) {
      const categorizedUrls = {
        brandId: brand.brandId,
        brandName: brand.brandName,
        categories: {
          products: [] as any[],
          categories: [] as any[],
          brands: [] as any[],
          content: [] as any[],
          other: [] as any[],
        },
        stats: {
          total: 0,
          byCategory: {} as Record<string, number>,
          byChangeFreq: {} as Record<string, number>,
          avgPriority: 0,
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
        } else if (pathSegments.includes('blog') || pathSegments.includes('content') || pathSegments.includes('about')) {
          category = 'content';
        }
        
        const enrichedEntry = {
          ...entry,
          urlParts: {
            protocol: url.protocol,
            hostname: url.hostname,
            pathname: url.pathname,
            segments: pathSegments,
          },
          category,
          isProduct: category === 'products',
          hasImages: !!entry.images && entry.images.length > 0,
          imageCount: entry.images?.length || 0,
        };
        
        categorizedUrls.categories[category as keyof typeof categorizedUrls.categories].push(enrichedEntry);
        categorizedUrls.stats.total++;
        categorizedUrls.stats.byCategory[category] = (categorizedUrls.stats.byCategory[category] || 0) + 1;
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
      categorizedData,
      categorizedAt: new Date().toISOString(),
    };
  }
);

// Step 4: Prepare database records
export const prepareDatabaseRecordsStep = createStep(
  'prepare-db-records',
  async (data: any) => {
    const { categorizedData, tracking } = data;
    const dbRecords = {
      brands: [] as any[],
      sitemaps: [] as any[],
      urls: [] as any[],
      urlTracking: [] as any[],
    };
    
    categorizedData.forEach((brand: any) => {
      // Brand record
      dbRecords.brands.push({
        id: brand.brandId,
        name: brand.brandName,
        totalUrls: brand.stats.total,
        lastCrawled: new Date().toISOString(),
        stats: brand.stats,
      });
      
      // URL records
      Object.entries(brand.categories).forEach(([category, urls]) => {
        (urls as any[]).forEach((url) => {
          const urlRecord = {
            id: `url_${Buffer.from(url.loc).toString('base64').substring(0, 20)}`,
            brandId: brand.brandId,
            url: url.loc,
            category,
            lastmod: url.lastmod,
            changefreq: url.changefreq,
            priority: url.priority,
            hasImages: url.hasImages,
            imageCount: url.imageCount,
            metadata: {
              urlParts: url.urlParts,
              images: url.images,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          dbRecords.urls.push(urlRecord);
          
          // Tracking records for each purpose
          tracking?.purposes.forEach((purpose) => {
            dbRecords.urlTracking.push({
              id: `track_${urlRecord.id}_${purpose}`,
              urlId: urlRecord.id,
              purpose,
              status: 'active',
              frequency: tracking.updateFrequency,
              lastChecked: null,
              nextCheck: new Date(Date.now() + getFrequencyMs(tracking.updateFrequency)).toISOString(),
              metrics: {
                checks: 0,
                changes: 0,
                errors: 0,
              },
            });
          });
        });
      });
    });
    
    return {
      ...data,
      dbRecords,
      totalRecords: {
        brands: dbRecords.brands.length,
        urls: dbRecords.urls.length,
        tracking: dbRecords.urlTracking.length,
      },
    };
  }
);

// Helper function to get frequency in milliseconds
function getFrequencyMs(frequency: string): number {
  const map: Record<string, number> = {
    always: 0,
    hourly: 3600000,
    daily: 86400000,
    weekly: 604800000,
  };
  return map[frequency] || 86400000;
}

// Step 5: Store in database using Prisma
export const storeInDatabaseStep = compose(
  StepTemplates.database('store-sitemap-data', 'Store parsed sitemap data in PostgreSQL via Prisma'),
  (step) => withStepRetry(step, {
    maxAttempts: 3,
    backoff: 'exponential',
  })
);

// Step 6: Generate parsing report
export const generateParsingReportStep = createStep(
  'generate-report',
  async (data: any) => {
    const { parsedSitemaps, categorizedData, dbRecords } = data;
    
    const report = {
      summary: {
        brandsProcessed: parsedSitemaps.length,
        totalSitemaps: parsedSitemaps.reduce((sum: number, b: any) => sum + b.sitemaps.length, 0),
        totalUrls: dbRecords.urls.length,
        totalErrors: parsedSitemaps.reduce((sum: number, b: any) => sum + b.errors.length, 0),
      },
      byBrand: parsedSitemaps.map((brand: any) => ({
        brandId: brand.brandId,
        brandName: brand.brandName,
        sitemapCount: brand.sitemaps.length,
        urlCount: brand.totalUrls,
        errorCount: brand.errors.length,
        categories: categorizedData.find((c: any) => c.brandId === brand.brandId)?.stats.byCategory,
      })),
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
      trackingSetup: {
        purposes: data.tracking?.purposes || [],
        updateFrequency: data.tracking?.updateFrequency || 'daily',
        totalTrackingRecords: dbRecords.urlTracking.length,
      },
      performance: {
        totalProcessingTime: Date.now() - new Date(data.discoveredSitemaps[0].discoveredAt).getTime(),
        avgUrlsPerSecond: Math.floor(
          dbRecords.urls.length / 
          ((Date.now() - new Date(data.discoveredSitemaps[0].discoveredAt).getTime()) / 1000)
        ),
      },
    };
    
    return {
      ...data,
      report,
      workflowComplete: true,
    };
  }
);

// Step 7: Schedule follow-up crawls
export const scheduleFollowUpStep = StepTemplates.conditional(
  'schedule-followup',
  'Schedule next sitemap crawl based on update frequency',
  {
    condition: (data: any) => data.tracking?.updateFrequency !== 'always',
    trueStep: createStep('create-schedule', async (data: any) => {
      const { tracking, discoveredSitemaps } = data;
      const schedules = [];
      
      discoveredSitemaps.forEach((brand: any) => {
        schedules.push({
          jobId: `sitemap_crawl_${brand.brandId}`,
          brandId: brand.brandId,
          nextRun: new Date(Date.now() + getFrequencyMs(tracking.updateFrequency)).toISOString(),
          config: {
            sitemapUrls: brand.sitemapUrls,
            tracking,
          },
        });
      });
      
      return {
        ...data,
        scheduledJobs: schedules,
      };
    }),
  }
);

// Main workflow definition
export const sitemapParserWorkflow = {
  id: 'sitemap-parser',
  name: 'Sitemap Parser',
  description: 'Fetch and parse sitemaps from multiple brands for database tracking',
  version: '1.0.0',
  steps: [
    discoverSitemapsStep,
    fetchAndParseSitemapsStep,
    categorizeUrlsStep,
    prepareDatabaseRecordsStep,
    storeInDatabaseStep,
    generateParsingReportStep,
    scheduleFollowUpStep,
  ],
  config: {
    maxDuration: 1800000, // 30 minutes
    concurrency: {
      max: 10, // Process up to 10 brands in parallel
    },
    rateLimiting: {
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
    },
  },
  features: {
    robotsTxtSupport: true,
    sitemapIndexSupport: true,
    urlCategorization: true,
    databaseIntegration: true,
  },
};