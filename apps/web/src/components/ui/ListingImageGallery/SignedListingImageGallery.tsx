'use client';

import { useEffect, useState } from 'react';
import { ListingImageGallery } from './ListingImageGallery';
import { logger } from '@/lib/logger';
// Import removed - will use server action instead

export interface SignedListingGalleryImage {
  id: number;
  mediaId?: string; // Media record ID from database
  storageKey?: string; // Direct storage key
  fallbackUrl?: string; // Fallback URL
}

interface SignedListingImageGalleryProps {
  images: SignedListingGalleryImage[];
  onClose?: () => void;
  testId?: string;
  refreshInterval?: number; // How often to refresh URLs (in ms)
}

/**
 * Enhanced ListingImageGallery that handles signed URLs with automatic refresh
 */
export function SignedListingImageGallery({
  images: signedImages,
  onClose,
  testId,
  refreshInterval = 3300000, // Default: 55 minutes
}: SignedListingImageGalleryProps) {
  const [images, setImages] = useState<Array<{ id: number; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    let refreshTimer: NodeJS.Timeout;

    const loadSignedUrls = async () => {
      try {
        setLoading(true);
        setError(undefined);

        // Get media IDs that need signed URLs
        const mediaIds = signedImages.filter((img) => img.mediaId).map((img) => img.mediaId!);

        let signedUrls: Record<string, string> = {};

        if (mediaIds.length > 0) {
          // Bulk refresh media URLs
          const { bulkRefreshMediaUrls } = await import('@/actions/storage');
          const result = await bulkRefreshMediaUrls(mediaIds);

          if (result.success && result.data) {
            signedUrls = result.data;
          } else {
            logger.error('Failed to refresh some URLs', result.error);
          }
        }

        // For images with storage keys, get signed URLs individually
        const storageKeyImages = signedImages.filter((img) => img.storageKey && !img.mediaId);

        if (storageKeyImages.length > 0) {
          const { getSignedStorageUrl } = await import('@/actions/storage');

          await Promise.all(
            storageKeyImages.map(async (img) => {
              try {
                const result = await getSignedStorageUrl(img.storageKey!, {
                  context: 'product',
                  expiresIn: 3600,
                });

                if (result.success && result.data) {
                  signedUrls[img.storageKey!] = result.data;
                }
              } catch (err) {
                logger.error(`Failed to get signed URL for ${img.storageKey}`, err);
              }
            }),
          );
        }

        // Map signed images to gallery format
        const galleryImages = signedImages.map((img) => {
          let url = img.fallbackUrl || '/placeholder.png';

          if (img.mediaId && signedUrls[img.mediaId]) {
            url = signedUrls[img.mediaId];
          } else if (img.storageKey && signedUrls[img.storageKey]) {
            url = signedUrls[img.storageKey];
          }

          return {
            id: img.id,
            url,
          };
        });

        if (mounted) {
          setImages(galleryImages);
        }
      } catch (err) {
        logger.error('Failed to load signed URLs', err);
        if (mounted) {
          setError('Failed to load images');
          // Use fallback URLs
          setImages(
            signedImages.map((img) => ({
              id: img.id,
              url: img.fallbackUrl || '/placeholder.png',
            })),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadSignedUrls();

    // Set up refresh interval
    if (refreshInterval > 0 && signedImages.some((img) => img.mediaId || img.storageKey)) {
      refreshTimer = setInterval(() => {
        loadSignedUrls();
      }, refreshInterval);
    }

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [signedImages, refreshInterval]);

  return (
    <ListingImageGallery
      images={images}
      onClose={onClose}
      testId={testId}
      loading={loading}
      error={error}
    />
  );
}
