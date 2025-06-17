import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TCollection as Collection } from '@/types';

interface CollectionCard1Props {
  className?: string;
  collection: Collection;
  size?: 'large' | 'normal';
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CollectionCard1
function CollectionCard1Skeleton({
  className,
  size,
}: {
  className?: string;
  size?: 'large' | 'normal';
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={clsx(
          'relative mr-4 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse',
          size === 'large' ? 'size-20' : 'size-12',
        )}
      />
      <div>
        <div
          className={clsx(
            'bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1',
            size === 'large' ? 'h-5 w-32' : 'h-4 w-24',
          )}
        />
        <div
          className={clsx(
            'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
            size === 'large' ? 'h-4 w-20' : 'h-3 w-16',
          )}
        />
      </div>
    </div>
  );
}

// Error state for CollectionCard1
function CollectionCard1Error({ className, error }: { className?: string; error: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative mr-4 shrink-0 size-12 overflow-hidden rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <div>
        <h2 className="nc-card-title font-semibold text-red-600 dark:text-red-400 text-base">
          Collection Error
        </h2>
        <span className="text-xs mt-[2px] block text-red-500 dark:text-red-400">
          Failed to load collection
        </span>
      </div>
    </div>
  );
}

// Zero state for CollectionCard1
function CollectionCard1Empty({
  className,
  size,
}: {
  className?: string;
  size?: 'large' | 'normal';
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={clsx(
          'relative mr-4 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center',
          size === 'large' ? 'size-20' : 'size-12',
        )}
      >
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <div>
        <h2
          className={clsx(
            'nc-card-title font-semibold text-gray-400 dark:text-gray-600',
            size === 'large' ? 'text-lg' : 'text-base',
          )}
        >
          No Collection
        </h2>
        <span
          className={`${
            size === 'large' ? 'text-sm' : 'text-xs'
          } mt-[2px] block text-gray-400 dark:text-gray-600`}
        >
          Collection not available
        </span>
      </div>
    </div>
  );
}

const CollectionCard1: FC<CollectionCard1Props> = ({
  className = '',
  collection,
  size = 'normal',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <CollectionCard1Skeleton className={className} size={size} />;
  }

  // Show error state
  if (error) {
    return <CollectionCard1Error className={className} error={error} />;
  }

  // Show zero state when no collection or no handle
  if (!collection || !collection.handle) {
    return <CollectionCard1Empty className={className} size={size} />;
  }

  return (
    <Link href={`/collections/${collection.handle}`} className={`flex items-center ${className}`}>
      {collection.image && (
        <div
          className={clsx(
            'relative mr-4 shrink-0 overflow-hidden rounded-lg',
            size === 'large' ? 'size-20' : 'size-12',
          )}
        >
          <Image
            alt={collection.image.altText || collection.title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            src={collection.image.url || collection.image.src}
            className="object-cover"
          />
        </div>
      )}
      <div>
        <h2
          className={clsx(
            'nc-card-title font-semibold text-neutral-900 dark:text-neutral-100',
            size === 'large' ? 'text-lg' : 'text-base',
          )}
        >
          {collection.title}
        </h2>
        <span
          className={`${
            size === 'large' ? 'text-sm' : 'text-xs'
          } mt-[2px] block text-neutral-500 dark:text-neutral-400`}
        >
          {collection.description || `${collection.products?.length || 0} products`}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard1;
