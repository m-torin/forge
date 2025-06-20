import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TCollection as Collection } from '@/types';

interface CollectionCard2Props {
  className?: string;
  collection: Collection;
  ratioClass?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CollectionCard2 (Tailwind-only)
function CollectionCard2Skeleton({
  className,
  ratioClass,
  testId,
}: {
  className?: string;
  ratioClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'block')} data-testid={testId}>
      <div
        className={clsx(
          'group relative w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse',
          ratioClass,
        )}
      />
      <div className="mt-5 flex-1 text-center">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mx-auto" />
      </div>
    </div>
  );
}

// Error state for CollectionCard2 (Tailwind-only)
function CollectionCard2Error({
  error,
  className,
  ratioClass,
  testId,
}: {
  error: string;
  className?: string;
  ratioClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'block')} data-testid={testId}>
      <div
        className={clsx(
          'group relative w-full overflow-hidden rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center',
          ratioClass,
        )}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-red-500 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm text-red-600 dark:text-red-400">Failed to load</span>
        </div>
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 sm:text-lg">
          Error loading collection
        </h2>
        <span className="mt-0.5 block text-sm text-red-500 sm:mt-1.5 dark:text-red-400">
          This collection could not be loaded
        </span>
      </div>
    </div>
  );
}

// Zero state for CollectionCard2 (Tailwind-only)
function CollectionCard2Empty({
  className,
  ratioClass,
  testId,
}: {
  className?: string;
  ratioClass?: string;
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'block')} data-testid={testId}>
      <div
        className={clsx(
          'group relative w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center',
          ratioClass,
        )}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
          <span className="text-sm text-gray-500">No collection</span>
        </div>
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 sm:text-lg">
          No collection available
        </h2>
        <span className="mt-0.5 block text-sm text-gray-400 sm:mt-1.5 dark:text-gray-500">
          Collection will appear here when available
        </span>
      </div>
    </div>
  );
}

const CollectionCard2: FC<CollectionCard2Props> = ({
  className,
  collection,
  ratioClass = 'aspect-square',
  'data-testid': testId = 'collection-card-2',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return (
      <CollectionCard2Skeleton className={className} ratioClass={ratioClass} testId={testId} />
    );
  }

  // Show error state
  if (error) {
    return (
      <CollectionCard2Error
        error={error}
        className={className}
        ratioClass={ratioClass}
        testId={testId}
      />
    );
  }

  // Show zero state when no collection or handle
  if (!collection || !collection.handle) {
    return <CollectionCard2Empty className={className} ratioClass={ratioClass} testId={testId} />;
  }

  // Get background color from collection metadata or use default
  const bgColor =
    collection.metafields?.find((m) => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className={clsx(className, 'block')}
      data-testid={testId}
    >
      <div
        className={clsx('group relative w-full overflow-hidden rounded-2xl', ratioClass, bgColor)}
      >
        {collection.image && (
          <div className="absolute inset-5 xl:inset-14">
            <Image
              className="rounded-2xl object-cover object-center"
              alt={collection.image.altText || collection.title}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              src={collection.image.url || collection.image.src}
            />
          </div>
        )}
        <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
          {collection.title}
        </h2>
        <span className="mt-0.5 block text-sm text-neutral-500 sm:mt-1.5 dark:text-neutral-400">
          {collection.description || `${collection.products?.length || 0} products`}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard2;
