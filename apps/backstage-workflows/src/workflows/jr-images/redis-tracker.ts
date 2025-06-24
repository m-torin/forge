import { JR_IMAGES_CONFIG, JR_IMAGES_REDIS_KEYS } from '@/workflows/jr-images/config';
import { JrImagesProcessingResult } from '@/workflows/jr-images/types';

// Mock Redis for development
const mockRedis = {
  data: new Map<string, any>(),

  async hset(key: string, data: Record<string, any>) {
    this.data.set(key, { ...this.data.get(key), ...data });
  },

  async hgetall(key: string) {
    return this.data.get(key) || {};
  },

  async hincrby(key: string, field: string, increment: number) {
    const current = this.data.get(key) || {};
    current[field] = (parseInt(current[field] || '0') + increment).toString();
    this.data.set(key, current);
  },

  async expire(_key: string, _seconds: number) {
    // Mock - in real implementation would set TTL
  },

  pipeline() {
    const operations: Array<() => Promise<any>> = [];
    return {
      hset: (key: string, data: Record<string, any>) => {
        operations.push(() => mockRedis.hset(key, data));
        return this;
      },
      hincrby: (key: string, field: string, increment: number) => {
        operations.push(() => mockRedis.hincrby(key, field, increment));
        return this;
      },
      async exec() {
        return Promise.all(operations.map((op) => op()));
      },
    };
  },
};

const redis = mockRedis;

/**
 * Tracks processing progress for individual JR-Images
 */
export async function trackJrImageProgress(
  documentId: string,
  imageIndex: number,
  status: 'processing' | 'completed' | 'failed',
  metadata?: {
    originalSize?: number;
    processedSize?: number;
    error?: string;
  },
): Promise<void> {
  try {
    const statusKey = `${JR_IMAGES_REDIS_KEYS.documentStatus}:${documentId}`;
    const now = new Date().toISOString();

    // Update document-level status
    await redis.hset(statusKey, {
      [`image_${imageIndex}_status`]: status,
      [`image_${imageIndex}_timestamp`]: now,
      lastUpdated: now,
    });

    // Add metadata if provided
    if (metadata) {
      const metadataUpdate: Record<string, any> = {};
      if (metadata.originalSize) {
        metadataUpdate[`image_${imageIndex}_originalSize`] = metadata.originalSize;
      }
      if (metadata.processedSize) {
        metadataUpdate[`image_${imageIndex}_processedSize`] = metadata.processedSize;
      }
      if (metadata.error) {
        metadataUpdate[`image_${imageIndex}_error`] = metadata.error;
      }

      if (Object.keys(metadataUpdate).length > 0) {
        await redis.hset(statusKey, metadataUpdate);
      }
    }

    // Update global statistics
    const pipeline = redis.pipeline();

    switch (status) {
      case 'completed':
        pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'totalImagesProcessed', 1);
        if (metadata?.processedSize) {
          pipeline.hincrby(
            JR_IMAGES_REDIS_KEYS.stats,
            'totalBytesProcessed',
            metadata.processedSize,
          );
        }
        break;
      case 'failed':
        pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'totalImagesFailed', 1);
        break;
    }

    pipeline.hset(JR_IMAGES_REDIS_KEYS.stats, { lastUpdated: now });
    await pipeline.exec();

    // Set TTL for document status
    await redis.expire(statusKey, JR_IMAGES_CONFIG.redis.metaTTL);
  } catch (error) {
    console.error('Failed to track JR-Image progress', {
      documentId,
      imageIndex,
      status,
      error,
    });
  }
}

/**
 * Tracks JR-Images workflow-level progress
 */
export async function trackJrImageWorkflowProgress(
  workflowRunId: string,
  totalDocuments: number,
  processedDocuments: number,
  additionalData?: Record<string, any>,
): Promise<void> {
  try {
    const progressKey = `${JR_IMAGES_REDIS_KEYS.workflowProgress}:${workflowRunId}`;

    const progressData = {
      totalDocuments,
      processedDocuments,
      percentage: Math.round((processedDocuments / totalDocuments) * 100),
      lastUpdated: new Date().toISOString(),
      ...additionalData,
    };

    await redis.hset(progressKey, progressData);
    await redis.expire(progressKey, JR_IMAGES_CONFIG.redis.statsTTL);
  } catch (error) {
    console.error('Failed to track JR-Images workflow progress', {
      workflowRunId,
      error,
    });
  }
}

