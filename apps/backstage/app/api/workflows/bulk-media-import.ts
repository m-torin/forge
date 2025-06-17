/**
 * Bulk Media Import Workflow
 * Import and process large volumes of product media from various sources
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
  withStepCircuitBreaker,
} from '@repo/orchestration/server/next';

// Input schemas
const BulkMediaImportInput = z.object({
  mapping: z.object({
    altText: z.string().optional(),
    mediaType: z.string().optional(),
    mediaUrl: z.string(),
    metadata: z.record(z.string()).optional(),
    priority: z.string().optional(),
    productId: z.string(), // CSV column or JSON path
  }),
  mediaConfig: z.object({
    requireValidation: z.boolean().default(true),
    types: z.array(z.enum(['image', 'video', '360', 'ar'])).default(['image']),
    allowedFormats: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'webp', 'mp4']),
    autoOptimize: z.boolean().default(true),
    generateVariants: z.boolean().default(true),
    maxFileSize: z.number().default(10485760), // 10MB
  }),
  mode: z.enum(['csv', 'api', 'ftp', 'cloud', 'scrape']).default('csv'),
  processingConfig: z.object({
    batchSize: z.number().default(100),
    cdnUpload: z.boolean().default(true),
    continueOnError: z.boolean().default(true),
    deduplication: z.boolean().default(true),
    parallelDownloads: z.number().default(10),
    retryAttempts: z.number().default(3),
  }),
  source: z.object({
    type: z.enum(['file', 'url', 'bucket', 'api']),
    credentials: z
      .object({
        accessKey: z.string().optional(),
        secretKey: z.string().optional(),
        token: z.string().optional(),
      })
      .optional(),
    format: z.enum(['csv', 'json', 'xml', 'tsv']).optional(),
    location: z.string(), // file path, URL, or bucket name
  }),
  transformations: z.object({
    autoEnhance: z
      .object({
        brightness: z.boolean().default(true),
        contrast: z.boolean().default(true),
        enabled: z.boolean(),
        sharpness: z.boolean().default(true),
      })
      .optional(),
    resize: z
      .array(
        z.object({
          width: z.number(),
          name: z.string(),
          format: z.enum(['jpeg', 'webp', 'png']).optional(),
          height: z.number(),
          quality: z.number().default(85),
        }),
      )
      .optional(),
    watermark: z
      .object({
        enabled: z.boolean(),
        image: z.string(),
        opacity: z.number().default(0.8),
        position: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']),
      })
      .optional(),
  }),
});

// Media processing result schema
const MediaProcessingResult = z.object({
  validation: z.object({
    isValid: z.boolean(),
    issues: z.array(z.string()),
    score: z.number(),
  }),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      retryable: z.boolean(),
    })
    .optional(),
  mediaId: z.string(),
  metadata: z.object({
    downloadTime: z.number(),
    processingTime: z.number(),
    totalTime: z.number(),
  }),
  originalUrl: z.string(),
  processedMedia: z
    .object({
      cdn: z
        .object({
          provider: z.string(),
          url: z.string(),
          region: z.string(),
        })
        .optional(),
      original: z.object({
        url: z.string(),
        dimensions: z.object({
          width: z.number(),
          height: z.number(),
        }),
        format: z.string(),
        hash: z.string(),
        size: z.number(),
      }),
      variants: z.array(
        z.object({
          name: z.string(),
          url: z.string(),
          dimensions: z.object({
            width: z.number(),
            height: z.number(),
          }),
          format: z.string(),
          size: z.number(),
        }),
      ),
    })
    .optional(),
  productId: z.string(),
  status: z.enum(['success', 'failed', 'skipped']),
});

// Step factory for media processing
const mediaProcessorFactory = createWorkflowStep(
  {
    name: 'Media Processor',
    category: 'media',
    tags: ['image-processing', 'optimization', 'cdn'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, media, transformations } = context.input;
    const processedMedia = [];

    for (const item of media) {
      const result = await processMediaItem(item, config, transformations);
      processedMedia.push(result);
    }

    return processedMedia;
  },
);

// Mock media processing
async function processMediaItem(item: any, config: any, transformations: any): Promise<any> {
  const startTime = Date.now();

  // Simulate download
  const downloadTime = 500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, downloadTime));

  // Simulate processing
  const processingTime = 300 + Math.random() * 700;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  // Generate mock result
  const success = Math.random() > 0.05; // 95% success rate

  if (!success) {
    return {
      validation: {
        isValid: false,
        issues: ['Download failed', 'Invalid image format'],
        score: 0,
      },
      error: {
        code: 'DOWNLOAD_ERROR',
        message: 'Failed to download media',
        retryable: true,
      },
      mediaId: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        downloadTime,
        processingTime: 0,
        totalTime: Date.now() - startTime,
      },
      originalUrl: item.url,
      productId: item.productId,
      status: 'failed',
    };
  }

  // Generate variants
  const variants = [];
  if (transformations?.resize) {
    for (const resize of transformations.resize) {
      variants.push({
        name: resize.name,
        url: `https://cdn.example.com/${item.productId}/${resize.name}.${resize.format || 'webp'}`,
        dimensions: {
          width: resize.width,
          height: resize.height,
        },
        format: resize.format || 'webp',
        size: Math.floor(Math.random() * 500000) + 50000,
      });
    }
  }

  return {
    validation: {
      isValid: true,
      issues: [],
      score: 0.9 + Math.random() * 0.1,
    },
    mediaId: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metadata: {
      downloadTime,
      processingTime,
      totalTime: Date.now() - startTime,
    },
    originalUrl: item.url,
    processedMedia: {
      cdn: config.cdnUpload
        ? {
            provider: 'cloudflare',
            url: `https://cdn.example.com/${item.productId}/original.jpg`,
            region: 'global',
          }
        : undefined,
      original: {
        url: item.url,
        dimensions: {
          width: 1920,
          height: 1080,
        },
        format: 'jpeg',
        hash: `hash_${Math.random().toString(36).substr(2, 16)}`,
        size: Math.floor(Math.random() * 5000000) + 500000,
      },
      variants,
    },
    productId: item.productId,
    status: 'success',
  };
}

// Step 1: Parse and validate import source
export const parseImportSourceStep = compose(
  createStepWithValidation(
    'parse-source',
    async (input: z.infer<typeof BulkMediaImportInput>) => {
      const { mapping, source } = input;

      let mediaItems = [];
      const parseErrors = [];

      try {
        // Parse based on source type
        switch (source.type) {
          case 'file':
            mediaItems = await parseFileSource(source, mapping);
            break;
          case 'url':
            mediaItems = await parseUrlSource(source, mapping);
            break;
          case 'bucket':
            mediaItems = await parseBucketSource(source, mapping);
            break;
          case 'api':
            mediaItems = await parseApiSource(source, mapping);
            break;
        }
      } catch (error) {
        parseErrors.push({
          type: 'parse_error',
          message: (error as Error).message,
          source: source.location,
        });
      }

      // Validate media items
      const validItems = [];
      const invalidItems = [];

      for (const item of mediaItems) {
        const validation = validateMediaItem(item, input.mediaConfig);
        if (validation.valid) {
          validItems.push(item);
        } else {
          invalidItems.push({
            ...item,
            validationErrors: validation.errors,
          });
        }
      }

      return {
        ...input,
        invalidCount: invalidItems.length,
        invalidItems,
        validCount: validItems.length,
        importStarted: new Date().toISOString(),
        mediaItems: validItems,
        parseErrors,
        totalItems: mediaItems.length,
      };
    },
    (input) => !!input.source.location,
    (output) => output.mediaItems.length > 0,
  ),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepMonitoring(step),
);

// Mock parsing functions
async function parseFileSource(source: any, mapping: any): Promise<any[]> {
  // Simulate CSV parsing
  return Array.from({ length: 500 }, (_, i) => ({
    type: 'image',
    url: `https://source.example.com/images/product_${i}.jpg`,
    altText: `Product ${i} image`,
    metadata: {
      importDate: new Date().toISOString(),
      source: 'csv_import',
    },
    priority: Math.floor(Math.random() * 10),
    productId: `prod_${i}`,
  }));
}

async function parseUrlSource(source: any, mapping: any): Promise<any[]> {
  // Simulate fetching from URL
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return parseFileSource(source, mapping); // Same format for demo
}

async function parseBucketSource(source: any, mapping: any): Promise<any[]> {
  // Simulate S3/cloud bucket listing
  return Array.from({ length: 1000 }, (_, i) => ({
    type: 'image',
    url: `https://${source.location}.s3.amazonaws.com/products/image_${i}.jpg`,
    altText: `Product image ${(i % 5) + 1}`,
    priority: i % 5,
    productId: `prod_${Math.floor(i / 5)}`, // 5 images per product
  }));
}

async function parseApiSource(source: any, mapping: any): Promise<any[]> {
  // Simulate API response
  return Array.from({ length: 200 }, (_, i) => ({
    type: i % 10 === 0 ? 'video' : 'image',
    url: `https://api.example.com/media/${i}`,
    priority: 0,
    productId: `prod_${i}`,
  }));
}

function validateMediaItem(item: any, config: any): { valid: boolean; errors?: string[] } {
  const errors = [];

  // Check required fields
  if (!item.productId) errors.push('Missing product ID');
  if (!item.url) errors.push('Missing media URL');

  // Check media type
  if (item.type && !config.types.includes(item.type)) {
    errors.push(`Unsupported media type: ${item.type}`);
  }

  // Check URL format
  try {
    new URL(item.url);
  } catch {
    errors.push('Invalid URL format');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Step 2: Check for duplicate media
export const checkDuplicateMediaStep = createStep('check-duplicates', async (data: any) => {
  const { mediaItems, processingConfig } = data;

  if (!processingConfig.deduplication) {
    return {
      ...data,
      deduplicationSkipped: true,
    };
  }

  // Group by product to find duplicates
  const productMedia = new Map();
  const duplicates = [];
  const uniqueItems = [];

  for (const item of mediaItems) {
    if (!productMedia.has(item.productId)) {
      productMedia.set(item.productId, new Set());
    }

    const mediaSet = productMedia.get(item.productId);
    const mediaKey = `${item.url}_${item.type || 'image'}`;

    if (mediaSet.has(mediaKey)) {
      duplicates.push({
        ...item,
        reason: 'Duplicate URL for same product',
      });
    } else {
      mediaSet.add(mediaKey);

      // Check against existing media (mock)
      const existingHash = await checkExistingMedia(item);
      if (existingHash) {
        duplicates.push({
          ...item,
          existingHash,
          reason: 'Media already exists',
        });
      } else {
        uniqueItems.push(item);
      }
    }
  }

  return {
    ...data,
    deduplicationStats: {
      deduplicationRate: duplicates.length / mediaItems.length,
      duplicateCount: duplicates.length,
      originalCount: mediaItems.length,
      uniqueCount: uniqueItems.length,
    },
    duplicates,
    mediaItems: uniqueItems,
  };
});

async function checkExistingMedia(item: any): Promise<string | null> {
  // Simulate checking against existing media database
  return Math.random() > 0.9 ? `existing_hash_${Math.random().toString(36).substr(2, 8)}` : null;
}

// Step 3: Download media in batches
export const downloadMediaBatchesStep = compose(
  createStep('download-media', async (data: any) => {
    const { mediaConfig, mediaItems, processingConfig } = data;
    const { batchSize, parallelDownloads } = processingConfig;

    const downloadResults = [];
    const failedDownloads = [];
    let processedCount = 0;

    // Process in batches
    for (let i = 0; i < mediaItems.length; i += batchSize) {
      const batch = mediaItems.slice(i, i + batchSize);

      // Download in parallel within batch
      const batchPromises = [];
      for (let j = 0; j < batch.length; j += parallelDownloads) {
        const parallelBatch = batch.slice(j, j + parallelDownloads);

        const downloads = parallelBatch.map((item: any) =>
          downloadMedia(item, mediaConfig, processingConfig.retryAttempts),
        );

        batchPromises.push(Promise.allSettled(downloads));
      }

      // Process batch results
      const batchResults = await Promise.all(batchPromises);

      for (const results of batchResults) {
        for (const result of results) {
          if (result.status === 'fulfilled') {
            downloadResults.push(result.value);
          } else {
            failedDownloads.push({
              error: result.reason,
              item: batch[results.indexOf(result)],
            });
          }
        }
      }

      processedCount += batch.length;
      console.log(`Downloaded ${processedCount}/${mediaItems.length} media files`);

      // Rate limiting pause
      if (i + batchSize < mediaItems.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return {
      ...data,
      downloadedMedia: downloadResults,
      downloadStats: {
        failed: failedDownloads.length,
        successful: downloadResults.length,
        successRate: downloadResults.length / mediaItems.length,
        total: mediaItems.length,
      },
      failedDownloads,
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

async function downloadMedia(item: any, config: any, retryAttempts: number): Promise<any> {
  const startTime = Date.now();
  let lastError = null;

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    try {
      // Simulate download
      const downloadTime = 200 + Math.random() * 800;
      await new Promise((resolve) => setTimeout(resolve, downloadTime));

      // Random failure for simulation
      if (Math.random() < 0.05) {
        throw new Error('Download timeout');
      }

      // Generate mock downloaded data
      const fileSize = Math.floor(Math.random() * config.maxFileSize);
      const format = item.url.split('.').pop() || 'jpg';

      return {
        ...item,
        downloaded: {
          attempt: attempt + 1,
          downloadTime: Date.now() - startTime,
          format,
          localPath: `/tmp/media/${item.productId}_${Date.now()}.${format}`,
          size: fileSize,
        },
      };
    } catch (error) {
      lastError = error;
      if (attempt < retryAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError;
}

// Step 4: Validate downloaded media
export const validateDownloadedMediaStep = createStep('validate-media', async (data: any) => {
  const { downloadedMedia, mediaConfig } = data;

  if (!mediaConfig.requireValidation) {
    return {
      ...data,
      validatedMedia: downloadedMedia,
      validationSkipped: true,
    };
  }

  const validatedMedia = [];
  const invalidMedia = [];

  for (const media of downloadedMedia) {
    const validation = await validateMedia(media, mediaConfig);

    if (validation.isValid) {
      validatedMedia.push({
        ...media,
        validation,
      });
    } else {
      invalidMedia.push({
        ...media,
        validation,
      });
    }
  }

  return {
    ...data,
    invalidMedia,
    validatedMedia,
    validationStats: {
      invalid: invalidMedia.length,
      valid: validatedMedia.length,
      validationRate: validatedMedia.length / downloadedMedia.length,
      total: downloadedMedia.length,
    },
  };
});

async function validateMedia(media: any, config: any): Promise<any> {
  // Simulate media validation
  await new Promise((resolve) => setTimeout(resolve, 50));

  const issues = [];
  let score = 1.0;

  // Check file size
  if (media.downloaded.size > config.maxFileSize) {
    issues.push('File size exceeds limit');
    score -= 0.3;
  }

  // Check format
  if (!config.allowedFormats.includes(media.downloaded.format)) {
    issues.push(`Unsupported format: ${media.downloaded.format}`);
    score -= 0.5;
  }

  // Simulate image quality checks
  if (Math.random() < 0.1) {
    issues.push('Low image quality detected');
    score -= 0.2;
  }

  // Simulate dimension checks
  const dimensions = {
    width: 800 + Math.floor(Math.random() * 2400),
    height: 600 + Math.floor(Math.random() * 1800),
  };

  if (dimensions.width < 800 || dimensions.height < 600) {
    issues.push('Image dimensions too small');
    score -= 0.2;
  }

  return {
    isValid: issues.length === 0 || score > 0.5,
    dimensions,
    issues,
    metadata: {
      colorSpace: 'RGB',
      hasTransparency: media.downloaded.format === 'png',
      isAnimated: false,
    },
    score: Math.max(0, score),
  };
}

// Step 5: Process and optimize media
export const processMediaStep = compose(
  createStep('process-media', async (data: any) => {
    const { validatedMedia, mediaConfig, transformations } = data;

    if (!mediaConfig.autoOptimize && !transformations.resize) {
      return {
        ...data,
        processedMedia: validatedMedia,
        processingSkipped: true,
      };
    }

    // Process media in batches
    const processedMedia = await mediaProcessorFactory.handler({
      input: {
        config: mediaConfig,
        media: validatedMedia,
        transformations,
      },
    });

    return {
      ...data,
      processedMedia,
      processingComplete: true,
      processingStats: {
        failed: processedMedia.filter((m: any) => m.status === 'failed').length,
        successful: processedMedia.filter((m: any) => m.status === 'success').length,
        total: validatedMedia.length,
      },
    };
  }),
  (step: any) => withStepTimeout(step, 300000), // 5 minutes
);

// Step 6: Generate image hashes for deduplication
export const generateImageHashesStep = createStep('generate-hashes', async (data: any) => {
  const { processedMedia } = data;
  const hashedMedia = [];

  for (const media of processedMedia) {
    if (media.status !== 'success') {
      hashedMedia.push(media);
      continue;
    }

    // Generate perceptual hash
    const hashes = await generatePerceptualHashes(media);

    hashedMedia.push({
      ...media,
      hashes,
    });
  }

  // Find similar images
  const similarityGroups = findSimilarImages(hashedMedia);

  return {
    ...data,
    hashedMedia,
    hashingComplete: true,
    similarityGroups,
  };
});

async function generatePerceptualHashes(media: any): Promise<any> {
  // Simulate perceptual hashing
  await new Promise((resolve) => setTimeout(resolve, 20));

  return {
    ahash: Math.random().toString(36).substr(2, 16),
    colorHash: Math.random().toString(36).substr(2, 8),
    dhash: Math.random().toString(36).substr(2, 16),
    phash: Math.random().toString(36).substr(2, 16),
  };
}

function findSimilarImages(mediaList: any[]): any[] {
  // Simulate finding similar images
  const groups = [];
  const processed = new Set();

  for (let i = 0; i < mediaList.length; i++) {
    if (processed.has(i)) continue;

    const group = {
      members: [mediaList[i].mediaId],
      representative: mediaList[i].mediaId,
      similarity: 1.0,
    };

    // Randomly group some images as similar
    for (let j = i + 1; j < mediaList.length; j++) {
      if (Math.random() < 0.05 && !processed.has(j)) {
        group.members.push(mediaList[j].mediaId);
        processed.add(j);
      }
    }

    if (group.members.length > 1) {
      groups.push(group);
    }
  }

  return groups;
}

// Step 7: Upload to CDN
export const uploadToCDNStep = compose(
  createStep('upload-cdn', async (data: any) => {
    const { hashedMedia, processingConfig } = data;

    if (!processingConfig.cdnUpload) {
      return {
        ...data,
        cdnUploadSkipped: true,
      };
    }

    const cdnResults: any[] = [];
    const uploadErrors: any[] = [];

    // Upload in batches
    const batchSize = 50;
    for (let i = 0; i < hashedMedia.length; i += batchSize) {
      const batch = hashedMedia.slice(i, i + batchSize);

      const uploadPromises = batch.map((media: any) => uploadToCDN(media));
      const results = await Promise.allSettled(uploadPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          cdnResults.push(result.value);
        } else {
          uploadErrors.push({
            error: result.reason,
            media: batch[index],
          });
        }
      });

      console.log(`Uploaded ${i + batch.length}/${hashedMedia.length} to CDN`);
    }

    return {
      ...data,
      cdnResults,
      cdnStats: {
        failed: uploadErrors.length,
        successRate: cdnResults.length / hashedMedia.length,
        total: hashedMedia.length,
        uploaded: cdnResults.length,
      },
      uploadErrors,
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
);

async function uploadToCDN(media: any): Promise<any> {
  // Simulate CDN upload
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

  if (Math.random() < 0.02) {
    throw new Error('CDN upload failed');
  }

  const cdnBaseUrl = 'https://cdn.example.com';
  const cdnUrls = {
    original: `${cdnBaseUrl}/${media.productId}/original.${media.processedMedia?.original.format || 'jpg'}`,
    variants: {} as Record<string, string>,
  };

  if (media.processedMedia?.variants) {
    media.processedMedia.variants.forEach((variant: any) => {
      cdnUrls.variants[variant.name] =
        `${cdnBaseUrl}/${media.productId}/${variant.name}.${variant.format}`;
    });
  }

  return {
    ...media,
    cdn: {
      provider: 'cloudflare',
      urls: cdnUrls,
      region: 'global',
      uploadedAt: new Date().toISOString(),
    },
  };
}

// Step 8: Update product database
export const updateProductMediaStep = compose(
  createStep('update-database', async (data: any) => {
    const { cdnResults, processedMedia } = data;

    // Group media by product
    const productMedia = new Map();

    const mediaToUpdate = cdnResults.length > 0 ? cdnResults : processedMedia;

    mediaToUpdate.forEach((media: any) => {
      if (media.status !== 'success') return;

      if (!productMedia.has(media.productId)) {
        productMedia.set(media.productId, []);
      }

      productMedia.get(media.productId).push({
        type: media.type || 'image',
        url: media.cdn?.urls.original || media.processedMedia?.original.url,
        altText: media.altText,
        mediaId: media.mediaId,
        metadata: {
          ...media.metadata,
          dimensions: media.validation?.dimensions,
          hash: media.hashes?.phash,
        },
        priority: media.priority || 0,
        variants: media.cdn?.urls.variants || {},
      });
    });

    // Sort media by priority
    productMedia.forEach((mediaList, productId) => {
      mediaList.sort((a: any, b: any) => a.priority - b.priority);
    });

    return {
      ...data,
      databaseUpdateComplete: true,
      productMediaUpdates: Array.from(productMedia.entries()).map(([productId, media]) => ({
        media,
        productId,
        updateCount: media.length,
      })),
    };
  }),
  StepTemplates.database('update-product-media', 'Update product media in database'),
);

// Step 9: Clean up temporary files
export const cleanupTemporaryFilesStep = createStep('cleanup-files', async (data: any) => {
  const { downloadedMedia, processingConfig } = data;

  if (!processingConfig.continueOnError) {
    // Don't cleanup if there were errors and continueOnError is false
    const hasErrors = data.uploadErrors?.length > 0 || data.failedDownloads?.length > 0;
    if (hasErrors) {
      return {
        ...data,
        cleanupReason: 'Errors detected, preserving files for debugging',
        cleanupSkipped: true,
      };
    }
  }

  // Simulate cleanup
  const cleanedFiles = [];
  for (const media of downloadedMedia) {
    if (media.downloaded?.localPath) {
      cleanedFiles.push(media.downloaded.localPath);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    ...data,
    cleanedFiles,
    cleanupComplete: true,
  };
});

// Step 10: Generate import report
export const generateImportReportStep = createStep('generate-report', async (data: any) => {
  const {
    invalidItems,
    validationStats,
    cdnStats,
    downloadStats,
    duplicates,
    processedMedia,
    productMediaUpdates,
    similarityGroups,
    totalItems,
  } = data;

  const report = {
    errors: {
      validation: data.invalidMedia?.slice(0, 10) || [],
      cdn: data.uploadErrors?.slice(0, 10) || [],
      download: data.failedDownloads?.slice(0, 10) || [],
    },
    performance: {
      averageDownloadTime:
        downloadStats?.successful > 0
          ? data.downloadedMedia.reduce(
              (sum: number, m: any) => sum + (m.downloaded?.downloadTime || 0),
              0,
            ) / downloadStats.successful
          : 0,
      throughput: {
        itemsPerMinute:
          (processedMedia?.length || 0) /
          ((Date.now() - new Date(data.importStarted).getTime()) / 60000),
      },
      totalProcessingTime: Date.now() - new Date(data.importStarted).getTime(),
    },
    products: {
      topProducts:
        productMediaUpdates?.slice(0, 10).map((p: any) => ({
          mediaCount: p.updateCount,
          productId: p.productId,
        })) || [],
      totalMediaAdded:
        productMediaUpdates?.reduce((sum: number, p: any) => sum + p.updateCount, 0) || 0,
      updated: productMediaUpdates?.length || 0,
    },
    quality: {
      averageValidationScore:
        data.validatedMedia?.reduce((sum: number, m: any) => sum + (m.validation?.score || 0), 0) /
          (data.validatedMedia?.length || 1) || 0,
      duplicatesFound: duplicates?.length || 0,
      similarImageGroups: similarityGroups?.length || 0,
    },
    recommendations: generateImportRecommendations(data),
    reportId: `media_import_${Date.now()}`,
    stages: {
      validation: validationStats || { skipped: true },
      cdn: cdnStats || { skipped: true },
      deduplication: data.deduplicationStats || { skipped: true },
      download: downloadStats || { skipped: true },
      parsing: {
        invalid: data.invalidCount,
        valid: data.validCount,
        errors: data.parseErrors,
        total: totalItems,
      },
    },
    summary: {
      failed: (data.failedDownloads?.length || 0) + (data.invalidMedia?.length || 0),
      skipped: (duplicates?.length || 0) + (invalidItems?.length || 0),
      successfullyImported: processedMedia?.filter((m: any) => m.status === 'success').length || 0,
      totalRequested: totalItems,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    importComplete: true,
    report,
  };
});

function generateImportRecommendations(data: any): any[] {
  const recommendations = [];

  // High failure rate
  const failureRate = (data.failedDownloads?.length || 0) / (data.totalItems || 1);
  if (failureRate > 0.1) {
    recommendations.push({
      type: 'high_failure_rate',
      action: 'check_source_availability',
      message: `${(failureRate * 100).toFixed(1)}% of downloads failed`,
      priority: 'high',
    });
  }

  // Many duplicates
  if (data.deduplicationStats?.deduplicationRate > 0.2) {
    recommendations.push({
      type: 'high_duplication',
      action: 'review_import_source',
      message: `${(data.deduplicationStats.deduplicationRate * 100).toFixed(1)}% duplicate media detected`,
      priority: 'medium',
    });
  }

  // Similar images
  if (data.similarityGroups?.length > data.processedMedia?.length * 0.1) {
    recommendations.push({
      type: 'similar_images',
      action: 'consider_deduplication_threshold',
      message: 'Many similar images detected',
      priority: 'low',
    });
  }

  // Enable CDN
  if (!data.processingConfig?.cdnUpload) {
    recommendations.push({
      type: 'cdn_disabled',
      action: 'enable_cdn_for_performance',
      message: 'CDN upload is disabled',
      priority: 'medium',
    });
  }

  return recommendations;
}

// Main workflow definition
export const bulkMediaImportWorkflow = {
  id: 'bulk-media-import',
  name: 'Bulk Media Import',
  config: {
    concurrency: {
      max: 3, // Limit concurrent import jobs
    },
    maxDuration: 14400000, // 4 hours
    schedule: {
      cron: '0 2 * * *', // Daily at 2 AM
      timezone: 'UTC',
    },
  },
  description: 'Import and process large volumes of product media from various sources',
  features: {
    bulkProcessing: true,
    cdnIntegration: true,
    deduplication: true,
    imageOptimization: true,
    perceptualHashing: true,
  },
  steps: [
    parseImportSourceStep,
    checkDuplicateMediaStep,
    downloadMediaBatchesStep,
    validateDownloadedMediaStep,
    processMediaStep,
    generateImageHashesStep,
    uploadToCDNStep,
    updateProductMediaStep,
    cleanupTemporaryFilesStep,
    generateImportReportStep,
  ],
  version: '1.0.0',
};
