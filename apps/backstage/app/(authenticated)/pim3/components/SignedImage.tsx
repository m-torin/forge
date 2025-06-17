'use client';

import { Image, ImageProps, Skeleton } from '@mantine/core';
import { IconPhotoOff } from '@tabler/icons-react';
import { useSignedMediaUrl } from '../hooks/useSignedMediaUrl';

interface SignedImageProps extends Omit<ImageProps, 'src'> {
  storageKey?: string;
  fallbackUrl?: string;
  context?: 'product' | 'user' | 'admin' | 'public';
  showSkeleton?: boolean;
}

/**
 * Image component that automatically handles signed URLs with refresh
 * Falls back to a placeholder if no URL is available
 */
export function SignedImage({
  storageKey,
  fallbackUrl,
  context = 'product',
  showSkeleton = true,
  alt,
  ...imageProps
}: SignedImageProps) {
  const { url, loading, error } = useSignedMediaUrl(storageKey, {
    context,
    enabled: !!storageKey,
  });

  if (loading && showSkeleton) {
    return <Skeleton height={imageProps.height || imageProps.h || 200} />;
  }

  const imageSrc = url || fallbackUrl;

  if (!imageSrc || error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-gray-1)',
          borderRadius: imageProps.radius || 'var(--mantine-radius-sm)',
          height: imageProps.height || imageProps.h || 200,
          width: imageProps.width || imageProps.w || '100%',
        }}
      >
        <IconPhotoOff size={40} color="var(--mantine-color-gray-5)" />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      src={imageSrc}
      alt={alt || 'Media'}
      fallbackSrc="/placeholder.png"
    />
  );
}