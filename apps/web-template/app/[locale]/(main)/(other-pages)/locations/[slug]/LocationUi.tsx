'use client';

import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';
import { useEffect, useState } from 'react';
import { Alert, Text, Skeleton } from '@mantine/core';
import { IconAlertTriangle, IconMapPin } from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

import { TProductItem } from '@/types';

interface LocationUiProps {
  isLoading?: boolean;
  products: TProductItem[];
  error?: string;
  'data-testid'?: string;
}

// Error state for LocationUi
function LocationUiError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title="Unable to load location products"
      color="red"
      variant="light"
      data-testid={testId}
    >
      <Text size="sm">{error || 'Failed to load products for this location'}</Text>
    </Alert>
  );
}

export function LocationUi({
  isLoading = false,
  products,
  error,
  'data-testid': testId = 'location-ui',
}: LocationUiProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom skeleton that matches the location grid layout
  const LocationSkeleton = () => (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" data-testid={`${testId}-skeleton`}>
      {[...Array(6)].map((_, i) => (
        <div key={`location-skeleton-${i}`} className="group relative">
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

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <LocationUiError error={currentError} testId={testId} />;
  }

  // Show skeleton during SSR hydration and when loading
  if (!mounted || isLoading) {
    return <LocationSkeleton />;
  }

  // Show empty state when no products
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16" data-testid={`${testId}-empty`}>
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <IconMapPin size={48} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products available at this location
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            There are no products available at this location currently. Please check other
            locations.
          </p>
          <div className="mt-6">
            <Link
              href="/en/locations"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Browse all locations
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
        fallback={<LocationUiError error="Failed to render products" testId={testId} />}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" data-testid={testId}>
          {products.map((product: TProductItem, index) => {
            try {
              return (
                <ErrorBoundary key={product.id} fallback={<Skeleton height={320} radius="lg" />}>
                  <ProductCardWithFavorite position={index + 1} data={product} listId="location" />
                </ErrorBoundary>
              );
            } catch (err) {
              console.error('Error rendering product:', err);
              setInternalError(`Failed to render product ${product.id}`);
              return <Skeleton key={product.id} height={320} radius="lg" />;
            }
          })}
        </div>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('LocationUi error:', err);
    setInternalError('Failed to render location products');
    return <LocationUiError error="Failed to render location products" testId={testId} />;
  }
}
