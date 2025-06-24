'use server';

import { cache } from 'react';
import { getJrImageProcessingRules } from '@/workflows/jr-images/config';
import {
  FirestoreDocument,
  JrImagesProcessingResult,
  ProcessingPriority,
  JrImagesProcessingStats,
} from '@/workflows/jr-images/types';

// Mock Timestamp for development
const mockTimestamp = () => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
});

/**
 * Fetches unmapped documents from Firestore with priority categorization
 * (Mock implementation for development)
 */
export async function fetchJrImageUnmappedDocuments(
  batchSize: number = 100,
  priorityFilter?: ProcessingPriority,
): Promise<FirestoreDocument[]> {
  try {
    // Mock data for development - replace with actual Firestore query
    const mockDocuments: FirestoreDocument[] = [];

    for (let i = 0; i < Math.min(batchSize, 20); i++) {
      const priority = ['high', 'medium', 'low'][
        Math.floor(Math.random() * 3)
      ] as ProcessingPriority;

      if (priorityFilter && priority !== priorityFilter) {
        continue;
      }

      mockDocuments.push({
        id: `mock-doc-${i}`,
        wasMapped: false,
        pdpImgs: [
          `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600`,
          `https://cdn.shopify.com/s/files/product-${i}-gallery.jpg`,
          `https://example.com/images/product-${i}-thumbnail.jpg`,
        ],
        productUrl: `https://example.com/products/product-${i}`,
        productTitle: `Sample Product ${i}`,
        priority,
        imageTypes: ['hero', 'gallery', 'thumbnail'],
        scrapedAt: mockTimestamp() as any,
      });
    }

    console.log(`Mock: Fetched ${mockDocuments.length} JR-Images documents`);
    return mockDocuments;
  } catch (error) {
    console.error('Failed to fetch unmapped documents for JR-Images', { error, priorityFilter });
    throw new Error('Failed to fetch documents from Firestore');
  }
}

/**
 * Validates image URL with enhanced security checks for JR-Images
 */
export const validateJrImageUrl = cache(async (url: string) => {
  try {
    const parsed = new URL(url);

    // Security checks
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Invalid protocol', isPriority: false };
    }

    // Prevent SSRF attacks
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname.startsWith('127.') ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.')
    ) {
      return { valid: false, error: 'Private IP addresses not allowed', isPriority: false };
    }

    const rules = getJrImageProcessingRules(url);
    const isPriority = rules.priority === 'high';

    // Check for common image extensions or patterns
    const pathname = parsed.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const hasImageExtension = imageExtensions.some((ext) => pathname.endsWith(ext));

    // Some CDNs don't use extensions, so also check for image paths
    const hasImagePath =
      pathname.includes('/image') ||
      pathname.includes('/img') ||
      pathname.includes('/photo') ||
      pathname.includes('/media') ||
      pathname.includes('/upload');

    // Check for data URLs
    const isDataUrl = url.startsWith('data:image/');

    if (!hasImageExtension && !hasImagePath && !isDataUrl) {
      return { valid: false, error: 'URL does not appear to be an image', isPriority: false };
    }

    return { valid: true, isPriority };
  } catch (error) {
    console.error('JR-Images URL validation error', { url, error });
    return { valid: false, error: 'Invalid URL format', isPriority: false };
  }
});

/**
 * Updates Firestore documents after JR-Images processing with enhanced error tracking
 * (Mock implementation for development)
 */
export async function updateJrImageProcessedDocuments(
  results: JrImagesProcessingResult[],
): Promise<{ updated: number; failed: number; partialSuccess: number }> {
  let updated = 0;
  let failed = 0;
  let partialSuccess = 0;

  for (const result of results) {
    try {
      if (result.success && result.processedImages && result.processedImages.length > 0) {
        // Track partial success
        if (result.failedImages && result.failedImages.length > 0) {
          partialSuccess++;
        }
        updated++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Failed to update JR-Images document', {
        documentId: result.documentId,
        error,
      });
      failed++;
    }
  }

  console.log(
    `Mock: Updated ${updated} documents, failed ${failed}, partial success ${partialSuccess}`,
  );
  return { updated, failed, partialSuccess };
}

/**
 * Gets comprehensive JR-Images processing statistics with caching
 * (Mock implementation for development)
 */
export const getJrImageProcessingStats = cache(async (): Promise<JrImagesProcessingStats> => {
  try {
    // Mock statistics for development
    const total = 1000;
    const mapped = 650;
    const failed = 50;
    const partial = 30;

    return {
      totalDocuments: total,
      mappedDocuments: mapped,
      unmappedDocuments: total - mapped,
      failedDocuments: failed,
      partialSuccessDocuments: partial,
      totalImagesProcessed: mapped * 3, // Assume 3 images per document
      totalBytesProcessed: mapped * 3 * 500000, // Assume 500KB per processed image
      averageCompressionRatio: 0.6, // Approximate for WebP
      processingTimeMs: 3600000, // 1 hour
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get JR-Images processing statistics', { error });
    throw new Error('Failed to retrieve JR-Images processing statistics');
  }
});

/**
 * Checks if an image should be skipped based on metadata comparison
 */
export async function shouldSkipJrImage(
  _imageUrl: string,
  _documentId: string,
  _imageIndex: number,
): Promise<boolean> {
  try {
    // For now, always process images - in production would check Redis metadata
    // const metaKey = `${JR_IMAGES_REDIS_KEYS.imageMeta}:${documentId}:${imageIndex}`;
    // const storedMeta = await redis.hgetall(metaKey);
    // ... implement metadata comparison logic
    return false;
  } catch {
    return false;
  }
}
