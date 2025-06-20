'use client';

import { logger } from '@/lib/logger';
import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { useEffect, useState } from 'react';
import { Alert, Text, Skeleton } from '@mantine/core';
import { IconAlertTriangle, IconSearch } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

import { TProductItem } from '@/types';

interface SearchUiProps {
  isLoading?: boolean;
  products: TProductItem[];
  error?: string;
  'data-testid'?: string;
}

// Error state for SearchUi
function SearchUiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Search error"
      color="red"
      variant="light"
      data-testid={testId}
      className="mt-8"
    >
      <Text size="sm">{error || 'Failed to perform search'}</Text>
    </Alert>
  );
}

// Custom skeleton that matches the search grid layout
function SearchSkeleton({ testId }: { testId?: string }) {
  return (
    <div
      className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4"
      data-testid={`${testId}-skeleton`}
    >
      {[...Array(8)].map((_, i) => (
        <div key={`search-skeleton-${i}`} className="group relative">
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

export function SearchUi({
  isLoading = false,
  products,
  error,
  'data-testid': testId = 'search-ui',
}: SearchUiProps) {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SearchUiError error={currentError} testId={testId} />;
  }

  // Show skeleton during SSR hydration and when loading
  if (!mounted || isLoading) {
    return <SearchSkeleton testId={testId} />;
  }
  // Zero state when no search results
  if (!products || products.length === 0) {
    return (
      <div className="mt-8 text-center py-16" data-testid={`${testId}-empty`}>
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <IconSearch size={48} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products found
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Try adjusting your search terms or browse our collections to discover products.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/en/collections"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse Collections
            </Link>
            <Link
              href="/en"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show search results
  try {
    return (
      <ErrorBoundary
        fallback={<SearchUiError error="Failed to render search results" testId={testId} />}
      >
        <div
          className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4"
          data-testid={testId}
        >
          {products.map((item, index) => {
            try {
              return (
                <ErrorBoundary key={item.id} fallback={<Skeleton height={320} radius="lg" />}>
                  <ProductCardWithFavorite position={index + 1} data={item} listId="search" />
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
    logger.error('SearchUi error', err);
    _setInternalError('Failed to render search results');
    return <SearchUiError error="Failed to render search results" testId={testId} />;
  }
}
