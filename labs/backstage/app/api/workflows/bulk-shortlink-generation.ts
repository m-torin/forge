/**
 * Bulk Shortlink Generation Workflow
 * Generate short links in dub.co for product affiliate links
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
  withStepCircuitBreaker,
} from '@repo/orchestration/server/next';

// Input schemas
const BulkShortlinkGenerationInput = z.object({
  batchConfig: z.object({
    batchSize: z.number().default(100),
    continueOnError: z.boolean().default(true),
    parallelism: z.number().default(5),
    retryOnFailure: z.boolean().default(true),
  }),
  dubConfig: z.object({
    apiKey: z.string(),
    customDomain: z.string().optional(),
    defaultExpiry: z.string().datetime().optional(),
    domain: z.string().default('dub.sh'),
    tagIds: z.array(z.string()).optional(),
    workspace: z.string(),
  }),
  links: z.array(
    z.object({
      affiliateUrl: z.string().url(),
      metadata: z.object({
        brand: z.string(),
        category: z.array(z.string()),
        image: z.string().url().optional(),
        price: z.number(),
        title: z.string(),
      }),
      networkId: z.string(),
      productId: z.string(),
    }),
  ),
  linkSettings: z.object({
    customSlug: z.object({
      includeNetwork: z.boolean().default(true),
      prefix: z.string().optional(),
      strategy: z.enum(['random', 'product-based', 'custom']).default('product-based'),
    }),
    enableAnalytics: z.boolean().default(true),
    qrCode: z.object({
      enabled: z.boolean().default(false),
      format: z.enum(['png', 'svg']).default('png'),
      size: z.number().default(256),
    }),
    trackConversion: z.boolean().default(true),
    utmParams: z
      .object({
        campaign: z.string().optional(),
        medium: z.string().default('link'),
        source: z.string().default('affiliate'),
      })
      .optional(),
  }),
  mode: z.enum(['create', 'update', 'sync']).default('create'),
});

// Shortlink result schema
const ShortlinkResult = z.object({
  analytics: z
    .object({
      clicks: z.number().default(0),
      lastClicked: z.string().datetime().optional(),
      uniqueClicks: z.number().default(0),
    })
    .optional(),
  createdAt: z.string(),
  linkId: z.string(),
  metadata: z.any(),
  originalUrl: z.string(),
  productId: z.string(),
  qrCode: z.string().optional(),
  shortUrl: z.string(),
  slug: z.string(),
});

// Step 1: Validate and prepare links
export const validateLinksStep = compose(
  createStepWithValidation(
    'validate-links',
    async (input: z.infer<typeof BulkShortlinkGenerationInput>) => {
      const { dubConfig, links, mode } = input;

      const validLinks = [];
      const invalidLinks = [];
      const existingLinks = new Map();

      // Check for existing links if updating or syncing
      if (mode !== 'create') {
        const existing = await fetchExistingShortlinks(dubConfig);
        existing.forEach((link) => {
          existingLinks.set(link.productId, link);
        });
      }

      // Validate each link
      for (const link of links) {
        const validation = validateAffiliateLink(link);

        if (validation.valid) {
          // Check if link already exists
          const existing = existingLinks.get(link.productId);

          if (existing && mode === 'create') {
            invalidLinks.push({
              ...link,
              existingShortUrl: existing.shortUrl,
              reason: 'Link already exists',
            });
          } else {
            validLinks.push({
              ...link,
              existingLinkId: existing?.linkId,
              requiresUpdate: existing && mode === 'update',
            });
          }
        } else {
          invalidLinks.push({
            ...link,
            reason: validation.reason,
          });
        }
      }

      return {
        ...input,
        invalidCount: invalidLinks.length,
        invalidLinks,
        validCount: validLinks.length,
        validLinks,
        existingLinks: Array.from(existingLinks.values()),
        processingStarted: new Date().toISOString(),
        totalLinks: links.length,
      };
    },
    (input) => input.links.length > 0,
    (output) => output.validLinks.length > 0,
  ),
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepMonitoring(step),
);

// Mock functions
async function fetchExistingShortlinks(dubConfig: any): Promise<any[]> {
  // Simulate fetching existing links from dub.co
  return Array.from({ length: 20 }, (_, i) => ({
    linkId: `link_${i}`,
    originalUrl: `https://affiliate.example.com/product/${i}`,
    productId: `prod_${i}`,
    shortUrl: `https://${dubConfig.domain}/p${i}`,
  }));
}

function validateAffiliateLink(link: any): { valid: boolean; reason?: string } {
  // Validate URL structure
  try {
    const url = new URL(link.affiliateUrl);

    // Check for required parameters
    if (!url.searchParams.has('tag') && !url.searchParams.has('affiliate_id')) {
      return { valid: false, reason: 'Missing affiliate tracking parameter' };
    }

    // Check URL length
    if (link.affiliateUrl.length > 2048) {
      return { valid: false, reason: 'URL too long' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

// Step 2: Generate short link slugs
export const generateSlugsStep = createStep('generate-slugs', async (data: any) => {
  const { validLinks, existingLinks, linkSettings } = data;
  const { customSlug } = linkSettings;

  const linksWithSlugs = [];
  const usedSlugs = new Set(existingLinks.map((l: any) => l.slug));

  for (const link of validLinks) {
    let slug = '';

    switch (customSlug.strategy) {
      case 'random':
        slug = generateRandomSlug(6);
        break;

      case 'product-based':
        slug = generateProductSlug(link, customSlug);
        break;

      case 'custom':
        slug = `${customSlug.prefix || ''}${link.productId}`;
        break;
    }

    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    usedSlugs.add(finalSlug);
    linksWithSlugs.push({
      ...link,
      slug: finalSlug,
    });
  }

  return {
    ...data,
    linksWithSlugs,
    slugsGenerated: true,
  };
});

function generateRandomSlug(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

function generateProductSlug(link: any, config: any): string {
  const parts = [];

  if (config.prefix) {
    parts.push(config.prefix);
  }

  // Add brand initial
  if (link.metadata.brand) {
    parts.push(link.metadata.brand.substring(0, 3).toLowerCase());
  }

  // Add product ID short form
  parts.push(link.productId.replace(/[^a-z0-9]/gi, '').substring(0, 6));

  // Add network if enabled
  if (config.includeNetwork) {
    const networkMap: Record<string, string> = {
      network_1: 'amz',
      network_2: 'wmt',
      network_3: 'tgt',
      network_4: 'eby',
    };
    parts.push(networkMap[link.networkId] || 'aff');
  }

  return parts.join('-');
}

// Step 3: Create shortlinks in batches
export const createShortlinksStep = compose(
  createStep('create-shortlinks', async (data: any) => {
    const { batchConfig, dubConfig, linkSettings, linksWithSlugs } = data;
    const { batchSize, parallelism } = batchConfig;

    const createdLinks: any[] = [];
    const failedLinks: any[] = [];
    let processedCount = 0;

    // Process in batches
    for (let i = 0; i < linksWithSlugs.length; i += batchSize) {
      const batch = linksWithSlugs.slice(i, i + batchSize);

      // Process batch with parallelism control
      const batchPromises = [];
      for (let j = 0; j < batch.length; j += parallelism) {
        const parallelBatch = batch.slice(j, j + parallelism);

        const promise = Promise.all(
          parallelBatch.map((link: any) => createShortlink(link, dubConfig, linkSettings)),
        );

        batchPromises.push(promise);
      }

      // Wait for all parallel batches
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          createdLinks.push(...result.value);
        } else {
          const batchLinks = batch.slice(idx * parallelism, (idx + 1) * parallelism);
          failedLinks.push(
            ...batchLinks.map((link: any) => ({
              ...link,
              error: result.reason.message,
            })),
          );
        }
      });

      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${linksWithSlugs.length} links`);

      // Rate limiting pause
      if (i + batchSize < linksWithSlugs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second between batches
      }
    }

    return {
      ...data,
      createdLinks,
      creationStats: {
        created: createdLinks.length,
        failed: failedLinks.length,
        successRate: createdLinks.length / linksWithSlugs.length,
        total: linksWithSlugs.length,
      },
      failedLinks,
    };
  }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      threshold: 5,
      resetTimeout: 60000,
    }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
);

async function createShortlink(link: any, dubConfig: any, settings: any): Promise<any> {
  // Simulate dub.co API call
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  // Build short URL
  const domain = dubConfig.customDomain || dubConfig.domain;
  const shortUrl = `https://${domain}/${link.slug}`;

  // Add UTM parameters if configured
  let targetUrl = link.affiliateUrl;
  if (settings.utmParams) {
    const url = new URL(targetUrl);
    Object.entries(settings.utmParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(`utm_${key}`, value as string);
    });
    targetUrl = url.toString();
  }

  const shortlinkData: any = {
    createdAt: new Date().toISOString(),
    linkId: `dub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      ...link.metadata,
      enableAnalytics: settings.enableAnalytics,
      networkId: link.networkId,
      trackConversion: settings.trackConversion,
    },
    originalUrl: link.affiliateUrl,
    productId: link.productId,
    shortUrl,
    slug: link.slug,
    targetUrl,
  };

  // Generate QR code if enabled
  if (settings.qrCode?.enabled) {
    shortlinkData.qrCode = await generateQRCode(shortUrl, settings.qrCode);
  }

  return shortlinkData;
}

async function generateQRCode(url: string, config: any): Promise<string> {
  // Simulate QR code generation
  return `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${encodeURIComponent(url)}`;
}

// Step 4: Configure link analytics
export const configureAnalyticsStep = createStep('configure-analytics', async (data: any) => {
  const { createdLinks, dubConfig, linkSettings } = data;

  if (!linkSettings.enableAnalytics) {
    return {
      ...data,
      analyticsSkipped: true,
    };
  }

  const analyticsConfig = [];

  for (const link of createdLinks) {
    const config = {
      customEvents: ['add_to_cart', 'purchase', 'view_details'],
      linkId: link.linkId,
      tracking: {
        browsers: true,
        clicks: true,
        conversion: linkSettings.trackConversion,
        countries: true,
        devices: true,
        referrers: true,
        uniqueVisitors: true,
      },
      webhooks: {
        onConversion: `https://api.example.com/webhooks/conversion/${link.productId}`,
        onThreshold: {
          clicks: 1000,
          endpoint: `https://api.example.com/webhooks/milestone/${link.productId}`,
        },
      },
    };

    analyticsConfig.push(config);
  }

  // Simulate configuring analytics
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ...data,
    analyticsConfig,
    analyticsConfigured: true,
  };
});

// Step 5: Update product database
export const updateProductDatabaseStep = compose(
  createStep('update-database', async (data: any) => {
    const { createdLinks, failedLinks } = data;

    // Prepare database updates
    const updates = createdLinks.map((link: any) => ({
      productId: link.productId,
      shortlinks: {
        [link.networkId]: {
          createdAt: link.createdAt,
          linkId: link.linkId,
          qrCode: link.qrCode,
          shortUrl: link.shortUrl,
          slug: link.slug,
        },
      },
    }));

    // Simulate database update
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      ...data,
      databaseUpdated: true,
      databaseUpdates: updates,
    };
  }),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 6: Generate QR code assets
export const generateQRCodeAssetsStep = createStep('generate-qr-assets', async (data: any) => {
  const { createdLinks, linkSettings } = data;

  if (!linkSettings.qrCode?.enabled) {
    return {
      ...data,
      qrAssetsSkipped: true,
    };
  }

  const qrAssets = [];

  // Generate different QR code variants
  for (const link of createdLinks.filter((l: any) => l.qrCode)) {
    const assets = {
      metadata: {
        errorCorrection: 'M',
        format: linkSettings.qrCode.format,
        margin: 4,
      },
      productId: link.productId,
      standard: link.qrCode,
      variants: {
        large: link.qrCode.replace(/size=\d+x\d+/, 'size=512x512'),
        medium: link.qrCode.replace(/size=\d+x\d+/, 'size=256x256'),
        print: link.qrCode.replace(/size=\d+x\d+/, 'size=1024x1024'),
        small: link.qrCode.replace(/size=\d+x\d+/, 'size=128x128'),
      },
    };

    qrAssets.push(assets);
  }

  return {
    ...data,
    qrAssets,
    qrAssetsGenerated: true,
  };
});

// Step 7: Send notifications
export const sendNotificationsStep = StepTemplates.notification(
  'shortlink-generation-complete',
  'success',
);

// Step 8: Generate report
export const generateShortlinkReportStep = createStep('generate-report', async (data: any) => {
  const { invalidLinks, createdLinks, creationStats, failedLinks, processingStarted, totalLinks } =
    data;

  const report = {
    configuration: {
      analyticsEnabled: data.linkSettings.enableAnalytics,
      domain: data.dubConfig.customDomain || data.dubConfig.domain,
      qrEnabled: data.linkSettings.qrCode?.enabled,
      slugStrategy: data.linkSettings.customSlug.strategy,
    },
    links: {
      created: createdLinks.slice(0, 100).map((link: any) => ({
        productId: link.productId,
        qrCode: !!link.qrCode,
        shortUrl: link.shortUrl,
        slug: link.slug,
      })),
      topFailures: failedLinks.slice(0, 10).map((link: any) => ({
        productId: link.productId,
        reason: link.error,
      })),
    },
    performance: {
      averageTimePerLink: (Date.now() - new Date(processingStarted).getTime()) / totalLinks,
      linksPerMinute:
        createdLinks.length / ((Date.now() - new Date(processingStarted).getTime()) / 60000),
      totalProcessingTime: Date.now() - new Date(processingStarted).getTime(),
    },
    recommendations: generateShortlinkRecommendations(data),
    reportId: `shortlinks_${Date.now()}`,
    summary: {
      invalid: invalidLinks.length,
      failed: failedLinks.length,
      successfullyCreated: createdLinks.length,
      successRate: creationStats.successRate,
      totalRequested: totalLinks,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    generationComplete: true,
    report,
  };
});

function generateShortlinkRecommendations(data: any): any[] {
  const recommendations = [];

  // High failure rate
  if (data.creationStats.successRate < 0.9) {
    recommendations.push({
      type: 'reliability',
      action: 'review_failed_links',
      message: `Creation success rate is ${(data.creationStats.successRate * 100).toFixed(1)}%`,
      priority: 'high',
    });
  }

  // Many invalid links
  if (data.invalidCount > data.totalLinks * 0.1) {
    recommendations.push({
      type: 'validation',
      action: 'review_affiliate_urls',
      message: `${data.invalidCount} links failed validation`,
      priority: 'medium',
    });
  }

  // Enable QR codes
  if (!data.linkSettings.qrCode?.enabled && data.createdLinks.length > 0) {
    recommendations.push({
      type: 'feature',
      action: 'enable_qr_codes',
      benefit: 'Improve offline-to-online tracking',
      message: 'QR codes are disabled',
      priority: 'low',
    });
  }

  // Custom domain
  if (!data.dubConfig.customDomain) {
    recommendations.push({
      type: 'branding',
      action: 'configure_custom_domain',
      benefit: 'Improve brand recognition and trust',
      message: 'Using default dub.sh domain',
      priority: 'medium',
    });
  }

  return recommendations;
}

// Main workflow definition
export const bulkShortlinkGenerationWorkflow = {
  id: 'bulk-shortlink-generation',
  name: 'Bulk Shortlink Generation',
  config: {
    concurrency: {
      max: 5, // Limit concurrent jobs
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 0 * * *', // Daily at midnight
      timezone: 'UTC',
    },
  },
  description: 'Generate short links in dub.co for product affiliate links',
  features: {
    analyticsIntegration: true,
    bulkProcessing: true,
    conversionTracking: true,
    customSlugs: true,
    qrCodeGeneration: true,
  },
  steps: [
    validateLinksStep,
    generateSlugsStep,
    createShortlinksStep,
    configureAnalyticsStep,
    updateProductDatabaseStep,
    generateQRCodeAssetsStep,
    sendNotificationsStep,
    generateShortlinkReportStep,
  ],
  version: '1.0.0',
};
