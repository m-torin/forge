import { createHash } from 'crypto';
import { ProcessingRules } from '@/workflows/jr-images/types';

// Parse the JR_IMAGES_CONFIG from environment variable
const parseJrImagesConfig = () => {
  try {
    const configString = process.env.JR_IMAGES_CONFIG;
    if (!configString) {
      throw new Error('JR_IMAGES_CONFIG environment variable is required');
    }
    return JSON.parse(configString);
  } catch (error) {
    console.error('Failed to parse JR_IMAGES_CONFIG:', error);
    // Fallback configuration
    return {
      defaultBatchSize: 100,
      imagesPerDocument: 20,
      maxConcurrentImages: 8,
      maxChildWorkflows: 10,
      compression: {
        quality: 85,
        maxWidth: 1600,
        maxHeight: 1600,
        format: 'webp',
      },
      processingRules: {
        'cdn.shopify.com': {
          priority: 'high',
          maxWidth: 2000,
          maxHeight: 2000,
          quality: 90,
          timeout: 45000,
        },
        'images.unsplash.com': {
          priority: 'medium',
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 85,
          timeout: 30000,
        },
        default: {
          priority: 'low',
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 75,
          timeout: 20000,
        },
      },
      redis: {
        imageTTL: 7776000,
        metaTTL: 2592000,
        statsTTL: 604800,
      },
      imageDownloadDelay: 100,
      batchDelay: '1s',
      priorityBatchDelay: '500ms',
      maxImageSize: 52428800,
      downloadTimeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      workflowTimeout: '30m',
      childWorkflowTimeout: '15m',
      progressReportInterval: 10,
    };
  }
};

export const JR_IMAGES_CONFIG = parseJrImagesConfig();

// Add computed Redis keys based on prefix
export const JR_IMAGES_REDIS_KEYS = {
  processingQueue: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:queue`
    : 'jr-images:processing:queue',
  processedImages: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:processed`
    : 'jr-images:processed',
  failedImages: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:failed`
    : 'jr-images:failed',
  documentStatus: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:document:status`
    : 'jr-images:document:status',
  imageMeta: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:meta`
    : 'jr-images:meta',
  stats: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:stats`
    : 'jr-images:stats',
  workflowProgress: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:jr-images:progress`
    : 'jr-images:progress',
} as const;

/**
 * Generates a consistent URL key for storage
 */
export function generateJrImageUrlKey(url: string): string {
  return createHash('sha256').update(url).digest('base64url');
}

/**
 * Cleans URL by removing query parameters and fragments
 */
export function cleanJrImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    // Normalize trailing slashes
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Gets processing rules based on image source domain
 */
export function getJrImageProcessingRules(imageUrl: string): ProcessingRules {
  try {
    const domain = new URL(imageUrl).hostname;
    return JR_IMAGES_CONFIG.processingRules[domain] || JR_IMAGES_CONFIG.processingRules.default;
  } catch {
    return JR_IMAGES_CONFIG.processingRules.default;
  }
}

/**
 * Generates R2 key for an image with date-based organization
 */
export function generateJrImageR2Key(
  documentId: string,
  imageIndex: number,
  originalUrl: string,
  priority: 'high' | 'medium' | 'low' = 'low',
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Always use webp for processed images
  const extension = 'webp';

  // Create organized path with priority: priority/year/month/day/documentId/index.extension
  return `jr-images/${priority}/${year}/${month}/${day}/${documentId}/${imageIndex}.${extension}`;
}
