'use client';

import { logger } from '@/lib/logger';
import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { useEffect, useState } from 'react';
import { Alert, Text, Skeleton } from '@mantine/core';
import { IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

import { TProductItem } from '@/types';

interface CollectionStyle2UiProps {
  isLoading?: boolean;
  products: TProductItem[];
  error?: string;
  'data-testid'?: string;
}

// Error state for CollectionStyle2Ui
function CollectionStyle2UiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Unable to load collection"
      color="red"
      variant="light"
      data-testid={testId}
      className="flex-1"
    >
      <Text size="sm">{error || 'Failed to load collection products'}</Text>
    </Alert>
  );
}

// Custom skeleton that matches the collection page layout
function CollectionSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
      data-testid={`${testId}-skeleton`}
    >
      {[...Array(7)].map((_, i) => (
        <div key={`collection-skeleton-${i}`} className="group relative">
          <Skeleton height={320} radius="lg" />
          <div className="mt-4 space-y-3">
            <Skeleton height={12} width={60} />
            <Skeleton height={20} width="75%" />
            <Skeleton height={24} width={80} />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} height={16} width={16} radius="sm" />
              ))}
              <Skeleton height={12} width={32} ml={8} />
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <Skeleton height={32} width={32} radius="md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionStyle2Ui({
  isLoading = false,
  products,
  error,
  'data-testid': testId = 'collection-style2-ui',
}: CollectionStyle2UiProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CollectionStyle2UiError error={currentError} testId={testId} />;
  }

  // Show skeleton during SSR hydration and when loading
  if (!mounted || isLoading) {
    return <CollectionSkeleton testId={testId} />;
  }

  // Show empty state when no products
  if (!products || products.length === 0) {
    return (
      <div className="flex-1 text-center py-16" data-testid={`${testId}-empty`}>
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <IconShoppingBag size={48} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products found
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            This collection is currently empty. Check back later for new products.
          </p>
          <div className="mt-6">
            <Link
              href="/en/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse all collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show products grid
  try {
    return (
      <ErrorBoundary
        fallback={<CollectionStyle2UiError error="Failed to render products" testId={testId} />}
      >
        <div
          className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
          data-testid={testId}
        >
          {products.map((item, index) => {
            try {
              return (
                <ErrorBoundary key={item.id} fallback={<Skeleton height={320} radius="lg" />}>
                  <ProductCardWithFavorite
                    position={index + 1}
                    data={item}
                    listId="collection-style-2"
                  />
                </ErrorBoundary>
              );
            } catch (err) {
              logger.error('Error rendering product', err);
              _setInternalError(`Failed to render product ${item.id}`);
              return <Skeleton key={item.id} height={320} radius="lg" />;
            }
          })}
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('CollectionStyle2Ui error', err);
    _setInternalError('Failed to render collection');
    return <CollectionStyle2UiError error="Failed to render collection" testId={testId} />;
  }
}
