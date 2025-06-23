'use client';

import { type TCollection } from './types';
import Link from 'next/link';
import { Skeleton } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Props {
  collection: TCollection;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for CollectionCard3
function CollectionCard3Skeleton({ testId }: { testId?: string }) {
  return (
    <div className="relative block group" data-testid={testId}>
      <div>
        <Skeleton height={0} className="aspect-[4/3] rounded-lg" />
        <div className="mt-4">
          <Skeleton height={20} width="70%" mb="xs" />
          <Skeleton height={16} width="90%" mb="xs" />
          <Skeleton height={14} width="40%" />
        </div>
      </div>
    </div>
  );
}

// Error state for CollectionCard3
function CollectionCard3Error({ error, testId }: { error: string; testId?: string }) {
  return (
    <div className="relative block group" data-testid={testId}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
        <div className="text-center p-4">
          <IconAlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">Collection failed to load</p>
        </div>
      </div>
    </div>
  );
}

// Zero state for CollectionCard3
function CollectionCard3Empty({ testId }: { testId?: string }) {
  return (
    <div className="relative block group" data-testid={testId}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">No collection available</p>
        </div>
      </div>
    </div>
  );
}

const CollectionCard3 = ({
  collection,
  loading = false,
  error,
  'data-testid': testId = 'collection-card-3',
}: Props) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CollectionCard3Skeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CollectionCard3Error error={currentError} testId={testId} />;
  }

  // Show zero state when no collection
  if (!collection) {
    return <CollectionCard3Empty testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={<CollectionCard3Error error="Collection card failed to render" testId={testId} />}
    >
      <div className="relative block group" data-testid={testId}>
        <Link href={`/collections/${collection.handle}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <IconAlertTriangle size={24} />
                </div>
              }
            >
              {collection.image ? (
                <img
                  alt={collection.image.alt || collection.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  height={collection.image.height}
                  src={collection.image.src}
                  width={collection.image.width}
                  onError={() => setInternalError('Image failed to load')}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">
                  No Image
                </div>
              )}
            </ErrorBoundary>
          </div>
          <ErrorBoundary
            fallback={<div className="mt-4 text-red-500 text-sm">Content unavailable</div>}
          >
            <div className="mt-4">
              <h3 className="text-base font-medium text-neutral-900 dark:text-white group-hover:text-primary-600">
                {collection.title}
              </h3>
              {collection.description && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {collection.description}
                </p>
              )}
              {collection.count && (
                <p className="mt-1 text-xs text-neutral-500">
                  {collection.count} {collection.count === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </ErrorBoundary>
        </Link>
      </div>
    </ErrorBoundary>
  );
};

export default CollectionCard3;
