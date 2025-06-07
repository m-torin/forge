/**
 * Image Deduplication Workflow
 * Hash images via URL streaming and detect duplicates using perceptual hashing
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createWorkflowStep,
  StepRegistry,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const ImageDeduplicationInput = z.object({
  images: z
    .array(
      z.object({
        url: z.string().url(),
        metadata: z
          .object({
            originalFilename: z.string().optional(),
            importedAt: z.string().optional(),
            source: z.string(),
          })
          .optional(),
        productId: z.string(),
      }),
    )
    .min(1)
    .max(1000), // Process up to 1000 images per batch
  options: z
    .object({
      hashAlgorithms: z
        .array(z.enum(['md5', 'sha256', 'phash', 'dhash']))
        .default(['sha256', 'phash']),
      similarity_threshold: z.number().min(0).max(1).default(0.95), // 95% similarity
      streamChunkSize: z.number().default(65536), // 64KB chunks
    })
    .optional(),
});

// Create reusable step components using step factory
const imageHashingStepFactory = createWorkflowStep(
  {
    name: 'Image Hasher',
    category: 'media',
    tags: ['hashing', 'streaming', 'deduplication'],
    version: '1.0.0',
  },
  async (context) => {
    const { url, algorithms } = context.input;

    // Simulate streaming and hashing
    const hashes: Record<string, string> = {};

    for (const algo of algorithms) {
      // In real implementation, would stream the image and calculate hash
      await new Promise((resolve) => setTimeout(resolve, 100));

      switch (algo) {
        case 'md5':
          hashes.md5 = `md5_${Buffer.from(url).toString('base64').substring(0, 32)}`;
          break;
        case 'sha256':
          hashes.sha256 = `sha256_${Buffer.from(url).toString('base64').substring(0, 64)}`;
          break;
        case 'phash':
          // Perceptual hash for visual similarity
          hashes.phash = `phash_${Math.random().toString(36).substring(2, 18)}`;
          break;
        case 'dhash':
          // Difference hash for structural similarity
          hashes.dhash = `dhash_${Math.random().toString(36).substring(2, 18)}`;
          break;
      }
    }

    return {
      output: {
        url,
        dimensions: {
          width: 1200 + Math.floor(Math.random() * 800),
          height: 800 + Math.floor(Math.random() * 600),
        },
        fileSize: Math.floor(Math.random() * 5000000), // Simulated file size
        hashes,
      },
      success: true,
    };
  },
  {
    executionConfig: {
      retryConfig: {
        backoff: 'exponential',
        maxAttempts: 3,
        retryIf: (error) => error.message.includes('timeout') || error.message.includes('stream'),
      },
      timeout: { execution: 30000 }, // 30s per image
    },
  },
);

// Register the reusable step
const stepRegistry = new StepRegistry();
stepRegistry.register(imageHashingStepFactory, {
  category: 'media',
  tags: ['reusable', 'hashing'],
});

// Step 1: Stream and hash images in parallel batches
export const streamAndHashImagesStep = compose(
  createStep('stream-hash-images', async (input: z.infer<typeof ImageDeduplicationInput>) => {
    const { images, options } = input;
    const BATCH_SIZE = 10; // Process 10 images in parallel
    const results = [];

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);

      // Use the registered step factory for each image
      const batchPromises = batch.map(async (image) => {
        const hasher = stepRegistry.get(imageHashingStepFactory.id);
        if (!hasher) throw new Error('Image hasher not found in registry');

        const result = await hasher.step.execute({
          executionId: `exec_${Date.now()}`,
          input: {
            url: image.url,
            algorithms: options?.hashAlgorithms || ['sha256', 'phash'],
          },
          workflowId: 'image-dedup',
        });

        return {
          ...image,
          ...result.output,
          hashedAt: new Date().toISOString(),
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Log progress
      console.log(
        `Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(images.length / BATCH_SIZE)}`,
      );
    }

    return {
      ...input,
      hashedImages: results,
      processingTime: new Date().toISOString(),
      totalProcessed: results.length,
    };
  }),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes total
  (step) =>
    withStepMonitoring(step, {
, 'hashingTime'],
      enableDetailedLogging: true,
    }),
);

// Step 2: Store hashes in database
export const storeHashesStep = compose(
  StepTemplates.database('store-image-hashes', 'Store image hashes in PostgreSQL'),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
);

// Reusable duplicate detection logic
const duplicateDetectionLogic = createWorkflowStep(
  {
    name: 'Duplicate Detector',
    category: 'analysis',
    tags: ['deduplication', 'similarity'],
    version: '1.0.0',
  },
  async (context) => {
    const { hashes, threshold } = context.input;

    // Simulate perceptual hash comparison
    const calculateSimilarity = (hash1: string, hash2: string): number => {
      // In real implementation, would calculate Hamming distance for perceptual hashes
      return Math.random() * 0.3 + 0.7; // Simulate 70-100% similarity
    };

    const duplicates = [];
    const processedPairs = new Set<string>();

    for (let i = 0; i < hashes.length; i++) {
      for (let j = i + 1; j < hashes.length; j++) {
        const pairKey = `${i}-${j}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // Check exact hash match first
        if (hashes[i].sha256 === hashes[j].sha256) {
          duplicates.push({
            type: 'exact',
            images: [hashes[i], hashes[j]],
            matchedOn: 'sha256',
            similarity: 1.0,
          });
          continue;
        }

        // Check perceptual similarity
        if (hashes[i].phash && hashes[j].phash) {
          const similarity = calculateSimilarity(hashes[i].phash, hashes[j].phash);
          if (similarity >= threshold) {
            duplicates.push({
              type: 'similar',
              images: [hashes[i], hashes[j]],
              matchedOn: 'phash',
              similarity,
            });
          }
        }
      }
    }

    return {
      output: {
        duplicates,
        duplicatesFound: duplicates.length,
        totalComparisons: (hashes.length * (hashes.length - 1)) / 2,
      },
      success: true,
    };
  },
);

// Step 3: Find duplicate images
export const findDuplicatesStep = createStep('find-duplicates', async (data: any) => {
  const { hashedImages, options } = data;

  // Query existing hashes from database (simulated)
  const existingHashes = await simulateDbQuery();

  // Combine with new hashes for comparison
  const allHashes = [...existingHashes, ...hashedImages];

  // Use the duplicate detection logic
  const detector = duplicateDetectionLogic;
  const result = await detector.execute({
    executionId: `detect_${Date.now()}`,
    input: {
      hashes: allHashes,
      threshold: options?.similarity_threshold || 0.95,
    },
    workflowId: 'image-dedup',
  });

  // Group duplicates by product
  const duplicatesByProduct = result.output.duplicates.reduce((acc: any, dup: any) => {
    dup.images.forEach((img: any) => {
      if (!acc[img.productId]) {
        acc[img.productId] = [];
      }
      acc[img.productId].push({
        ...dup,
        relatedImage: dup.images.find((i: any) => i.productId !== img.productId),
      });
    });
    return acc;
  }, {});

  return {
    ...data,
    duplicateAnalysis: {
      ...result.output,
      duplicatesByProduct,
      uniqueProducts: Object.keys(duplicatesByProduct).length,
    },
  };
});

// Helper function to simulate DB query
async function simulateDbQuery() {
  // In real implementation, would use @repo/database
  return Array.from({ length: 100 }, (_, i) => ({
    url: `https://existing-image-${i}.jpg`,
    phash: `existing_phash_${i}`,
    productId: `existing_product_${i}`,
    sha256: `existing_sha256_${i}`,
    storedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

// Step 4: Create deduplication report
export const createDeduplicationReportStep = createStep('create-report', async (data: any) => {
  const { duplicateAnalysis, hashedImages } = data;

  const report = {
    actions: [],
    recommendations: [],
    summary: {
      deduplicationRate: (duplicateAnalysis.duplicatesFound / hashedImages.length) * 100,
      duplicatesFound: duplicateAnalysis.duplicatesFound,
      exactMatches: duplicateAnalysis.duplicates.filter((d: any) => d.type === 'exact').length,
      similarMatches: duplicateAnalysis.duplicates.filter((d: any) => d.type === 'similar').length,
      totalImagesProcessed: hashedImages.length,
      uniqueImages: hashedImages.length - duplicateAnalysis.duplicatesFound,
    },
  };

  // Generate recommendations
  if (report.summary.deduplicationRate > 20) {
    report.recommendations.push({
      impact: `Could save ${Math.floor(report.summary.duplicatesFound * 2.5)}MB of storage`,
      message:
        'High duplication rate detected. Consider implementing duplicate prevention at upload time.',
      priority: 'high',
    });
  }

  // Generate actions for each duplicate set
  duplicateAnalysis.duplicates.forEach((dup: any) => {
    report.actions.push({
      confidence: dup.similarity,
      action: 'merge_products',
      products: dup.images.map((img: any) => img.productId),
      reason: `${dup.type} match with ${(dup.similarity * 100).toFixed(1)}% similarity`,
    });
  });

  return {
    ...data,
    report,
    reportGeneratedAt: new Date().toISOString(),
  };
});

// Step 5: Update product mappings
export const updateProductMappingsStep = compose(
  createStep('update-mappings', async (data: any) => {
    const { duplicateAnalysis, report } = data;

    // Create product mapping table updates
    const mappings: any[] = [];

    duplicateAnalysis.duplicates.forEach((dup: any) => {
      const [primary, ...secondaries] = dup.images.sort(
        (a: any, b: any) =>
          new Date(a.hashedAt || a.storedAt).getTime() -
          new Date(b.hashedAt || b.storedAt).getTime(),
      );

      secondaries.forEach((secondary: any) => {
        mappings.push({
          duplicateProductId: secondary.productId,
          mappedAt: new Date().toISOString(),
          matchType: dup.type,
          primaryProductId: primary.productId,
          similarity: dup.similarity,
        });
      });
    });

    return {
      ...data,
      mappingsCreated: mappings.length,
      productMappings: mappings,
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 2 }),
);

// Step 6: Clean up duplicate images (optional)
export const cleanupDuplicatesStep = StepTemplates.conditional(
  'cleanup-duplicates',
  'Remove duplicate images if confirmed',
  {
,
    trueStep: createStep('perform-cleanup', async (data: any) => {
      const { productMappings } = data;

      // Simulate cleanup actions
      const cleanupResults = productMappings.map((mapping: any) => ({
        ...mapping,
        cleaned: Math.random() > 0.1, // 90% success rate
        error: Math.random() > 0.9 ? 'File in use' : null,
      }));

      return {
        ...data,
        cleanupResults,
        totalCleaned: cleanupResults.filter((r: any) => r.cleaned).length,
      };
    }),
  },
);

// Step 7: Send notifications
export const sendDeduplicationNotificationStep = StepTemplates.notification(
  'dedup-notification',
  'Notify about deduplication results',
  {
, 'webhook'],
    template: {
      subject: 'Image Deduplication Report - {{totalImages}} processed',
      webhookUrl: 'https://api.example.com/webhooks/deduplication',
    },
  },
);

// Main workflow definition
export const imageDeduplicationWorkflow = {
  id: 'image-deduplication',
  name: 'Image Deduplication',
  config: {
    concurrency: {
      max: 5, // Allow 5 deduplication jobs in parallel
    },
    maxDuration: 900000, // 15 minutes
    monitoring: {
      alerts: [
        {
          action: 'notify',
          metric: 'deduplicationRate',
          threshold: 30, // Alert if >30% duplicates
        },
      ],
      metrics: ['imagesProcessed', 'duplicatesFound', 'processingTime'],
    },
  },
  description: 'Hash images via URL streaming and detect duplicates using perceptual hashing',
  // Example of workflow composition - this workflow can be used as a sub-workflow
  metadata: {
    composable: true,
    inputs: ImageDeduplicationInput,
    outputs: z.object({
      productMappings: z.array(z.any()),
      report: z.any(),
      totalProcessed: z.number(),
    }),
  },
  steps: [
    streamAndHashImagesStep,
    storeHashesStep,
    findDuplicatesStep,
    createDeduplicationReportStep,
    updateProductMappingsStep,
    cleanupDuplicatesStep,
    sendDeduplicationNotificationStep,
  ],
  version: '1.0.0',
};
