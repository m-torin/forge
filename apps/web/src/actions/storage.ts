'use server';

import { logger } from '@/lib/logger';
import {
  getMediaUrlAction,
  getMediaSignedUrlAction,
  bulkRefreshMediaUrlsAction,
} from '@repo/storage/server/next';
import { prisma } from '@repo/database/prisma/server/next';

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get a signed URL for a media record by ID
 * Used by SignedProductImage component when mediaId is provided
 */
export async function getSignedMediaUrl(mediaId: string): Promise<ActionResponse<string>> {
  try {
    // First check if media exists
    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
        deletedAt: null,
      },
      select: {
        id: true,
        url: true,
        productId: true,
      },
    });

    if (!media) {
      return {
        success: false,
        error: 'Media not found',
      };
    }

    // Get signed URL for product photos (1 hour expiration for customers)
    const result = await getMediaSignedUrlAction(media.id, {
      expiresIn: 3600,
    });

    return result;
  } catch (_error) {
    logger.error('Failed to get signed media URL', _error);
    return {
      success: false,
      error: _error instanceof Error ? (_error as Error).message : 'Failed to get signed URL',
    };
  }
}

/**
 * Get a signed URL directly from storage key
 * Used by SignedProductImage when storageKey is provided
 */
export async function getSignedStorageUrl(
  storageKey: string,
  options?: {
    context?: 'product' | 'user' | 'admin' | 'public';
    expiresIn?: number;
  },
): Promise<ActionResponse<string>> {
  try {
    // Use the storage action directly
    const result = await getMediaUrlAction(storageKey, {
      context: options?.context || 'product',
      expiresIn: options?.expiresIn || 3600,
      forceSign: true, // Always sign for security
    });

    return result;
  } catch (_error) {
    logger.error('Failed to get signed storage URL', _error);
    return {
      success: false,
      error: _error instanceof Error ? (_error as Error).message : 'Failed to get signed URL',
    };
  }
}

/**
 * Bulk refresh media URLs for galleries
 * Used by SignedListingImageGallery for efficient bulk operations
 */
export async function bulkRefreshMediaUrls(
  mediaIds: string[],
): Promise<ActionResponse<Record<string, string>>> {
  try {
    if (mediaIds.length === 0) {
      return { success: true, data: {} };
    }

    // Verify all media records exist
    const mediaRecords = await prisma.media.findMany({
      where: {
        id: { in: mediaIds },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    const validIds = mediaRecords.map((m) => m.id);

    if (validIds.length === 0) {
      return { success: true, data: {} };
    }

    // Bulk refresh with 1-hour expiration for customer views
    const result = await bulkRefreshMediaUrlsAction(validIds, {
      expiresIn: 3600,
    });

    return result;
  } catch (_error) {
    logger.error('Failed to bulk refresh media URLs', _error);
    return {
      success: false,
      error: _error instanceof Error ? (_error as Error).message : 'Failed to refresh URLs',
    };
  }
}
