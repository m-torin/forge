/**
 * Image CDN Sync Workflow
 * Synchronize and optimize 10M product images across CDN networks
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepBulkhead,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const ImageCDNSyncInput = z.object({
  mode: z.enum(['full', 'incremental', 'repair']).default('incremental'),
  optimization: z.object({
    adaptiveQuality: z.boolean().default(true),
    enableJPEGProgressive: z.boolean().default(true),
    removeMetadata: z.boolean().default(false),
    smartCropping: z.boolean().default(true),
  }),
  processing: z.object({
    autoColorPalette: z.boolean().default(true),
    enableDeduplication: z.boolean().default(true),
    lazyLoadingMetadata: z.boolean().default(true),
    perceptualHashThreshold: z.number().min(0).max(1).default(0.95),
    variants: z
      .array(
        z.object({
          width: z.number(),
          name: z.string(),
          fit: z.enum(['cover', 'contain', 'fill', 'inside', 'outside']).default('cover'),
          format: z.enum(['webp', 'avif', 'jpg', 'png']),
          height: z.number().optional(),
          quality: z.number().min(1).max(100).default(85),
        }),
      )
      .default([
        { width: 150, name: 'thumbnail', format: 'webp', quality: 80 },
        { width: 640, name: 'mobile', format: 'webp', quality: 85 },
        { width: 1024, name: 'desktop', format: 'webp', quality: 90 },
        { width: 2048, name: 'retina', format: 'webp', quality: 90 },
      ]),
  }),
  sources: z.array(
    z.object({
      type: z.enum(['database', 's3', 'affiliate-api', 'direct-url']),
      config: z.object({
        batchSize: z.number().default(100),
        filters: z
          .object({
            brands: z.array(z.string()).optional(),
            categories: z.array(z.string()).optional(),
            missingVariants: z.boolean().optional(),
            modifiedAfter: z.string().datetime().optional(),
          })
          .optional(),
        parallelism: z.number().default(5),
      }),
    }),
  ),
  targets: z.array(
    z.object({
      provider: z.enum(['cloudflare', 'fastly', 'akamai', 'cloudfront', 'bunny']),
      config: z.object({
        preserveMetadata: z.boolean().default(true),
        purgeExisting: z.boolean().default(false),
        region: z.array(z.string()).default(['global']),
      }),
    }),
  ),
});

// Image processing result
const ImageProcessingResult = z.object({
  cdnUrls: z.record(z.string()), // provider -> url mapping
  metadata: z.object({
    aspectRatio: z.number(),
    blurHash: z.string(),
    dominantColors: z.array(z.string()),
    hasTransparency: z.boolean(),
    perceptualHash: z.string(),
  }),
  originalUrl: z.string(),
  processingTime: z.number(),
  productId: z.string(),
  variants: z.array(
    z.object({
      width: z.number(),
      name: z.string(),
      url: z.string(),
      format: z.string(),
      hash: z.string(),
      height: z.number(),
      size: z.number(),
    }),
  ),
});

// Step factory for image processing
const imageProcessingStepFactory = createWorkflowStep(
  {
    name: 'Image Processor',
    category: 'media',
    tags: ['image', 'optimization', 'cdn'],
    version: '1.0.0',
  },
  async (context) => {
    const { images, optimization, variants } = context.input;
    const results = [];

    for (const image of images) {
      // Simulate image processing
      const processedVariants = [];
      for (const variant of variants) {
        processedVariants.push({
          width: variant.width,
          name: variant.name,
          url: `https://cdn.example.com/${image.productId}/${variant.name}.${variant.format}`,
          format: variant.format,
          hash: `hash_${image.productId}_${variant.name}`,
          height: variant.height || Math.floor(variant.width * image.aspectRatio),
          size: Math.floor(image.size * (variant.width / 1024) * 0.7),
        });
      }

      results.push({
        cdnUrls: {},
        metadata: {
          aspectRatio: image.aspectRatio || 1.33,
          blurHash: `bhash_${image.productId}`,
          dominantColors: ['#FF5733', '#33FF57', '#3357FF'],
          hasTransparency: image.format === 'png',
          perceptualHash: `phash_${image.productId}`,
        },
        originalUrl: image.url,
        processingTime: Math.random() * 1000,
        productId: image.productId,
        variants: processedVariants,
      });
    }

    return results;
  },
);

// Step 1: Fetch images to sync
export const fetchImagesToSyncStep = compose(
  createStepWithValidation(
    'fetch-images',
    async (input: z.infer<typeof ImageCDNSyncInput>) => {
      const { mode, sources } = input;
      const images = [];

      for (const source of sources) {
        // In production, would fetch from actual sources
        const sourceImages = await fetchFromSource(source, mode);
        images.push(...sourceImages);
      }

      // Remove duplicates if found
      const uniqueImages = Array.from(new Map(images.map((img) => [img.productId, img])).values());

      return {
        ...input,
        fetchedAt: new Date().toISOString(),
        images: uniqueImages,
        totalImages: uniqueImages.length,
      };
    },
    (input) => input.sources.length > 0,
    (output) => output.images.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 60000 }),
  (step) =>
    withStepMonitoring(step, {
, 'sourceCount'],
      enableDetailedLogging: true,
    }),
);

// Mock function to fetch images from source
async function fetchFromSource(source: any, mode: string): Promise<any[]> {
  // Simulate fetching images
  const baseImages = Array.from({ length: 50 }, (_, i) => ({
    url: `https://source.example.com/products/prod_${i}/main.jpg`,
    aspectRatio: [1, 1.33, 1.5, 1.77][Math.floor(Math.random() * 4)],
    format: ['jpg', 'png', 'webp'][Math.floor(Math.random() * 3)],
    lastModified: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    productId: `prod_${i}`,
    size: Math.floor(Math.random() * 5000000) + 500000, // 500KB to 5MB
  }));

  if (mode === 'incremental' && source.config.filters?.modifiedAfter) {
    const cutoffDate = new Date(source.config.filters.modifiedAfter);
    return baseImages.filter((img) => new Date(img.lastModified) > cutoffDate);
  }

  return baseImages;
}

// Step 2: Deduplicate images using perceptual hashing
export const deduplicateImagesStep = createStep('deduplicate-images', async (data: any) => {
  const { images, processing } = data;

  if (!processing.enableDeduplication) {
    return {
      ...data,
      deduplicationSkipped: true,
    };
  }

  // Simulate perceptual hash comparison
  const uniqueImages = [];
  const duplicates = [];
  const hashMap = new Map();

  for (const image of images) {
    const phash = `phash_${image.productId}`; // In production, calculate actual perceptual hash

    const similar = Array.from(hashMap.entries()).find(([hash, _]) => {
      // Simulate hash similarity calculation
      return Math.random() > processing.perceptualHashThreshold;
    });

    if (similar) {
      duplicates.push({
        duplicateOf: similar[1],
        image,
        similarity: 0.96,
      });
    } else {
      hashMap.set(phash, image);
      uniqueImages.push(image);
    }
  }

  return {
    ...data,
    deduplicationStats: {
      deduplicationRate: (duplicates.length / images.length) * 100,
      duplicatesFound: duplicates.length,
      original: images.length,
      unique: uniqueImages.length,
    },
    duplicates,
    images: uniqueImages,
  };
});

// Step 3: Process images in batches
export const processImageBatchesStep = compose(
  createStep('process-batches', async (data: any) => {
    const { images, processing, sources } = data;
    const batchSize = sources[0]?.config.batchSize || 100;
    const parallelism = sources[0]?.config.parallelism || 5;

    const processedImages = [];
    const failedImages = [];

    // Process in batches
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);

      // Process batch with parallelism control
      const batchPromises = [];
      for (let j = 0; j < batch.length; j += parallelism) {
        const parallelBatch = batch.slice(j, j + parallelism);

        const promise = imageProcessingStepFactory.handler({
          input: {
            images: parallelBatch,
            optimization: data.optimization,
            variants: processing.variants,
          },
        });

        batchPromises.push(promise);
      }

      try {
        const batchResults = await Promise.all(batchPromises);
        processedImages.push(...batchResults.flat());
      } catch (error) {
        console.error(`Batch processing failed:`, error);
        failedImages.push(...batch);
      }

      // Progress update
      console.log(`Processed ${Math.min(i + batchSize, images.length)}/${images.length} images`);
    }

    return {
      ...data,
      failedImages,
      processedImages,
      processingStats: {
        failed: failedImages.length,
        processed: processedImages.length,
        successRate: (processedImages.length / images.length) * 100,
        total: images.length,
      },
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 10,
      maxQueued: 100,
    }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

// Step 4: Distribute to CDN networks
export const distributeToCDNStep = compose(
  createStep('distribute-cdn', async (data: any) => {
    const { processedImages, targets } = data;
    const cdnDistribution = [];

    for (const image of processedImages) {
      const cdnUrls: Record<string, string> = {};

      for (const target of targets) {
        // Simulate CDN upload
        await new Promise((resolve) => setTimeout(resolve, 50));

        const baseUrl = getCDNBaseUrl(target.provider);
        cdnUrls[target.provider] = `${baseUrl}/${image.productId}/optimized`;

        // Purge existing if requested
        if (target.config.purgeExisting) {
          console.log(`Purging existing content for ${image.productId} on ${target.provider}`);
        }
      }

      cdnDistribution.push({
        ...image,
        cdnUrls,
        distributedAt: new Date().toISOString(),
      });
    }

    return {
      ...data,
      cdnDistribution,
      distributionStats: {
        cdnProviders: targets.length,
        totalImages: cdnDistribution.length,
        totalVariants: cdnDistribution.reduce((sum, img) => sum + img.variants.length, 0),
      },
    };
  }),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes
);

// Helper function to get CDN base URL
function getCDNBaseUrl(provider: string): string {
  const cdnUrls: Record<string, string> = {
    akamai: 'https://cdn.akamai.com',
    bunny: 'https://cdn.bunny.net',
    cloudflare: 'https://cdn.cloudflare.com',
    cloudfront: 'https://d1234567890.cloudfront.net',
    fastly: 'https://cdn.fastly.net',
  };
  return cdnUrls[provider] || 'https://cdn.example.com';
}

// Step 5: Generate lazy loading metadata
export const generateLazyLoadingMetadataStep = createStep(
  'generate-metadata',
  async (data: any) => {
    const { cdnDistribution, processing } = data;

    if (!processing.lazyLoadingMetadata) {
      return data;
    }

    const metadataEntries = cdnDistribution.map((image: any) => ({
      lazyLoad: {
        aspectRatio: image.metadata.aspectRatio,
        blurHash: image.metadata.blurHash,
        dominantColor: image.metadata.dominantColors[0],
        placeholder: `data:image/svg+xml;base64,${generatePlaceholderSVG(image.metadata)}`,
        sizes: image.variants.map((v: any) => ({
          width: v.width,
          name: v.name,
          srcset: `${v.url} ${v.width}w`,
        })),
      },
      performance: {
        optimizedSize: image.variants.reduce((sum: number, v: any) => sum + v.size, 0),
        originalSize: image.originalSize || 0,
        savingsPercent: 0,
      },
      productId: image.productId,
    }));

    return {
      ...data,
      lazyLoadingMetadata: metadataEntries,
      metadataGenerated: true,
    };
  },
);

// Helper to generate placeholder SVG
function generatePlaceholderSVG(metadata: any): string {
  const svg = `<svg width="100%" height="100%" viewBox="0 0 ${metadata.aspectRatio * 100} 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${metadata.dominantColors[0]}" />
  </svg>`;
  return Buffer.from(svg).toString('base64');
}

// Step 6: Update database and cache
export const updateDatabaseStep = compose(
  StepTemplates.database('update-image-records', 'Update image CDN records in database'),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
);

// Step 7: Warm CDN caches
export const warmCDNCachesStep = createStep('warm-caches', async (data: any) => {
  const { cdnDistribution, targets } = data;
  const warmingResults = [];

  // Select strategic images to warm (popular products, homepage items, etc.)
  const imagesToWarm = cdnDistribution.slice(0, 100); // Top 100 images

  for (const image of imagesToWarm) {
    for (const target of targets) {
      for (const region of target.config.region) {
        // Simulate cache warming request
        warmingResults.push({
          provider: target.provider,
          latency: Math.random() * 100,
          productId: image.productId,
          region,
          status: 'warmed',
        });
      }
    }
  }

  return {
    ...data,
    cacheWarmingResults: warmingResults,
    warmingStats: {
      averageLatency: warmingResults.reduce((sum, r) => sum + r.latency, 0) / warmingResults.length,
      imagesWarmed: imagesToWarm.length,
      totalRequests: warmingResults.length,
    },
  };
});

// Step 8: Generate sync report
export const generateSyncReportStep = createStep('generate-report', async (data: any) => {
  const report = {
    cdnStatus: data.targets.map((target: any) => ({
      provider: target.provider,
      imagesDistributed: data.cdnDistribution?.length || 0,
      regions: target.config.region,
      status: 'active',
    })),
    mode: data.mode,
    performance: {
      averageImageProcessingTime:
        data.processedImages?.reduce((sum: number, img: any) => sum + img.processingTime, 0) /
          (data.processedImages?.length || 1) || 0,
      cacheWarmingLatency: data.warmingStats?.averageLatency || 0,
      totalProcessingTime: Date.now() - new Date(data.fetchedAt).getTime(),
    },
    recommendations: [],
    summary: {
      cdnProviders: data.targets.length,
      duplicatesFound: data.deduplicationStats?.duplicatesFound || 0,
      failedImages: data.failedImages?.length || 0,
      processedImages: data.processedImages?.length || 0,
      totalImages: data.totalImages,
      totalVariants: data.distributionStats?.totalVariants || 0,
    },
    syncId: `cdn_sync_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Generate recommendations
  if (data.deduplicationStats?.deduplicationRate > 10) {
    report.recommendations.push({
      type: 'deduplication',
      message: `High duplication rate (${data.deduplicationStats.deduplicationRate.toFixed(1)}%). Consider reviewing image upload process.`,
      priority: 'medium',
    });
  }

  if (data.processingStats?.successRate < 95) {
    report.recommendations.push({
      type: 'reliability',
      message: `Processing success rate below threshold (${data.processingStats.successRate.toFixed(1)}%). Review failed images.`,
      priority: 'high',
    });
  }

  return {
    ...data,
    report,
    syncComplete: true,
  };
});

// Main workflow definition
export const imageCDNSyncWorkflow = {
  id: 'image-cdn-sync',
  name: 'Image CDN Sync',
  config: {
    concurrency: {
      max: 5, // Allow 5 sync jobs in parallel
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 */6 * * *', // Every 6 hours
      timezone: 'UTC',
    },
  },
  description: 'Synchronize and optimize product images across CDN networks',
  features: {
    cdnDistribution: true,
    imageOptimization: true,
    lazyLoadingSupport: true,
    multiCDNSupport: true,
    perceptualDeduplication: true,
  },
  steps: [
    fetchImagesToSyncStep,
    deduplicateImagesStep,
    processImageBatchesStep,
    distributeToCDNStep,
    generateLazyLoadingMetadataStep,
    updateDatabaseStep,
    warmCDNCachesStep,
    generateSyncReportStep,
  ],
  version: '1.0.0',
};
