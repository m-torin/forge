'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// Import removed - will use server action instead

interface SignedProductImageProps extends Omit<ImageProps, 'src'> {
  mediaId?: string; // Media record ID from database
  fallbackSrc?: string; // Fallback URL if signed URL fails
  storageKey?: string; // Direct storage key (alternative to mediaId)
  refreshInterval?: number; // How often to refresh the URL (in ms)
}

/**
 * Product image component that automatically handles signed URLs with refresh
 * Designed for customer-facing product pages
 */
function SignedProductImageInner({
  mediaId,
  fallbackSrc = '/placeholder.png',
  storageKey,
  refreshInterval = 3300000, // Default: 55 minutes (before 1-hour expiration)
  alt,
  ...imageProps
}: SignedProductImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let refreshTimer: NodeJS.Timeout;

    const loadSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        let url: string | null = null;

        if (mediaId) {
          // Get signed URL from media record
          const { getSignedMediaUrl } = await import('@/actions/storage');
          const result = await getSignedMediaUrl(mediaId);

          if (result.success && result.data) {
            url = result.data;
          } else {
            throw new Error(result.error || 'Failed to get signed URL');
          }
        } else if (storageKey) {
          // Get signed URL directly from storage key
          const { getSignedStorageUrl } = await import('@/actions/storage');
          const result = await getSignedStorageUrl(storageKey, {
            context: 'product',
            expiresIn: 3600, // 1 hour for customer views
          });

          if (result.success && result.data) {
            url = result.data;
          } else {
            throw new Error(result.error || 'Failed to get signed URL');
          }
        }

        if (mounted && url) {
          setSrc(url);
        }
      } catch (err) {
        console.error('Failed to load signed URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
        if (mounted) {
          setSrc(fallbackSrc);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadSignedUrl();

    // Set up refresh interval
    if (refreshInterval > 0 && (mediaId || storageKey)) {
      refreshTimer = setInterval(() => {
        loadSignedUrl();
      }, refreshInterval);
    }

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [mediaId, storageKey, fallbackSrc, refreshInterval]);

  // Show skeleton while loading
  if (loading && !src) {
    return (
      <div
        className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"
        style={{
          width: imageProps.width || '100%',
          height: imageProps.height || 'auto',
          aspectRatio:
            imageProps.width && imageProps.height
              ? `${imageProps.width}/${imageProps.height}`
              : undefined,
        }}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt || 'Product image'}
      onError={() => {
        // Fallback to placeholder on error
        setSrc(fallbackSrc);
      }}
    />
  );
}

export function SignedProductImage(props: SignedProductImageProps) {
  return (
    <ErrorBoundary
      fallback={
        <div
          className="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
          style={{
            width: props.width || '100%',
            height: props.height || 'auto',
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined,
          }}
        >
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      }
    >
      <SignedProductImageInner {...props} />
    </ErrorBoundary>
  );
}
