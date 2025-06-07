/**
 * Image Deduplication Workflow
 * Hash images via URL streaming and detect duplicates using perceptual hashing
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepTimeout,
  withStepMonitoring,
  compose,
  StepRegistry,
  createWorkflowStep,
} from '@repo/orchestration';
import { z } from 'zod';
import type { Prisma } from '@repo/database';

// Input schemas
const ImageDeduplicationInput = z.object({
  images: z.array(z.object({
    url: z.string().url(),
    productId: z.string(),
    metadata: z.object({
      source: z.string(),
      importedAt: z.string().optional(),
      originalFilename: z.string().optional(),
    }).optional(),
  })).min(1).max(1000), // Process up to 1000 images per batch
  options: z.object({
    hashAlgorithms: z.array(z.enum(['md5', 'sha256', 'phash', 'dhash'])).default(['sha256', 'phash']),
    similarity_threshold: z.number().min(0).max(1).default(0.95), // 95% similarity
    streamChunkSize: z.number().default(65536), // 64KB chunks
  }).optional(),
});

// Create reusable step components using step factory
const imageHashingStepFactory = createWorkflowStep(
  {
    name: 'Image Hasher',
    version: '1.0.0',
    category: 'media',
    tags: ['hashing', 'streaming', 'deduplication'],
  },
  async (context) => {
    const { url, algorithms } = context.input;
    
    // Simulate streaming and hashing
    const hashes: Record<string, string> = {};
    
    for (const algo of algorithms) {
      // In real implementation, would stream the image and calculate hash
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      success: true,
      output: {
        url,
        hashes,
        fileSize: Math.floor(Math.random() * 5000000), // Simulated file size
        dimensions: {
          width: 1200 + Math.floor(Math.random() * 800),
          height: 800 + Math.floor(Math.random() * 600),
        },
      },
    };
  },
  {
    executionConfig: {
      timeout: { execution: 30000 }, // 30s per image
      retryConfig: {
        maxAttempts: 3,
        backoff: 'exponential',
        retryIf: (error) => error.message.includes('timeout') || error.message.includes('stream'),
      },
    },
  }
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
          input: {
            url: image.url,
            algorithms: options?.hashAlgorithms || ['sha256', 'phash'],
          },
          executionId: `exec_${Date.now()}`,
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
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(images.length / BATCH_SIZE)}`);
    }
    
    return {
      ...input,
      hashedImages: results,
      totalProcessed: results.length,
      processingTime: new Date().toISOString(),
    };
  }),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes total
  (step) => withStepMonitoring(step, {
    enableDetailedLogging: true,
    customMetrics: ['imagesProcessed', 'hashingTime'],
  })
);

// Step 2: Store hashes in database
export const storeHashesStep = compose(
  StepTemplates.database('store-image-hashes', 'Store image hashes in PostgreSQL'),
  (step) => withStepRetry(step, { maxAttempts: 3 })
);

// Reusable duplicate detection logic
const duplicateDetectionLogic = createWorkflowStep(
  {
    name: 'Duplicate Detector',
    version: '1.0.0',
    category: 'analysis',
    tags: ['deduplication', 'similarity'],
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
            similarity: 1.0,
            matchedOn: 'sha256',
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
              similarity,
              matchedOn: 'phash',
            });
          }
        }
      }
    }
    
    return {
      success: true,
      output: {
        duplicates,
        totalComparisons: (hashes.length * (hashes.length - 1)) / 2,
        duplicatesFound: duplicates.length,
      },
    };
  }
);

// Step 3: Find duplicate images
export const findDuplicatesStep = createStep(
  'find-duplicates',
  async (data: any) => {
    const { hashedImages, options } = data;
    
    // Query existing hashes from database (simulated)
    const existingHashes = await simulateDbQuery();
    
    // Combine with new hashes for comparison
    const allHashes = [...existingHashes, ...hashedImages];
    
    // Use the duplicate detection logic
    const detector = duplicateDetectionLogic;
    const result = await detector.execute({
      input: {
        hashes: allHashes,
        threshold: options?.similarity_threshold || 0.95,
      },
      executionId: `detect_${Date.now()}`,
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
  }
);

// Helper function to simulate DB query
async function simulateDbQuery() {
  // In real implementation, would use @repo/database
  return Array.from({ length: 100 }, (_, i) => ({
    url: `https://existing-image-${i}.jpg`,
    productId: `existing_product_${i}`,
    sha256: `existing_sha256_${i}`,
    phash: `existing_phash_${i}`,
    storedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

// Step 4: Create deduplication report
export const createDeduplicationReportStep = createStep(
  'create-report',
  async (data: any) => {
    const { hashedImages, duplicateAnalysis } = data;
    
    const report = {
      summary: {
        totalImagesProcessed: hashedImages.length,
        uniqueImages: hashedImages.length - duplicateAnalysis.duplicatesFound,
        duplicatesFound: duplicateAnalysis.duplicatesFound,
        exactMatches: duplicateAnalysis.duplicates.filter((d: any) => d.type === 'exact').length,
        similarMatches: duplicateAnalysis.duplicates.filter((d: any) => d.type === 'similar').length,
        deduplicationRate: (duplicateAnalysis.duplicatesFound / hashedImages.length) * 100,
      },
      recommendations: [],
      actions: [],
    };
    
    // Generate recommendations
    if (report.summary.deduplicationRate > 20) {
      report.recommendations.push({
        priority: 'high',
        message: 'High duplication rate detected. Consider implementing duplicate prevention at upload time.',
        impact: `Could save ${Math.floor(report.summary.duplicatesFound * 2.5)}MB of storage`,
      });
    }
    
    // Generate actions for each duplicate set
    duplicateAnalysis.duplicates.forEach((dup: any) => {
      report.actions.push({
        action: 'merge_products',
        products: dup.images.map((img: any) => img.productId),
        reason: `${dup.type} match with ${(dup.similarity * 100).toFixed(1)}% similarity`,
        confidence: dup.similarity,
      });
    });
    
    return {
      ...data,
      report,
      reportGeneratedAt: new Date().toISOString(),
    };
  }
);

// Step 5: Update product mappings
export const updateProductMappingsStep = compose(
  createStep('update-mappings', async (data: any) => {
    const { report, duplicateAnalysis } = data;
    
    // Create product mapping table updates
    const mappings = [];
    
    duplicateAnalysis.duplicates.forEach((dup: any) => {
      const [primary, ...secondaries] = dup.images.sort((a: any, b: any) => 
        new Date(a.hashedAt || a.storedAt).getTime() - new Date(b.hashedAt || b.storedAt).getTime()
      );
      
      secondaries.forEach((secondary: any) => {
        mappings.push({
          duplicateProductId: secondary.productId,
          primaryProductId: primary.productId,
          matchType: dup.type,
          similarity: dup.similarity,
          mappedAt: new Date().toISOString(),
        });
      });
    });
    
    return {
      ...data,
      productMappings: mappings,
      mappingsCreated: mappings.length,
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 2 })
);

// Step 6: Clean up duplicate images (optional)
export const cleanupDuplicatesStep = StepTemplates.conditional(
  'cleanup-duplicates',
  'Remove duplicate images if confirmed',
  {
    condition: (data: any) => data.options?.enableCleanup === true,
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
  }
);

// Step 7: Send notifications
export const sendDeduplicationNotificationStep = StepTemplates.notification(
  'dedup-notification',
  'Notify about deduplication results',
  {
    channels: ['email', 'webhook'],
    template: {
      subject: 'Image Deduplication Report - {{totalImages}} processed',
      webhookUrl: 'https://api.example.com/webhooks/deduplication',
    },
  }
);

// Main workflow definition
export const imageDeduplicationWorkflow = {
  id: 'image-deduplication',
  name: 'Image Deduplication',
  description: 'Hash images via URL streaming and detect duplicates using perceptual hashing',
  version: '1.0.0',
  steps: [
    streamAndHashImagesStep,
    storeHashesStep,
    findDuplicatesStep,
    createDeduplicationReportStep,
    updateProductMappingsStep,
    cleanupDuplicatesStep,
    sendDeduplicationNotificationStep,
  ],
  config: {
    maxDuration: 900000, // 15 minutes
    concurrency: {
      max: 5, // Allow 5 deduplication jobs in parallel
    },
    monitoring: {
      metrics: ['imagesProcessed', 'duplicatesFound', 'processingTime'],
      alerts: [
        {
          metric: 'deduplicationRate',
          threshold: 30, // Alert if >30% duplicates
          action: 'notify',
        },
      ],
    },
  },
  // Example of workflow composition - this workflow can be used as a sub-workflow
  metadata: {
    composable: true,
    inputs: ImageDeduplicationInput,
    outputs: z.object({
      report: z.any(),
      productMappings: z.array(z.any()),
      totalProcessed: z.number(),
    }),
  },
};