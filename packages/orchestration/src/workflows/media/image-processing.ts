import { devLog } from '../../utils/observability';

import type { EnhancedContext } from '../../runtime';

/**
 * Image Processing Workflow Types
 */
export interface ImageProcessingPayload {
  imageId: string;
  imageUrl?: string; // Optional: direct URL to process
  options?: {
    resolutions?: number[];
    filters?: string[];
    outputFormat?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };
  userId: string;

  // Explicit deduplication support
  dedupId?: string;
}

interface ProcessedImage {
  bytes: number;
  dataUrl?: string;
  filter?: string;
  resolution?: number;
  size?: number;
  url: string;
}

/**
 * Image Processing Workflow
 *
 * Demonstrates simulated image processing:
 * - Multiple resolution resizing
 * - Filter application (grayscale, sepia, contrast, blur)
 * - Format conversion
 * - Quality optimization
 *
 * Note: This is a demo workflow that simulates image processing.
 * In production, you would integrate with an actual image processing service.
 */
export async function imageProcessingWorkflow(context: EnhancedContext<ImageProcessingPayload>) {
  const { imageId, imageUrl, options = {}, userId } = context.requestPayload || {};

  // Validate payload
  if (!imageId || !userId) {
    throw new Error('Missing required fields: imageId and userId');
  }

  // Use custom options or defaults
  const resolutions = options.resolutions || [320, 640, 960, 1200];
  const filters = options.filters || ['grayscale', 'sepia', 'blur', 'sharpen'];
  const outputFormat = options.outputFormat || 'webp';
  const quality = options.quality || 85;

  devLog.workflow(context, 'Starting image processing workflow', {
    filters,
    imageId,
    outputFormat,
    quality,
    resolutions,
    userId,
  });

  // Step 1: Simulate fetching delay
  await context.sleep('simulate-fetch', 500);

  // Step 2: Get the original image URL
  const originalUrl = await context.run('get-image-url', async () => {
    return imageUrl || `https://example-storage.com/images/${imageId}/original.jpg`;
  });

  devLog.workflow(context, 'Retrieved image URL', { originalUrl });

  // Step 3: Simulate image processing delays (single step for all variants)
  await context.sleep('process-image-variants', resolutions.length * filters.length * 100);

  // Step 4: Process images
  const processedImages = await context.run('process-images', async () => {
    const results: ProcessedImage[] = [];

    // Create processed image URLs (processing simulation already done above)
    for (const resolution of resolutions) {
      for (const filter of filters) {
        const processedUrl = `https://example-cdn.com/${userId}/${imageId}/${resolution}px-${filter}.${outputFormat}`;

        results.push({
          url: processedUrl,
          bytes: Math.floor(Math.random() * 500000) + 100000, // Simulated file size
          filter,
          resolution,
        });
      }
    }

    devLog.workflow(context, 'Processed images', {
      combinations: `${resolutions.length} resolutions × ${filters.length} filters`,
      count: results.length,
    });

    return results;
  });

  // Step 5: Simulate thumbnail generation delays (single step for all sizes)
  const thumbSizes = [150, 300];
  await context.sleep('generate-thumbnails-delay', thumbSizes.length * 50);

  // Step 6: Generate thumbnails
  const thumbnails = await context.run('generate-thumbnails', async () => {
    const thumbs: ProcessedImage[] = [];

    for (const size of thumbSizes) {
      thumbs.push({
        url: `https://example-cdn.com/${userId}/${imageId}/thumb-${size}.jpg`,
        bytes: Math.floor(Math.random() * 50000) + 10000,
        size,
      });
    }

    return thumbs;
  });

  // Step 4: Call external image processing service (simulated)
  const externalProcessingResults = await context.call<{
    success: boolean;
    processedCount: number;
  }>('external-image-processor', {
    url: 'https://api.example.com/process-batch',
    body: {
      imageUrl: originalUrl,
      operations: {
        filters: filters,
        format: outputFormat,
        quality: quality,
        resize: resolutions,
      },
      webhookUrl: `${context.env.UPSTASH_WORKFLOW_URL}/api/workflows/image-processing/callback`,
    },
    method: 'POST',
    retries: 3,
  });

  // Step 7: Simulate storing metadata delay
  await context.sleep('store-metadata', 200);

  // Step 8: Store results metadata
  const storedResults = await context.run('store-results', async () => {
    const allImages = [...processedImages, ...thumbnails];

    return {
      urls: allImages,
      externalProcessing: externalProcessingResults.body,
      imageId,
      original: {
        url: originalUrl,
        format: 'jpeg', // Assumed original format
      },
      processed: {
        filters,
        outputFormat,
        quality,
        resolutions,
      },
      processingTime: Date.now() - Date.now(), // Processing time would be tracked differently in production
      results: {
        thumbnails: thumbnails.length,
        totalImages: allImages.length,
        totalSizeMB: (allImages.reduce((sum, img) => sum + img.bytes, 0) / 1024 / 1024).toFixed(2),
      },
      userId,
    };
  });

  // Step 9: Simulate notification delay
  await context.sleep('simulate-notification', 100);

  // Step 10: Send notification
  await context.run('notify-completion', async () => {
    devLog.workflow(context, 'Sending completion notification', {
      imageId,
      totalProcessed: storedResults.urls.length,
      userId,
    });
  });

  return storedResults;
}
