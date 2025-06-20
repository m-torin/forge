'use client';

import { Image, ImageProps, Skeleton } from '@mantine/core';
import { IconPhotoOff } from '@tabler/icons-react';
import { useSignedMediaUrl } from '@/hooks/pim3/useSignedMediaUrl';

interface SignedImageProps extends Omit<ImageProps, 'src'> {
  storageKey?: string;
  fallbackUrl?: string;
  context?: 'product' | 'user' | 'admin' | 'public';
  showSkeleton?: boolean;
  alt?: string;
  height?: number | string;
  h?: number | string;
  width?: number | string;
  w?: number | string;
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
  height,
  h,
  width,
  w,
  ...imageProps
}: SignedImageProps) {
  const { url, loading, error } = useSignedMediaUrl(storageKey, {
    context,
    enabled: !!storageKey,
  });

  if (loading && showSkeleton) {
    return <Skeleton height={height || h || 200} />;
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
          height: height || h || 200,
          width: width || w || '100%',
        }}
      >
        <IconPhotoOff size={40} color="var(--mantine-color-gray-5)" />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      height={height}
      h={h}
      width={width}
      w={w}
      src={imageSrc}
      alt={alt || 'Media'}
      fallbackSrc="/placeholder.png"
    />
  );
}
