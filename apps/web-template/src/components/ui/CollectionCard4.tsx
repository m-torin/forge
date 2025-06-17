import { IconArrowUpRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TCollection as Collection } from '@/types';

interface CollectionCard4Props {
  bgSvgUrl?: string;
  className?: string;
  collection: Collection;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for CollectionCard4 (Tailwind-only)
function CollectionCard4Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 p-5 sm:p-8 animate-pulse',
        className,
      )}
      data-testid={testId}
    >
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between gap-x-2.5">
          <div className="relative size-20 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        <div className="mt-12">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4" />
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full" />
        </div>
        <div className="mt-10 sm:mt-20">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// Error state for CollectionCard4 (Tailwind-only)
function CollectionCard4Error({
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
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 sm:p-8',
        className,
      )}
      data-testid={testId}
    >
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
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
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Error loading collection
            </h2>
            <p className="text-sm text-red-500 dark:text-red-400">
              This collection could not be loaded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Zero state for CollectionCard4 (Tailwind-only)
function CollectionCard4Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 p-5 sm:p-8',
        className,
      )}
      data-testid={testId}
    >
      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
            <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
              No collection available
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Collection will appear here when available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CollectionCard4: FC<CollectionCard4Props> = ({
  bgSvgUrl,
  className,
  collection,
  'data-testid': testId = 'collection-card-4',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <CollectionCard4Skeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <CollectionCard4Error error={error} className={className} testId={testId} />;
  }

  // Show zero state when no collection or handle
  if (!collection || !collection.handle) {
    return <CollectionCard4Empty className={className} testId={testId} />;
  }

  // Get background color from collection metadata or use default
  const bgColor =
    collection.metafields?.find((m) => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-white p-5 transition-shadow hover:shadow-lg sm:p-8 dark:bg-neutral-900',
        className,
      )}
      data-testid={testId}
    >
      {bgSvgUrl && (
        <div className="absolute bottom-0 end-0 size-52 sm:size-64 xl:size-72">
          <Image
            className="object-bottom-right object-contain opacity-60"
            alt="background decoration"
            fill
            src={bgSvgUrl}
          />
        </div>
      )}

      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between gap-x-2.5">
          {collection.image && (
            <div className={clsx('relative size-20 overflow-hidden rounded-full', bgColor)}>
              <div className="absolute inset-4">
                <Image
                  className="object-cover"
                  alt={collection.image.altText || collection.title}
                  fill
                  sizes="80px"
                  src={collection.image.url || collection.image.src}
                />
              </div>
            </div>
          )}
          <IconArrowUpRight
            size={24}
            className="text-neutral-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110"
          />
        </div>

        <div className="mt-12">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{collection.description}</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{collection.title}</h2>
        </div>

        <p className="mt-10 text-sm text-neutral-500 sm:mt-20 dark:text-neutral-400">
          {collection.products?.length || 0} products
        </p>

        <Link href={`/collections/${collection.handle}`} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default CollectionCard4;
