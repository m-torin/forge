import Image, { type ImageProps } from 'next/image';
import React, { type FC } from 'react';

export interface NcImageProps extends Omit<ImageProps, 'alt' | 'loading'> {
  alt?: string;
  containerClassName?: string;
  loading?: ImageProps['loading'] | boolean;
  error?: string;
}

// Loading skeleton for NcImage
function NcImageSkeleton({
  containerClassName,
  className,
}: {
  containerClassName?: string;
  className?: string;
}) {
  return (
    <div className={containerClassName}>
      <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    </div>
  );
}

// Error state for NcImage
function NcImageError({
  containerClassName,
  className,
  alt,
}: {
  containerClassName?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div className={containerClassName}>
      <div
        className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center ${className}`}
      >
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs text-gray-500 dark:text-gray-500 text-center px-2">
          {alt ? `Failed to load: ${alt}` : 'Image failed to load'}
        </span>
      </div>
    </div>
  );
}

const NcImage: FC<NcImageProps> = ({
  alt = 'nc-image',
  className = 'object-cover w-full h-full',
  containerClassName = '',
  loading,
  error,
  ...args
}) => {
  // Show loading state
  if (loading === true) {
    return <NcImageSkeleton containerClassName={containerClassName} className={className} />;
  }

  // Show error state
  if (error) {
    return <NcImageError containerClassName={containerClassName} className={className} alt={alt} />;
  }

  return (
    <div className={containerClassName}>
      <Image
        alt={alt}
        className={className}
        loading={typeof loading === 'string' ? loading : undefined}
        onError={() => {
          // Note: In server components, we can't set state for error handling
          // Error handling would need to be managed by parent components
          console.error('Image failed to load:', args.src);
        }}
        {...args}
      />
    </div>
  );
};

export default NcImage;
