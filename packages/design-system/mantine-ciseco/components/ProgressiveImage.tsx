'use client';

import { useIntersection, useViewportSize } from '@mantine/hooks';
import clsx from 'clsx';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface ProgressiveImageProps extends Omit<ImageProps, 'src'> {
  blurDataURL?: string;
  placeholder?: string;
  rootMargin?: string;
  src: string | { small: string; medium: string; large: string };
  threshold?: number;
}

export function ProgressiveImage({
  alt,
  blurDataURL,
  className,
  placeholder,
  rootMargin = '50px',
  src,
  threshold = 0.1,
  ...props
}: ProgressiveImageProps) {
  const { entry, ref } = useIntersection({
    rootMargin,
    threshold,
  });

  const { width: viewportWidth } = useViewportSize();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isVisible = entry?.isIntersecting;

  // Get responsive image src
  const getImageSrc = () => {
    if (typeof src === 'string') return src;

    if (viewportWidth < 640) return src.small;
    if (viewportWidth < 1024) return src.medium;
    return src.large;
  };

  const imageSrc = getImageSrc();

  return (
    <div ref={ref} className={clsx('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {(placeholder || blurDataURL) && !imageLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Main image - only loads when visible */}
      {isVisible && !hasError && (
        <Image
          {...props}
          onError={() => setHasError(true)}
          onLoad={() => setImageLoaded(true)}
          className={clsx(
            'transition-opacity duration-700',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            props.fill && 'object-cover',
          )}
          alt={alt}
          src={imageSrc}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="text-center">
            <svg
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="mx-auto h-12 w-12 text-neutral-400"
              fill="none"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-neutral-500">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Gallery component with scroll-based loading
export function ProgressiveImageGallery({
  className,
  images,
}: {
  images: string[];
  className?: string;
}) {
  const [loadedIndexes, setLoadedIndexes] = useState(new Set([0, 1])); // Load first 2 immediately

  return (
    <div className={clsx('grid gap-4', className)}>
      {images.map((image, index) => (
        <ProgressiveImage
          key={index}
          width={800}
          onLoad={() => {
            setLoadedIndexes((prev) => new Set(prev).add(index));
          }}
          priority={index < 2}
          rootMargin={index < 4 ? '100px' : '200px'} // Load nearby images sooner
          alt={`Gallery image ${index + 1}`}
          height={800}
          src={image}
        />
      ))}
    </div>
  );
}
