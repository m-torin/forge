import { IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TCollection as Collection } from '@/types';

interface CollectionCard6Props {
  bgSvgUrl?: string;
  className?: string;
  collection: Collection;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CollectionCard6 (Tailwind-only)
function CollectionCard6Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      data-testid={testId}
    >
      <div className="absolute inset-5 flex flex-col items-center justify-between">
        <div className="flex items-center justify-center">
          <div className="size-20 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="text-center">
          <div className="mb-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto" />
        </div>
        <div className="flex items-center">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
          <div className="ml-2.5 h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  );
}

// Error state for CollectionCard6 (Tailwind-only)
function CollectionCard6Error({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}
      data-testid={testId}
    >
      <div className="absolute inset-5 flex flex-col items-center justify-center text-center">
        <svg
          className="w-12 h-12 text-red-500 mb-4"
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
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error loading collection
        </h2>
        <span className="text-sm text-red-500 dark:text-red-400">
          This collection could not be loaded
        </span>
      </div>
    </div>
  );
}

// Zero state for CollectionCard6 (Tailwind-only)
function CollectionCard6Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
      data-testid={testId}
    >
      <div className="absolute inset-5 flex flex-col items-center justify-center text-center">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
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
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
          No collection available
        </h2>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Collection will appear here when available
        </span>
      </div>
    </div>
  );
}

const CollectionCard6: FC<CollectionCard6Props> = ({
  bgSvgUrl,
  className = '',
  collection,
  'data-testid': testId = 'collection-card-6',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <CollectionCard6Skeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <CollectionCard6Error error={error} className={className} testId={testId} />;
  }

  // Show zero state when no collection or handle
  if (!collection || !collection.handle) {
    return <CollectionCard6Empty className={className} testId={testId} />;
  }

  // Get background color from collection metadata or use default
  const bgColor =
    collection.metafields?.find((m) => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-white transition-shadow hover:shadow-lg dark:bg-neutral-900 ${className}`}
      data-testid={testId}
    >
      <div>
        <div className="absolute inset-0 opacity-10">
          {bgSvgUrl && <Image alt="background decoration" fill src={bgSvgUrl} />}
        </div>

        <div className="absolute inset-5 flex flex-col items-center justify-between">
          <div className="flex items-center justify-center">
            {collection.image && (
              <div className={`size-20 rounded-full relative overflow-hidden z-0 ${bgColor}`}>
                <Image
                  alt={collection.image.altText || collection.title}
                  fill
                  src={collection.image.url || collection.image.src}
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">
              {collection.description}
            </span>
            <h2 className="text-lg font-semibold sm:text-xl">{collection.title}</h2>
          </div>

          <Link
            href={`/collections/${collection.handle}`}
            className="group-hover:text-primary-500 flex items-center text-sm font-medium transition-colors"
          >
            <span>See Collection</span>
            <IconArrowRight className="ml-2.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard6;