/**
 * Updates JR-Images batch-level statistics
 */
export async function updateJrImageBatchStats(results: JrImagesProcessingResult[]): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    const now = new Date().toISOString();

    let totalImages = 0;
    let totalBytes = 0;
    let successfulDocs = 0;
    let failedDocs = 0;
    let partialSuccessDocs = 0;

    results.forEach((result) => {
      if (result.success && result.processedImages) {
        successfulDocs++;
        result.processedImages.forEach((img) => {
          totalImages++;
          totalBytes += img.size;
        });

        if (result.partialSuccess) {
          partialSuccessDocs++;
        }
      } else {
        failedDocs++;
      }
    });

    // Update global stats
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'totalDocumentsProcessed', results.length);
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'successfulDocuments', successfulDocs);
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'failedDocuments', failedDocs);
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'partialSuccessDocuments', partialSuccessDocs);
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'totalImagesInBatch', totalImages);
    pipeline.hincrby(JR_IMAGES_REDIS_KEYS.stats, 'totalBytesInBatch', totalBytes);
    pipeline.hset(JR_IMAGES_REDIS_KEYS.stats, { lastBatchUpdate: now });

    await pipeline.exec();
  } catch (error) {
    console.error('Failed to update JR-Images batch stats', { error });
  }
}

/**
 * Gets real-time JR-Images workflow progress
 */
export async function getJrImageWorkflowProgress(workflowRunId: string): Promise<{
  totalDocuments: number;
  processedDocuments: number;
  percentage: number;
  lastUpdated: string;
} | null> {
  try {
    const progressKey = `${JR_IMAGES_REDIS_KEYS.workflowProgress}:${workflowRunId}`;
    const progress = await redis.hgetall(progressKey);

    if (!progress) return null;

    return {
      totalDocuments: Number(progress.totalDocuments || 0),
      processedDocuments: Number(progress.processedDocuments || 0),
      percentage: Number(progress.percentage || 0),
      lastUpdated: progress.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get JR-Images workflow progress', { workflowRunId, error });
    return null;
  }
}

/**
 * Updates JR-Image metadata in Redis after processing
 */
export async function updateJrImageMetadata(
  imageUrl: string,
  documentId: string,
  imageIndex: number,
  r2Key: string,
  processedImage: {
    r2Url: string;
    size: number;
    format: string;
    width: number;
    height: number;
  },
): Promise<void> {
  try {
    const metaKey = `${JR_IMAGES_REDIS_KEYS.imageMeta}:${documentId}:${imageIndex}`;

    // Get original image headers for comparison
    const headResponse = await fetch(imageUrl, { method: 'HEAD' }).catch(() => null);

    await redis.hset(metaKey, {
      originalUrl: imageUrl,
      r2Key,
      r2Url: processedImage.r2Url,
      etag: headResponse?.headers.get('etag') || '',
      size: headResponse?.headers.get('content-length') || '0',
      lastModified: headResponse?.headers.get('last-modified') || '',
      processedAt: new Date().toISOString(),
      processedSize: processedImage.size,
      format: processedImage.format,
      width: processedImage.width,
      height: processedImage.height,
    });

    await redis.expire(metaKey, JR_IMAGES_CONFIG.redis.imageTTL);
  } catch (error) {
    console.error('Failed to update JR-Image metadata', {
      documentId,
      imageIndex,
      error,
    });
  }
}

/**
 * Checks if a JR-Image has changed since last processing
 */
export async function checkJrImageChanged(
  imageUrl: string,
  documentId: string,
  imageIndex: number,
): Promise<boolean> {
  try {
    const metaKey = `${JR_IMAGES_REDIS_KEYS.imageMeta}:${documentId}:${imageIndex}`;
    const metadata = await redis.hgetall(metaKey);

    if (!metadata) return true;

    // For now, always return true to reprocess
    // In production, this would check HTTP headers against stored metadata
    return true;
  } catch (error) {
    console.error('Error checking JR-Image change', { imageUrl, documentId, imageIndex, error });
    return true;
  }
}

/**
 * Gets comprehensive JR-Images processing statistics from Redis
 */
export async function getJrImageRedisStats(): Promise<Record<string, any>> {
  try {
    const stats = await redis.hgetall(JR_IMAGES_REDIS_KEYS.stats);
    return stats || {};
  } catch (error) {
    console.error('Failed to get JR-Images Redis stats', { error });
    return {};
  }
}
