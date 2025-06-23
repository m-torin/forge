'use server';

import { logger } from '@/lib/logger';
import { getMediaSignedUrlAction, bulkRefreshMediaUrlsAction } from '@repo/storage/server/next';
import { prisma } from '@repo/database/prisma/server/next';

interface MediaWithSignedUrl {
  id: string;
  url: string;
  signedUrl: string;
  altText?: string | null;
  type: string;
  width?: number | null;
  height?: number | null;
}

/**
 * Get a single media record with its signed URL
 */
export async function getMediaWithSignedUrl(mediaId: string): Promise<MediaWithSignedUrl | null> {
  try {
    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
        deletedAt: null,
      },
      select: {
        id: true,
        url: true,
        altText: true,
        type: true,
        width: true,
        height: true,
        productId: true,
      },
    });

    if (!media) {
      return null;
    }

    // Get signed URL for product photos
    const signedUrlResult = await getMediaSignedUrlAction(media.id, {
      expiresIn: 3600, // 1 hour for customer views
    });

    const signedUrl = signedUrlResult.success ? signedUrlResult.data : media.url;

    return {
      ...media,
      signedUrl: signedUrl || media.url,
    };
  } catch (_error) {
    logger.error('Failed to get media with signed URL', _error);
    return null;
  }
}

/**
 * Get multiple media records with signed URLs (for galleries)
 */
export async function getMediaListWithSignedUrls(
  mediaIds: string[],
): Promise<MediaWithSignedUrl[]> {
  try {
    if (mediaIds.length === 0) return [];

    const mediaRecords = await prisma.media.findMany({
      where: {
        id: { in: mediaIds },
        deletedAt: null,
      },
      select: {
        id: true,
        url: true,
        altText: true,
        type: true,
        width: true,
        height: true,
        sortOrder: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    if (mediaRecords.length === 0) return [];

    // Bulk refresh URLs
    const signedUrlsResult = await bulkRefreshMediaUrlsAction(
      mediaRecords.map((m) => m.id),
      { expiresIn: 3600 },
    );

    const signedUrls = signedUrlsResult.success ? signedUrlsResult.data : undefined;

    return mediaRecords.map((media) => ({
      ...media,
      signedUrl: (signedUrls && signedUrls[media.id]) || media.url,
    }));
  } catch (_error) {
    logger.error('Failed to get media list with signed URLs', _error);
    return [];
  }
}

/**
 * Get product media with signed URLs
 */
export async function getProductMediaWithSignedUrls(
  productId: string,
): Promise<MediaWithSignedUrl[]> {
  try {
    const mediaRecords = await prisma.media.findMany({
      where: {
        productId,
        deletedAt: null,
        type: 'IMAGE',
      },
      select: {
        id: true,
        url: true,
        altText: true,
        type: true,
        width: true,
        height: true,
        sortOrder: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    if (mediaRecords.length === 0) return [];

    // Bulk refresh URLs for all product media
    const signedUrlsResult = await bulkRefreshMediaUrlsAction(
      mediaRecords.map((m) => m.id),
      { expiresIn: 3600 },
    );

    const signedUrls = signedUrlsResult.success ? signedUrlsResult.data : undefined;

    return mediaRecords.map((media) => ({
      ...media,
      signedUrl: (signedUrls && signedUrls[media.id]) || media.url,
    }));
  } catch (_error) {
    logger.error('Failed to get product media with signed URLs', _error);
    return [];
  }
}
